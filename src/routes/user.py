from flask import Blueprint, jsonify, request
from src.config.firebase_config import firebase_config
from datetime import datetime
import uuid

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    """Endpoint para obter perfil do usuário - alias para /api/user/profile"""
    try:
        # Simular obtenção do perfil do usuário autenticado
        # Em produção, usar token JWT para identificar o usuário
        
        if firebase_config.is_connected():
            # Implementação com Firebase seria aqui
            pass
        
        # Perfil simulado para desenvolvimento
        usuario_simulado = {
            'id': str(uuid.uuid4()),
            'nome': 'Usuário Teste',
            'email': 'usuario@teste.com',
            'cargo': 'Enfermeiro na Atenção Primária',
            'bloco': 'Bloco 5 - Educação, Saúde, Desenvolvimento Social e Direitos Humanos',
            'vida': 85,
            'pontuacao': 1250,
            'nivel_escolaridade': 'Superior',
            'status': 'ativo',
            'data_criacao': datetime.now().isoformat(),
            'ultimo_acesso': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user': usuario_simulado
            }
        })
        
    except Exception as e:
        print(f"Erro ao obter perfil: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Endpoint para atualizar perfil do usuário - alias para /api/user/profile"""
    try:
        data = request.get_json()
        
        if firebase_config.is_connected():
            # Implementação com Firebase seria aqui
            pass
        
        # Simular atualização do perfil
        usuario_atualizado = {
            'id': str(uuid.uuid4()),
            'nome': data.get('nome', 'Usuário Teste'),
            'email': data.get('email', 'usuario@teste.com'),
            'cargo': data.get('cargo', 'Enfermeiro na Atenção Primária'),
            'bloco': data.get('bloco', 'Bloco 5 - Educação, Saúde, Desenvolvimento Social e Direitos Humanos'),
            'nivel_escolaridade': data.get('nivel_escolaridade', 'Superior'),
            'ultimo_acesso': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user': usuario_atualizado,
                'message': 'Perfil atualizado com sucesso'
            }
        })
        
    except Exception as e:
        print(f"Erro ao atualizar perfil: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

# Alias para compatibilidade com diferentes nomenclaturas
@user_bp.route('/<user_id>', methods=['GET'])
def get_user_by_id(user_id):
    """Endpoint para obter usuário por ID"""
    return get_profile()  # Redirecionar para o perfil

@user_bp.route('/<user_id>', methods=['PUT'])
def update_user_by_id(user_id):
    """Endpoint para atualizar usuário por ID"""
    return update_profile()  # Redirecionar para atualização de perfil
