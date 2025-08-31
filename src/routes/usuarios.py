from flask import Blueprint, request, current_app
from firebase_admin import auth as firebase_auth, firestore
from config.firebase_config import firebase_config
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request
from datetime import datetime
import uuid

usuarios_bp = Blueprint('usuarios', __name__)
logger = StructuredLogger('usuarios')

@usuarios_bp.route('/<user_id>', methods=['GET'])
@log_request(logger)
def obter_usuario_por_id(user_id):
    """Endpoint para obter dados do usuário por ID"""
    try:
        logger.info("Iniciando obtenção de usuário por ID", extra={'user_id': user_id})
        
        # Buscar usuário no Firestore usando o user_id
        if firebase_config.is_connected():
            try:
                db = firebase_config.get_db()
                
                # Buscar primeiro na coleção 'users'
                doc = db.collection('users').document(user_id).get()
                
                if not doc.exists:
                    # Se não encontrar, buscar na coleção 'usuarios'
                    doc = db.collection('usuarios').document(user_id).get()
                
                if doc.exists:
                    usuario_data = doc.to_dict()
                    usuario_data['id'] = doc.id
                    
                    # Remover dados sensíveis
                    if 'senha' in usuario_data:
                        del usuario_data['senha']
                    
                    logger.info("Usuário obtido com sucesso via Firestore", extra={
                        'user_id': user_id,
                        'found_in': 'users' if db.collection('users').document(user_id).get().exists else 'usuarios'
                    })
                    
                    return ResponseFormatter.success(
                        data=usuario_data,
                        message="Usuário obtido com sucesso"
                    )
                else:
                    logger.warning("Usuário não encontrado no Firestore", extra={'user_id': user_id})
                    return ResponseFormatter.not_found("Usuário não encontrado")
                    
            except Exception as e:
                logger.error("Erro ao buscar usuário no Firestore", extra={"error": str(e), "user_id": user_id})
                return ResponseFormatter.internal_error("Erro interno do servidor")
        else:
            # Modo desenvolvimento - dados simulados
            usuario_simulado = {
                'id': user_id,
                'nome': f'Usuário {user_id}',
                'email': f'user{user_id}@teste.com',
                'cargo': 'Enfermeiro',
                'bloco': 'Bloco 1 - Seguridade Social',
                'nivel_escolaridade': 'Superior',
                'plano_atual': 'gratuito',
                'data_cadastro': datetime.now().isoformat(),
                'ultimo_acesso': datetime.now().isoformat()
            }
            
            logger.info("Usuário simulado gerado com sucesso", extra={
                'user_id': user_id,
                'modo': 'desenvolvimento'
            })
            
            return ResponseFormatter.success(
                data=usuario_simulado,
                message="Usuário obtido com sucesso (modo desenvolvimento)"
            )
            
    except Exception as e:
        logger.error("Erro interno ao obter usuário por ID", extra={"error": str(e), "user_id": user_id})
        return ResponseFormatter.internal_error("Erro interno do servidor")

@usuarios_bp.route('/perfil', methods=['GET'])
@log_request(logger)
def obter_perfil():
    """Endpoint para obter perfil do usuário"""
    try:
        logger.info("Iniciando obtenção de perfil do usuário")
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Token de autorização não fornecido")
            return ResponseFormatter.unauthorized("Token de autorização necessário")
        
        token = auth_header.split(' ')[1]
        
        # Extrair user_id do token simples (formato: token-{user_id})
        if not token.startswith('token-'):
            logger.warning("Formato de token inválido")
            return ResponseFormatter.unauthorized("Token inválido")
        
        user_id = token.replace('token-', '')
        
        # Buscar usuário no Firestore usando o user_id
        if firebase_config.is_connected():
            try:
                db = firebase_config.get_db()
                
                # Buscar primeiro na coleção 'users'
                doc = db.collection('users').document(user_id).get()
                
                if not doc.exists:
                    # Se não encontrar, buscar na coleção 'usuarios'
                    doc = db.collection('usuarios').document(user_id).get()
                
                if doc.exists:
                    usuario_data = doc.to_dict()
                    usuario_data['id'] = doc.id
                    
                    # Remover dados sensíveis
                    for sensitive_field in ['senha', 'password_hash']:
                        if sensitive_field in usuario_data:
                            del usuario_data[sensitive_field]
                    
                    logger.info("Perfil do usuário obtido com sucesso via Firestore", extra={
                        "user_id": user_id,
                        "nome": usuario_data.get('nome'),
                        "email": usuario_data.get('email')
                    })
                    
                    return ResponseFormatter.success(
                        data=usuario_data,
                        message="Perfil obtido com sucesso"
                    )
                else:
                    logger.warning("Usuário não encontrado no Firestore", extra={"user_id": user_id})
                    return ResponseFormatter.not_found("Usuário não encontrado")
                    
            except Exception as e:
                logger.error("Erro ao buscar perfil no Firestore", extra={"error": str(e)})
                # Fallback para modo desenvolvimento
                pass
        
        # Modo desenvolvimento - dados simulados
        logger.info("Usando modo desenvolvimento para obter perfil")
        
        usuario_data = {
            'id': token,
            'nome': 'Usuário Teste',
            'email': 'teste@exemplo.com',
            'cargo': 'Enfermeiro',
            'bloco': 'Bloco 1 - Seguridade Social',
            'nivel_escolaridade': 'Superior',
            'vida': 80,
            'pontuacao': 1250,
            'status': 'ativo',
            'data_criacao': '2024-01-15T10:30:00',
            'ultimo_acesso': datetime.now().isoformat()
        }
        
        logger.info("Perfil do usuário obtido com sucesso via modo desenvolvimento", extra={
            "nome": usuario_data['nome'],
            "email": usuario_data['email']
        })
        
        return ResponseFormatter.success(
            data=usuario_data,
            message="Perfil obtido com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro interno ao obter perfil do usuário", extra={"error": str(e)})
        return ResponseFormatter.internal_error("Erro interno do servidor")

@usuarios_bp.route('/perfil', methods=['PUT'])
@log_request(logger)
def atualizar_perfil():
    """Endpoint para atualizar perfil do usuário"""
    try:
        logger.info("Iniciando atualização de perfil do usuário")
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Token de autorização não fornecido para atualização")
            return ResponseFormatter.unauthorized("Token de autorização necessário")
        
        token = auth_header.split(' ')[1]
        
        # Obter dados do corpo da requisição
        data = request.get_json()
        if not data:
            logger.warning("Dados não fornecidos para atualização de perfil")
            return ResponseFormatter.bad_request("Dados não fornecidos")
        
        # Campos permitidos para atualização
        campos_permitidos = ['nome', 'cargo', 'bloco', 'nivel_escolaridade']
        dados_atualizacao = {}
        
        for campo in campos_permitidos:
            if campo in data:
                dados_atualizacao[campo] = data[campo]
        
        if not dados_atualizacao:
            logger.warning("Nenhum campo válido fornecido para atualização")
            return ResponseFormatter.bad_request("Nenhum campo válido para atualização")
        
        logger.info("Campos validados para atualização", extra={
            "campos": list(dados_atualizacao.keys())
        })
        
        # Adicionar timestamp de atualização
        dados_atualizacao['ultimo_acesso'] = datetime.now().isoformat()
        
        # Verificar se o Firebase está conectado
        if firebase_config.is_connected():
            try:
                # Verificar token no Firebase
                decoded_token = firebase_auth.verify_id_token(token)
                uid = decoded_token['uid']
                
                logger.info("Token Firebase verificado para atualização", extra={"uid": uid})
                
                # Atualizar dados no Firestore
                db = firebase_config.get_db()
                doc_ref = db.collection('usuarios').document(uid)
                
                # Verificar se o usuário existe
                doc = doc_ref.get()
                if not doc.exists:
                    logger.warning("Usuário não encontrado para atualização", extra={"uid": uid})
                    return ResponseFormatter.not_found("Usuário não encontrado")
                
                # Atualizar documento
                doc_ref.update(dados_atualizacao)
                
                logger.info("Perfil atualizado no Firebase", extra={
                    "uid": uid,
                    "campos_atualizados": list(dados_atualizacao.keys())
                })
                
                # Buscar dados atualizados
                doc_atualizado = doc_ref.get()
                usuario_data = doc_atualizado.to_dict()
                
                # Remover dados sensíveis
                if 'senha' in usuario_data:
                    del usuario_data['senha']
                
                return ResponseFormatter.success(
                    data=usuario_data,
                    message="Perfil atualizado com sucesso"
                )
                
            except firebase_auth.InvalidIdTokenError:
                logger.warning("Token Firebase inválido para atualização")
                return ResponseFormatter.unauthorized("Token inválido")
            except firebase_auth.ExpiredIdTokenError:
                logger.warning("Token Firebase expirado para atualização")
                return ResponseFormatter.unauthorized("Token expirado")
            except Exception as e:
                logger.error("Erro ao atualizar perfil no Firebase", extra={"error": str(e)})
                # Fallback para modo desenvolvimento
                pass
        
        # Modo desenvolvimento - simulação de atualização
        logger.info("Usando modo desenvolvimento para atualizar perfil")
        
        if len(token) < 10:  # Validação básica
            logger.warning("Token inválido no modo desenvolvimento para atualização")
            return ResponseFormatter.unauthorized("Token inválido")
        
        # Simular dados atualizados
        usuario_data = {
            'id': token,
            'nome': dados_atualizacao.get('nome', 'Usuário Teste'),
            'email': 'teste@exemplo.com',
            'cargo': dados_atualizacao.get('cargo', 'Enfermeiro'),
            'bloco': dados_atualizacao.get('bloco', 'Bloco 1 - Seguridade Social'),
            'nivel_escolaridade': dados_atualizacao.get('nivel_escolaridade', 'Superior'),
            'vida': 80,
            'pontuacao': 1250,
            'status': 'ativo',
            'data_criacao': '2024-01-15T10:30:00',
            'ultimo_acesso': dados_atualizacao['ultimo_acesso']
        }
        
        logger.info("Perfil atualizado com sucesso via modo desenvolvimento", extra={
            "campos_atualizados": list(dados_atualizacao.keys()),
            "nome": usuario_data.get('nome'),
            "email": usuario_data.get('email')
        })
        
        return ResponseFormatter.success(
            data=usuario_data,
            message="Perfil atualizado com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro interno ao atualizar perfil do usuário", extra={"error": str(e)})
        return ResponseFormatter.internal_error("Erro interno do servidor")
