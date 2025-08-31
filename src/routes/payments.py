"""
Routas de Pagamento - Mercado Pago Integration
Gabarit-AI Backend
"""

from flask import Blueprint, request
import os
import mercadopago
import firebase_admin
from firebase_admin import firestore
from datetime import datetime, timedelta
import hashlib
import hmac
from config.firebase_config import firebase_config
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request

payments_bp = Blueprint('payments', __name__)

# Initialize structured logger
logger = StructuredLogger(__name__)

def get_db():
    """Retorna a instância do Firestore se disponível"""
    return firebase_config.get_db()

# Configurar Mercado Pago
sdk = mercadopago.SDK(os.getenv('MERCADOPAGO_ACCESS_TOKEN'))

# Definir planos globalmente
PLANOS_DISPONIVEIS = {
    'gratuito': {
        'id': 'gratuito',
        'name': 'Gratuito/Trial',
        'price': 0.00,
        'duration': 0,  # Ilimitada
        'features': [
            '3 questões limitadas'
        ],
        'resources': {
            'questoes_limitadas': True,
            'simulados': False,
            'relatorios': False,
            'ranking': False,
            'suporte': False,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'popular': False
    },
    'promo': {
        'id': 'promo',
        'name': 'Promo (Semanal)',
        'price': 5.90,
        'duration': 7,
        'features': [
            'Questões ilimitadas',
            'Simulados',
            'Relatórios',
            'Ranking',
            'Suporte'
        ],
        'resources': {
            'questoes_limitadas': False,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'popular': False
    },
    'lite': {
        'id': 'lite',
        'name': 'Lite (Mensal)',
        'price': 14.90,
        'duration': 30,
        'features': [
            'Questões ilimitadas',
            'Simulados',
            'Relatórios',
            'Ranking',
            'Suporte'
        ],
        'resources': {
            'questoes_limitadas': False,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'popular': False
    },
    'premium': {
        'id': 'premium',
        'name': 'Premium (Bimestral)',
        'price': 20.00,
        'duration': 60,
        'features': [
            'Questões ilimitadas',
            'Simulados',
            'Relatórios',
            'Ranking',
            'Suporte'
        ],
        'resources': {
            'questoes_limitadas': False,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': False,
            'modo_foco': False,
            'redacao': False
        },
        'popular': False
    },
    'premium_plus': {
        'id': 'premium_plus',
        'name': 'Premium Plus',
        'price': 40.00,
        'duration': 60,
        'features': [
            'Todos os recursos anteriores',
            'Macetes',
            'Modo foco'
        ],
        'resources': {
            'questoes_limitadas': False,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': True,
            'modo_foco': True,
            'redacao': False
        },
        'popular': False
    },
    'black_cnu': {
        'id': 'black_cnu',
        'name': 'Black CNU ⭐',
        'price': 70.00,
        'duration': 365,  # Até 5 de dezembro de 2025
        'features': [
            'Todos os recursos',
            'Macetes',
            'Modo foco',
            'Redação',
            'Chat tira-dúvidas',
            'Pontos centrais',
            'Outras explorações'
        ],
        'resources': {
            'questoes_limitadas': False,
            'simulados': True,
            'relatorios': True,
            'ranking': True,
            'suporte': True,
            'macetes': True,
            'modo_foco': True,
            'redacao': True,
            'chat_tira_duvidas': True,
            'pontos_centrais': True,
            'outras_exploracoes': True
        },
        'popular': True,
        'special_duration': 'Até 5 de dezembro de 2025'
    }
}

@payments_bp.route('/planos', methods=['GET'])
@log_request(logger)
def obter_planos():
    """Listar todos os planos disponíveis"""
    try:
        logger.info("Listando planos disponíveis")
        return ResponseFormatter.success(
            data=list(PLANOS_DISPONIVEIS.values()),
            message="Planos listados com sucesso"
        )
    except Exception as e:
        logger.error("Erro ao listar planos", extra={"error": str(e)})
        return ResponseFormatter.internal_error(f"Erro ao listar planos: {str(e)}")

@payments_bp.route('/processar', methods=['POST'])
@log_request(logger)
def processar_pagamento():
    """Criar preferência de pagamento no Mercado Pago"""
    try:
        data = request.get_json()
        plano = data.get('plano')
        user_id = data.get('userId')
        user_email = data.get('userEmail')
        
        logger.info("Iniciando criação de pagamento", extra={
            "plano": plano,
            "user_id": user_id,
            "user_email": user_email
        })
        
        # Usar planos globais
        if plano not in PLANOS_DISPONIVEIS:
            logger.warning("Plano inválido solicitado", extra={"plano": plano})
            return ResponseFormatter.bad_request("Plano inválido")
            
        plano_info = PLANOS_DISPONIVEIS[plano]
        
        # Planos gratuitos não precisam de pagamento
        if plano_info['price'] == 0:
            logger.warning("Tentativa de pagamento para plano gratuito", extra={"plano": plano})
            return ResponseFormatter.bad_request("Plano gratuito não requer pagamento")
        
        # Criar preferência no Mercado Pago
        preference_data = {
            "items": [{
                "title": plano_info['name'],
                "quantity": 1,
                "unit_price": plano_info['price']
            }],
            "payer": {
                "email": user_email
            },
            "back_urls": {
                "success": f"{os.getenv('FRONTEND_URL')}/retorno?status=success",
                "failure": f"{os.getenv('FRONTEND_URL')}/retorno?status=failure",
                "pending": f"{os.getenv('FRONTEND_URL')}/retorno?status=pending"
            },
            "notification_url": f"{os.getenv('BACKEND_URL')}/api/pagamentos/webhook",
            "external_reference": f"{user_id}_{plano}_{datetime.now().timestamp()}"
        }
        
        logger.info("Criando preferência no Mercado Pago", extra={
            "plano": plano,
            "valor": plano_info['price']
        })
        
        preference_response = sdk.preference().create(preference_data)
        
        if preference_response["status"] == 201:
            preference = preference_response["response"]
            
            logger.info("Preferência criada com sucesso", extra={
                "preference_id": preference['id'],
                "user_id": user_id
            })
            
            # Salvar transação no Firebase
            transaction_data = {
                'userId': user_id,
                'userEmail': user_email,
                'plano': plano,
                'valor': plano_info['price'],
                'duracao': plano_info['duration'],
                'preferenceId': preference['id'],
                'status': 'pending',
                'createdAt': datetime.now(),
                'externalReference': preference_data['external_reference']
            }
            
            db = get_db()
            if db:
                db.collection('transactions').add(transaction_data)
                logger.info("Transação salva no Firebase", extra={
                    "preference_id": preference['id'],
                    "user_id": user_id
                })
            else:
                logger.warning("Firebase não disponível para salvar transação")
            
            return ResponseFormatter.success(
                data={
                    'preferenceId': preference['id'],
                    'initPoint': preference['init_point'],
                    'sandboxInitPoint': preference['sandbox_init_point']
                },
                message="Pagamento criado com sucesso"
            )
        else:
            logger.error("Erro ao criar preferência no Mercado Pago", extra={
                "status": preference_response.get("status"),
                "response": preference_response.get("response")
            })
            return ResponseFormatter.internal_error("Erro ao criar pagamento")
            
    except Exception as e:
        logger.error("Erro interno ao criar pagamento", extra={
            "error": str(e),
            "user_id": user_id,
            "plano": plano
        })
        return ResponseFormatter.internal_error(str(e))

@payments_bp.route('/webhook', methods=['POST'])
@log_request(logger)
def webhook_pagamento():
    """Webhook para notificações do Mercado Pago"""
    try:
        logger.info("Recebendo webhook do Mercado Pago")
        
        # Validar assinatura do webhook
        x_signature = request.headers.get('x-signature')
        x_request_id = request.headers.get('x-request-id')
        
        if not validate_webhook_signature(request.data, x_signature, x_request_id):
            logger.warning("Webhook com assinatura inválida", extra={
                "x_signature": x_signature,
                "x_request_id": x_request_id
            })
            return ResponseFormatter.unauthorized("Assinatura inválida")
            
        data = request.get_json()
        
        logger.info("Webhook validado com sucesso", extra={
            "webhook_type": data.get('type'),
            "data_id": data.get('data', {}).get('id')
        })
        
        if data.get('type') == 'payment':
            payment_id = data['data']['id']
            
            logger.info("Processando pagamento", extra={
                "payment_id": payment_id
            })
            
            # Buscar informações do pagamento
            payment_info = sdk.payment().get(payment_id)
            
            if payment_info['status'] == 200:
                payment = payment_info['response']
                external_reference = payment.get('external_reference')
                status = payment.get('status')
                
                logger.info("Informações do pagamento obtidas", extra={
                    "payment_id": payment_id,
                    "external_reference": external_reference,
                    "status": status
                })
                
                # Atualizar transação no Firebase
                db = get_db()
                if db:
                    transactions_ref = db.collection('transactions')
                    query = transactions_ref.where('externalReference', '==', external_reference)
                    docs = query.get()
                    
                    for doc in docs:
                        doc.reference.update({
                            'status': status,
                            'paymentId': payment_id,
                            'updatedAt': datetime.now()
                        })
                        
                        logger.info("Transação atualizada no Firebase", extra={
                            "payment_id": payment_id,
                            "status": status,
                            "transaction_id": doc.id
                        })
                        
                        # Se pagamento aprovado, ativar plano
                        if status == 'approved':
                            transaction_data = doc.to_dict()
                            logger.info("Ativando plano do usuário", extra={
                                "payment_id": payment_id,
                                "user_id": transaction_data.get('userId'),
                                "plano": transaction_data.get('plano')
                            })
                            ativar_plano_usuario(transaction_data)
                else:
                    logger.error("Firebase não disponível para atualizar transação")
            else:
                logger.error("Erro ao obter informações do pagamento", extra={
                    "payment_id": payment_id,
                    "status": payment_info.get('status')
                })
                        
        logger.info("Webhook processado com sucesso")
        return ResponseFormatter.success(
            data={'status': 'ok'},
            message="Webhook processado com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro interno no webhook", extra={
            "error": str(e)
        })
        return ResponseFormatter.internal_error(str(e))

@payments_bp.route('/status/<payment_id>', methods=['GET'])
@log_request(logger)
def obter_status_pagamento(payment_id):
    """Verificar status de um pagamento"""
    try:
        logger.info("Consultando status do pagamento", extra={
            "payment_id": payment_id
        })
        
        payment_info = sdk.payment().get(payment_id)
        
        if payment_info['status'] == 200:
            logger.info("Status do pagamento obtido com sucesso", extra={
                "payment_id": payment_id,
                "status": payment_info['response'].get('status')
            })
            return ResponseFormatter.success(
                data=payment_info['response'],
                message="Status do pagamento obtido com sucesso"
            )
        else:
            logger.warning("Pagamento não encontrado", extra={
                "payment_id": payment_id,
                "api_status": payment_info.get('status')
            })
            return ResponseFormatter.not_found("Pagamento não encontrado")
            
    except Exception as e:
        logger.error("Erro ao consultar status do pagamento", extra={
            "payment_id": payment_id,
            "error": str(e)
        })
        return ResponseFormatter.internal_error(str(e))

@payments_bp.route('/ativar-plano', methods=['POST'])
@log_request(logger)
def ativar_plano():
    """Ativar plano manualmente (para testes)"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        plano = data.get('plano')
        
        logger.info("Tentativa de ativação manual de plano", extra={
            "user_id": user_id,
            "plano": plano
        })
        
        if not user_id or not plano:
            logger.warning("Dados obrigatórios ausentes para ativação de plano", extra={
                "user_id": user_id,
                "plano": plano
            })
            return ResponseFormatter.bad_request("userId e plano são obrigatórios")
            
        # Simular dados da transação
        transaction_data = {
            'userId': user_id,
            'plano': plano,
            'duracao': {'mensal': 30, 'trimestral': 90, 'anual': 365}.get(plano, 30)
        }
        
        result = ativar_plano_usuario(transaction_data)
        
        if result:
            logger.info("Plano ativado manualmente com sucesso", extra={
                "user_id": user_id,
                "plano": plano
            })
            return ResponseFormatter.success(
                data={'activated': True},
                message="Plano ativado com sucesso"
            )
        else:
            logger.error("Erro ao ativar plano manualmente", extra={
                "user_id": user_id,
                "plano": plano
            })
            return ResponseFormatter.internal_error("Erro ao ativar plano")
            
    except Exception as e:
        logger.error("Erro interno na ativação manual de plano", extra={
            "error": str(e),
            "user_id": data.get('userId') if 'data' in locals() else None
        })
        return ResponseFormatter.internal_error(str(e))

def validate_webhook_signature(data, x_signature, x_request_id):
    """Validar assinatura do webhook do Mercado Pago"""
    try:
        webhook_secret = os.getenv('MERCADO_PAGO_WEBHOOK_SECRET')
        if not webhook_secret:
            return True  # Em desenvolvimento, pular validação
            
        # Extrair ts e hash da assinatura
        parts = x_signature.split(',')
        ts = None
        hash_signature = None
        
        for part in parts:
            if part.startswith('ts='):
                ts = part[3:]
            elif part.startswith('v1='):
                hash_signature = part[3:]
                
        if not ts or not hash_signature:
            return False
            
        # Criar string para validação
        manifest = f"id:{x_request_id};request-id:{x_request_id};ts:{ts};"
        
        # Calcular HMAC
        expected_signature = hmac.new(
            webhook_secret.encode(),
            manifest.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, hash_signature)
        
    except Exception:
        return False

def ativar_plano_usuario(transaction_data):
    """Ativar plano do usuário no Firebase"""
    try:
        user_id = transaction_data['userId']
        duracao = transaction_data['duracao']
        plano = transaction_data['plano']
        
        logger.info("Iniciando ativação de plano do usuário", extra={
            "user_id": user_id,
            "plano": plano,
            "duracao": duracao
        })
        
        # Calcular data de expiração
        data_expiracao = datetime.now() + timedelta(days=duracao)
        
        # Atualizar usuário no Firebase
        db = get_db()
        if not db:
            logger.error("Firebase não disponível para ativar plano", extra={
                "user_id": user_id,
                "plano": plano
            })
            return False
            
        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'planoAtivo': plano,
            'dataExpiracao': data_expiracao,
            'questoesRestantes': 1000 if plano != 'free' else 5,
            'updatedAt': datetime.now()
        })
        
        logger.info("Plano do usuário ativado com sucesso", extra={
            "user_id": user_id,
            "plano": plano,
            "data_expiracao": data_expiracao.isoformat(),
            "questoes_restantes": 1000 if plano != 'free' else 5
        })
        
        return True
        
    except Exception as e:
        logger.error("Erro ao ativar plano do usuário", extra={
            "user_id": transaction_data.get('userId'),
            "plano": transaction_data.get('plano'),
            "error": str(e)
        })
        return False
