from flask import Blueprint, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from routes.questoes import CONTEUDOS_EDITAL

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

@opcoes_bp.route('/conteudos-edital', methods=['GET'])
def get_conteudos_edital():
    """Retorna todos os conteúdos de edital disponíveis no formato esperado pelo frontend"""
    try:
        # Extrair cargos únicos e seus blocos
        cargos_blocos = {}
        
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            if isinstance(blocos_data, dict):
                cargos_blocos[cargo] = list(blocos_data.keys())
        
        # Criar estrutura de cargos com grupos (blocos)
        cargos = []
        for cargo, blocos in cargos_blocos.items():
            grupos = []
            for bloco in sorted(blocos):
                # Obter matérias do bloco
                bloco_data = CONTEUDOS_EDITAL.get(cargo, {}).get(bloco, {})
                materias = []
                
                if isinstance(bloco_data, dict):
                    # Se é um dicionário, pegar as chaves (categorias de conhecimento)
                    for categoria, lista_materias in bloco_data.items():
                        if isinstance(lista_materias, list):
                            materias.extend(lista_materias[:3])  # Primeiras 3 de cada categoria
                elif isinstance(bloco_data, list):
                    # Se é uma lista direta
                    materias = bloco_data[:5]  # Primeiras 5 matérias
                
                grupo = {
                    'id': f"{cargo.lower().replace(' ', '_')}_{bloco.lower().replace(' ', '_').replace('-', '_')}",
                    'nome': bloco,
                    'descricao': f'Grupo {bloco} para {cargo}',
                    'materias': materias[:5]  # Limitar a 5 matérias
                }
                grupos.append(grupo)
            
            cargo_obj = {
                'id': cargo.lower().replace(' ', '_'),
                'nome': cargo,
                'descricao': f'Cargo de {cargo}',
                'grupos': grupos
            }
            cargos.append(cargo_obj)
        
        # Criar conteúdo de edital principal
        conteudo_edital = {
            'id': '1',
            'nome': 'Concurso Nacional Unificado - CNU',
            'descricao': 'Conteúdos para o Concurso Nacional Unificado',
            'ativo': True,
            'cargos': cargos
        }
        
        return jsonify([conteudo_edital])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@opcoes_bp.route('/conteudos-edital/grupos/<cargo_id>', methods=['GET'])
def get_grupos_by_cargo(cargo_id):
    """Endpoint para obter grupos (blocos) por cargo"""
    try:
        # Encontrar o cargo pelo ID
        cargo_encontrado = None
        for cargo in CONTEUDOS_EDITAL.keys():
            if cargo.lower().replace(' ', '_') in cargo_id.lower():
                cargo_encontrado = cargo
                break
        
        if not cargo_encontrado:
            return jsonify({
                'erro': 'Cargo não encontrado'
            }), 404
        
        # Obter blocos para o cargo
        blocos = list(CONTEUDOS_EDITAL.get(cargo_encontrado, {}).keys())
        
        # Formatar como grupos
        grupos = []
        for i, bloco in enumerate(blocos):
            grupo = {
                'id': f"{cargo_encontrado.lower().replace(' ', '_')}_{bloco.lower().replace(' ', '_').replace('-', '_')}",
                'nome': bloco,
                'descricao': f'Grupo {bloco} para {cargo_encontrado}',
                'cargo_id': cargo_id,
                'ativo': True
            }
            grupos.append(grupo)
        
        return jsonify(grupos), 200
        
    except Exception as e:
        print(f"Erro ao obter grupos para cargo {cargo_id}: {str(e)}")
        return jsonify({
            'erro': 'Erro interno do servidor'
        }), 500