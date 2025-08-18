from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from firebase_admin import firestore
from config.firebase_config import firebase_config
import re

signup_bp = Blueprint('signup', __name__)

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

@signup_bp.route('/signup', methods=['POST'])
def signup():
    """Endpoint para cadastro de usuario com hash de senha"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatorios
        required_fields = ['nomeCompleto', 'cpf', 'email', 'senha']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'sucesso': False,
                    'erro': f'Campo {field} e obrigatorio'
                }), 400
        
        nome_completo = data['nomeCompleto'].strip()
        cpf = data['cpf'].strip()
        email = data['email'].strip().lower()
        senha = data['senha']
        
        # Validacoes
        if not validate_email(email):
            return jsonify({
                'sucesso': False,
                'erro': 'Email invalido'
            }), 400
        
        # Validar CPF (implementação básica)
        if not cpf or len(cpf.replace('.', '').replace('-', '')) != 11:
            return jsonify({
                'sucesso': False,
                'erro': 'CPF invalido'
            }), 400
        
        is_valid_password, password_error = validate_password(senha)
        if not is_valid_password:
            return jsonify({
                'sucesso': False,
                'erro': password_error
            }), 400
        
        # Verificar se email ja existe
        db = get_db()
        if db is None:
            # Modo desenvolvimento sem Firebase - permitir cadastro
            print("⚠️ Firebase não configurado, cadastro em modo desenvolvimento")
        else:
            users_ref = db.collection('users')
            existing_user = users_ref.where('email', '==', email).limit(1).get()
            
            if existing_user:
                return jsonify({
                    'sucesso': False,
                    'erro': 'Email ja cadastrado'
                }), 409
            
            # Verificar se CPF ja existe
            existing_cpf = users_ref.where('cpf', '==', cpf).limit(1).get()
        
            if existing_cpf:
                return jsonify({
                    'sucesso': False,
                    'erro': 'CPF ja cadastrado'
                }), 409
        
        # Gerar hash da senha
        password_hash = generate_password_hash(senha)
        
        # Criar usuario no Firestore
        user_data = {
            'nomeCompleto': nome_completo,
            'cpf': cpf,
            'email': email,
            'password_hash': password_hash,
            'freeQuestionsRemaining': 3,
            'createdAt': 'desenvolvimento',  # Em desenvolvimento, usar string simples
            'totalAnswered': 0,
            'correctAnswers': 0,
            'planId': 'free',
            'profileComplete': True
        }
        
        # Adicionar usuario
        if db is not None:
            doc_ref = users_ref.add(user_data)
            user_id = doc_ref[1].id
        else:
            # Modo desenvolvimento - simular ID
            user_id = 'dev-user-' + email.replace('@', '-').replace('.', '-')
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Usuario cadastrado com sucesso (modo desenvolvimento)' if db is None else 'Usuario cadastrado com sucesso',
            'userId': user_id
        }), 201
        
    except Exception as e:
        print(f"Erro no cadastro: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500

@signup_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para login com verificacao de hash"""
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        senha = data.get('senha', '')
        
        if not email or not senha:
            return jsonify({
                'sucesso': False,
                'erro': 'Email e senha sao obrigatorios'
            }), 400
        
        # Buscar usuario por email
        db = get_db()
        if not db:
            return jsonify({
                'sucesso': False,
                'erro': 'Serviço temporariamente indisponível'
            }), 503
        
        users_ref = db.collection('users')
        user_query = users_ref.where('email', '==', email).limit(1).get()
        
        if not user_query:
            return jsonify({
                'sucesso': False,
                'erro': 'Usuario nao encontrado'
            }), 404
        
        user_doc = user_query[0]
        user_data = user_doc.to_dict()
        
        # Verificar senha
        if not check_password_hash(user_data.get('password_hash', ''), senha):
            return jsonify({
                'sucesso': False,
                'erro': 'Senha incorreta'
            }), 401
        
        # Remover hash da senha dos dados retornados
        user_data.pop('password_hash', None)
        user_data['id'] = user_doc.id
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Login realizado com sucesso',
            'usuario': user_data
        }), 200
        
    except Exception as e:
        print(f"Erro no login: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500