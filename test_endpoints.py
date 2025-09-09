#!/usr/bin/env python3
"""
Script para testar endpoints do backend Gabarita AI
"""

import requests
import json

def test_endpoint(url, method='GET', data=None):
    """Testa um endpoint e retorna o resultado"""
    try:
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=5)
        
        return {
            'status': response.status_code,
            'success': True,
            'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        }
    except Exception as e:
        return {
            'status': 'ERROR',
            'success': False,
            'error': str(e)
        }

def main():
    base_url = 'http://127.0.0.1:5000'
    
    print("=== TESTE DE ENDPOINTS - GABARITA AI ===")
    print()
    
    # Endpoints para testar
    endpoints = [
        {'url': f'{base_url}/health', 'method': 'GET', 'name': 'Health Check'},
        {'url': f'{base_url}/api/planos', 'method': 'GET', 'name': 'Listar Planos'},
        {'url': f'{base_url}/api/auth/login', 'method': 'POST', 'data': {'email': 'test@test.com', 'password': '123456'}, 'name': 'Login'},
        {'url': f'{base_url}/api/auth/register', 'method': 'POST', 'data': {'email': 'test@test.com', 'password': '123456'}, 'name': 'Register'},
        {'url': f'{base_url}/api/signup', 'method': 'POST', 'data': {'email': 'test@test.com', 'password': '123456'}, 'name': 'Signup'},
        {'url': f'{base_url}/api/jogos', 'method': 'GET', 'name': 'Jogos'},
        {'url': f'{base_url}/api/opcoes', 'method': 'GET', 'name': 'Opções'},
    ]
    
    results = []
    
    for endpoint in endpoints:
        print(f"Testando {endpoint['name']}...")
        result = test_endpoint(
            endpoint['url'], 
            endpoint.get('method', 'GET'),
            endpoint.get('data')
        )
        result['name'] = endpoint['name']
        results.append(result)
        
        status_icon = "✅" if result['success'] and result['status'] in [200, 201] else "❌"
        print(f"  {status_icon} {endpoint['name']}: {result['status']}")
        print()
    
    # Resumo
    print("=== RESUMO ===")
    working = sum(1 for r in results if r['success'] and r['status'] in [200, 201])
    total = len(results)
    print(f"Funcionando: {working}/{total}")
    
    print("\n=== ENDPOINTS COM PROBLEMAS ===")
    for result in results:
        if not (result['success'] and result['status'] in [200, 201]):
            print(f"❌ {result['name']}: {result['status']} - {result.get('error', 'Erro desconhecido')}")

if __name__ == '__main__':
    main()