from flask import Blueprint, jsonify
from src.routes.questoes import CONTEUDOS_EDITAL

opcoes_bp = Blueprint('opcoes', __name__)

@opcoes_bp.route('/opcoes', methods=['GET'])
def get_opcoes():
    """Endpoint principal para obter todas as opções disponíveis"""
    try:
        # Extrair todas as opções do sistema
        opcoes_sistema = {
            'cargos': list(CONTEUDOS_EDITAL.keys()),
            'blocos': list(set(bloco for blocos_data in CONTEUDOS_EDITAL.values() for bloco in blocos_data.keys())),
            'tipos_opcoes': ['cargos-blocos', 'blocos-cargos', 'diagnostico'],
            'estatisticas': {
                'total_cargos': len(CONTEUDOS_EDITAL.keys()),
                'total_blocos': len(set(bloco for blocos_data in CONTEUDOS_EDITAL.values() for bloco in blocos_data.keys())),
                'total_conteudos': sum(len(conteudos) for blocos_data in CONTEUDOS_EDITAL.values() for conteudos in blocos_data.values())
            }
        }
        
        return jsonify({
            'success': True,
            'data': opcoes_sistema,
            'message': 'Opções do sistema obtidas com sucesso'
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter opções: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro ao obter opções do sistema'
        }), 500

@opcoes_bp.route('/opcoes/<tipo>', methods=['GET'])
def get_opcoes_generica(tipo):
    """Rota genérica para opções que redireciona para funções específicas"""
    try:
        if tipo == 'cargos-blocos':
            return get_cargos_blocos()
        elif tipo == 'blocos-cargos':
            return get_blocos_cargos()
        elif tipo == 'diagnostico':
            return get_diagnostico()
        else:
            return jsonify({
                'success': False,
                'error': 'Tipo de opção não encontrado',
                'message': f'Tipo "{tipo}" não é válido. Tipos disponíveis: cargos-blocos, blocos-cargos, diagnostico'
            }), 404
    except Exception as e:
        print(f"Erro na rota genérica de opções: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro interno do servidor'
        }), 500

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
            'success': True,
            'data': {
                'cargos_blocos': opcoes,
                'todos_cargos': list(opcoes.keys()),
                'todos_blocos': sorted(list(todos_blocos))
            },
            'message': 'Opções de cargos e blocos obtidas com sucesso'
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter opções: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro interno do servidor'
        }), 500

@opcoes_bp.route('/opcoes/blocos-cargos', methods=['GET'])
def get_blocos_cargos():
    """Endpoint para obter lista de blocos e cargos disponíveis (formato esperado pelo frontend)"""
    try:
        # Extrair cargos e seus blocos do mapeamento CONTEUDOS_EDITAL
        blocos_cargos = {}
        
        # Inverter a estrutura: bloco -> [cargos]
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            for bloco in blocos_data.keys():
                if bloco not in blocos_cargos:
                    blocos_cargos[bloco] = []
                blocos_cargos[bloco].append(cargo)
        
        # Criar listas únicas
        todos_blocos = list(blocos_cargos.keys())
        todos_cargos = list(CONTEUDOS_EDITAL.keys())
        
        return jsonify({
            'success': True,
            'data': {
                'blocos_cargos': blocos_cargos,
                'todos_blocos': sorted(todos_blocos),
                'todos_cargos': sorted(todos_cargos)
            },
            'message': 'Opções de blocos e cargos obtidas com sucesso'
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter opções blocos-cargos: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro interno do servidor'
        }), 500

@opcoes_bp.route('/opcoes/cargos-por-bloco/<bloco>', methods=['GET'])
def get_cargos_por_bloco(bloco):
    """Endpoint para obter cargos disponíveis para um bloco específico"""
    try:
        cargos = []
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            if bloco in blocos_data:
                cargos.append(cargo)
        
        if not cargos:
            return jsonify({
                'success': False,
                'error': 'Bloco não encontrado',
                'message': 'Bloco não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'bloco': bloco,
                'cargos': cargos
            },
            'message': f'Cargos para o bloco {bloco} obtidos com sucesso'
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter cargos para bloco {bloco}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro interno do servidor'
        }), 500

@opcoes_bp.route('/opcoes/blocos-por-cargo/<cargo>', methods=['GET'])
def get_blocos_por_cargo(cargo):
    """Endpoint para obter blocos disponíveis para um cargo específico"""
    try:
        blocos = list(CONTEUDOS_EDITAL.get(cargo, {}).keys())
        
        if not blocos:
            return jsonify({
                'success': False,
                'error': 'Cargo não encontrado',
                'message': 'Cargo não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'cargo': cargo,
                'blocos': blocos
            },
            'message': f'Blocos para o cargo {cargo} obtidos com sucesso'
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter blocos para cargo {cargo}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro interno do servidor'
        }), 500

@opcoes_bp.route('/opcoes/diagnostico', methods=['GET'])
def get_diagnostico():
    """Endpoint para obter dados de diagnóstico do sistema"""
    try:
        # Estatísticas básicas do sistema
        total_cargos = len(CONTEUDOS_EDITAL.keys())
        total_blocos = len(set(bloco for blocos_data in CONTEUDOS_EDITAL.values() for bloco in blocos_data.keys()))
        
        # Contagem de conteúdos por cargo
        conteudos_por_cargo = {}
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            total_conteudos = sum(len(conteudos) for conteudos in blocos_data.values())
            conteudos_por_cargo[cargo] = total_conteudos
        
        return jsonify({
            'success': True,
            'data': {
                'total_cargos': total_cargos,
                'total_blocos': total_blocos,
                'conteudos_por_cargo': conteudos_por_cargo,
                'sistema_status': 'ativo'
            },
            'message': 'Diagnóstico do sistema obtido com sucesso'
        }), 200
        
    except Exception as e:
        print(f"Erro ao obter diagnóstico: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro interno do servidor'
        }), 500