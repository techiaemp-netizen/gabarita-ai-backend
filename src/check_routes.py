#!/usr/bin/env python3
"""
Script para listar todas as rotas mapeadas na aplicação Flask
Gabarita-AI Backend
"""

from main import app

def print_routes():
    """
    Imprime todas as rotas registradas na aplicação Flask
    """
    print("\n" + "="*80)
    print("ROTAS MAPEADAS - GABARITA-AI BACKEND")
    print("="*80)
    
    routes = []
    for rule in app.url_map.iter_rules():
        methods = ','.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
        routes.append({
            'endpoint': rule.endpoint,
            'methods': methods,
            'rule': rule.rule,
            'blueprint': rule.endpoint.split('.')[0] if '.' in rule.endpoint else 'main'
        })
    
    # Agrupar por blueprint
    blueprints = {}
    for route in routes:
        bp = route['blueprint']
        if bp not in blueprints:
            blueprints[bp] = []
        blueprints[bp].append(route)
    
    # Imprimir rotas agrupadas por blueprint
    for blueprint_name, blueprint_routes in sorted(blueprints.items()):
        print(f"\n📁 BLUEPRINT: {blueprint_name.upper()}")
        print("-" * 60)
        
        for route in sorted(blueprint_routes, key=lambda x: x['rule']):
            methods_str = f"[{route['methods']}]".ljust(20)
            print(f"  {methods_str} {route['rule']}")
    
    print(f"\n📊 RESUMO:")
    print(f"   Total de rotas: {len(routes)}")
    print(f"   Total de blueprints: {len(blueprints)}")
    print("\n" + "="*80)

def check_route_consistency():
    """
    Verifica a consistência das rotas
    """
    print("\n🔍 VERIFICAÇÃO DE CONSISTÊNCIA")
    print("-" * 40)
    
    issues = []
    
    for rule in app.url_map.iter_rules():
        rule_str = rule.rule
        
        # Verificar se rotas de API têm prefixo /api
        if rule.endpoint != 'static' and not rule_str.startswith('/api') and rule_str not in ['/', '/health']:
            issues.append(f"❌ Rota sem prefixo /api: {rule_str}")
        
        # Verificar rotas com nomes em português
        portuguese_words = ['cadastro', 'processar', 'ativar-plano', 'criar-preferencia']
        for word in portuguese_words:
            if word in rule_str:
                issues.append(f"⚠️  Rota com nome em português: {rule_str}")
    
    if issues:
        print("\n🚨 PROBLEMAS ENCONTRADOS:")
        for issue in issues:
            print(f"   {issue}")
    else:
        print("\n✅ Todas as rotas estão consistentes!")
    
    print()

if __name__ == '__main__':
    with app.app_context():
        print_routes()
        check_route_consistency()