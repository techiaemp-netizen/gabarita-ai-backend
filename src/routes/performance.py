from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import sys
from ..utils.logger import log_request, logger
from ..utils.response_formatter import ResponseFormatter

# Criar blueprint para performance e ranking
performance_bp = Blueprint('performance', __name__)

@performance_bp.route('/desempenho', methods=['GET'])
@log_request(logger)
def obter_desempenho():
    print("📈 Requisição recebida para dados de performance")
    sys.stdout.flush()
    
    usuario_id = request.args.get('usuario_id', 'user-default')
    periodo = request.args.get('periodo', '30')  # dias
    
    print(f"👤 Usuario ID: {usuario_id}")
    print(f"📅 Período: {periodo} dias")
    sys.stdout.flush()
    
    # Dados simulados de performance
    performance_data = {
        'usuario_id': usuario_id,
        'periodo_dias': int(periodo),
        'estatisticas': {
            'total_questoes': 150,
            'acertos': 105,
            'erros': 45,
            'percentual_acerto': 70.0,
            'tempo_medio_resposta': 45,  # segundos
            'questoes_por_dia': 5.0,
            'dias_consecutivos': 12
        },
        'evolucao_semanal': [
            {'semana': 1, 'acertos': 65, 'total': 35, 'percentual': 65.0},
            {'semana': 2, 'acertos': 72, 'total': 40, 'percentual': 72.0},
            {'semana': 3, 'acertos': 68, 'total': 38, 'percentual': 68.0},
            {'semana': 4, 'acertos': 75, 'total': 37, 'percentual': 75.0}
        ],
        'materias_performance': [
            {'materia': 'SUS', 'acertos': 25, 'total': 30, 'percentual': 83.3},
            {'materia': 'Enfermagem', 'acertos': 40, 'total': 50, 'percentual': 80.0},
            {'materia': 'Legislação', 'acertos': 20, 'total': 35, 'percentual': 57.1},
            {'materia': 'Ética', 'acertos': 20, 'total': 25, 'percentual': 80.0}
        ],
        'metas': {
            'questoes_diarias': 10,
            'percentual_alvo': 80.0,
            'progresso_meta_questoes': 50.0,  # 5/10 questões por dia
            'progresso_meta_percentual': 87.5  # 70/80 percentual
        }
    }
    
    print(f"✅ Performance calculada: {performance_data['estatisticas']['percentual_acerto']}% de acerto")
    sys.stdout.flush()
    
    return ResponseFormatter.success(performance_data)

@performance_bp.route('/classificacao', methods=['GET'])
@log_request(logger)
def obter_classificacao():
    print("🏆 Requisição recebida para ranking")
    sys.stdout.flush()
    
    tipo = request.args.get('tipo', 'geral')  # geral, semanal, mensal
    cargo = request.args.get('cargo', 'todos')
    limite = int(request.args.get('limite', '50'))
    
    print(f"🎯 Tipo: {tipo}")
    print(f"💼 Cargo: {cargo}")
    print(f"📊 Limite: {limite}")
    sys.stdout.flush()
    
    # Dados simulados de ranking
    ranking_data = {
        'tipo': tipo,
        'cargo': cargo,
        'periodo': 'últimos_30_dias' if tipo == 'mensal' else 'última_semana' if tipo == 'semanal' else 'geral',
        'atualizado_em': datetime.now().isoformat(),
        'ranking': [
            {
                'posicao': 1,
                'usuario_id': 'user-001',
                'nome': 'Ana Silva',
                'cargo': 'Enfermeiro',
                'pontuacao': 2850,
                'questoes_respondidas': 320,
                'percentual_acerto': 89.1,
                'nivel': 'Especialista',
                'avatar': None
            },
            {
                'posicao': 2,
                'usuario_id': 'user-002',
                'nome': 'Carlos Santos',
                'cargo': 'Enfermeiro',
                'pontuacao': 2720,
                'questoes_respondidas': 298,
                'percentual_acerto': 87.3,
                'nivel': 'Avançado',
                'avatar': None
            },
            {
                'posicao': 3,
                'usuario_id': 'user-003',
                'nome': 'Maria Oliveira',
                'cargo': 'Enfermeiro',
                'pontuacao': 2650,
                'questoes_respondidas': 285,
                'percentual_acerto': 85.8,
                'nivel': 'Avançado',
                'avatar': None
            },
            {
                'posicao': 4,
                'usuario_id': 'user-default',
                'nome': 'Você',
                'cargo': 'Enfermeiro',
                'pontuacao': 1950,
                'questoes_respondidas': 150,
                'percentual_acerto': 70.0,
                'nivel': 'Intermediário',
                'avatar': None,
                'destaque': True
            },
            {
                'posicao': 5,
                'usuario_id': 'user-005',
                'nome': 'João Pereira',
                'cargo': 'Enfermeiro',
                'pontuacao': 1820,
                'questoes_respondidas': 142,
                'percentual_acerto': 68.5,
                'nivel': 'Intermediário',
                'avatar': None
            }
        ],
        'estatisticas_gerais': {
            'total_usuarios': 1247,
            'media_pontuacao': 1650,
            'media_percentual': 72.3,
            'questoes_respondidas_total': 45230
        }
    }
    
    # Limitar resultado conforme solicitado
    ranking_data['ranking'] = ranking_data['ranking'][:limite]
    
    print(f"✅ Ranking gerado: {len(ranking_data['ranking'])} posições")
    sys.stdout.flush()
    
    return ResponseFormatter.success(ranking_data)