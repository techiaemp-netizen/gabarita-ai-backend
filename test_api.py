#!/usr/bin/env python3
"""
Script de teste para verificar se as APIs do backend estão funcionando
"""

import requests
import json
import sys
from datetime import datetime

# Configuração
BASE_URL = "http://localhost:5000"  # Altere para a URL do Render após deploy
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def test_health_check():
    """Testa o endpoint de health check"""
    print("\n🔍 Testando Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check OK - Status: {data.get('status')}")
            print(f"   Timestamp: {data.get('timestamp')}")
            print(f"   Versão: {data.get('version')}")
            return True
        else:
            print(f"❌ Health Check falhou - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro no Health Check: {str(e)}")
        return False

def test_auth_signup():
    """Testa o endpoint de cadastro"""
    print("\n🔍 Testando Cadastro de Usuário...")
    test_user = {
        "email": f"teste_{datetime.now().strftime('%Y%m%d_%H%M%S')}@teste.com",
        "password": "senha123",
        "nome": "Usuário Teste"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json=test_user,
            headers=HEADERS,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            print("✅ Cadastro funcionando")
            return True, test_user
        else:
            print(f"❌ Cadastro falhou - Status: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Erro no cadastro: {str(e)}")
        return False, None

def test_auth_login(user_data):
    """Testa o endpoint de login"""
    print("\n🔍 Testando Login...")
    if not user_data:
        print("❌ Sem dados de usuário para testar login")
        return False, None
    
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            headers=HEADERS,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print("✅ Login funcionando")
            print(f"   Token recebido: {token[:20]}..." if token else "   Sem token")
            return True, token
        else:
            print(f"❌ Login falhou - Status: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Erro no login: {str(e)}")
        return False, None

def test_questoes_endpoint(token):
    """Testa o endpoint de geração de questões"""
    print("\n🔍 Testando Geração de Questões...")
    if not token:
        print("❌ Sem token para testar questões")
        return False
    
    headers_with_auth = HEADERS.copy()
    headers_with_auth["Authorization"] = f"Bearer {token}"
    
    questao_data = {
        "materia": "Matemática",
        "assunto": "Álgebra",
        "dificuldade": "medio",
        "tipo": "multipla_escolha"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/questoes/gerar",
            json=questao_data,
            headers=headers_with_auth,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Geração de questões funcionando")
            print(f"   Questão gerada: {data.get('pergunta', 'N/A')[:50]}...")
            return True
        else:
            print(f"❌ Geração de questões falhou - Status: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro na geração de questões: {str(e)}")
        return False

def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes da API do Gabarita AI")
    print(f"📍 URL Base: {BASE_URL}")
    print("=" * 50)
    
    # Contador de testes
    total_tests = 0
    passed_tests = 0
    
    # Teste 1: Health Check
    total_tests += 1
    if test_health_check():
        passed_tests += 1
    
    # Teste 2: Cadastro
    total_tests += 1
    signup_success, user_data = test_auth_signup()
    if signup_success:
        passed_tests += 1
    
    # Teste 3: Login
    total_tests += 1
    login_success, token = test_auth_login(user_data)
    if login_success:
        passed_tests += 1
    
    # Teste 4: Questões (apenas se login funcionou)
    total_tests += 1
    if test_questoes_endpoint(token):
        passed_tests += 1
    
    # Resultado final
    print("\n" + "=" * 50)
    print(f"📊 Resultado dos Testes: {passed_tests}/{total_tests} passaram")
    
    if passed_tests == total_tests:
        print("🎉 Todos os testes passaram! API está funcionando corretamente.")
        sys.exit(0)
    else:
        print("⚠️  Alguns testes falharam. Verifique os logs acima.")
        sys.exit(1)

if __name__ == "__main__":
    main()