from flask import Blueprint
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request
from datetime import datetime
from routes.questoes import CONTEUDOS_EDITAL

opcoes_bp = Blueprint('opcoes', __name__)
logger = StructuredLogger('opcoes')

@opcoes_bp.route('/opcoes/cargos-blocos', methods=['GET'])
@log_request(logger)
def get_cargos_blocos():
    """Endpoint para obter lista de cargos e blocos disponíveis"""
    logger.info("Iniciando busca de cargos e blocos")
    try:
        # Extrair cargos e seus blocos do mapeamento CONTEUDOS_EDITAL
        opcoes = {}
        
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            opcoes[cargo] = list(blocos_data.keys())
        
        # Criar lista única de blocos para facilitar a busca
        todos_blocos = set()
        for blocos in opcoes.values():
            todos_blocos.update(blocos)
        
        logger.info("Cargos e blocos obtidos com sucesso", extra={
            'total_cargos': len(opcoes),
            'total_blocos': len(todos_blocos)
        })
        
        return ResponseFormatter.success(
            data={
                'cargos_blocos': opcoes,
                'todos_cargos': list(opcoes.keys()),
                'todos_blocos': sorted(list(todos_blocos))
            },
            message="Cargos e blocos obtidos com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro ao obter opções", extra={'error': str(e)})
        return ResponseFormatter.internal_error("Erro interno do servidor")

@opcoes_bp.route('/opcoes/diagnostico', methods=['GET'])
@log_request(logger)
def diagnostico_opcoes():
    """Endpoint de diagnóstico para verificar o status das opções"""
    logger.info("Iniciando diagnóstico das opções")
    try:
        # Verificar se CONTEUDOS_EDITAL está carregado
        if not CONTEUDOS_EDITAL:
            logger.warning("CONTEUDOS_EDITAL não carregado")
            return ResponseFormatter.error(
                error="CONTEUDOS_EDITAL não carregado",
                data={
                    'diagnostico': {
                        'conteudos_carregados': False,
                        'total_cargos': 0,
                        'total_blocos': 0
                    }
                }
            )
        
        # Contar cargos e blocos
        total_cargos = len(CONTEUDOS_EDITAL)
        todos_blocos = set()
        
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            if isinstance(blocos_data, dict):
                todos_blocos.update(blocos_data.keys())
        
        total_blocos = len(todos_blocos)
        
        # Testar endpoints principais
        try:
            # Simular chamada para blocos-cargos
            blocos_cargos = {}
            for cargo, blocos_data in CONTEUDOS_EDITAL.items():
                if isinstance(blocos_data, dict):
                    for bloco in blocos_data.keys():
                        if bloco not in blocos_cargos:
                            blocos_cargos[bloco] = []
                        blocos_cargos[bloco].append(cargo)
            
            endpoint_blocos_cargos_ok = True
        except Exception as e:
            endpoint_blocos_cargos_ok = False
        
        logger.info("Diagnóstico realizado com sucesso", extra={
            'total_cargos': total_cargos,
            'total_blocos': total_blocos,
            'endpoint_blocos_cargos_ok': endpoint_blocos_cargos_ok
        })
        
        return ResponseFormatter.success(
            data={
                'diagnostico': {
                    'conteudos_carregados': True,
                    'total_cargos': total_cargos,
                    'total_blocos': total_blocos,
                    'endpoint_blocos_cargos_ok': endpoint_blocos_cargos_ok,
                    'primeiros_cargos': list(CONTEUDOS_EDITAL.keys())[:5],
                    'primeiros_blocos': sorted(list(todos_blocos))[:5],
                    'timestamp': str(datetime.now())
                }
            },
            message="Diagnóstico realizado com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro no diagnóstico", extra={'error': str(e)})
        return ResponseFormatter.internal_error(
            f"Erro no diagnóstico: {str(e)}",
            data={
                'diagnostico': {
                    'conteudos_carregados': False,
                    'erro_detalhado': str(e)
                }
            }
        )

@opcoes_bp.route('/opcoes/blocos-cargos', methods=['GET'])
@log_request(logger)
def get_blocos_cargos():
    """Endpoint para obter lista de blocos e cargos disponíveis (formato esperado pelo frontend)"""
    logger.info("Iniciando busca de blocos e cargos (formato frontend)")
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
        
        logger.info("Blocos e cargos obtidos com sucesso (formato frontend)", extra={
            'total_blocos': len(todos_blocos),
            'total_cargos': len(todos_cargos),
            'primeiros_blocos': todos_blocos[:3],
            'primeiros_cargos': todos_cargos[:3]
        })
        
        return ResponseFormatter.success(
            data={
                'blocos_cargos': blocos_cargos,
                'todos_blocos': sorted(todos_blocos),
                'todos_cargos': sorted(todos_cargos)
            },
            message="Blocos e cargos obtidos com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro ao obter opções blocos-cargos", extra={'error': str(e)})
        return ResponseFormatter.internal_error("Erro interno do servidor")

@opcoes_bp.route('/opcoes/cargos/<bloco>', methods=['GET'])
@log_request(logger)
def get_cargos_por_bloco(bloco):
    """Endpoint para obter cargos disponíveis para um bloco específico"""
    logger.info("Iniciando busca de cargos por bloco", extra={'bloco': bloco})
    try:
        cargos = []
        for cargo, blocos_data in CONTEUDOS_EDITAL.items():
            if bloco in blocos_data:
                cargos.append(cargo)
        
        if not cargos:
            logger.warning("Bloco não encontrado", extra={'bloco': bloco})
            return ResponseFormatter.not_found("Bloco não encontrado")
        
        logger.info("Cargos obtidos com sucesso para bloco", extra={
            'bloco': bloco,
            'total_cargos': len(cargos),
            'cargos': cargos
        })
        
        return ResponseFormatter.success(
            data={
                'bloco': bloco,
                'cargos': cargos
            },
            message="Cargos obtidos com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro ao obter cargos para bloco", extra={'bloco': bloco, 'error': str(e)})
        return ResponseFormatter.internal_error("Erro interno do servidor")

@opcoes_bp.route('/opcoes/blocos/<cargo>', methods=['GET'])
@log_request(logger)
def get_blocos_por_cargo(cargo):
    """Endpoint para obter blocos disponíveis para um cargo específico"""
    logger.info("Iniciando busca de blocos por cargo", extra={'cargo': cargo})
    try:
        blocos = list(CONTEUDOS_EDITAL.get(cargo, {}).keys())
        
        if not blocos:
            logger.warning("Cargo não encontrado", extra={'cargo': cargo})
            return ResponseFormatter.not_found("Cargo não encontrado")
        
        logger.info("Blocos obtidos com sucesso para cargo", extra={
            'cargo': cargo,
            'total_blocos': len(blocos),
            'blocos': blocos
        })
        
        return ResponseFormatter.success(
            data={
                'cargo': cargo,
                'blocos': blocos
            },
            message="Blocos obtidos com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro ao obter blocos para cargo", extra={'cargo': cargo, 'error': str(e)})
        return ResponseFormatter.internal_error("Erro interno do servidor")
