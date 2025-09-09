from flask import Blueprint, request, jsonify
from services.plano_service import plano_service
from functools import wraps
import jwt
import os

planos_bp = Blueprint('planos', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({
                'success': False,
                'error': 'Token é obrigatório'
            }), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({
                'success': False,
                'error': 'Token inválido'
            }), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

@planos_bp.route('/planos', methods=['GET'])
def listar_planos():
    """Lista todos os planos disponíveis"""
    try:
        planos = plano_service.listar_planos()
        return jsonify({
            'success': True,
            'data': {
                'planos': planos
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@planos_bp.route('/planos/usuario', methods=['GET'])
@token_required
def obter_plano_usuario(current_user_id):
    """Obtém o plano atual do usuário"""
    try:
        plano = plano_service.obter_plano_usuario(current_user_id)
        return jsonify({
            'success': True,
            'data': {
                'plano': plano
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@planos_bp.route('/planos/ativar', methods=['POST'])
@token_required
def ativar_plano(current_user_id):
    """Ativa um plano para o usuário"""
    try:
        data = request.get_json()
        plano_id = data.get('plano_id')
        
        if not plano_id:
            return jsonify({
                'success': False,
                'error': 'plano_id é obrigatório'
            }), 400
        
        resultado = plano_service.ativar_plano(current_user_id, plano_id)
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@planos_bp.route('/planos/verificar-acesso', methods=['GET'])
@token_required
def verificar_acesso(current_user_id):
    """Verifica se o usuário tem acesso a determinada funcionalidade"""
    try:
        funcionalidade = request.args.get('funcionalidade')
        
        if not funcionalidade:
            return jsonify({
                'success': False,
                'error': 'funcionalidade é obrigatória'
            }), 400
        
        tem_acesso = plano_service.verificar_acesso(current_user_id, funcionalidade)
        return jsonify({
            'success': True,
            'data': {
                'tem_acesso': tem_acesso
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@planos_bp.route('/planos/limite-questoes', methods=['GET'])
@token_required
def obter_limite_questoes(current_user_id):
    """Obtém o limite de questões do usuário"""
    try:
        limite = plano_service.obter_limite_questoes(current_user_id)
        return jsonify({
            'success': True,
            'data': {
                'limite_questoes': limite
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@planos_bp.route('/planos/processar-pagamento', methods=['POST'])
@token_required
def processar_pagamento(current_user_id):
    """Processa o pagamento de um plano"""
    try:
        data = request.get_json()
        plano_id = data.get('plano_id')
        metodo_pagamento = data.get('metodo_pagamento')
        
        if not plano_id or not metodo_pagamento:
            return jsonify({
                'success': False,
                'error': 'plano_id e metodo_pagamento são obrigatórios'
            }), 400
        
        resultado = plano_service.processar_pagamento(current_user_id, plano_id, metodo_pagamento)
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@planos_bp.route('/planos/historico', methods=['GET'])
@token_required
def obter_historico_planos(current_user_id):
    """Obtém o histórico de planos do usuário"""
    try:
        historico = plano_service.obter_historico_planos(current_user_id)
        return jsonify(historico), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
