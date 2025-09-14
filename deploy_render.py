#!/usr/bin/env python3
"""
Script para deploy automático no Render
"""

import requests
import json
import os
import sys
from typing import Dict, Any

class RenderDeployer:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.render.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def create_service(self, service_config: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um novo serviço no Render"""
        url = f"{self.base_url}/services"
        response = requests.post(url, headers=self.headers, json=service_config)
        
        if response.status_code == 201:
            print("✅ Serviço criado com sucesso!")
            return response.json()
        else:
            print(f"❌ Erro ao criar serviço: {response.status_code}")
            print(response.text)
            return {}
    
    def get_services(self) -> list:
        """Lista todos os serviços"""
        url = f"{self.base_url}/services"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Erro ao listar serviços: {response.status_code}")
            return []
    
    def deploy_service(self, service_id: str) -> Dict[str, Any]:
        """Faz deploy de um serviço específico"""
        url = f"{self.base_url}/services/{service_id}/deploys"
        response = requests.post(url, headers=self.headers)
        
        if response.status_code == 201:
            print("✅ Deploy iniciado com sucesso!")
            return response.json()
        else:
            print(f"❌ Erro ao iniciar deploy: {response.status_code}")
            print(response.text)
            return {}

def main():
    # Configuração do serviço
    service_config = {
        "type": "web_service",
        "name": "gabarita-ai-backend",
        "repo": "https://github.com/techiaemp-netizen/gabarita-ai-frontend",
        "branch": "gabarita-frontend-deploy",
        "rootDir": "gabarita-ai-backend",
        "runtime": "python",
        "buildCommand": "pip install -r requirements.txt",
        "startCommand": "gunicorn --bind 0.0.0.0:$PORT src.main:app",
        "plan": "free",
        "region": "oregon",
        "envVars": [
            {"key": "FLASK_ENV", "value": "production"},
            {"key": "FLASK_DEBUG", "value": "False"},
            {"key": "PYTHON_VERSION", "value": "3.11.0"},
            {"key": "PORT", "generateValue": True}
        ],
        "healthCheckPath": "/health",
        "autoDeploy": False
    }
    
    # Verifica se a API key foi fornecida
    api_key = os.getenv('RENDER_API_KEY')
    if not api_key:
        print("❌ RENDER_API_KEY não encontrada nas variáveis de ambiente")
        print("💡 Para obter sua API key:")
        print("   1. Acesse https://dashboard.render.com/account/api-keys")
        print("   2. Crie uma nova API key")
        print("   3. Execute: set RENDER_API_KEY=sua_api_key")
        return
    
    deployer = RenderDeployer(api_key)
    
    # Lista serviços existentes
    print("📋 Listando serviços existentes...")
    services = deployer.get_services()
    
    # Verifica se já existe um serviço com o mesmo nome
    existing_service = None
    for service in services:
        if service.get('name') == 'gabarita-ai-backend':
            existing_service = service
            break
    
    if existing_service:
        print(f"🔄 Serviço existente encontrado: {existing_service['id']}")
        print("🚀 Iniciando novo deploy...")
        deploy_result = deployer.deploy_service(existing_service['id'])
        if deploy_result:
            print(f"✅ Deploy ID: {deploy_result.get('id')}")
            print(f"🌐 URL: https://{existing_service['name']}.onrender.com")
    else:
        print("🆕 Criando novo serviço...")
        service_result = deployer.create_service(service_config)
        if service_result:
            print(f"✅ Serviço ID: {service_result.get('id')}")
            print(f"🌐 URL: https://{service_result.get('name')}.onrender.com")
            print("⏳ O primeiro deploy pode levar alguns minutos...")
    
    print("\n📊 Status do deploy:")
    print("   - Acesse https://dashboard.render.com para acompanhar")
    print("   - Verifique os logs em caso de erro")
    print("   - Configure as variáveis de ambiente necessárias")

if __name__ == "__main__":
    main()