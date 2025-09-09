from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import re
from ..config.firebase_config import firebase_config

signup_bp = Blueprint('signup', __name__)
db = firebase_config.get_db()

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

@signup_bp.route('/signup', methods=['POST'])
@signup_bp.route('/api/signup', methods=['POST'])
def signup():
    """Endpoint para cadastro de usuários"""
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
        nickname = data.get('nickname', '').strip()
        nome = data.get('nome', '').strip()
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Dados obrigatórios ausentes',
                'message': 'Email e senha são obrigatórios'
            }), 400
        
        # Validações
        if not validate_email(email):
            return jsonify({
                'success': False,
                'error': 'Email inválido',
                'message': 'Formato de email inválido'
            }), 400
        
        is_valid_password, password_error = validate_password(password)
        if not is_valid_password:
            return jsonify({
                'success': False,
                'error': 'Senha inválida',
                'message': password_error
            }), 400
        
        if nickname:
            is_valid_nickname, nickname_error = validate_nickname(nickname)
            if not is_valid_nickname:
                return jsonify({
                    'success': False,
                    'error': 'Nickname inválido',
                    'message': nickname_error
                }), 400
        
        # Verificar se usuário já existe
        try:
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
            'nickname': nickname or email.split('@')[0],
            'nome': nome or nickname or email.split('@')[0],
            'plano': 'trial',  # Plano padrão
            'createdAt': 'desenvolvimento',
            'ativo': True,
            'configuracoes': {
                'notificacoes': True,
                'tema': 'claro'
            }
        }
        
        try:
            # Salvar no Firebase
            doc_ref = users_ref.add(user_data)
            user_id = doc_ref[1].id
            
            return jsonify({
                'success': True,
                'message': 'Usuário cadastrado com sucesso',
                'data': {
                    'user_id': user_id,
                    'email': email,
                    'nickname': user_data['nickname'],
                    'nome': user_data['nome'],
                    'plano': user_data['plano'],
                    'token': user_id
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
        print(f"Erro no cadastro: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno',
            'message': 'Erro interno do servidor'
        }), 500

# Login endpoint removido - usar apenas o endpoint em auth.py