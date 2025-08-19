#!/usr/bin/env python3
"""
Script para listar todas as rotas registradas no Flask
"""

import sys
import os

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    from src.main import app
    
    print("=" * 80)
    print("ROTAS REGISTRADAS NO FLASK")
    print("=" * 80)
    
    # Listar todas as rotas
    for rule in app.url_map.iter_rules():
        methods = ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
        print(f"{rule.endpoint:30} {methods:15} {rule.rule}")
    
    print("\n" + "=" * 80)
    print(f"TOTAL DE ROTAS: {len(list(app.url_map.iter_rules()))}")
    print("=" * 80)
    
except Exception as e:
    print(f"Erro ao importar a aplicação: {e}")
    import traceback
    traceback.print_exc()