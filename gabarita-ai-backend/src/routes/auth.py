"""
Rotas de autenticação para o Gabarita.AI
"""
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from firebase_admin import auth, firestore
from src.config.firebase_config import firebase_config
import uuid
from datetime import datetime, timedelta
import jwt
import re
import os

auth_bp = Blueprint('auth', __name__)

# Chave secreta para JWT (em produção, usar variável de ambiente)
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'gabarita-ai-secret-key-2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

@auth_bp.route('/login', methods=['POST'])
@auth_bp.route('/api/auth/login', methods=['POST'])  # Alias para compatibilidade com FE
def login():
    """Endpoint para login de usuários"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos',
                'message': 'Corpo da requisição deve conter dados JSON'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password') or data.get('senha', '')  # Aceita ambos os campos
        if password:
            password = password.strip()
        
        # Debug logs
        print(f"[DEBUG] Dados recebidos: {data}")
        print(f"[DEBUG] Email: '{email}', Password: '{password}'")
        print(f"[DEBUG] Email válido: {bool(email)}, Password válido: {bool(password)}")
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email e senha são obrigatórios',
                'message': 'Email e senha são obrigatórios'
            }), 400
        
        # Validar formato do email
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({
                'success': False,
                'error': 'Email inválido',
                'message': 'Formato de email inválido'
            }), 400
        
        # Buscar usuário no banco de dados
        user_data = None
        user_id = None
        
        if firebase_config.is_connected():
            try:
                db = firebase_config.get_db()
                users_ref = db.collection('usuarios')
                user_query = users_ref.where('email', '==', email).limit(1).get()
                
                if len(user_query) > 0:
                    user_doc = user_query[0]
                    user_data = user_doc.to_dict()
                    user_id = user_doc.id
                    
                    # Verificar senha
                    if not check_password_hash(user_data.get('password_hash', ''), password):
                        return jsonify({
                            'success': False,
                            'error': 'Credenciais inválidas',
                            'message': 'Email ou senha incorretos'
                        }), 401
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Usuário não encontrado',
                        'message': 'Email ou senha incorretos'
                    }), 401
                    
            except Exception as e:
                print(f"Erro ao buscar usuário: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Erro de banco de dados',
                    'message': 'Erro ao verificar credenciais'
                }), 500
        else:
            # Modo desenvolvimento - simular login
            print(f"[DEV] Login simulado para: {email}")
            user_id = str(uuid.uuid4())
            user_data = {
                'email': email,
                'nome': 'Usuário Teste',
                'plano': 'trial',
                'ativo': True
            }
        
        # Gerar JWT token
        token_payload = {
            'user_id': user_id,
            'email': email,
            'plano': user_data.get('plano', 'trial'),
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'data': {
                'user_id': user_id,
                'email': email,
                'nome': user_data.get('nome', email.split('@')[0]),
                'plano': user_data.get('plano', 'trial'),
                'token': token
            }
        }), 200
    
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/register', methods=['POST'])
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """Endpoint para registro de novos usuários"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos',
                'message': 'Corpo da requisição deve conter dados JSON'
            }), 400
        
        # Validar campos obrigatórios
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        nome = data.get('nome', '').strip()
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Dados obrigatórios ausentes',
                'message': 'Email e senha são obrigatórios'
            }), 400
        
        # Validar formato do email
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({
                'success': False,
                'error': 'Email inválido',
                'message': 'Formato de email inválido'
            }), 400
        
        # Validar força da senha
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Senha fraca',
                'message': 'Senha deve ter pelo menos 6 caracteres'
            }), 400
        
        # Verificar se usuário já existe (modo desenvolvimento)
        if not firebase_config.is_connected():
            # Simulação para desenvolvimento - sempre permitir registro
            print(f"[DEV] Registrando usuário: {email}")
        else:
            # Verificar se usuário já existe no Firebase
            try:
                db = firebase_config.get_db()
                users_ref = db.collection('users')
                existing_user = users_ref.where('email', '==', email).limit(1).get()
                
                if len(existing_user) > 0:
                    return jsonify({
                        'success': False,
                        'error': 'Usuário já existe',
                        'message': 'Este email já está cadastrado'
                    }), 409
            except Exception as e:
                print(f"Erro ao verificar usuário existente: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Erro de banco de dados',
                    'message': 'Erro ao verificar dados do usuário'
                }), 500
        
        # Hash da senha
        password_hash = generate_password_hash(password)
        
        # Criar novo usuário
        user_data = {
            'email': email,
            'password_hash': password_hash,
            'nome': nome or email.split('@')[0],
            'plano': 'trial',  # Plano padrão
            'data_criacao': datetime.now(),
            'ativo': True,
            'configuracoes': {
                'notificacoes': True,
                'tema': 'claro'
            }
        }
        
        try:
            if firebase_config.is_connected():
                # Salvar no Firebase
                db = firebase_config.get_db()
                users_ref = db.collection('usuarios')
                doc_ref = users_ref.add(user_data)
                user_id = doc_ref[1].id
            else:
                # Modo desenvolvimento - gerar ID simulado
                user_id = str(uuid.uuid4())
                print(f"[DEV] Usuário criado com ID: {user_id}")
            
            # Gerar JWT token
            token_payload = {
                'user_id': user_id,
                'email': email,
                'plano': 'trial',
                'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
                'iat': datetime.utcnow()
            }
            
            token = jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
            
            return jsonify({
                'success': True,
                'message': 'Usuário registrado com sucesso',
                'data': {
                    'user_id': user_id,
                    'email': email,
                    'nome': user_data['nome'],
                    'plano': user_data['plano'],
                    'token': token
                }
            }), 201
            
        except Exception as e:
            print(f"Erro ao criar usuário: {e}")
            return jsonify({
                'success': False,
                'error': 'Erro ao criar usuário',
                'message': 'Erro interno do servidor ao criar usuário'
            }), 500
    
    except Exception as e:
        print(f"Erro no registro: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno',
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/cadastro', methods=['POST'])
@auth_bp.route('/api/auth/signup', methods=['POST'])  # Alias para compatibilidade com FE
def cadastro():
    """Endpoint para cadastro de novos usuários"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        campos_obrigatorios = ['nome', 'email', 'senha', 'cargo', 'bloco']
        for campo in campos_obrigatorios:
            if not data.get(campo):
                return jsonify({
                    'success': False,
                    'error': f'Campo {campo} é obrigatório',
                    'message': f'Campo {campo} é obrigatório'
                }), 400
        
        # Validar confirmação de senha
        confirmar_senha = data.get('confirmarSenha')
        if confirmar_senha and data.get('senha') != confirmar_senha:
            return jsonify({
                'success': False,
                'error': 'Senhas não coincidem',
                'message': 'Senhas não coincidem'
            }), 400
        
        email = data.get('email')
        senha = data.get('senha')
        nome = data.get('nome')
        cargo = data.get('cargo')
        bloco = data.get('bloco')
        nivel_escolaridade = data.get('nivel_escolaridade', 'Superior')
        
        # Verificar se e-mail já existe
        if firebase_config.is_connected():
            try:
                # Tentar criar usuário no Firebase Auth
                user = auth.create_user(
                    email=email,
                    password=senha,
                    display_name=nome
                )
                
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
                db.collection('usuarios').document(user.uid).set(usuario_data)
                
                return jsonify({
                    'success': True,
                    'data': {
                        'user': usuario_data,
                        'token': user.uid
                    },
                    'message': 'Cadastro realizado com sucesso'
                })
                
            except auth.EmailAlreadyExistsError:
                return jsonify({
                    'success': False,
                    'error': 'E-mail já cadastrado',
                    'message': 'E-mail já cadastrado'
                }), 409
            except Exception as e:
                print(f"Erro no cadastro Firebase: {e}")
                # Fallback para cadastro simulado
                pass
        
        # Cadastro simulado para desenvolvimento
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
        
        return jsonify({
            'success': True,
            'data': {
                'user': usuario_data,
                'token': usuario_id
            },
            'message': 'Cadastro realizado com sucesso (modo desenvolvimento)'
        })
        
    except Exception as e:
        print(f"Erro no cadastro: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/verificar-token', methods=['POST'])
def verificar_token():
    """Endpoint para verificar validade do token"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'Token é obrigatório'
            }), 400
        
        if firebase_config.is_connected():
            try:
                # Verificar token com Firebase Auth
                decoded_token = auth.verify_id_token(token)
                uid = decoded_token['uid']
                
                # Buscar dados do usuário
                usuario_data = _get_usuario_firestore(uid)
                
                if usuario_data:
                    # Atualizar último acesso
                    _atualizar_ultimo_acesso(uid)
                    
                    return jsonify({
                        'success': True,
                        'data': {'usuario': usuario_data}
                    })
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Usuário não encontrado'
                    }), 404
                    
            except auth.InvalidIdTokenError:
                return jsonify({
                    'success': False,
                    'error': 'Token inválido'
                }), 401
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
        
        return jsonify({
            'success': True,
            'data': {'usuario': usuario_simulado}
        })
        
    except Exception as e:
        print(f"Erro na verificação do token: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/google-auth', methods=['POST'])
def google_auth():
    """Endpoint para autenticação/cadastro com Google"""
    try:
        data = request.get_json()
        id_token = data.get('idToken')
        
        if not id_token:
            return jsonify({
                'success': False,
                'error': 'Token do Google é obrigatório'
            }), 400
        
        if firebase_config.is_connected():
            try:
                # Verificar o token do Google
                decoded_token = auth.verify_id_token(id_token)
                uid = decoded_token['uid']
                email = decoded_token.get('email')
                nome = decoded_token.get('name', '')
                
                # Verificar se o usuário já existe
                usuario_existente = _get_usuario_firestore(uid)
                
                if usuario_existente:
                    # Usuário já existe, fazer login
                    _atualizar_ultimo_acesso(uid)
                    return jsonify({
                        'success': True,
                        'data': {
                            'usuario': usuario_existente,
                            'token': uid,
                            'isNewUser': False
                        }
                    })
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
                    
                    return jsonify({
                        'success': True,
                        'data': {
                            'usuario': usuario_data,
                            'token': uid,
                            'isNewUser': True
                        }
                    })
                    
            except auth.InvalidIdTokenError:
                return jsonify({
                    'success': False,
                    'error': 'Token do Google inválido'
                }), 401
            except Exception as e:
                print(f"Erro na autenticação Google: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Erro na autenticação com Google'
                }), 500
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
            
            return jsonify({
                'success': True,
                'data': {
                    'usuario': usuario_simulado,
                    'token': 'google-test-token',
                    'isNewUser': True
                }
            })
            
    except Exception as e:
        print(f"Erro no Google Auth: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/complete-profile', methods=['POST'])
def complete_profile():
    """Endpoint para completar perfil de usuários Google"""
    try:
        data = request.get_json()
        nickname = data.get('nickname')
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Token de autorização é obrigatório'
            }), 401
            
        token = auth_header.split(' ')[1]
        
        if not nickname:
            return jsonify({
                'success': False,
                'error': 'Nickname é obrigatório'
            }), 400
            
        if len(nickname) < 3 or len(nickname) > 20:
            return jsonify({
                'success': False,
                'error': 'Nickname deve ter entre 3 e 20 caracteres'
            }), 400
        
        if firebase_config.is_connected():
            try:
                # Verificar se o token é válido
                decoded_token = auth.verify_id_token(token)
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
                
                return jsonify({
                    'success': True,
                    'data': {
                        'usuario': usuario_atualizado
                    },
                    'message': 'Perfil completado com sucesso'
                })
                
            except auth.InvalidIdTokenError:
                return jsonify({
                    'success': False,
                    'error': 'Token inválido'
                }), 401
            except Exception as e:
                print(f"Erro ao completar perfil: {e}")
                return jsonify({
                    'success': False,
                    'error': 'Erro ao atualizar perfil'
                }), 500
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
            
            return jsonify({
                'success': True,
                'data': {
                    'usuario': usuario_simulado
                },
                'message': 'Perfil completado com sucesso'
            })
            
    except Exception as e:
        print(f"Erro ao completar perfil: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@auth_bp.route('/api/auth/logout', methods=['POST'])  # Alias para compatibilidade com FE
def logout():
    """Endpoint para logout de usuários"""
    try:
        # Em uma implementação real, invalidar o token
        # Para desenvolvimento, apenas retornar sucesso
        return jsonify({
            'success': True,
            'message': 'Logout realizado com sucesso'
        })
        
    except Exception as e:
        print(f"Erro no logout: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

def _get_usuario_firestore(uid):
    """Busca dados do usuário no Firestore"""
    try:
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

