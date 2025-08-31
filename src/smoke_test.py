#!/usr/bin/env python3
"""
Smoke tests para validar endpoints principais
Gabarita-AI Backend
"""

import sys
from main import app

def run_smoke_tests():
    """
    Executa smoke tests básicos nos endpoints principais
    """
    print("\n🧪 EXECUTANDO SMOKE TESTS")
    print("=" * 50)
    
    with app.test_client() as client:
        print("✅ Test client criado")
        
        # Teste endpoint de saúde principal
        try:
            resp = client.get('/health')
            status = "✅" if resp.status_code == 200 else "❌"
            print(f"{status} GET /health: {resp.status_code}")
        except Exception as e:
            print(f"❌ GET /health: Erro - {e}")
        
        # Teste endpoint de saúde da API
        try:
            resp = client.get('/api/health')
            status = "✅" if resp.status_code == 200 else "❌"
            print(f"{status} GET /api/health: {resp.status_code}")
        except Exception as e:
            print(f"❌ GET /api/health: Erro - {e}")
        
        # Teste endpoint de teste
        try:
            resp = client.get('/api/test')
            status = "✅" if resp.status_code == 200 else "❌"
            print(f"{status} GET /api/test: {resp.status_code}")
        except Exception as e:
            print(f"❌ GET /api/test: Erro - {e}")
        
        # Teste endpoint de opções de teste
        try:
            resp = client.get('/api/opcoes/test')
            status = "✅" if resp.status_code == 200 else "❌"
            print(f"{status} GET /api/opcoes/test: {resp.status_code}")
        except Exception as e:
            print(f"❌ GET /api/opcoes/test: Erro - {e}")
    
    print("=" * 50)
    print("✅ Smoke tests concluídos!")
    print()

if __name__ == '__main__':
    with app.app_context():
        run_smoke_tests()