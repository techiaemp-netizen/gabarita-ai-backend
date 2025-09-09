#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Validação: Dados Reais vs Mocks
Testa se os endpoints retornam dados reais ou mockados
"""

import requests
import json
import time
from datetime import datetime
import re
from typing import Dict, List, Any, Tuple

class RealVsMockValidator:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "base_url": base_url,
            "tests": [],
            "summary": {
                "total_tests": 0,
                "real_data": 0,
                "mock_data": 0,
                "errors": 0,
                "warnings": []
            }
        }
        
        # Palavras que indicam dados mockados (mais específicas)
        self.mock_indicators = [
            'mock_data', 'fake_data', 'placeholder', 'dummy', 'sample_data',
            'exemplo_mock', 'dados_falsos', 'lorem ipsum', 'demo_data'
        ]
    
    def log_test(self, endpoint: str, status: str, details: Dict[str, Any]):
        """Registra resultado de um teste"""
        test_result = {
            "endpoint": endpoint,
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.results["tests"].append(test_result)
        self.results["summary"]["total_tests"] += 1
        
        if status == "REAL_DATA":
            self.results["summary"]["real_data"] += 1
        elif status == "MOCK_DATA":
            self.results["summary"]["mock_data"] += 1
        elif status == "ERROR":
            self.results["summary"]["errors"] += 1
    
    def authenticate(self) -> bool:
        """Autentica usuário para testes"""
        try:
            # Primeiro, registra um usuário de teste
            register_data = {
                "nome": "Usuario Teste Validacao",
                "email": f"teste_validacao_{int(time.time())}@gabarita.ai",
                "senha": "senha123",
                "plano": "premium"
            }
            
            register_response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=register_data
            )
            
            if register_response.status_code == 201:
                # Login com o usuário criado
                login_data = {
                    "email": register_data["email"],
                    "senha": register_data["senha"]
                }
                
                login_response = self.session.post(
                    f"{self.base_url}/api/auth/login",
                    json=login_data
                )
                
                if login_response.status_code == 200:
                    login_result = login_response.json()
                    self.auth_token = login_result.get("token")
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                    return True
            
            return False
            
        except Exception as e:
            print(f"Erro na autenticação: {e}")
            return False
    
    def contains_mock_indicators(self, data: Any) -> Tuple[bool, List[str]]:
        """Verifica se os dados contêm indicadores de mock (mais inteligente)"""
        found_indicators = []
        data_str = json.dumps(data, default=str).lower()
        
        # Indicadores específicos de mock
        for indicator in self.mock_indicators:
            if indicator in data_str:
                found_indicators.append(indicator)
        
        # Verifica padrões específicos que indicam dados mockados
        mock_patterns = [
            r'mock[_\s]',  # mock_ ou mock seguido de espaço
            r'fake[_\s]',  # fake_ ou fake seguido de espaço
            r'test[_\s]data',  # test_data ou test data
            r'exemplo[_\s]de',  # exemplo_de ou exemplo de
            r'dados[_\s]de[_\s]teste'  # dados_de_teste
        ]
        
        for pattern in mock_patterns:
            if re.search(pattern, data_str):
                found_indicators.append(f"pattern: {pattern}")
        
        return len(found_indicators) > 0, found_indicators
    
    def test_planos_endpoint(self):
        """Testa endpoint de planos"""
        try:
            response = self.session.get(f"{self.base_url}/api/planos")
            
            if response.status_code == 200:
                data = response.json()
                has_mocks, indicators = self.contains_mock_indicators(data)
                
                # Verifica se são dados dinâmicos (com timestamps e source)
                is_dynamic = False
                if isinstance(data, dict) and 'data' in data:
                    plans = data['data']
                    if isinstance(plans, list) and plans:
                        first_plan = plans[0]
                        is_dynamic = (
                            'updated_at' in first_plan and
                            'source' in first_plan and
                            first_plan.get('source') == 'dynamic_service'
                        )
                
                is_hardcoded = not is_dynamic
                
                details = {
                    "response_code": response.status_code,
                    "data_count": len(data) if isinstance(data, list) else 1,
                    "mock_indicators": indicators,
                    "is_hardcoded": is_hardcoded,
                    "sample_data": data[:2] if isinstance(data, list) else data
                }
                
                if has_mocks or is_hardcoded:
                    self.log_test("/api/planos", "MOCK_DATA", details)
                else:
                    self.log_test("/api/planos", "REAL_DATA", details)
            else:
                self.log_test("/api/planos", "ERROR", {
                    "response_code": response.status_code,
                    "error": response.text
                })
                
        except Exception as e:
            self.log_test("/api/planos", "ERROR", {"error": str(e)})
    
    def test_jogos_endpoint(self):
        """Testa endpoint de jogos"""
        try:
            response = self.session.get(f"{self.base_url}/api/jogos")
            
            if response.status_code == 200:
                data = response.json()
                has_mocks, indicators = self.contains_mock_indicators(data)
                
                # Verifica se há funções mock nos prompts
                has_mock_functions = False
                if isinstance(data, dict) and 'jogos' in data:
                    for jogo in data['jogos']:
                        if 'prompt' in str(jogo).lower() and 'mock' in str(jogo).lower():
                            has_mock_functions = True
                            break
                
                details = {
                    "response_code": response.status_code,
                    "mock_indicators": indicators,
                    "has_mock_functions": has_mock_functions,
                    "sample_data": data
                }
                
                if has_mocks or has_mock_functions:
                    self.log_test("/api/jogos", "MOCK_DATA", details)
                else:
                    self.log_test("/api/jogos", "REAL_DATA", details)
            else:
                self.log_test("/api/jogos", "ERROR", {
                    "response_code": response.status_code,
                    "error": response.text
                })
                
        except Exception as e:
            self.log_test("/api/jogos", "ERROR", {"error": str(e)})
    
    def test_news_endpoint(self):
        """Testa endpoint de notícias"""
        try:
            response = self.session.get(f"{self.base_url}/api/news")
            
            if response.status_code == 200:
                data = response.json()
                has_mocks, indicators = self.contains_mock_indicators(data)
                
                # Verifica se são dados claramente mockados
                is_clearly_mock = (
                    'MOCK_NEWS' in str(data) or
                    any('Lorem ipsum' in str(item) for item in data if isinstance(item, dict))
                )
                
                details = {
                    "response_code": response.status_code,
                    "data_count": len(data) if isinstance(data, list) else 1,
                    "mock_indicators": indicators,
                    "is_clearly_mock": is_clearly_mock,
                    "sample_data": data[:2] if isinstance(data, list) else data
                }
                
                if has_mocks or is_clearly_mock:
                    self.log_test("/api/news", "MOCK_DATA", details)
                else:
                    self.log_test("/api/news", "REAL_DATA", details)
            else:
                self.log_test("/api/news", "ERROR", {
                    "response_code": response.status_code,
                    "error": response.text
                })
                
        except Exception as e:
            self.log_test("/api/news", "ERROR", {"error": str(e)})
    
    def test_opcoes_endpoint(self):
        """Testa endpoint de opções"""
        try:
            response = self.session.get(f"{self.base_url}/api/opcoes")
            
            if response.status_code == 200:
                data = response.json()
                has_mocks, indicators = self.contains_mock_indicators(data)
                
                details = {
                    "response_code": response.status_code,
                    "mock_indicators": indicators,
                    "sample_data": data
                }
                
                if has_mocks:
                    self.log_test("/api/opcoes", "MOCK_DATA", details)
                else:
                    self.log_test("/api/opcoes", "REAL_DATA", details)
            else:
                self.log_test("/api/opcoes", "ERROR", {
                    "response_code": response.status_code,
                    "error": response.text
                })
                
        except Exception as e:
            self.log_test("/api/opcoes", "ERROR", {"error": str(e)})
    
    def test_question_generation(self):
        """Testa geração real de questões"""
        if not self.auth_token:
            self.log_test("/api/questoes/gerar", "ERROR", {
                "error": "Não autenticado"
            })
            return
        
        try:
            question_data = {
                "materia": "Matemática",
                "assunto": "Álgebra",
                "dificuldade": "medio",
                "quantidade": 1
            }
            
            response = self.session.post(
                f"{self.base_url}/api/questoes/gerar",
                json=question_data
            )
            
            if response.status_code == 200:
                data = response.json()
                has_mocks, indicators = self.contains_mock_indicators(data)
                
                # Verifica se a questão parece real (tem conteúdo substantivo)
                is_real_question = (
                    isinstance(data, dict) and
                    'questao' in data and
                    len(str(data.get('questao', ''))) > 50  # Questão real deve ter conteúdo
                )
                
                details = {
                    "response_code": response.status_code,
                    "mock_indicators": indicators,
                    "is_real_question": is_real_question,
                    "question_length": len(str(data.get('questao', ''))),
                    "sample_data": data
                }
                
                if has_mocks or not is_real_question:
                    self.log_test("/api/questoes/gerar", "MOCK_DATA", details)
                else:
                    self.log_test("/api/questoes/gerar", "REAL_DATA", details)
            else:
                self.log_test("/api/questoes/gerar", "ERROR", {
                    "response_code": response.status_code,
                    "error": response.text
                })
                
        except Exception as e:
            self.log_test("/api/questoes/gerar", "ERROR", {"error": str(e)})
    
    def test_performance(self):
        """Testa performance das APIs"""
        endpoints = [
            "/api/planos",
            "/api/jogos",
            "/api/news",
            "/api/opcoes"
        ]
        
        performance_results = []
        
        for endpoint in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}{endpoint}")
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000  # em ms
                
                performance_results.append({
                    "endpoint": endpoint,
                    "response_time_ms": round(response_time, 2),
                    "status_code": response.status_code
                })
                
            except Exception as e:
                performance_results.append({
                    "endpoint": endpoint,
                    "error": str(e)
                })
        
        self.results["performance"] = performance_results
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🔍 Iniciando validação: Dados Reais vs Mocks")
        print(f"📡 Base URL: {self.base_url}")
        print("="*50)
        
        # Testa conectividade
        try:
            health_response = self.session.get(f"{self.base_url}/api/planos")
            if health_response.status_code != 200:
                print("❌ Servidor não está respondendo")
                return
        except:
            print("❌ Não foi possível conectar ao servidor")
            return
        
        print("✅ Servidor conectado")
        
        # Autentica
        print("🔐 Autenticando...")
        if self.authenticate():
            print("✅ Autenticação realizada")
        else:
            print("⚠️ Falha na autenticação - alguns testes podem falhar")
        
        # Executa testes
        print("\n📋 Executando testes...")
        
        print("  • Testando /api/planos")
        self.test_planos_endpoint()
        
        print("  • Testando /api/jogos")
        self.test_jogos_endpoint()
        
        print("  • Testando /api/news")
        self.test_news_endpoint()
        
        print("  • Testando /api/opcoes")
        self.test_opcoes_endpoint()
        
        print("  • Testando geração de questões")
        self.test_question_generation()
        
        print("  • Testando performance")
        self.test_performance()
        
        # Gera relatório
        self.generate_report()
    
    def generate_report(self):
        """Gera relatório final"""
        print("\n" + "="*50)
        print("📊 RELATÓRIO DE VALIDAÇÃO: REAL vs MOCK")
        print("="*50)
        
        summary = self.results["summary"]
        print(f"📈 Total de testes: {summary['total_tests']}")
        print(f"✅ Dados reais: {summary['real_data']}")
        print(f"🎭 Dados mockados: {summary['mock_data']}")
        print(f"❌ Erros: {summary['errors']}")
        
        if summary['total_tests'] > 0:
            real_percentage = (summary['real_data'] / summary['total_tests']) * 100
            mock_percentage = (summary['mock_data'] / summary['total_tests']) * 100
            print(f"\n📊 Percentual de dados reais: {real_percentage:.1f}%")
            print(f"🎭 Percentual de dados mockados: {mock_percentage:.1f}%")
        
        print("\n📋 DETALHES POR ENDPOINT:")
        print("-" * 30)
        
        for test in self.results["tests"]:
            status_icon = {
                "REAL_DATA": "✅",
                "MOCK_DATA": "🎭",
                "ERROR": "❌"
            }.get(test["status"], "❓")
            
            print(f"{status_icon} {test['endpoint']}: {test['status']}")
            
            if test["status"] == "MOCK_DATA":
                details = test["details"]
                if "mock_indicators" in details and details["mock_indicators"]:
                    print(f"    🔍 Indicadores encontrados: {', '.join(details['mock_indicators'])}")
                if details.get("is_hardcoded"):
                    print(f"    📝 Dados hardcoded detectados")
                if details.get("is_clearly_mock"):
                    print(f"    🎭 Claramente dados mock")
        
        # Performance
        if "performance" in self.results:
            print("\n⚡ PERFORMANCE:")
            print("-" * 20)
            for perf in self.results["performance"]:
                if "response_time_ms" in perf:
                    print(f"  {perf['endpoint']}: {perf['response_time_ms']}ms")
        
        # Recomendações
        print("\n💡 RECOMENDAÇÕES:")
        print("-" * 20)
        
        if summary['mock_data'] > 0:
            print("🔧 Endpoints com dados mockados foram identificados")
            print("📝 Considere implementar dados reais antes do deploy em produção")
            print("🎯 Priorize a substituição dos mocks nos endpoints críticos")
        else:
            print("✅ Todos os endpoints testados retornam dados reais")
            print("🚀 Sistema pronto para deploy em produção")
        
        # Salva relatório
        report_filename = f"real_vs_mock_validation_report_{int(time.time())}.json"
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório salvo em: {report_filename}")
        
        # Conclusão
        if summary['mock_data'] == 0 and summary['errors'] == 0:
            print("\n🎉 CONCLUSÃO: Sistema validado com dados reais!")
            return True
        else:
            print("\n⚠️ CONCLUSÃO: Sistema ainda contém mocks ou erros")
            return False

def main():
    """Função principal"""
    validator = RealVsMockValidator()
    success = validator.run_all_tests()
    
    if success:
        print("\n✅ Validação concluída com sucesso - Sistema pronto para produção")
        exit(0)
    else:
        print("\n⚠️ Validação identificou problemas - Revisar antes do deploy")
        exit(1)

if __name__ == "__main__":
    main()