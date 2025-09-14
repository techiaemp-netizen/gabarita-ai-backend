#!/usr/bin/env python3
"""
Script para testar o backend em produção
"""

import requests
import json
import time
from typing import Dict, Any

class ProductionTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Gabarita-AI-Test/1.0'
        })
    
    def test_health(self) -> bool:
        """Testa o endpoint de health check"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Health Check: OK")
                return True
            else:
                print(f"❌ Health Check: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health Check: Erro - {str(e)}")
            return False
    
    def test_cors(self) -> bool:
        """Testa configuração CORS"""
        try:
            response = self.session.options(f"{self.base_url}/api/auth/login", timeout=10)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            if any(cors_headers.values()):
                print("✅ CORS: Configurado")
                for key, value in cors_headers.items():
                    if value:
                        print(f"   {key}: {value}")
                return True
            else:
                print("⚠️ CORS: Não detectado")
                return False
        except Exception as e:
            print(f"❌ CORS: Erro - {str(e)}")
            return False
    
    def test_auth_endpoints(self) -> bool:
        """Testa endpoints de autenticação"""
        success = True
        
        # Teste de login
        try:
            login_data = {
                "email": "test@test.com",
                "password": "123456"
            }
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code in [200, 401, 404]:  # Qualquer resposta válida
                print(f"✅ Login Endpoint: Respondendo ({response.status_code})")
            else:
                print(f"❌ Login Endpoint: {response.status_code}")
                success = False
                
        except Exception as e:
            print(f"❌ Login Endpoint: Erro - {str(e)}")
            success = False
        
        # Teste de registro
        try:
            register_data = {
                "email": "newuser@test.com",
                "password": "123456",
                "name": "Test User"
            }
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=register_data,
                timeout=10
            )
            
            if response.status_code in [200, 201, 400, 409]:  # Qualquer resposta válida
                print(f"✅ Register Endpoint: Respondendo ({response.status_code})")
            else:
                print(f"❌ Register Endpoint: {response.status_code}")
                success = False
                
        except Exception as e:
            print(f"❌ Register Endpoint: Erro - {str(e)}")
            success = False
        
        return success
    
    def test_api_status(self) -> bool:
        """Testa endpoint de status da API"""
        try:
            response = self.session.get(f"{self.base_url}/api/status", timeout=10)
            if response.status_code == 200:
                print("✅ API Status: OK")
                try:
                    data = response.json()
                    print(f"   Status: {data.get('status', 'N/A')}")
                    print(f"   Timestamp: {data.get('timestamp', 'N/A')}")
                except:
                    pass
                return True
            else:
                print(f"❌ API Status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ API Status: Erro - {str(e)}")
            return False
    
    def test_response_time(self) -> bool:
        """Testa tempo de resposta"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # em ms
            
            if response_time < 5000:  # Menos de 5 segundos
                print(f"✅ Tempo de Resposta: {response_time:.0f}ms")
                return True
            else:
                print(f"⚠️ Tempo de Resposta: {response_time:.0f}ms (Lento)")
                return False
        except Exception as e:
            print(f"❌ Tempo de Resposta: Erro - {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Executa todos os testes"""
        print(f"🧪 Testando: {self.base_url}")
        print("=" * 50)
        
        results = {
            'health': self.test_health(),
            'cors': self.test_cors(),
            'auth': self.test_auth_endpoints(),
            'status': self.test_api_status(),
            'response_time': self.test_response_time()
        }
        
        print("\n" + "=" * 50)
        print("📊 RESUMO DOS TESTES")
        print("=" * 50)
        
        passed = sum(results.values())
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSOU" if result else "❌ FALHOU"
            print(f"{test_name.upper()}: {status}")
        
        print(f"\n🎯 RESULTADO: {passed}/{total} testes passaram")
        
        if passed == total:
            print("🎉 TODOS OS TESTES PASSARAM! Backend está funcionando.")
        elif passed >= total * 0.7:  # 70% ou mais
            print("⚠️ MAIORIA DOS TESTES PASSOU. Verifique os que falharam.")
        else:
            print("❌ MUITOS TESTES FALHARAM. Backend precisa de correções.")
        
        return results

def main():
    # URLs para testar
    urls = [
        "http://localhost:5000",  # Local
        "https://gabarita-ai-backend.onrender.com"  # Produção
    ]
    
    for url in urls:
        print(f"\n🔍 TESTANDO: {url}")
        print("=" * 60)
        
        tester = ProductionTester(url)
        results = tester.run_all_tests()
        
        print("\n" + "=" * 60)
        
        # Pausa entre testes
        if url != urls[-1]:
            time.sleep(2)

if __name__ == "__main__":
    main()