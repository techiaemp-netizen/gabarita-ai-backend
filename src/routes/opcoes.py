from flask import Blueprint, jsonify
from src.routes.questoes import CONTEUDOS_EDITAL

opcoes_bp = Blueprint('opcoes', __name__)

@opcoes_bp.route('/opcoes/cargos-blocos', methods=['GET'])
def get_cargos_blocos():
    """Endpoint para obter lista de cargos e blocos disponíveis"""
    try:
        # Extrair cargos e seus blocos do mapeamento CONTEUDOS_EDITAL
        opcoes = {}
        
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            opcoes[cargo] = list(blocos_data.keys())
        
        # Criar lista única de blocos para facilitar a busca
        todos_blocos = set()
        for blocos in opcoes.values():
            todos_blocos.update(blocos)
        
        return jsonify({
            'sucesso': True,
            'dados': {
                'cargos_blocos': opcoes,
                'todos_cargos': list(opcoes.keys()),
                'todos_blocos': sorted(list(todos_blocos))
            }
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter opções: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500

@opcoes_bp.route('/opcoes/blocos-cargos', methods=['GET'])
def get_blocos_cargos():
    """Endpoint para obter lista de blocos e cargos disponíveis (formato esperado pelo frontend)"""
    try:
        # Extrair cargos e seus blocos do mapeamento CONTEUDOS_EDITAL
        blocos_cargos = {}
        
        # Inverter a estrutura: bloco -> [cargos]
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            # Verificar se blocos_data é um dicionário ou lista
            if isinstance(blocos_data, dict):
                # Estrutura nova: cargo -> {bloco: {conhecimentos_especificos: [...]}}
                for bloco in blocos_data.keys():
                    if bloco not in blocos_cargos:
                        blocos_cargos[bloco] = []
                    blocos_cargos[bloco].append(cargo)
            else:
                # Estrutura antiga: cargo -> [conhecimentos] - assumir bloco padrão
                print(f"Aviso: Cargo {cargo} tem estrutura antiga (lista), ignorando...")
                continue
        
        # Criar listas únicas
        todos_blocos = list(blocos_cargos.keys())
        todos_cargos = list(CONTEUDOS_EDITAL.keys())
        
        print(f"Debug: Encontrados {len(todos_blocos)} blocos e {len(todos_cargos)} cargos")
        print(f"Debug: Blocos: {todos_blocos[:3]}...")  # Primeiros 3 blocos
        print(f"Debug: Cargos: {todos_cargos[:3]}...")   # Primeiros 3 cargos
        
        return jsonify({
            'sucesso': True,
            'dados': {
                'blocos_cargos': blocos_cargos,
                'todos_blocos': sorted(todos_blocos),
                'todos_cargos': sorted(todos_cargos)
            }
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter opções blocos-cargos: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500

@opcoes_bp.route('/opcoes/cargos/<bloco>', methods=['GET'])
def get_cargos_por_bloco(bloco):
    """Endpoint para obter cargos disponíveis para um bloco específico"""
    try:
        cargos = []
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            if bloco in blocos_data:
                cargos.append(cargo)
        
        if not cargos:
            return jsonify({
                'sucesso': False,
                'erro': 'Bloco não encontrado'
            }), 404
        
        return jsonify({
            'sucesso': True,
            'dados': {
                'bloco': bloco,
                'cargos': cargos
            }
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter cargos para bloco {bloco}: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500

@opcoes_bp.route('/opcoes/blocos/<cargo>', methods=['GET'])
def get_blocos_por_cargo(cargo):
    """Endpoint para obter blocos disponíveis para um cargo específico"""
    try:
        blocos = list(CONTEUDOS_EDITAL.get(cargo, {}).keys())
        
        if not blocos:
            return jsonify({
                'sucesso': False,
                'erro': 'Cargo não encontrado'
            }), 404
        
        return jsonify({
            'sucesso': True,
            'dados': {
                'cargo': cargo,
                'blocos': blocos
            }
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter blocos para cargo {cargo}: {str(e)}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500