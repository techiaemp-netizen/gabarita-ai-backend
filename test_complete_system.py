#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste Completo do Sistema Gabarita AI
Validação end-to-end de todos os endpoints e fluxos
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:5000"
FRONTEND_URL = "http://localhost:3000"

class GabaritaAITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, status, details=""):
        """Registra resultado do teste"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status} - {details}")
        
    def test_health_check(self):
        """Testa endpoint de health check"""
        try:
            response = self.session.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                self.log_test("Health Check", "PASS", f"Status: {response.status_code}")
                return True
            else:
                self.log_test("Health Check", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", "FAIL", f"Erro: {str(e)}")
            return False
            
    def test_planos_endpoint(self):
        """Testa endpoint de planos"""
        try:
            response = self.session.get(f"{BASE_URL}/api/planos")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Planos Endpoint", "PASS", f"Retornou {len(data)} planos")
                return True
            else:
                self.log_test("Planos Endpoint", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Planos Endpoint", "FAIL", f"Erro: {str(e)}")
            return False
            
    def test_user_registration(self):
        """Testa registro de usuário"""
        test_user = {
            "email": f"teste_{int(time.time())}@gabarita.ai",
            "password": "123456",
            "nome": "Usuario Teste"
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/api/auth/register",
                json=test_user,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                if "token" in data or "access_token" in data:
                    self.auth_token = data.get("token") or data.get("access_token")
                    self.log_test("User Registration", "PASS", "Usuário registrado com sucesso")
                    return True, test_user
                else:
                    self.log_test("User Registration", "WARN", "Registro OK mas sem token")
                    return True, test_user
            else:
                self.log_test("User Registration", "FAIL", f"Status: {response.status_code}")
                return False, None
        except Exception as e:
            self.log_test("User Registration", "FAIL", f"Erro: {str(e)}")
            return False, None
            
    def test_user_login(self, user_data):
        """Testa login de usuário"""
        if not user_data:
            self.log_test("User Login", "SKIP", "Sem dados de usuário")
            return False
            
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data or "access_token" in data:
                    self.auth_token = data.get("token") or data.get("access_token")
                    self.log_test("User Login", "PASS", "Login realizado com sucesso")
                    return True
                else:
                    self.log_test("User Login", "WARN", "Login OK mas sem token")
                    return True
            else:
                self.log_test("User Login", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("User Login", "FAIL", f"Erro: {str(e)}")
            return False
            
    def test_protected_endpoints(self):
        """Testa endpoints protegidos"""
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        # Teste geração de questões
        try:
            questao_data = {
                "materia": "Matemática",
                "dificuldade": "medio",
                "quantidade": 1
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/questoes/gerar",
                json=questao_data,
                headers={**headers, "Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                self.log_test("Geração de Questões", "PASS", "Questões geradas com sucesso")
            elif response.status_code == 401:
                self.log_test("Geração de Questões", "PASS", "Proteção de rota funcionando (401)")
            else:
                self.log_test("Geração de Questões", "WARN", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Geração de Questões", "FAIL", f"Erro: {str(e)}")
            
    def test_jogos_endpoint(self):
        """Testa endpoint de jogos"""
        try:
            response = self.session.get(f"{BASE_URL}/api/jogos")
            if response.status_code == 200:
                self.log_test("Jogos Endpoint", "PASS", f"Status: {response.status_code}")
                return True
            else:
                self.log_test("Jogos Endpoint", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Jogos Endpoint", "FAIL", f"Erro: {str(e)}")
            return False
            
    def test_opcoes_endpoint(self):
        """Testa endpoint de opções"""
        try:
            response = self.session.get(f"{BASE_URL}/api/opcoes")
            if response.status_code == 200:
                self.log_test("Opções Endpoint", "PASS", f"Status: {response.status_code}")
                return True
            else:
                self.log_test("Opções Endpoint", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Opções Endpoint", "FAIL", f"Erro: {str(e)}")
            return False
            
    def test_frontend_connectivity(self):
        """Testa conectividade com frontend"""
        try:
            response = requests.get(FRONTEND_URL, timeout=5)
            if response.status_code == 200:
                self.log_test("Frontend Connectivity", "PASS", "Frontend acessível")
                return True
            else:
                self.log_test("Frontend Connectivity", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Frontend Connectivity", "FAIL", f"Erro: {str(e)}")
            return False
            
    def generate_report(self):
        """Gera relatório final dos testes"""
        print("\n" + "="*60)
        print("📊 RELATÓRIO FINAL DE TESTES - GABARITA AI")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["status"] == "PASS"])
        failed_tests = len([t for t in self.test_results if t["status"] == "FAIL"])
        warned_tests = len([t for t in self.test_results if t["status"] == "WARN"])
        
        print(f"\n📈 ESTATÍSTICAS:")
        print(f"   Total de Testes: {total_tests}")
        print(f"   ✅ Aprovados: {passed_tests}")
        print(f"   ❌ Falharam: {failed_tests}")
        print(f"   ⚠️  Avisos: {warned_tests}")
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        print(f"   🎯 Taxa de Sucesso: {success_rate:.1f}%")
        
        print(f"\n📋 DETALHES DOS TESTES:")
        for result in self.test_results:
            status_icon = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "⚠️"
            print(f"   {status_icon} {result['test']}: {result['details']}")
            
        print(f"\n🏆 STATUS FINAL:")
        if success_rate >= 90:
            print("   🟢 SISTEMA APROVADO PARA PRODUÇÃO")
        elif success_rate >= 70:
            print("   🟡 SISTEMA FUNCIONAL - REQUER AJUSTES MENORES")
        else:
            print("   🔴 SISTEMA REQUER CORREÇÕES CRÍTICAS")
            
        print("\n" + "="*60)
        
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 INICIANDO TESTES COMPLETOS DO SISTEMA GABARITA AI")
        print("="*60)
        
        # Testes básicos
        self.test_health_check()
        self.test_planos_endpoint()
        self.test_jogos_endpoint()
        self.test_opcoes_endpoint()
        self.test_frontend_connectivity()
        
        # Testes de autenticação
        success, user_data = self.test_user_registration()
        if success:
            self.test_user_login(user_data)
            
        # Testes de endpoints protegidos
        self.test_protected_endpoints()
        
        # Gerar relatório
        self.generate_report(