from flask import Blueprint, request
from models.user import User, db
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request

user_bp = Blueprint('user', __name__)
logger = StructuredLogger('user')

@user_bp.route('/usuarios', methods=['GET'])
@log_request(logger)
def obter_usuarios():
    try:
        logger.info("Listando todos os usuários")
        users = User.query.all()
        logger.info("Usuários recuperados com sucesso", extra={"total_usuarios": len(users)})
        return ResponseFormatter.success([user.to_dict() for user in users], 'Usuários recuperados com sucesso')
    except Exception as e:
        logger.error("Erro ao listar usuários", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@user_bp.route('/users', methods=['POST'])
@log_request(logger)
def create_user():
    try:
        logger.info("Criando novo usuário")
        data = request.json
        
        if not data or not data.get('username') or not data.get('email'):
            logger.warning("Dados obrigatórios não fornecidos")
            return ResponseFormatter.bad_request('Username e email são obrigatórios')
        
        logger.info("Criando usuário", extra={"username": data['username'], "email": data['email']})
        user = User(username=data['username'], email=data['email'])
        db.session.add(user)
        db.session.commit()
        
        logger.info("Usuário criado com sucesso", extra={"user_id": user.id, "username": user.username})
        return ResponseFormatter.created(user.to_dict(), 'Usuário criado com sucesso')
    except Exception as e:
        logger.error("Erro ao criar usuário", extra={"error": str(e)})
        db.session.rollback()
        return ResponseFormatter.internal_error('Erro interno do servidor')

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@log_request(logger)
def get_user(user_id):
    try:
        logger.info("Buscando usuário", extra={"user_id": user_id})
        user = User.query.get_or_404(user_id)
        logger.info("Usuário encontrado", extra={"user_id": user_id, "username": user.username})
        return ResponseFormatter.success(user.to_dict(), 'Usuário encontrado')
    except Exception as e:
        logger.error("Erro ao buscar usuário", extra={"user_id": user_id, "error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@log_request(logger)
def update_user(user_id):
    try:
        logger.info("Atualizando usuário", extra={"user_id": user_id})
        user = User.query.get_or_404(user_id)
        data = request.json
        
        if not data:
            logger.warning("Dados para atualização não fornecidos", extra={"user_id": user_id})
            return ResponseFormatter.bad_request('Dados para atualização são obrigatórios')
        
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        db.session.commit()
        
        logger.info("Usuário atualizado com sucesso", extra={"user_id": user_id, "username": user.username})
        return ResponseFormatter.success(user.to_dict(), 'Usuário atualizado com sucesso')
    except Exception as e:
        logger.error("Erro ao atualizar usuário", extra={"user_id": user_id, "error": str(e)})
        db.session.rollback()
        return ResponseFormatter.internal_error('Erro interno do servidor')

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@log_request(logger)
def delete_user(user_id):
    try:
        logger.info("Deletando usuário", extra={"user_id": user_id})
        user = User.query.get_or_404(user_id)
        username = user.username  # Store for logging
        db.session.delete(user)
        db.session.commit()
        
        logger.info("Usuário deletado com sucesso", extra={"user_id": user_id, "username": username})
        return ResponseFormatter.success({}, 'Usuário deletado com sucesso')
    except Exception as e:
        logger.error("Erro ao deletar usuário", extra={"user_id": user_id, "error": str(e)})
        db.session.rollback()
        return ResponseFormatter.internal_error('Erro interno do servidor')
