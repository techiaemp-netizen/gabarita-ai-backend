from main import app

print("=== DUMP DE ROTAS DA API ===")
for r in app.url_map.iter_rules():
    if r.rule.startswith('/api'):
        methods = ','.join(sorted(m for m in r.methods if m not in ('HEAD','OPTIONS')))
        print(f"{methods} {r.rule}")