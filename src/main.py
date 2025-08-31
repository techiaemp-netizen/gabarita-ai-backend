from flask import Flask, request
from flask_cors import CORS
import os
from datetime import datetime
from services.chatgpt_service import chatgpt_service
from routes.questoes import CONTEUDOS_EDITAL
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request
from routes.auth import auth_bp
from routes.questoes import questoes_bp
from routes.planos import planos_bp
from routes.jogos import jogos_bp
from routes.news import news_bp
from routes.opcoes import opcoes_bp
from routes.usuarios import usuarios_bp
from routes.payments import payments_bp
from config.firebase_config import firebase_config

app = Flask(__name__)

# Initialize structured logger
logger = StructuredLogger(__name__)

# Configuração CORS específica para o frontend do Vercel
CORS(app, 
     origins=['https://gabarita-ai-frontend-pied.vercel.app', 'http://localhost:3000'],
     allow_headers=['Content-Type', 'Authorization', 'Accept', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     supports_credentials=True)  # Habilitar credentials para autenticação

# Registrar blueprints com prefixo /api padronizado
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(questoes_bp, url_prefix='/api/questoes')
app.register_blueprint(planos_bp, url_prefix='/api/planos')
app.register_blueprint(jogos_bp, url_prefix='/api/jogos')
app.register_blueprint(news_bp, url_prefix='/api/noticias')
app.register_blueprint(opcoes_bp, url_prefix='/api/opcoes')
app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
app.register_blueprint(payments_bp, url_prefix='/api/payments')

@app.route('/', methods=['GET'])
@log_request(logger)
def root():
    """Rota raiz da API"""
    logger.info("API root endpoint accessed")
    return ResponseFormatter.success({
        'message': 'Gabarita.AI Backend API',
        'version': '1.0.0',
        'status': 'online',
        'endpoints': {
            'health': '/health',
            'auth': '/api/auth/*',
            'questoes': '/api/questoes/*',
            'planos': '/api/planos/*',
            'jogos': '/api/jogos/*',
            'opcoes': '/api/opcoes/*',
            'usuarios': '/api/usuarios/*',
            'noticias': '/api/noticias/*',
            'payments': '/api/payments/*'
        }
    })

@app.route('/health', methods=['GET'])
@log_request(logger)
def health_check():
    """Endpoint de verificação de saúde da API"""
    logger.info("Health check endpoint accessed")
    return ResponseFormatter.success({
        'status': 'healthy',
        'timestamp': str(datetime.now())
    }, 'API funcionando corretamente')

@app.route('/api/test', methods=['GET', 'OPTIONS'])
@log_request(logger)
def test_endpoint():
    """Endpoint de teste público para verificar conectividade"""
    if request.method == 'OPTIONS':
        logger.debug("CORS preflight request received for test endpoint")
        # Resposta para preflight CORS
        response = ResponseFormatter.success({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response
    
    logger.info("Test endpoint accessed successfully")
    return ResponseFormatter.success({
        'status': 'sucesso',
        'timestamp': str(datetime.now()),
        'cors_enabled': True
    }, 'Endpoint de teste funcionando')

@app.route('/api/opcoes/test', methods=['GET', 'OPTIONS'])
def test_opcoes():
    """Endpoint de teste específico para opções"""
    if request.method == 'OPTIONS':
        response = ResponseFormatter.success({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response
    
    try:
        from .routes.questoes import CONTEUDOS_EDITAL
        total_cargos = len(CONTEUDOS_EDITAL) if CONTEUDOS_EDITAL else 0
        
        return ResponseFormatter.success({
            'status': 'sucesso',
            'total_cargos': total_cargos,
            'conteudos_carregados': bool(CONTEUDOS_EDITAL),
            'timestamp': str(datetime.now())
        }, 'Teste de opções funcionando')
    except Exception as e:
        return ResponseFormatter.internal_error(f'Erro no teste: {str(e)}')

@app.route('/api/health', methods=['GET'])
@log_request(logger)
def api_health():
    logger.info("API health endpoint accessed")
    return ResponseFormatter.success({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })



@app.route('/api/questoes/gerar', methods=['POST'])
def gerar_questao_endpoint():
    import sys
    print("🔥 Requisição recebida na API de geração de questões")
    sys.stdout.flush()
    data = request.get_json()
    print(f"📋 Dados recebidos: {data}")
    sys.stdout.flush()
    
    usuario_id = data.get('usuario_id', 'user-default')
    cargo = data.get('cargo', 'Enfermeiro')
    bloco = data.get('bloco', 'Saúde')
    
    print(f"👤 Usuario ID: {usuario_id}")
    print(f"💼 Cargo: {cargo}")
    print(f"📚 Bloco: {bloco}")
    sys.stdout.flush()
    
    # Obter conteúdo específico do edital
    conteudo_edital = CONTEUDOS_EDITAL.get(cargo, {}).get(bloco, [])
    print(f"📖 Conteúdo do edital: {conteudo_edital}")
    sys.stdout.flush()
    
    if not conteudo_edital:
        print("❌ Cargo ou bloco não encontrado")
        return ResponseFormatter.not_found('Cargo ou bloco não encontrado')
    
    # Usar a função real de geração de questões
    try:
        print("🤖 Gerando questão com ChatGPT...")
        sys.stdout.flush()
        conteudo_str = ', '.join(conteudo_edital[:3])  # Usar os primeiros 3 tópicos
        questao_gerada = chatgpt_service.gerar_questao(cargo, conteudo_str)
        
        if questao_gerada:
            print(f"✅ Questão gerada com sucesso: {questao_gerada.get('questao', 'N/A')[:50]}...")
            # Converter formato para o frontend
            questao_frontend = {
                'id': f'q-{usuario_id}-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'enunciado': questao_gerada.get('questao', ''),
                'alternativas': [{'id': alt['id'], 'texto': alt['texto']} for alt in questao_gerada.get('alternativas', [])],
                'gabarito': questao_gerada.get('gabarito', 'A'),
                'explicacao': questao_gerada.get('explicacao', ''),
                'dificuldade': questao_gerada.get('dificuldade', 'medio'),
                'tema': questao_gerada.get('tema', conteudo_edital[0] if conteudo_edital else 'Geral')
            }
            return ResponseFormatter.success({'questao': questao_frontend})
        else:
            print("❌ ChatGPT retornou None")
            raise Exception("ChatGPT não retornou questão válida")
            
    except Exception as e:
        print(f"❌ Erro ao gerar questão: {e}")
        sys.stdout.flush()
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        # Fallback
        questao_personalizada = {
            'id': f'q-{usuario_id}-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'enunciado': 'Questão de exemplo sobre SUS',
            'alternativas': [
                {'id': 'A', 'texto': 'Alternativa A'},
                {'id': 'B', 'texto': 'Alternativa B'},
                {'id': 'C', 'texto': 'Alternativa C'},
                {'id': 'D', 'texto': 'Alternativa D'},
                {'id': 'E', 'texto': 'Alternativa E'}
            ],
            'gabarito': 'C',
            'explicacao': 'Explicação da resposta correta',
            'dificuldade': 'medio',
            'tema': 'SUS'
        }
        
        print(f"✅ Questão fallback gerada: {questao_personalizada['enunciado'][:50]}...")
        
        return ResponseFormatter.success({
            'questao': questao_personalizada
        })

@app.route('/api/questoes/<questao_id>/responder', methods=['POST'])
def responder_questao(questao_id):
    data = request.get_json()
    resposta = data.get('resposta')
    
    return ResponseFormatter.success({
        'sucesso': True,
        'correto': resposta == 'C',
        'gabarito': 'C',
        'explicacao': 'Explicação detalhada da resposta'
    })

@app.route('/api/perplexity/explicacao', methods=['POST'])
def obter_explicacao_perplexity():
    import sys
    print("🔍 Requisição recebida para explicação do Perplexity")
    sys.stdout.flush()
    
    data = request.get_json()
    questao = data.get('questao', '')
    alternativa_correta = data.get('alternativa_correta', '')
    alternativa_escolhida = data.get('alternativa_escolhida', '')
    materia = data.get('materia', '')
    tema = data.get('tema', '')
    
    print(f"📝 Questão: {questao[:100]}...")
    print(f"✅ Alternativa correta: {alternativa_correta}")
    print(f"❌ Alternativa escolhida: {alternativa_escolhida}")
    print(f"📚 Matéria: {materia}")
    print(f"🎯 Tema: {tema}")
    sys.stdout.flush()
    
    try:
        # Criar prompt para explicação detalhada
        prompt_explicacao = f"""
        Explique detalhadamente por que a alternativa {alternativa_correta} é a correta para esta questão de concurso público:
        
        Questão: {questao}
        
        O candidato escolheu a alternativa {alternativa_escolhida}, mas a correta é {alternativa_correta}.
        
        Forneça:
        1. Explicação clara do conceito
        2. Por que a alternativa {alternativa_correta} está correta
        3. Por que a alternativa {alternativa_escolhida} está incorreta
        4. Fontes de estudo recomendadas sobre {tema} em {materia}
        
        Seja didático e inclua referências normativas quando aplicável.
        """
        
        print("🤖 Enviando prompt para o Perplexity...")
        sys.stdout.flush()
        
        # Usar o serviço ChatGPT/Perplexity para gerar explicação
        explicacao_detalhada = chatgpt_service.gerar_explicacao(prompt_explicacao)
        
        if explicacao_detalhada:
            print(f"✅ Explicação gerada com sucesso: {explicacao_detalhada[:100]}...")
            return ResponseFormatter.success({
                'sucesso': True,
                'explicacao': explicacao_detalhada,
                'fontes': [
                    'Constituição Federal de 1988',
                    'Lei 8.080/90 - Lei Orgânica da Saúde',
                    'Lei 8.142/90 - Participação e Financiamento do SUS'
                ]
            })
        else:
            raise Exception("Não foi possível gerar explicação")
            
    except Exception as e:
        print(f"❌ Erro ao gerar explicação: {e}")
        sys.stdout.flush()
        
        # Fallback com explicação genérica
        explicacao_fallback = f"""
        A alternativa {alternativa_correta} é a correta para esta questão sobre {tema}.
        
        Para entender melhor este conceito, recomendo revisar:
        - Legislação específica sobre {materia}
        - Conceitos fundamentais de {tema}
        - Jurisprudência relacionada ao assunto
        
        Continue estudando e pratique mais questões sobre este tema!
        """
        
        return ResponseFormatter.success({
            'sucesso': True,
            'explicacao': explicacao_fallback,
            'fontes': [
                'Material de estudo recomendado',
                'Legislação pertinente',
                'Doutrina especializada'
            ]
        })

@app.route('/api/simulados/submit', methods=['POST'])
def submit_simulado():
    """Submete um simulado e calcula o score"""
    try:
        data = request.get_json()
        usuario_id = data.get('usuario_id')
        respostas = data.get('respostas', [])
        
        if not usuario_id or not respostas:
            return ResponseFormatter.bad_request('Dados obrigatórios não fornecidos')
        
        # Calcular estatísticas
        total_questoes = len(respostas)
        acertos = sum(1 for r in respostas if r.get('resposta_usuario') == r.get('gabarito'))
        erros = total_questoes - acertos
        taxa_acerto = (acertos / total_questoes * 100) if total_questoes > 0 else 0
        tempo_total = sum(r.get('tempo_resposta', 0) for r in respostas)
        tempo_medio = tempo_total / total_questoes if total_questoes > 0 else 0
        
        # Calcular score (0-1000 pontos)
        score = int((acertos / total_questoes * 1000)) if total_questoes > 0 else 0
        
        # Resultado do simulado
        resultado = {
            'simulado_id': f'sim-{usuario_id}-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'usuario_id': usuario_id,
            'data_realizacao': datetime.now().isoformat(),
            'total_questoes': total_questoes,
            'acertos': acertos,
            'erros': erros,
            'taxa_acerto': round(taxa_acerto, 2),
            'tempo_total': tempo_total,
            'tempo_medio': round(tempo_medio, 2),
            'score': score,
            'status': 'concluido'
        }
        
        return ResponseFormatter.success(
            data={
                'resultado': resultado
            },
            message=f'Simulado concluído! Você acertou {acertos} de {total_questoes} questões ({taxa_acerto:.1f}%)'
        )
        
    except Exception as e:
        print(f"Erro ao processar simulado: {e}")
        return ResponseFormatter.internal_error('Erro interno do servidor')

@app.route('/api/performance', methods=['GET'])
def get_performance():
    """Retorna dados de performance do usuário"""
    try:
        # Dados simulados de performance
        performance_data = {
            'total_questoes': 150,
            'acertos': 120,
            'erros': 30,
            'taxa_acerto': 80.0,
            'tempo_medio': 45.5,
            'sequencia_atual': 5,
            'melhor_sequencia': 12,
            'nivel_atual': 'Intermediário',
            'pontos_totais': 2450,
            'progresso_semanal': [
                {'dia': 'Seg', 'questoes': 15, 'acertos': 12},
                {'dia': 'Ter', 'questoes': 20, 'acertos': 16},
                {'dia': 'Qua', 'questoes': 18, 'acertos': 15},
                {'dia': 'Qui', 'questoes': 22, 'acertos': 18},
                {'dia': 'Sex', 'questoes': 25, 'acertos': 20}
            ],
            'desempenho_por_materia': [
                {'materia': 'SUS', 'total': 50, 'acertos': 42, 'taxa': 84.0},
                {'materia': 'Enfermagem', 'total': 60, 'acertos': 45, 'taxa': 75.0},
                {'materia': 'Saúde Pública', 'total': 40, 'acertos': 33, 'taxa': 82.5}
            ]
        }
        return ResponseFormatter.success(performance_data)
    except Exception as e:
        print(f"Erro ao obter performance: {e}")
        return ResponseFormatter.internal_error('Erro interno do servidor')

@app.route('/api/ranking', methods=['GET'])
def get_ranking():
    """Retorna o ranking de usuários"""
    try:
        ranking_data = {
            'ranking': [
                {'posicao': 1, 'nome': 'Usuário***', 'score': 2850, 'acertos': 95.2},
                {'posicao': 2, 'nome': 'Estudante***', 'score': 2720, 'acertos': 92.8},
                {'posicao': 3, 'nome': 'Concurseiro***', 'score': 2650, 'acertos': 90.5},
                {'posicao': 4, 'nome': 'Você', 'score': 2450, 'acertos': 80.0, 'destaque': True},
                {'posicao': 5, 'nome': 'Candidato***', 'score': 2380, 'acertos': 78.2}
            ],
            'sua_posicao': 4,
            'total_usuarios': 1247
        }
        return ResponseFormatter.success(ranking_data)
    except Exception as e:
        print(f"Erro ao obter ranking: {e}")
        return ResponseFormatter.internal_error('Erro interno do servidor')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
