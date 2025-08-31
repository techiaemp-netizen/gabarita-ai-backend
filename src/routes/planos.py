from flask import Blueprint, request
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request
from services.plano_service import plano_service
from firebase_admin import auth, firestore
from datetime import datetime

planos_bp = Blueprint('planos', __name__)
logger = StructuredLogger('planos')

@planos_bp.route('/', methods=['GET'])
@log_request(logger)
def listar_planos():
    """Lista todos os planos disponíveis"""
    try:
        logger.info("Listando planos disponíveis")
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
        
        logger.info("Planos listados com sucesso", extra={"total_planos": len(planos)})
        return ResponseFormatter.success(planos, 'Planos listados com sucesso')
        
    except Exception as e:
        logger.error("Erro ao listar planos", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@planos_bp.route('/usuario', methods=['GET'])
@log_request(logger)
def obter_plano_usuario():
    """Obtém o plano atual do usuário"""
    try:
        logger.info("Obtendo plano do usuário")
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Token de autorização não fornecido")
            return ResponseFormatter.unauthorized('Token de autorização é obrigatório')
        
        token = auth_header.split(' ')[1]
        
        # Para desenvolvimento, usar token como user_id
        # Em produção, verificar token JWT
        user_id = token
        
        plano = plano_service.obter_plano_usuario(user_id)
        
        logger.info("Plano do usuário obtido com sucesso", extra={"user_id": user_id, "plano": plano.get('tipo') if plano else None})
        return ResponseFormatter.success(plano, 'Plano do usuário obtido com sucesso')
        
    except Exception as e:
        logger.error("Erro ao obter plano do usuário", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@planos_bp.route('/subscribe', methods=['POST'])
@log_request(logger)
def ativar_plano():
    """Ativa um plano para o usuário"""
    try:
        logger.info("Ativando plano para usuário")
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Token de autorização não fornecido")
            return ResponseFormatter.unauthorized('Token de autorização é obrigatório')
        
        token = auth_header.split(' ')[1]
        
        # Extrair user_id do token simples (formato: token-{user_id})
        if token.startswith('token-'):
            user_id = token.replace('token-', '')
        else:
            logger.warning("Formato de token inválido")
            return ResponseFormatter.unauthorized('Token inválido')
        
        data = request.get_json()
        tipo_plano = data.get('tipo_plano')
        metodo_pagamento = data.get('metodo_pagamento')
        
        if not tipo_plano:
            logger.warning("Tipo de plano não fornecido")
            return ResponseFormatter.bad_request('Tipo de plano é obrigatório')
        
        logger.info("Ativando plano", extra={"user_id": user_id, "tipo_plano": tipo_plano, "metodo_pagamento": metodo_pagamento})
        
        # Ativar o plano
        plano_info = plano_service.ativar_plano(user_id, tipo_plano, metodo_pagamento)
        
        logger.info("Plano ativado com sucesso", extra={"user_id": user_id, "tipo_plano": tipo_plano})
        return ResponseFormatter.success(plano_info, f'Plano {tipo_plano} ativado com sucesso')
        
    except ValueError as e:
        logger.warning("Erro de validação ao ativar plano", extra={"error": str(e)})
        return ResponseFormatter.bad_request(str(e))
    except Exception as e:
        logger.error("Erro ao ativar plano", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@planos_bp.route('/verificar-acesso', methods=['POST'])
@log_request(logger)
def verificar_acesso():
    """Verifica se o usuário tem acesso a um recurso específico"""
    try:
        logger.info("Verificando acesso do usuário")
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Token de autorização não fornecido")
            return ResponseFormatter.unauthorized('Token de autorização é obrigatório')
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        data = request.get_json()
        recurso = data.get('recurso')
        
        if not recurso:
            logger.warning("Recurso não fornecido")
            return ResponseFormatter.bad_request('Recurso é obrigatório')
        
        logger.info("Verificando acesso ao recurso", extra={"user_id": user_id, "recurso": recurso})
        tem_acesso = plano_service.verificar_acesso_recurso(user_id, recurso)
        
        logger.info("Acesso verificado com sucesso", extra={"user_id": user_id, "recurso": recurso, "tem_acesso": tem_acesso})
        return ResponseFormatter.success({'tem_acesso': tem_acesso, 'recurso': recurso}, 'Acesso verificado com sucesso')
        
    except Exception as e:
        logger.error("Erro ao verificar acesso", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@planos_bp.route('/limite-questoes', methods=['GET'])
@log_request(logger)
def obter_limite_questoes():
    """Obtém o limite de questões para o usuário"""
    try:
        logger.info("Obtendo limite de questões do usuário")
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Token de autorização não fornecido")
            return ResponseFormatter.unauthorized('Token de autorização é obrigatório')
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        limite = plano_service.obter_limite_questoes(user_id)
        
        logger.info("Limite de questões obtido com sucesso", extra={"user_id": user_id, "limite_questoes": limite, "ilimitado": limite is None})
        return ResponseFormatter.success({'limite_questoes': limite, 'ilimitado': limite is None}, 'Limite de questões obtido com sucesso')
        
    except Exception as e:
        logger.error("Erro ao obter limite de questões", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@planos_bp.route('/process-payment', methods=['POST'])
@log_request(logger)
def processar_pagamento():
    """Processa o pagamento de um plano"""
    try:
        logger.info("Processando pagamento de plano")
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Token de autorização não fornecido")
            return ResponseFormatter.unauthorized('Token de autorização é obrigatório')
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        data = request.get_json()
        tipo_plano = data.get('tipo_plano')
        metodo_pagamento = data.get('metodo_pagamento', 'mercado_pago')
        dados_pagamento = data.get('dados_pagamento', {})
        
        if not tipo_plano:
            logger.warning("Tipo de plano não fornecido")
            return ResponseFormatter.bad_request('Tipo de plano é obrigatório')
        
        logger.info("Processando pagamento", extra={"user_id": user_id, "tipo_plano": tipo_plano, "metodo_pagamento": metodo_pagamento})
        
        # Simular processamento de pagamento
        # Em produção, integrar com gateway de pagamento real
        pagamento_aprovado = True  # Simular aprovação
        
        if pagamento_aprovado:
            logger.info("Pagamento aprovado, ativando plano", extra={"user_id": user_id, "tipo_plano": tipo_plano})
            # Ativar o plano após pagamento aprovado
            plano_info = plano_service.ativar_plano(user_id, tipo_plano, metodo_pagamento)
            
            logger.info("Pagamento processado e plano ativado com sucesso", extra={"user_id": user_id, "tipo_plano": tipo_plano})
            return ResponseFormatter.success({'pagamento_aprovado': True, 'plano': plano_info}, 'Pagamento processado e plano ativado com sucesso')
        else:
            logger.warning("Pagamento não foi aprovado", extra={"user_id": user_id, "tipo_plano": tipo_plano})
            return ResponseFormatter.bad_request('Pagamento não foi aprovado')
        
    except ValueError as e:
        logger.warning("Erro de validação ao processar pagamento", extra={"error": str(e)})
        return ResponseFormatter.bad_request(str(e))
    except Exception as e:
        logger.error("Erro ao processar pagamento", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@planos_bp.route('/historico', methods=['GET'])
@log_request(logger)
def obter_historico_planos():
    """Obtém o histórico de planos do usuário"""
    try:
        logger.info("Obtendo histórico de planos do usuário")
        
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("Token de autorização não fornecido")
            return ResponseFormatter.unauthorized('Token de autorização é obrigatório')
        
        token = auth_header.split(' ')[1]
        user_id = token
        
        logger.info("Buscando histórico no Firestore", extra={"user_id": user_id})
        
        # Buscar histórico no Firestore
        db = plano_service.db
        if not db:
            logger.warning("Firebase não disponível, retornando histórico vazio")
            return ResponseFormatter.success([], 'Histórico de planos obtido com sucesso')
        
        historico_docs = db.collection('historico_planos').where('user_id', '==', user_id).order_by('data_registro', direction=firestore.Query.DESCENDING).get()
        
        historico = []
        for doc in historico_docs:
            historico.append(doc.to_dict())
        
        logger.info("Histórico de planos obtido com sucesso", extra={"user_id": user_id, "total_registros": len(historico)})
        return ResponseFormatter.success(historico, 'Histórico de planos obtido com sucesso')
        
    except Exception as e:
        logger.error("Erro ao obter histórico de planos", extra={"error": str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')
