from flask import Blueprint, jsonify, request
from src.models.user import User, db
from ..config.firebase_config import firebase_config
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/', methods=['GET'])
def get_users():
    """Lista todos os usuários"""
    users = User.query.all()
    return jsonify({
        'success': True,
        'data': [user.to_dict() for user in users],
        'message': 'Usuários listados com sucesso'
    })

@user_bp.route('/', methods=['POST'])
def create_user():
    """Cria um novo usuário"""
    try:
        data = request.json
        if not data or not data.get('username') or not data.get('email'):
            return jsonify({
                'success': False,
                'error': 'Username e email são obrigatórios'
            }), 400
            
        user = User(username=data['username'], email=data['email'])
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': user.to_dict(),
            'message': 'Usuário criado com sucesso'
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@user_bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Obtém dados de um usuário específico"""
    try:
        # Buscar dados do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            db = firebase_config.get_db()
            user_ref = db.collection('usuarios').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                # Padronizar campos para inglês
                profile_data = {
                    'id': user_id,
                    'name': user_data.get('nome', user_data.get('nomeCompleto', 'Usuário')),
                    'email': user_data.get('email', ''),
                    'level': user_data.get('nivel', 1),
                    'xp': user_data.get('xp', 0),
                    'accuracy': user_data.get('taxa_acerto', 0),
                    'plan': user_data.get('plano', 'free'),
                    'cargo': user_data.get('cargo', ''),
                    'bloco': user_data.get('bloco', ''),
                    'questionsAnswered': user_data.get('questoes_respondidas', 0)
                }
                
                return jsonify({
                    'success': True,
                    'data': profile_data,
                    'message': 'Usuário encontrado'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Usuário não encontrado'
                }), 404
        else:
            # Modo desenvolvimento - retornar dados simulados
            profile_data = {
                'id': user_id,
                'name': 'Desenvolvedor',
                'email': 'dev@example.com',
                'level': 1,
                'xp': 0,
                'accuracy': 0,
                'plan': 'free',
                'cargo': 'Enfermeiro',
                'bloco': 'Saúde',
                'questionsAnswered': 0
            }
            
            return jsonify({
                'success': True,
                'data': profile_data,
                'message': 'Usuário encontrado (modo dev)'
            })
            
    except Exception as e:
        print(f"Erro ao buscar usuário: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@user_bp.route('/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Atualiza dados de um usuário específico"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados para atualização são obrigatórios'
            }), 400
        
        # Modo desenvolvimento - simular atualização
        profile_data = {
            'id': user_id,
            'name': data.get('name', 'Desenvolvedor'),
            'email': data.get('email', 'dev@example.com'),
            'level': 1,
            'xp': 0,
            'accuracy': 0,
            'plan': 'free',
            'cargo': data.get('cargo', 'Enfermeiro'),
            'bloco': data.get('bloco', 'Saúde'),
            'questionsAnswered': 0
        }
        
        return jsonify({
            'success': True,
            'data': profile_data,
            'message': 'Usuário atualizado com sucesso'
        })
            
    except Exception as e:
        print(f"Erro ao atualizar usuário: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@user_bp.route('/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Remove um usuário específico"""
    try:
        # Modo desenvolvimento - simular remoção
        return jsonify({
            'success': True,
            'message': 'Usuário removido com sucesso'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    """Endpoint para obter perfil do usuário"""
    try:
        # Obter usuario_id do token de autenticação
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Token de autorização é obrigatório'
            }), 401
        
        usuario_id = auth_header.split(' ')[1]
        
        # Buscar dados do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            db = firebase_config.get_db()
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                # Padronizar campos para inglês
                profile_data = {
                    'id': usuario_id,
                    'name': user_data.get('nome', user_data.get('nomeCompleto', 'Usuário')),
                    'email': user_data.get('email', ''),
                    'level': user_data.get('nivel', 1),
                    'xp': user_data.get('xp', 0),
                    'accuracy': user_data.get('taxa_acerto', 0),
                    'plan': user_data.get('plano', 'free'),
                    'cargo': user_data.get('cargo', ''),
                    'bloco': user_data.get('bloco', ''),
                    'questionsAnswered': user_data.get('questoes_respondidas', 0)
                }
                
                return jsonify({
                    'success': True,
                    'data': profile_data
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Usuário não encontrado'
                }), 404
        else:
            # Modo desenvolvimento - retornar dados simulados
            profile_data = {
                'id': usuario_id,
                'name': 'Desenvolvedor',
                'email': 'dev@example.com',
                'level': 1,
                'xp': 0,
                'accuracy': 0,
                'plan': 'free',
                'cargo': 'Enfermeiro',
                'bloco': 'Saúde',
                'questionsAnswered': 0
            }
            
            return jsonify({
                'success': True,
                'data': profile_data
            })
            
    except Exception as e:
        print(f"Erro ao buscar perfil: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Endpoint para atualizar perfil do usuário"""
    try:
        # Obter usuario_id do token de autenticação
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Token de autorização é obrigatório'
            }), 401
        
        usuario_id = auth_header.split(' ')[1]
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados para atualização são obrigatórios'
            }), 400
        
        # Modo desenvolvimento - simular atualização
        profile_data = {
            'id': usuario_id,
            'name': data.get('name', 'Desenvolvedor'),
            'email': data.get('email', 'dev@example.com'),
            'level': 1,
            'xp': 0,
            'accuracy': 0,
            'plan': 'free',
            'cargo': data.get('cargo', 'Enfermeiro'),
            'bloco': data.get('bloco', 'Saúde'),
            'questionsAnswered': 0
        }
        
        return jsonify({
            'success': True,
            'data': profile_data,
            'message': 'Perfil atualizado com sucesso'
        })
            
    except Exception as e:
        print(f"Erro ao atualizar perfil: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500
