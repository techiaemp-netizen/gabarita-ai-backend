from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard/stats/<usuario_id>', methods=['GET'])
def obter_estatisticas_dashboard(usuario_id):
    """Obtém estatísticas do dashboard para o usuário"""
    try:
        print(f"📊 Buscando estatísticas do dashboard para usuário: {usuario_id}")
        
        # Dados simulados para demonstração
        estatisticas = {
            'questoes_respondidas': random.randint(50, 200),
            'acertos': random.randint(30, 150),
            'taxa_acerto': round(random.uniform(60, 95), 1),
            'tempo_medio_resposta': random.randint(45, 120),
            'simulados_realizados': random.randint(5, 25),
            'pontuacao_total': random.randint(500, 2000),
            'ranking_posicao': random.randint(1, 100),
            'materias_estudadas': random.randint(8, 15),
            'dias_consecutivos': random.randint(1, 30),
            'meta_diaria': 10,
            'meta_cumprida': random.choice([True, False])
        }
        
        # Dados de desempenho por matéria
        materias = [
            'Português', 'Matemática', 'História', 'Geografia', 
            'Ciências', 'Inglês', 'Física', 'Química', 'Biologia'
        ]
        
        desempenho_materias = []
        for materia in materias[:random.randint(5, 8)]:
            desempenho_materias.append({
                'materia': materia,
                'questoes_respondidas': random.randint(10, 50),
                'acertos': random.randint(5, 40),
                'taxa_acerto': round(random.uniform(50, 95), 1),
                'tempo_medio': random.randint(30, 90)
            })
        
        # Histórico de atividade (últimos 7 dias)
        historico_atividade = []
        for i in range(7):
            data = datetime.now() - timedelta(days=i)
            historico_atividade.append({
                'data': data.strftime('%Y-%m-%d'),
                'questoes_respondidas': random.randint(0, 20),
                'tempo_estudado': random.randint(0, 180)  # em minutos
            })
        
        # Próximas metas
        metas = [
            {
                'tipo': 'diaria',
                'descricao': 'Responder 10 questões',
                'progresso': random.randint(0, 10),
                'meta': 10,
                'concluida': False
            },
            {
                'tipo': 'semanal',
                'descricao': 'Realizar 2 simulados',
                'progresso': random.randint(0, 2),
                'meta': 2,
                'concluida': False
            },
            {
                'tipo': 'mensal',
                'descricao': 'Estudar 15 matérias diferentes',
                'progresso': random.randint(8, 15),
                'meta': 15,
                'concluida': False
            }
        ]
        
        resposta = {
            'sucesso': True,
            'dados': {
                'estatisticas_gerais': estatisticas,
                'desempenho_materias': desempenho_materias,
                'historico_atividade': historico_atividade,
                'metas': metas,
                'usuario_id': usuario_id,
                'ultima_atualizacao': datetime.now().isoformat()
            }
        }
        
        print(f"✅ Estatísticas do dashboard geradas com sucesso")
        return jsonify(resposta)
        
    except Exception as e:
        print(f"❌ Erro ao obter estatísticas do dashboard: {e}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500

@dashboard_bp.route('/api/dashboard/recent-activity/<usuario_id>', methods=['GET'])
def obter_atividade_recente(usuario_id):
    """Obtém atividade recente do usuário"""
    try:
        print(f"📋 Buscando atividade recente para usuário: {usuario_id}")
        
        # Atividades simuladas
        atividades = [
            {
                'id': 1,
                'tipo': 'questao',
                'descricao': 'Respondeu questão de Matemática',
                'resultado': 'acerto',
                'data': (datetime.now() - timedelta(hours=2)).isoformat(),
                'pontos': 10
            },
            {
                'id': 2,
                'tipo': 'simulado',
                'descricao': 'Completou simulado de Português',
                'resultado': '8/10 acertos',
                'data': (datetime.now() - timedelta(hours=5)).isoformat(),
                'pontos': 80
            },
            {
                'id': 3,
                'tipo': 'questao',
                'descricao': 'Respondeu questão de História',
                'resultado': 'erro',
                'data': (datetime.now() - timedelta(days=1)).isoformat(),
                'pontos': 0
            },
            {
                'id': 4,
                'tipo': 'meta',
                'descricao': 'Completou meta diária',
                'resultado': 'concluida',
                'data': (datetime.now() - timedelta(days=1)).isoformat(),
                'pontos': 50
            }
        ]
        
        return jsonify({
            'sucesso': True,
            'atividades': atividades
        })
        
    except Exception as e:
        print(f"❌ Erro ao obter atividade recente: {e}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500

@dashboard_bp.route('/api/dashboard/ranking', methods=['GET'])
def obter_ranking():
    """Obtém ranking geral dos usuários"""
    try:
        print(f"🏆 Buscando ranking geral")
        
        # Dados simulados de ranking
        ranking = []
        nomes = ['Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Carla Souza', 
                'Lucas Lima', 'Fernanda Alves', 'Rafael Pereira', 'Juliana Rocha', 'Bruno Martins']
        
        for i, nome in enumerate(nomes):
            ranking.append({
                'posicao': i + 1,
                'nome': nome,
                'pontuacao': random.randint(1500, 3000),
                'questoes_respondidas': random.randint(100, 500),
                'taxa_acerto': round(random.uniform(70, 95), 1),
                'cargo': random.choice(['Estudante', 'Professor', 'Concurseiro']),
                'avatar': f'https://ui-avatars.com/api/?name={nome.replace(" ", "+")}&background=random'
            })
        
        # Ordenar por pontuação
        ranking.sort(key=lambda x: x['pontuacao'], reverse=True)
        
        # Atualizar posições
        for i, usuario in enumerate(ranking):
            usuario['posicao'] = i + 1
        
        return jsonify({
            'sucesso': True,
            'ranking': ranking[:10]  # Top 10
        })
        
    except Exception as e:
        print(f"❌ Erro ao obter ranking: {e}")
        return jsonify({
            'sucesso': False,
            'erro': 'Erro interno do servidor'
        }), 500