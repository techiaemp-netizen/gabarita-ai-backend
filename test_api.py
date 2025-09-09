#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar a API de geração de questões diretamente
"""

import requests
import json

def test_generate_questions():
    url = "http://localhost:5000/api/questoes/gerar"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer fake-token-for-development"
    }
    
    payload = {
        "subject": "Enfermagem Geral",
        "difficulty": "medio",
        "count": 5,
        "bloco": "Bloco 5 - Educação, Saúde, Desenvolvimento Social e Direitos Humanos",
        "cargo": "Enfermeiro",
        "usuario_id": "test-user-123"
    }
    
    print("🚀 Testando API de geração de questões...")
    print(f"📡 URL: {url}")
    print(f"📦 Payload: {json.dumps(payload, indent=2, ensure_ascii=False)}")
    print(f"🔑 Headers: {json.dumps(headers, indent=2)}")
    print("\n" + "="*50)
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers da Resposta: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ Resposta JSON: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except json.JSONDecodeError:
                print(f"❌ Erro ao decodificar JSON. Resposta raw: {response.text}")
        else:
            print(f"❌ Erro HTTP {response.status_code}: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro na requisição: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_generate_questions()