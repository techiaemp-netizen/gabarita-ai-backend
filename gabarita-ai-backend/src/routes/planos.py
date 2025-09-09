from flask import Blueprint, request, jsonify
from ..services.plano_service import plano_service
from firebase_admin import auth
from datetime import datetime

planos_bp = Blueprint('planos', __name__)

@planos_bp.route('/planos', methods=['GET'])
@planos_bp.route('/plans', methods=['GET'])  # Alias em inglês
def listar_planos():
    """Lista todos os planos disponíveis dinamicamente"""
    try:
        # Buscar planos do serviço (dados reais)
        planos = plano_service.listar_planos_disponiveis()
        
        # Adicionar timestamp para indicar dados dinâmicos
        for plano in planos:
            plano['updated_at'] = datetime.now().isoformat()
            plano['source'] = 'dynamic_service'
        
        return jsonify({
            'success': True,
            'data': planos
        })
        
    except Exception as e:
        print(f"Erro ao listar planos: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@planos_bp.route('/planos/usuario', methods=['GET'])
def obter_plano_usuario():
    """Obtém o plano atual do usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Token de autorização é obrigatório'
            }), 401
        
        token = auth_header.split(' ')[1]
        
        # Para desenvolvimento, usar token como user_id
        # Em produção, verificar token JWT
        user_id = token
        
        plano = plano_service.obter_plano_usuario(user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'plano': plano
            }
        })
        
    except Exception as e:
        print(f"Erro ao obter plano do usuário: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@planos_bp.route('/planos/ativar', methods=['POST'])
def ativar_plano():
    """Ativa um plano para o usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Token de autorização é obrigatório'
            }), 401
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        data = request.get_json()
        tipo_plano = data.get('tipo_plano')
        metodo_pagamento = data.get('metodo_pagamento')
        
        if not tipo_plano:
            return jsonify({
                'success': False,
                'error': 'Tipo de plano é obrigatório'
            }), 400
        
        # Ativar o plano
        plano_info = plano_service.ativar_plano(user_id, tipo_plano, metodo_pagamento)
        
        return jsonify({
            'success': True,
            'data': {
                'plano': plano_info
            },
            'message': f'Plano {tipo_plano} ativado com sucesso'
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        print(f"Erro ao ativar plano: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@planos_bp.route('/planos/verificar-acesso', methods=['POST'])
def verificar_acesso():
    """Verifica se o usuário tem acesso a um recurso específico"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Token de autorização é obrigatório'
            }), 401
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        data = request.get_json()
        recurso = data.get('recurso')
        
        if not recurso:
            return jsonify({
                'success': False,
                'error': 'Recurso é obrigatório'
            }), 400
        
        tem_acesso = plano_service.verificar_acesso_recurso(user_id, recurso)
        
        return jsonify({
            'success': True,
            'data': {
                'tem_acesso': tem_acesso,
                'recurso': recurso
            }
        })
        
    except Exception as e:
        print(f"Erro ao verificar acesso: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@planos_bp.route('/planos/limite-questoes', methods=['GET'])
def obter_limite_questoes():
    """Obtém o limite de questões para o usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Token de autorização é obrigatório'
            }), 401
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        limite = plano_service.obter_limite_questoes(user_id)
        
        return jsonify({
            'sucesso': True,
            'limite_questoes': limite,
            'ilimitado': limite is None
        })
        
    except Exception as e:
        print(f"Erro ao obter limite de questões: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

@planos_bp.route('/planos/processar-pagamento', methods=['POST'])
def processar_pagamento():
    """Processa o pagamento de um plano"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autorização é obrigatório'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        data = request.get_json()
        tipo_plano = data.get('tipo_plano')
        metodo_pagamento = data.get('metodo_pagamento', 'mercado_pago')
        dados_pagamento = data.get('dados_pagamento', {})
        
        if not tipo_plano:
            return jsonify({
                'success': False,
                'error': 'Tipo de plano é obrigatório'
            }), 400
        
        # Simular processamento de pagamento
        # Em produção, integrar com gateway de pagamento real
        pagamento_aprovado = True  # Simular aprovação
        
        if pagamento_aprovado:
            # Ativar o plano após pagamento aprovado
            plano_info = plano_service.ativar_plano(user_id, tipo_plano, metodo_pagamento)
            
            return jsonify({
                'success': True,
                'data': {
                    'payment_approved': True,
                    'plan': plano_info,
                    'message': 'Pagamento processado e plano ativado com sucesso'
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Pagamento não foi aprovado'
            }), 400
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        print(f"Erro ao processar pagamento: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

@planos_bp.route('/planos/historico', methods=['GET'])
def obter_historico_planos():
    """Obtém o histórico de planos do usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autorização é obrigatório'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        # Buscar histórico no Firestore
        db = plano_service.db
        if not db:
            return jsonify({
                'success': True,
                'data': {
                    'historico': []
                }
            })
        
        historico_docs = db.collection('historico_planos').where('user_id', '==', user_id).order_by('data_registro', direction=firestore.Query.DESCENDING).get()
        
        historico = []
        for doc in historico_docs:
            historico.append(doc.to_dict())
        
        return jsonify({
            'sucesso': True,
            'historico': historico
        })
        
    except Exception as e:
        print(f"Erro ao obter histórico de planos: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500