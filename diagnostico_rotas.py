from src.main import app

print("=== Diagnóstico de Rotas do Flask - Gabarita.AI ===")
print()

for rule in app.url_map.iter_rules():
    print(f"Rota disponível: {rule}  --> Métodos: {rule.methods}")

print()
print(f"Total de rotas encontradas: {len(list(app.url_map.iter_rules()))}")