from flask import Blueprint, request, jsonify
from ..services.plano_service import plano_service
from firebase_admin import auth
from datetime import datetime

planos_bp = Blueprint('planos', __name__)

@planos_bp.route('/planos', methods=['GET'])
def listar_planos():
    """Lista todos os planos disponíveis"""
    try:
        planos = [
            {
                'id': 'gratuito',
                'nome': 'Gratuito/Trial',
                'preco': 0.00,
                'periodo': 'ilimitado',
                'descricao': 'Experimente gratuitamente com recursos básicos',
                'recursos': [
                    '✅ 3 questões limitadas',
                    '❌ Simulados',
                    '❌ Relatórios',
                    '❌ Ranking',
                    '❌ Suporte',
                    '❌ Macetes',
                    '❌ Modo foco',
                    '❌ Redação'
                ],
                'popular': False,
                'duracao': 'ilimitado',
                'tipo': 'gratuito'
            },
            {
                'id': 'promo',
                'nome': 'Promo (Semanal)',
                'preco': 5.90,
                'periodo': '7 dias',
                'descricao': 'Acesso completo por 1 semana com ótimo custo-benefício',
                'recursos': [
                    '✅ Questões ilimitadas',
                    '✅ Simulados',
                    '✅ Relatórios',
                    '✅ Ranking',
                    '✅ Suporte',
                    '❌ Macetes',
                    '❌ Modo foco',
                    '❌ Redação'
                ],
                'popular': False,
                'duracao': '7 dias',
                'tipo': 'promo'
            },
            {
                'id': 'lite',
                'nome': 'Lite (Mensal)',
                'preco': 14.90,
                'periodo': '30 dias',
                'descricao': 'Acesso completo por 1 mês - ideal para estudos regulares',
                'recursos': [
                    '✅ Questões ilimitadas',
                    '✅ Simulados',
                    '✅ Relatórios',
                    '✅ Ranking',
                    '✅ Suporte',
                    '❌ Macetes',
                    '❌ Modo foco',
                    '❌ Redação'
                ],
                'popular': False,
                'duracao': '30 dias',
                'tipo': 'lite'
            },
            {
                'id': 'premium',
                'nome': 'Premium (Bimestral)',
                'preco': 20.00,
                'periodo': '60 dias',
                'descricao': 'Acesso completo por 2 meses - melhor valor',
                'recursos': [
                    '✅ Questões ilimitadas',
                    '✅ Simulados',
                    '✅ Relatórios',
                    '✅ Ranking',
                    '✅ Suporte',
                    '❌ Macetes',
                    '❌ Modo foco',
                    '❌ Redação'
                ],
                'popular': True,
                'duracao': '60 dias',
                'tipo': 'premium'
            },
            {
                'id': 'premium_plus',
                'nome': 'Premium Plus',
                'preco': 40.00,
                'periodo': '60 dias',
                'descricao': 'Recursos avançados com macetes e modo foco',
                'recursos': [
                    '✅ Todos os recursos anteriores',
                    '✅ Macetes',
                    '✅ Modo foco',
                    '❌ Redação'
                ],
                'popular': False,
                'duracao': '60 dias',
                'tipo': 'premium_plus'
            },
            {
                'id': 'black',
                'nome': 'Black CNU ⭐',
                'preco': 70.00,
                'periodo': 'até 5 de dezembro de 2025',
                'descricao': 'Plano completo com todos os recursos premium',
                'recursos': [
                    '✅ Todos os recursos',
                    '✅ Macetes',
                    '✅ Modo foco',
                    '✅ Redação',
                    '✅ Chat tira-dúvidas',
                    '✅ Pontos centrais',
                    '✅ Outras explorações'
                ],
                'popular': True,
                'duracao': 'até 5 de dezembro de 2025',
                'tipo': 'black'
            }
        ]
        
        return jsonify({
            'sucesso': True,
            'planos': planos
        })
        
    except Exception as e:
        print(f"Erro ao listar planos: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

@planos_bp.route('/planos/usuario', methods=['GET'])
def obter_plano_usuario():
    """Obtém o plano atual do usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autorização é obrigatório'}), 401
        
        token = auth_header.split(' ')[1]
        
        # Para desenvolvimento, usar token como user_id
        # Em produção, verificar token JWT
        user_id = token
        
        plano = plano_service.obter_plano_usuario(user_id)
        
        return jsonify({
            'sucesso': True,
            'plano': plano
        })
        
    except Exception as e:
        print(f"Erro ao obter plano do usuário: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

@planos_bp.route('/planos/ativar', methods=['POST'])
def ativar_plano():
    """Ativa um plano para o usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autorização é obrigatório'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        data = request.get_json()
        tipo_plano = data.get('tipo_plano')
        metodo_pagamento = data.get('metodo_pagamento')
        
        if not tipo_plano:
            return jsonify({'erro': 'Tipo de plano é obrigatório'}), 400
        
        # Ativar o plano
        plano_info = plano_service.ativar_plano(user_id, tipo_plano, metodo_pagamento)
        
        return jsonify({
            'sucesso': True,
            'plano': plano_info,
            'mensagem': f'Plano {tipo_plano} ativado com sucesso'
        })
        
    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        print(f"Erro ao ativar plano: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

@planos_bp.route('/planos/verificar-acesso', methods=['POST'])
def verificar_acesso():
    """Verifica se o usuário tem acesso a um recurso específico"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autorização é obrigatório'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        data = request.get_json()
        recurso = data.get('recurso')
        
        if not recurso:
            return jsonify({'erro': 'Recurso é obrigatório'}), 400
        
        tem_acesso = plano_service.verificar_acesso_recurso(user_id, recurso)
        
        return jsonify({
            'sucesso': True,
            'tem_acesso': tem_acesso,
            'recurso': recurso
        })
        
    except Exception as e:
        print(f"Erro ao verificar acesso: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

@planos_bp.route('/planos/limite-questoes', methods=['GET'])
def obter_limite_questoes():
    """Obtém o limite de questões para o usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autorização é obrigatório'}), 401
        
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
            return jsonify({'erro': 'Tipo de plano é obrigatório'}), 400
        
        # Simular processamento de pagamento
        # Em produção, integrar com gateway de pagamento real
        pagamento_aprovado = True  # Simular aprovação
        
        if pagamento_aprovado:
            # Ativar o plano após pagamento aprovado
            plano_info = plano_service.ativar_plano(user_id, tipo_plano, metodo_pagamento)
            
            return jsonify({
                'sucesso': True,
                'pagamento_aprovado': True,
                'plano': plano_info,
                'mensagem': 'Pagamento processado e plano ativado com sucesso'
            })
        else:
            return jsonify({
                'sucesso': False,
                'pagamento_aprovado': False,
                'erro': 'Pagamento não foi aprovado'
            }), 400
        
    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
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
                'sucesso': True,
                'historico': []
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