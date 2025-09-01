"""
Rotas de autenticação para o Gabarita.AI
"""
from flask import Blueprint, request, current_app
from utils.response_formatter import ResponseFormatter
from firebase_admin import auth as firebase_auth, firestore
from config.firebase_config import firebase_config
from utils.logger import StructuredLogger, log_request
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import re
from datetime import datetime

auth_bp = Blueprint('auth', __name__)
logger = StructuredLogger('auth_routes')

def get_db():
    """Retorna a instância do Firestore se disponível"""
    return firebase_config.get_db()

def validate_email(email):
    """Valida formato do email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Valida se a senha atende aos criterios minimos"""
    if len(password) < 6:
        return False, "Senha deve ter pelo menos 6 caracteres"
    return True, ""

def validate_nickname(nickname):
    """Valida se o apelido atende aos criterios"""
    if len(nickname) < 4:
        return False, "Apelido deve ter pelo menos 4 caracteres"
    return True, ""

@auth_bp.route('/entrar', methods=['POST'])
def entrar():
    """Endpoint para login de usuários"""
    try:
        logger.info("Tentativa de login iniciada")
        
        data = request.get_json()
        # Aceitar tanto 'email' quanto 'email', e 'senha' quanto 'password'
        email = data.get('email')
        senha = data.get('senha') or data.get('password')
        
        if not email or not senha:
            logger.warning("Login falhou - dados obrigatórios ausentes", extra={
                'email_provided': bool(email),
                'senha_provided': bool(senha)
            })
            return ResponseFormatter.bad_request('E-mail e senha são obrigatórios')
        
        email = email.strip().lower()
        
        # Pular Firebase Auth e usar autenticação baseada em Firestore
        # Firebase Auth não suporta validação de senha no backend
        logger.info("Usando autenticação baseada em Firestore", extra={'email': email})
        
        # Verificar se o usuário existe no Firestore
        db = get_db()
        if db is None:
            # Modo desenvolvimento sem Firebase
            logger.info("Login simulado (desenvolvimento)", extra={'email': email})
            return ResponseFormatter.success(
                data={
                    'token': 'dev-token-123',
                    'usuario': {
                        'id': 'dev-user-1',
                        'email': email,
                        'nome': 'Usuário Desenvolvimento',
                        'nomeCompleto': 'Usuário Desenvolvimento',
                        'planId': 'free',
                        'freeQuestionsRemaining': 3
                    }
                },
                message='Login realizado com sucesso (modo desenvolvimento)'
            )
        
        # Buscar primeiro na coleção 'users' (novo formato)
        users_ref = db.collection('users')
        user_query = users_ref.where('email', '==', email).limit(1)
        users = user_query.get()
        
        # Se não encontrar, buscar na coleção 'usuarios' (formato antigo)
        if not users:
            usuarios_ref = db.collection('usuarios')
            usuario_query = usuarios_ref.where('email', '==', email).limit(1)
            users = usuario_query.get()
        
        if not users:
            logger.warning("Login falhou - usuário não encontrado", extra={'email': email})
            return ResponseFormatter.unauthorized('Email ou senha incorretos')
        
        user_doc = users[0]
        user_data = user_doc.to_dict()
        user_data['id'] = user_doc.id
        
        # Verificar senha com hash
        if 'password_hash' in user_data:
            if not check_password_hash(user_data['password_hash'], senha):
                logger.warning("Login falhou - senha incorreta", extra={'email': email})
                return ResponseFormatter.unauthorized('Email ou senha incorretos')
        else:
            # Fallback para senhas em texto plano (migração)
            if user_data.get('senha') != senha:
                logger.warning("Login falhou - senha incorreta (texto plano)", extra={'email': email})
                return ResponseFormatter.unauthorized('Email ou senha incorretos')
        
        # Remover dados sensíveis da resposta
        user_response = {k: v for k, v in user_data.items() if k not in ['password_hash', 'senha']}
        
        logger.info("Login realizado com sucesso", extra={
            'user_id': user_data['id'],
            'email': email
        })
        
        return ResponseFormatter.success(
            data={
                'token': f'token-{user_data["id"]}',
                'usuario': user_response
            },
            message='Login realizado com sucesso'
        )
        
    except Exception as e:
        logger.error("Erro interno no login", extra={
            'error': str(e),
            'email': data.get('email') if 'data' in locals() else None
        })
        print(f"Erro no login: {e}")
        return ResponseFormatter.internal_error('Erro interno do servidor')

@auth_bp.route('/cadastrar', methods=['POST'])
@log_request(logger)
def cadastrar():
    """Endpoint para cadastro de usuario com hash de senha"""
    try:
        data = request.get_json()
        logger.info("Iniciando processo de cadastro", extra={"email": data.get('email', 'N/A')})
        
        # Validar dados obrigatorios - aceitar tanto nomeCompleto quanto nome
        nome_completo = data.get('nomeCompleto') or data.get('nome')
        cpf = data.get('cpf')
        email = data.get('email')
        senha = data.get('senha') or data.get('password')
        
        required_fields = {'nome': nome_completo, 'cpf': cpf, 'email': email, 'senha': senha}
        for field_name, field_value in required_fields.items():
            if not field_value:
                return ResponseFormatter.bad_request(f"Campo {field_name} é obrigatório")
        
        nome_completo = nome_completo.strip()
        cpf = cpf.strip()
        email = email.strip().lower()
        
        # Validacoes
        if not validate_email(email):
            return ResponseFormatter.bad_request("Email inválido")
        
        # Validar CPF (implementação básica)
        if not cpf or len(cpf.replace('.', '').replace('-', '')) != 11:
            return ResponseFormatter.bad_request("CPF inválido")
        
        is_valid_password, password_error = validate_password(senha)
        if not is_valid_password:
            return ResponseFormatter.bad_request(password_error)
        
        # Verificar se email ja existe
        db = get_db()
        if db is None:
            # Modo desenvolvimento sem Firebase - permitir cadastro
            print("⚠️ Firebase não configurado, cadastro em modo desenvolvimento")
        else:
            users_ref = db.collection('users')
            existing_user = users_ref.where('email', '==', email).limit(1).get()
            
            if existing_user:
                return ResponseFormatter.conflict("Email já cadastrado")
            
            # Verificar se CPF ja existe
            existing_cpf = users_ref.where('cpf', '==', cpf).limit(1).get()
        
            if existing_cpf:
                return ResponseFormatter.conflict("CPF já cadastrado")
        
        # Gerar hash da senha
        password_hash = generate_password_hash(senha)
        
        # Criar usuario no Firestore
        user_data = {
            'nomeCompleto': nome_completo,
            'nome': nome_completo,  # Alias para compatibilidade
            'cpf': cpf,
            'email': email,
            'password_hash': password_hash,
            'freeQuestionsRemaining': 3,
            'createdAt': datetime.now().isoformat(),
            'totalAnswered': 0,
            'correctAnswers': 0,
            'planId': 'free',
            'profileComplete': True
        }
        
        # Adicionar usuario
        if db is not None:
            users_ref = db.collection('users')
            doc_ref = users_ref.add(user_data)
            user_id = doc_ref[1].id
        else:
            # Modo desenvolvimento - simular ID
            user_id = 'dev-user-' + email.replace('@', '-').replace('.', '-')
        
        logger.info("Usuário cadastrado com sucesso", extra={
            "user_id": user_id,
            "email": email,
            "modo_desenvolvimento": db is None
        })
        
        return ResponseFormatter.created(
            data={'userId': user_id, 'usuario': {**user_data, 'id': user_id}},
            message='Usuário cadastrado com sucesso (modo desenvolvimento)' if db is None else 'Usuário cadastrado com sucesso'
        )
        
    except Exception as e:
        logger.error("Erro no processo de cadastro", extra={
            "email": data.get('email', 'N/A') if 'data' in locals() else 'N/A',
            "error": str(e)
        })
        return ResponseFormatter.internal_error("Erro interno do servidor")

@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
def cadastro():
    """Endpoint para cadastro de novos usuários"""
    # Tratar preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = ResponseFormatter.success({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response
    
    try:
        import re
        data = request.get_json(force=True) or {}
        
        logger.info("Tentativa de cadastro iniciada", extra={
            'email': data.get('email'),
            'nome': data.get('nome') or data.get('nomeCompleto')
        })
        
        # Fallback tolerante: aceitar 'nome' ou 'nomeCompleto'
        nome = (data.get("nome") or data.get("nomeCompleto") or "").strip()
        if not nome:
            logger.warning("Campo nome vazio no cadastro", extra={
                'email': data.get('email')
            })
            return ResponseFormatter.bad_request('Campo nome é obrigatório')
        data["nome"] = nome
        
        # Normalizar CPF (só dígitos)
        data["cpf"] = re.sub(r"\D", "", data.get("cpf", ""))
        
        # Validar dados obrigatórios
        campos_obrigatorios = ['nome', 'email', 'senha', 'cargo', 'bloco']
        for campo in campos_obrigatorios:
            if not data.get(campo):
                logger.warning("Campo obrigatório vazio no cadastro", extra={
                    'campo': campo,
                    'email': data.get('email')
                })
                return ResponseFormatter.bad_request(f'Campo {campo} é obrigatório')
        
        # Validar confirmação de senha
        confirmar_senha = data.get('confirmarSenha')
        if confirmar_senha and data.get('senha') != confirmar_senha:
            return ResponseFormatter.bad_request('Senhas não coincidem')
        
        email = data.get('email')
        senha = data.get('senha')
        nome = data.get('nome')
        cargo = data.get('cargo')
        bloco = data.get('bloco')
        nivel_escolaridade = data.get('nivel_escolaridade', 'Superior')
        
        # Verificar se e-mail já existe
        logger.info("Verificando conexão Firebase para cadastro", extra={
            'firebase_connected': firebase_config.is_connected(),
            'email': email
        })
        if firebase_config.is_connected():
            try:
                logger.info("Criando usuário no Firebase Auth", extra={
                    'email': email
                })
                # Tentar criar usuário no Firebase Auth
                user = firebase_auth.create_user(
                    email=email,
                    password=senha,
                    display_name=nome
                )
                logger.info("Usuário criado no Firebase Auth com sucesso", extra={
                    'user_id': user.uid,
                    'email': email
                })
                
                # Criar documento do usuário no Firestore
                usuario_data = {
                    'id': user.uid,
                    'nome': nome,
                    'email': email,
                    'cargo': cargo,
                    'bloco': bloco,
                    'nivel_escolaridade': nivel_escolaridade,
                    'vida': 80,  # Vida inicial
                    'pontuacao': 0,
                    'status': 'ativo',
                    'erros_por_tema': {},
                    'data_criacao': datetime.now().isoformat(),
                    'ultimo_acesso': datetime.now().isoformat()
                }
                
                # Salvar no Firestore
                db = firebase_config.get_db()
                logger.info("Salvando usuário no Firestore", extra={
                    'user_id': user.uid
                })
                db.collection('usuarios').document(user.uid).set(usuario_data)
                logger.info("Cadastro Firebase concluído com sucesso", extra={
                    'user_id': user.uid,
                    'email': email
                })
                
                return ResponseFormatter.success({
            'usuario': usuario_data,
            'token': user.uid
        }, 'Cadastro realizado com sucesso')
                
            except firebase_auth.EmailAlreadyExistsError:
                logger.warning("E-mail já existe no Firebase", extra={
                    'email': email
                })
                return ResponseFormatter.error('E-mail já cadastrado', 409)
            except Exception as e:
                logger.error("Erro no cadastro Firebase", extra={
                    'error': str(e),
                    'email': email
                })
                # Fallback para cadastro simulado
                pass
        
        # Cadastro simulado para desenvolvimento
        logger.info("Usando cadastro simulado (fallback)", extra={
            'email': email
        })
        # Simular verificação de e-mail duplicado
        emails_cadastrados = ['teste@exemplo.com', 'admin@gabarita.ai']
        if email in emails_cadastrados:
            logger.warning("E-mail já existe no cadastro simulado", extra={
                'email': email
            })
            return ResponseFormatter.conflict('E-mail já cadastrado')
            
        usuario_id = str(uuid.uuid4())
        usuario_data = {
            'id': usuario_id,
            'nome': nome,
            'email': email,
            'cargo': cargo,
            'bloco': bloco,
            'nivel_escolaridade': nivel_escolaridade,
            'vida': 80,
            'pontuacao': 0,
            'status': 'ativo',
            'erros_por_tema': {},
            'data_criacao': datetime.now().isoformat(),
            'ultimo_acesso': datetime.now().isoformat()
        }
        
        logger.info("Cadastro simulado concluído com sucesso", extra={
            'user_id': usuario_id,
            'email': email
        })
        return ResponseFormatter.success({
            'usuario': usuario_data,
            'token': usuario_id
        }, 'Cadastro realizado com sucesso')
        
    except ValueError as e:
        logger.error("Erro de validação no cadastro", extra={
            'error': str(e),
            'email': data.get('email') if 'data' in locals() else None
        })
        return ResponseFormatter.error('Dados inválidos fornecidos', 422)
    except Exception as e:
        logger.error("Erro interno no cadastro", extra={
            'error': str(e),
            'email': data.get('email') if 'data' in locals() else None
        })
        return ResponseFormatter.internal_error('Erro interno do servidor')

@auth_bp.route('/verificar-token', methods=['POST'])
@log_request(logger)
def verificar_token():
    """Endpoint para verificar validade do token"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return ResponseFormatter.bad_request('Token é obrigatório')
        
        if firebase_config.is_connected():
            try:
                # Verificar token com Firebase Auth
                decoded_token = firebase_auth.verify_id_token(token)
                uid = decoded_token['uid']
                
                # Buscar dados do usuário
                usuario_data = _get_usuario_firestore(uid)
                
                if usuario_data:
                    # Atualizar último acesso
                    _atualizar_ultimo_acesso(uid)
                    
                    return ResponseFormatter.success({
                        'usuario': usuario_data
                    }, 'Token válido')
                else:
                    return ResponseFormatter.not_found('Usuário não encontrado')
                    
            except firebase_auth.InvalidIdTokenError:
                return ResponseFormatter.unauthorized('Token inválido')
            except Exception as e:
                print(f"Erro na verificação do token: {e}")
                # Fallback para verificação simulada
                pass
        
        # Verificação simulada para desenvolvimento
        # Em desenvolvimento, qualquer token é válido
        usuario_simulado = {
            'id': token,
            'nome': 'Usuário Teste',
            'email': 'teste@gabarita.ai',
            'cargo': 'Enfermeiro na Atenção Primária',
            'bloco': 'Bloco 5',
            'vida': 85,
            'pontuacao': 1250
        }
        
        return ResponseFormatter.success({
            'usuario': usuario_simulado
        }, 'Token válido')
        
    except Exception as e:
        print(f"Erro na verificação do token: {e}")
        return ResponseFormatter.internal_error('Erro interno do servidor')

@auth_bp.route('/google-auth', methods=['POST'])
@log_request(logger)
def google_auth():
    """Endpoint para autenticação/cadastro com Google"""
    try:
        data = request.get_json()
        id_token = data.get('idToken')
        
        if not id_token:
            return ResponseFormatter.bad_request('Token do Google é obrigatório')
        
        if firebase_config.is_connected():
            try:
                # Verificar o token do Google
                decoded_token = firebase_auth.verify_id_token(id_token)
                uid = decoded_token['uid']
                email = decoded_token.get('email')
                nome = decoded_token.get('name', '')
                
                # Verificar se o usuário já existe
                usuario_existente = _get_usuario_firestore(uid)
                
                if usuario_existente:
                    # Usuário já existe, fazer login
                    _atualizar_ultimo_acesso(uid)
                    return ResponseFormatter.success({
                        'usuario': usuario_existente,
                        'token': uid,
                        'isNewUser': False
                    }, 'Login realizado com sucesso')
                else:
                    # Novo usuário, criar perfil básico
                    db = firebase_config.get_db()
                    usuario_data = {
                        'nome': nome,
                        'nickname': nome.split(' ')[0] if nome else '',
                        'email': email,
                        'freeQuestionsRemaining': 3,
                        'createdAt': datetime.now().isoformat(),
                        'totalAnswered': 0,
                        'correctAnswers': 0,
                        'isGoogleUser': True,
                        'profileComplete': False
                    }
                    
                    # Salvar no Firestore
                    db.collection('usuarios').document(uid).set(usuario_data)
                    
                    return ResponseFormatter.success({
                        'usuario': usuario_data,
                        'token': uid,
                        'isNewUser': True
                    }, 'Usuário criado com sucesso')
                    
            except firebase_auth.InvalidIdTokenError:
                return ResponseFormatter.unauthorized('Token do Google inválido')
            except Exception as e:
                print(f"Erro na autenticação Google: {e}")
                return ResponseFormatter.internal_error('Erro na autenticação com Google')
        else:
            # Modo desenvolvimento - simular autenticação Google
            usuario_simulado = {
                'id': str(uuid.uuid4()),
                'nome': 'Usuário Google Teste',
                'email': 'google@teste.com',
                'freeQuestionsRemaining': 3,
                'createdAt': datetime.now().isoformat(),
                'totalAnswered': 0,
                'correctAnswers': 0,
                'isGoogleUser': True,
                'profileComplete': False
            }
            
            return ResponseFormatter.success({
                'usuario': usuario_simulado,
                'token': 'google-test-token',
                'isNewUser': True
            }, 'Usuário Google criado com sucesso')
            
    except Exception as e:
        print(f"Erro no Google Auth: {e}")
        return ResponseFormatter.internal_error('Erro interno do servidor')

@auth_bp.route('/complete-profile', methods=['POST'])
@log_request(logger)
def complete_profile():
    """Endpoint para completar perfil de usuários Google"""
    try:
        data = request.get_json()
        nickname = data.get('nickname')
        logger.info("Iniciando completar perfil", extra={"nickname": nickname})
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return ResponseFormatter.unauthorized('Token de autorização é obrigatório')
            
        token = auth_header.split(' ')[1]
        
        if not nickname:
            return ResponseFormatter.bad_request('Nickname é obrigatório')
            
        if len(nickname) < 3 or len(nickname) > 20:
            return ResponseFormatter.bad_request('Nickname deve ter entre 3 e 20 caracteres')
        
        if firebase_config.is_connected():
            try:
                # Verificar se o token é válido
                decoded_token = firebase_auth.verify_id_token(token)
                uid = decoded_token['uid']
                
                # Atualizar perfil no Firestore
                db = firebase_config.get_db()
                db.collection('usuarios').document(uid).update({
                    'nickname': nickname,
                    'profileComplete': True,
                    'updatedAt': datetime.now().isoformat()
                })
                
                # Buscar dados atualizados
                usuario_atualizado = _get_usuario_firestore(uid)
                
                logger.info("Perfil completado com sucesso no Firebase", extra={
                    "uid": uid,
                    "nickname": nickname
                })
                
                return ResponseFormatter.success({
                    'usuario': usuario_atualizado
                }, 'Perfil completado com sucesso')
                
            except firebase_auth.InvalidIdTokenError:
                return ResponseFormatter.unauthorized('Token inválido')
            except Exception as e:
                print(f"Erro ao completar perfil: {e}")
                return ResponseFormatter.internal_error('Erro ao atualizar perfil')
        else:
            # Modo desenvolvimento
            usuario_simulado = {
                'id': token,
                'nome': 'Usuário Google Teste',
                'nickname': nickname,
                'email': 'google@teste.com',
                'freeQuestionsRemaining': 3,
                'createdAt': datetime.now().isoformat(),
                'totalAnswered': 0,
                'correctAnswers': 0,
                'isGoogleUser': True,
                'profileComplete': True
            }
            
            logger.info("Perfil completado com sucesso (modo desenvolvimento)", extra={
                "nickname": nickname,
                "modo_desenvolvimento": True
            })
            
            return ResponseFormatter.success({
                'usuario': usuario_simulado
            }, 'Perfil completado com sucesso')
            
    except Exception as e:
        logger.error("Erro ao completar perfil", extra={
            "nickname": data.get('nickname', 'N/A') if 'data' in locals() else 'N/A',
            "error": str(e)
        })
        return ResponseFormatter.internal_error('Erro interno do servidor')

@auth_bp.route('/sair', methods=['POST'])
@log_request(logger)
def sair():
    """Endpoint para logout de usuários"""
    try:
        logger.info("Iniciando processo de logout")
        # Em uma implementação real, invalidar o token
        # Para desenvolvimento, apenas retornar sucesso
        logger.info("Logout realizado com sucesso")
        return ResponseFormatter.success({"loggedOut": True}, 'Logout realizado com sucesso')
        
    except Exception as e:
        logger.error("Erro no processo de logout", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@auth_bp.route('/logout', methods=['POST'])
@log_request(logger)
def logout():
    """Endpoint para logout de usuários (alias para /sair)"""
    return sair()

@auth_bp.route('/renovar-token', methods=['POST'])
@log_request(logger)
def renovar_token():
    """Endpoint para renovar token de autenticação"""
    try:
        data = request.get_json()
        if not data:
            return ResponseFormatter.bad_request('Dados não fornecidos')
        
        token_atual = data.get('token')
        if not token_atual:
            return ResponseFormatter.bad_request('Token atual é obrigatório')
        
        logger.info("Iniciando renovação de token")
        
        # Verificar se o Firebase está conectado
        if firebase_config.is_connected():
            try:
                # Verificar token atual no Firebase
                decoded_token = firebase_auth.verify_id_token(token_atual)
                uid = decoded_token['uid']
                
                # Buscar dados do usuário
                usuario_data = _get_usuario_firestore(uid)
                if not usuario_data:
                    return ResponseFormatter.not_found('Usuário não encontrado')
                
                # Atualizar último acesso
                _atualizar_ultimo_acesso(uid)
                
                # Gerar novo token (em produção, usar Firebase custom token)
                novo_token = uid  # Simplificado para desenvolvimento
                
                logger.info("Token renovado com sucesso no Firebase", extra={
                    "uid": uid,
                    "modo_firebase": True
                })
                
                return ResponseFormatter.success({
                    'token': novo_token,
                    'usuario': usuario_data
                }, 'Token renovado com sucesso')
                
            except firebase_auth.InvalidIdTokenError:
                return ResponseFormatter.unauthorized('Token inválido')
            except firebase_auth.ExpiredIdTokenError:
                return ResponseFormatter.unauthorized('Token expirado')
            except Exception as e:
                current_app.logger.error(f"Erro no refresh token Firebase: {e}")
                # Fallback para modo desenvolvimento
                pass
        
        # Modo desenvolvimento - validação simplificada
        if len(token_atual) < 10:  # Validação básica
            return ResponseFormatter.unauthorized('Token inválido')
        
        # Simular dados do usuário para desenvolvimento
        usuario_data = {
            'id': token_atual,
            'nome': 'Usuário Teste',
            'email': 'teste@exemplo.com',
            'cargo': 'Enfermeiro',
            'bloco': 'Bloco 1 - Seguridade Social',
            'vida': 80,
            'pontuacao': 1250,
            'status': 'ativo'
        }
        
        logger.info("Token renovado com sucesso (modo desenvolvimento)", extra={
            "modo_desenvolvimento": True
        })
        
        return ResponseFormatter.success({
            'token': token_atual,  # Retornar o mesmo token em desenvolvimento
            'usuario': usuario_data
        }, 'Token renovado com sucesso')
        
    except Exception as e:
        logger.error("Erro na renovação de token", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

def _get_usuario_firestore(uid):
    """Busca dados do usuário no Firestore"""
    try:
        if not firebase_config.is_connected():
            # Modo de desenvolvimento - retornar dados simulados
            print(f"Buscando usuário em modo desenvolvimento: {uid}")
            return None
            
        db = firebase_config.get_db()
        doc = db.collection('usuarios').document(uid).get()
        
        if doc.exists:
            return doc.to_dict()
        else:
            return None
            
    except Exception as e:
        print(f"Erro ao buscar usuário no Firestore: {e}")
        return None

def _atualizar_ultimo_acesso(uid):
    """Atualiza o último acesso do usuário"""
    try:
        db = firebase_config.get_db()
        db.collection('usuarios').document(uid).update({
            'ultimo_acesso': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Erro ao atualizar último acesso: {e}")
        pass

