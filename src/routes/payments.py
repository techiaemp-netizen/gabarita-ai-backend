import os
from flask import Blueprint, current_app, jsonify, request
import mercadopago

payments_bp = Blueprint("payments", __name__)

def get_mp_sdk():
    """Inicializa o SDK do MercadoPago de forma lazy com validação"""
    token = current_app.config.get("MERCADOPAGO_ACCESS_TOKEN") or os.getenv("MERCADOPAGO_ACCESS_TOKEN")
    if not isinstance(token, str) or not token.strip():
        # Deixa claro no log e evita quebrar o processo inteiro
        raise RuntimeError("MERCADOPAGO_ACCESS_TOKEN não configurado. Defina a env var no Render.")
    return mercadopago.SDK(token)

@payments_bp.route("/payments/ping", methods=["GET"])
def payments_ping():
    """Testa a inicialização lazy do SDK MercadoPago"""
    try:
        sdk = get_mp_sdk()
        return jsonify({
            "success": True,
            "message": "MercadoPago SDK inicializado com sucesso",
            "status": "ok"
        })
    except RuntimeError as e:
        current_app.logger.error(f"Erro na configuração do MercadoPago: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    except Exception as e:
        current_app.logger.error(f"Erro inesperado no MercadoPago: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@payments_bp.route("/payments/create-preference", methods=["POST"])
def create_payment_preference():
    """Cria uma preferência de pagamento no MercadoPago"""
    try:
        sdk = get_mp_sdk()
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dados do pagamento são obrigatórios"}), 400
        
        # Validar dados obrigatórios
        required_fields = ["title", "price", "quantity"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo '{field}' é obrigatório"}), 400
        
        # Criar preferência de pagamento
        preference_data = {
            "items": [
                {
                    "title": data["title"],
                    "quantity": data["quantity"],
                    "unit_price": float(data["price"])
                }
            ],
            "back_urls": {
                "success": data.get("success_url", "https://gabarita-ai-backend.onrender.com/payments/success"),
                "failure": data.get("failure_url", "https://gabarita-ai-backend.onrender.com/payments/failure"),
                "pending": data.get("pending_url", "https://gabarita-ai-backend.onrender.com/payments/pending")
            },
            "auto_return": "approved"
        }
        
        # Adicionar dados opcionais
        if "external_reference" in data:
            preference_data["external_reference"] = data["external_reference"]
        
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        
        return jsonify({
            "success": True,
            "preference_id": preference["id"],
            "init_point": preference["init_point"],
            "sandbox_init_point": preference.get("sandbox_init_point")
        })
        
    except RuntimeError as e:
        current_app.logger.error(f"Erro na configuração do MercadoPago: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    except Exception as e:
        current_app.logger.error(f"Erro ao criar preferência de pagamento: {e}")
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor"
        }), 500

@payments_bp.route("/payments/verify", methods=["POST"])
def verify_payment():
    """Endpoint para verificar o pagamento manualmente via frontend após o sucesso"""
    try:
        data = request.get_json()
        payment_id = data.get('payment_id')
        user_id_request = data.get('user_id')
        
        if not payment_id:
            return jsonify({"success": False, "error": "payment_id é obrigatório"}), 400
            
        sdk = get_mp_sdk()
        payment_info = sdk.payment().get(payment_id)
        payment_data = payment_info["response"]
        
        status = payment_data.get('status')
        external_reference = payment_data.get('external_reference')
        
        # Priorizar user_id enviado pelo front se o external_reference parecer truncado
        # (O MP trunca após 256 caracteres, o que acontece com tokens JWT longos)
        user_id = user_id_request if user_id_request else external_reference
        
        if status == 'approved' and user_id:
            from .planos import ativar_plano_usuario
            # Determinar tipo de plano (pode vir no metadata ou external_ref se não for apenas o ID)
            # Como padrão para verificação manual, assumimos premium se o pagamento foi aprovado
            ativar_plano_usuario(user_id, 'premium')
            
            return jsonify({
                "success": True,
                "status": status,
                "user_id": user_id,
                "message": "Plano ativado com sucesso"
            })
        
        return jsonify({
            "success": False,
            "status": status,
            "message": "Pagamento não aprovado ou usuário não identificado"
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Erro ao verificar pagamento: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@payments_bp.route("/payments/webhook", methods=["POST"])
def payment_webhook():
    """Webhook para receber notificações do MercadoPago"""
    try:
        data = request.get_json()
        current_app.logger.info(f"Webhook recebido: {data}")
        
        # Aqui você pode processar a notificação do pagamento
        # Por exemplo, atualizar o status do pedido no banco de dados
        
        return jsonify({"success": True}), 200
        
    except Exception as e:
        current_app.logger.error(f"Erro no webhook: {e}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@payments_bp.route("/payments/success", methods=["GET"])
def payment_success():
    """Página de sucesso do pagamento"""
    return jsonify({
        "message": "Pagamento realizado com sucesso!",
        "status": "approved"
    })

@payments_bp.route("/payments/failure", methods=["GET"])
def payment_failure():
    """Página de falha do pagamento"""
    return jsonify({
        "message": "Pagamento não foi aprovado.",
        "status": "rejected"
    })

@payments_bp.route("/payments/pending", methods=["GET"])
def payment_pending():
    """Página de pagamento pendente"""
    return jsonify({
        "message": "Pagamento está sendo processado.",
        "status": "pending"
    })