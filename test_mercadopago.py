#!/usr/bin/env python3
"""
Teste simples do Mercado Pago SDK
"""

import os
import mercadopago
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def test_mercadopago():
    try:
        # Configurar SDK
        access_token = os.getenv('MERCADO_PAGO_ACCESS_TOKEN')
        print(f"Access Token: {access_token[:20]}...")
        
        sdk = mercadopago.SDK(access_token)
        
        # Criar uma preferência simples
        preference_data = {
            "items": [{
                "title": "Teste Promo",
                "quantity": 1,
                "unit_price": 5.90
            }],
            "payer": {
                "email": "test@example.com"
            },
            "back_urls": {
                "success": "http://localhost:3000/retorno?status=success",
                "failure": "http://localhost:3000/retorno?status=failure",
                "pending": "http://localhost:3000/retorno?status=pending"
            },
            "notification_url": "http://localhost:5000/api/pagamentos/webhook",
            "external_reference": "test_123"
        }
        
        print("Criando preferência...")
        preference_response = sdk.preference().create(preference_data)
        
        print(f"Status: {preference_response['status']}")
        print(f"Response: {preference_response}")
        
        if preference_response["status"] == 201:
            preference = preference_response["response"]
            print(f"Preferência criada com sucesso!")
            print(f"ID: {preference['id']}")
            print(f"Init Point: {preference['init_point']}")
        else:
            print(f"Erro ao criar preferência: {preference_response}")
            
    except Exception as e:
        print(f"Erro: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_mercadopago()