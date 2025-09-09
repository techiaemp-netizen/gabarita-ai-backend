from functools import wraps
from flask import request, jsonify, current_app
import jwt
import os
from datetime import datetime

# Configurações JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'gabarita-ai-secret-key-2024')
JWT_ALGORITHM = 'HS256'

def token_required(f):
    """
    Decorator para proteger rotas que requerem autenticação JWT
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Verificar se o token está no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Formato esperado: "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    'success': False,
                    'error': 'Token inválido',
                    'message': 'Formato de token inválido. Use: Bearer <token>'
                }), 401
        
        # Verificar se o token está nos parâmetros da query
        elif 'token' in request.args:
            token = request.args.get('token')
        
        # Verificar se o token está no corpo da requisição (para POST)
        elif request.is_json and request.get_json() and 'token' in request.get_json():
            token = request.get_json().get('token')
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'Token ausente',
                'message': 'Token de acesso é obrigatório'
            }), 401
        
        try:
            # Decodificar o token
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            # Verificar se o token não expirou
            if 'exp' in data:
                exp_timestamp = data['exp']
                if datetime.utcnow().timestamp() > exp_timestamp:
                    return jsonify({
                        'success': False,
                        'error': 'Token expirado',
                        'message': 'Token de acesso expirado. Faça login novamente.'
                    }), 401
            
            # Adicionar dados do usuário ao request para uso na rota
            request.current_user = {
                'user_id': data.get('user_id'),
                'email': data.get('email'),
                'plano': data.get('plano', 'trial')
            }
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'error': 'Token expirado',
                'message': 'Token de acesso expirado. Faça login novamente.'
            }), 401
        
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'error': 'Token inválido',
                'message': 'Token de acesso inválido'
            }), 401
        
        except Exception as e:
            print(f"Erro na validação do token: {e}")
            return jsonify({
                'success': False,
                'error': 'Erro de autenticação',
                'message': 'Erro interno na validação do token'
            }), 500
        
        return f(*args, **kwargs)
    
    return decorated

def optional_token(f):
    """
    Decorator para rotas onde o token é opcional
    Se presente, adiciona os dados do usuário ao request
    Se ausente, continua normalmente
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Tentar obter o token (mesmo processo do token_required)
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                pass
        elif 'token' in request.args:
            token = request.args.get('token')
        elif request.is_json and request.get_json() and 'token' in request.get_json():
            token = request.get_json().get('token')
        
        # Se não há token, continuar sem autenticação
        if not token:
            request.current_user = None
            return f(*args, **kwargs)
        
        try:
            # Tentar decodificar o token
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            # Verificar expiração
            if 'exp' in data and datetime.utcnow().timestamp() > data['exp']:
                request.current_user = None
            else:
                request.current_user = {
                    'user_id': data.get('user_id'),
                    'email': data.get('email'),
                    'plano': data.get('plano', 'trial')
                }
        
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            # Token inválido, mas não é obrigatório
            request.current_user = None
        
        except Exception as e:
            print(f"Erro na validação opcional do token: {e}")
            request.current_user = None
        
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """
    Decorator para rotas que requerem privilégios de administrador
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Primeiro, verificar se há token válido
        token_result = token_required(lambda: None)()
        if token_result is not None:
            return token_result
        
        # Verificar se o usuário tem privilégios de admin
        if not hasattr(request, 'current_user') or not request.current_user:
            return jsonify({
                'success': False,
                'error': 'Acesso negado',
                'message': 'Privilégios de administrador necessários'
            }), 403
        
        # Verificar se o plano permite acesso admin (implementar lógica específica)
        user_plano = request.current_user.get('plano', 'trial')
        if user_plano not in ['admin', 'premium']:
            return jsonify({
                'success': False,
                'error': 'Acesso negado',
                'message': 'Privilégios insuficientes'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated

def generate_jwt_token(user_data, expiration_hours=24):
    """
    Função utilitária para gerar tokens JWT
    """
    from datetime import timedelta
    
    payload = {
        'user_id': user_data.get('user_id'),
        'email': user_data.get('email'),
        'plano': user_data.get('plano', 'trial'),
        'exp': datetime.utcnow() + timedelta(hours=expiration_hours),
        'iat': datetime.utcnow()
    }
    
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token):
    """
    Função utilitária para decodificar tokens JWT
    """
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise Exception("Token expirado")
    except jwt.InvalidTokenError:
        raise Exception("Token inválido")