#!/usr/bin/env python3
"""
Script para testar todos os endpoints da API Gabarita.AI
"""

import requests
import json
from datetime import datetime

# URLs para teste
BASE_URL_LOCAL = "http://localhost:5000"
BASE_URL_RENDER = "https://gabarita-ai-backend.onrender.com"

# Lista de endpoints para testar
ENDPOINTS = [
    {
        "name": "Root",
        "path": "/",
        "method": "GET"
    },
    {
        "name": "Health Check",
        "path": "/health",
        "method": "GET"
    },
    {
        "name": "Cargos e Blocos",
        "path": "/api/opcoes/cargos-blocos",
        "method": "GET"
    },
    {
        "name": "Planos",
        "path": "/api/planos",
        "method": "GET"
    },
    {
        "name": "Login",
        "path": "/api/auth/login",
        "method": "POST",
        "data": {"email": "test@test.com", "senha": "123456"}
    },
    {
        "name": "Gerar Questão",
        "path": "/api/questoes/gerar",
        "method": "POST",
        "data": {"cargo": "Enfermeiro", "bloco": "Saúde"}
    }
]

def test_endpoint(base_url, endpoint):
    """Testa um endpoint específico"""
    url = f"{base_url}{endpoint['path']}"
    method = endpoint['method']
    data = endpoint.get('data')
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        else:
            return {"error": f"Método {method} não suportado"}
        
        return {
            "status_code": response.status_code,
            "success": response.status_code < 400,
            "response_size": len(response.text),
            "content_type": response.headers.get('content-type', 'unknown'),
            "response_preview": response.text[:200] + "..." if len(response.text) > 200 else response.text
        }
    
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def main():
    """Função principal para testar todos os endpoints"""
    print("=" * 80)
    print(f"TESTE DE ENDPOINTS - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    # Testar Render
    print(f"\n🌐 TESTANDO RENDER: {BASE_URL_RENDER}")
    print("-" * 50)
    
    for endpoint in ENDPOINTS:
        print(f"\n📍 {endpoint['name']} ({endpoint['method']} {endpoint['path']})")
        result = test_endpoint(BASE_URL_RENDER, endpoint)
        
        if "error" in result:
            print(f"   ❌ ERRO: {result['error']}")
        else:
            status_icon = "✅" if result['success'] else "❌"
            print(f"   {status_icon} Status: {result['status_code']}")
            print(f"   📄 Tipo: {result['content_type']}")
            print(f"   📏 Tamanho: {result['response_size']} chars")
            if result['response_preview']:
                print(f"   📝 Preview: {result['response_preview']}")
    
    print("\n" + "=" * 80)
    print("TESTE CONCLUÍDO")
    print("=" * 80)

if __name__ == "__main__":
    main()