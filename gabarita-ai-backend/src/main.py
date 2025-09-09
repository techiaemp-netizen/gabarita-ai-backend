from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime
from . import firebase_config
from .services.chatgpt_service import chatgpt_service
from .routes.questoes import CONTEUDOS_EDITAL
from .routes.signup import signup_bp
from .routes.auth import auth_bp
from .routes.questoes import questoes_bp
from .routes.planos import planos_bp
from .routes.jogos import jogos_bp
from .routes.news import news_bp
from .routes.opcoes import opcoes_bp
from .routes.user import user_bp

app = Flask(__name__)

# Configurar CORS com variáveis de ambiente para produção
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173,https://j6h5i7c0x703.manus.space').split(',')
CORS(app, 
     origins=[origin.strip() for origin in cors_origins], 
     supports_credentials=True,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'])

# Registrar blueprints
app.register_blueprint(signup_bp, url_prefix='/api/auth')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(questoes_bp, url_prefix='/api/questoes')
app.register_blueprint(planos_bp, url_prefix='/api')
app.register_blueprint(jogos_bp, url_prefix='/api/jogos')
app.register_blueprint(news_bp, url_prefix='/api')
app.register_blueprint(opcoes_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api/user')

# Aliases para compatibilidade com frontend
@app.route('/api/usuarios/<user_id>', methods=['GET'])
def get_usuario_alias(user_id):
    """Alias para GET /api/user/<id>"""
    from .routes.user import get_user
    return get_user(user_id)

@app.route('/api/usuarios/<user_id>', methods=['PUT'])
def update_usuario_alias(user_id):
    """Alias para PUT /api/user/<id>"""
    from .routes.user import update_user
    return update_user(user_id)

@app.route('/api/usuarios/perfil', methods=['GET'])
def get_perfil_alias():
    """Alias para GET /api/user/profile"""
    from .routes.user import get_profile
    return get_profile()

@app.route('/api/usuarios/perfil', methods=['PUT'])
def update_perfil_alias():
    """Alias para PUT /api/user/profile"""
    from .routes.user import update_profile
    return update_profile()

@app.route('/', methods=['GET'])
def root():
    """Rota raiz da API"""
    return jsonify({
        'message': 'Gabarita.AI Backend API',
        'version': '1.0.0',
        'status': 'online',
        'endpoints': {
            'health': '/health',
            'auth': '/api/auth/*',
            'questoes': '/api/questoes/*',
            'planos': '/api/planos',
            'jogos': '/api/jogos/*',
            'opcoes': '/api/opcoes/*'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# Rota de login removida - usar blueprint signup_bp em /api/auth/login

@app.route('/api/questoes/gerar', methods=['POST'])
def gerar_questao_endpoint():
    import sys
    print("🔥 Requisição recebida na API de geração de questões")
    sys.stdout.flush()
    data = request.get_json()
    print(f"📋 Dados recebidos: {data}")
    sys.stdout.flush()
    
    # Obter usuario_id do token de autenticação ou usar bypass para desenvolvimento
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        usuario_id = auth_header.split(' ')[1]  # Usar token como usuario_id temporariamente
    else:
        usuario_id = 'dev-user'  # Fallback para desenvolvimento
    
    # Aceitar parâmetros do frontend
    cargo = data.get('cargo') or data.get('subject', 'Enfermeiro')
    bloco = data.get('bloco') or data.get('difficulty', 'Saúde')
    count = data.get('count', 1)
    
    print(f"👤 Usuario ID: {usuario_id}")
    print(f"💼 Cargo: {cargo}")
    print(f"📚 Bloco: {bloco}")
    print(f"🔢 Quantidade: {count}")
    sys.stdout.flush()
    
    # Validar dados obrigatórios
    if not cargo or not bloco:
        print("❌ Dados obrigatórios faltando")
        return jsonify({
            'success': False,
            'error': 'Cargo e bloco são obrigatórios',
            'data': []
        }), 400
    
    # Obter conteúdo específico do edital
    conteudo_edital = CONTEUDOS_EDITAL.get(cargo, {}).get(bloco, [])
    print(f"📖 Conteúdo do edital: {conteudo_edital}")
    sys.stdout.flush()
    
    if not conteudo_edital:
        print("❌ Cargo ou bloco não encontrado")
        return jsonify({
            'success': False,
            'error': 'Cargo ou bloco não encontrado',
            'data': []
        }), 404
    
    # Usar a função real de geração de questões
    try:
        print("🤖 Gerando questão com ChatGPT...")
        sys.stdout.flush()
        conteudo_str = ', '.join(conteudo_edital[:3])  # Usar os primeiros 3 tópicos
        questao_gerada = chatgpt_service.gerar_questao(cargo, conteudo_str)
        
        if questao_gerada:
            print(f"✅ Questão gerada com sucesso: {questao_gerada.get('questao', 'N/A')[:50]}...")
            # Converter formato para o frontend (padrão inglês)
            questao_frontend = {
                'id': f'q-{usuario_id}-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'question': questao_gerada.get('questao', ''),
                'alternatives': [{'id': alt['id'], 'text': alt['texto']} for alt in questao_gerada.get('alternativas', [])],
                'correctAnswer': questao_gerada.get('gabarito', 'A'),
                'explanation': questao_gerada.get('explicacao', ''),
                'difficulty': questao_gerada.get('dificuldade', 'medium'),
                'subject': questao_gerada.get('tema', conteudo_edital[0] if conteudo_edital else 'General')
            }
            return jsonify({
                'success': True,
                'data': [questao_frontend],
                'message': 'Questão gerada com sucesso'
            })
        else:
            print("❌ ChatGPT retornou None")
            raise Exception("ChatGPT não retornou questão válida")
            
    except Exception as e:
        print(f"❌ Erro ao gerar questão: {e}")
        sys.stdout.flush()
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        # Fallback (padrão inglês)
        questao_personalizada = {
            'id': f'q-{usuario_id}-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'question': f'Questão sobre {cargo} - {bloco}: Qual das alternativas abaixo está correta sobre os conceitos fundamentais da área?',
            'alternatives': [
                {'id': 'A', 'text': 'Alternativa A - Conceito básico 1'},
                {'id': 'B', 'text': 'Alternativa B - Conceito básico 2'},
                {'id': 'C', 'text': 'Alternativa C - Conceito básico 3'},
                {'id': 'D', 'text': 'Alternativa D - Conceito básico 4'},
                {'id': 'E', 'text': 'Alternativa E - Conceito básico 5'}
            ],
            'correctAnswer': 'C',
            'explanation': 'Esta é uma questão de fallback gerada automaticamente.',
            'difficulty': 'medium',
            'subject': 'Conceitos Gerais'
        }
        
        print(f"✅ Questão fallback gerada: {questao_personalizada['question'][:50]}...")
        
        return jsonify({
            'success': True,
            'data': [questao_personalizada],
            'message': 'Questão de fallback gerada'
        })

@app.route('/api/questoes/<questao_id>/responder', methods=['POST'])
def responder_questao(questao_id):
    data = request.get_json()
    resposta = data.get('resposta')
    
    return jsonify({
        'success': True,
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
            return jsonify({
                'success': True,
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
        
        return jsonify({
            'success': True,
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
            return jsonify({'erro': 'Dados obrigatórios não fornecidos'}), 400
        
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
        
        return jsonify({
            'success': True,
            'resultado': resultado,
            'message': f'Simulado concluído! Você acertou {acertos} de {total_questoes} questões ({taxa_acerto:.1f}%)'
        })
        
    except Exception as e:
        print(f"Erro ao processar simulado: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

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
        return jsonify(performance_data)
    except Exception as e:
        print(f"Erro ao obter performance: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

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
        return jsonify(ranking_data)
    except Exception as e:
        print(f"Erro ao obter ranking: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

