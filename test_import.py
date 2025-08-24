#!/usr/bin/env python3
"""
Teste de importação para verificar se o app pode ser importado corretamente
"""

try:
    from run import app
    print("✅ Importação do app bem-sucedida")
    print(f"✅ App: {app}")
    
    # Testar se as rotas estão registradas
    with app.app_context():
        rules = list(app.url_map.iter_rules())
        auth_routes = [rule for rule in rules if '/auth/' in rule.rule]
        print(f"✅ Rotas de auth encontradas: {len(auth_routes)}")
        for route in auth_routes:
            print(f"  - {route.rule} [{', '.join(route.methods)}]")
            
except Exception as e:
    print(f"❌ Erro na importação: {e}")
    import traceback
    traceback.print_exc()