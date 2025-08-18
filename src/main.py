from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime
from .services.chatgpt_service import chatgpt_service
from .routes.questoes import CONTEUDOS_EDITAL
from .routes.signup import signup_bp
from .routes.questoes import questoes_bp
from .routes.payments import payments_bp
from .routes.auth import auth_bp
from .routes.planos import planos_bp
from .routes.opcoes import opcoes_bp

app = Flask(__name__)
CORS(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(signup_bp, url_prefix='/api/auth')
app.register_blueprint(questoes_bp, url_prefix='/api/questoes')
app.register_blueprint(planos_bp, url_prefix='/api')
app.register_blueprint(payments_bp)
app.register_blueprint(opcoes_bp, url_prefix='/api')

# Aliases para compatibilidade com frontend
@app.route('/api/plans', methods=['GET'])
def alias_plans():
    """Alias para /api/planos - compatibilidade com frontend"""
    from .routes.payments import listar_planos
    return listar_planos()

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Endpoint de perfil do usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autorização necessário'}), 401
        
        token = auth_header.split(' ')[1]
        
        # Simular dados do usuário baseado no token
        # Em produção, validar token e buscar dados reais
        usuario_data = {
            'id': token,
            'nome': 'Usuário Teste',
            'email': 'usuario@teste.com',
            'cargo': 'Enfermeiro na Atenção Primária',
            'bloco': 'Bloco 5 - Educação, Saúde, Desenvolvimento Social e Direitos Humanos',
            'vida': 85,
            'pontuacao': 1250,
            'nivel_escolaridade': 'Superior',
            'plano_ativo': 'gratuito',
            'status': 'ativo'
        }
        
        return jsonify(usuario_data)
        
    except Exception as e:
        print(f"Erro ao obter perfil: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

@app.route('/api/user/profile', methods=['PUT'])
def update_user_profile():
    """Endpoint para atualizar perfil do usuário"""
    try:
        # Obter token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autorização necessário'}), 401
        
        token = auth_header.split(' ')[1]
        data = request.get_json()
        
        # Simular atualização do perfil
        # Em produção, validar token e atualizar dados reais
        usuario_atualizado = {
            'id': token,
            'nome': data.get('nome', 'Usuário Teste'),
            'email': data.get('email', 'usuario@teste.com'),
            'cargo': data.get('cargo', 'Enfermeiro na Atenção Primária'),
            'bloco': data.get('bloco', 'Bloco 5 - Educação, Saúde, Desenvolvimento Social e Direitos Humanos'),
            'nivel_escolaridade': data.get('nivel_escolaridade', 'Superior'),
            'status': 'ativo'
        }
        
        return jsonify({
            'sucesso': True,
            'usuario': usuario_atualizado,
            'mensagem': 'Perfil atualizado com sucesso'
        })
        
    except Exception as e:
        print(f"Erro ao atualizar perfil: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

# ========== ROTAS DE SISTEMA ==========

@app.route('/api/performance', methods=['GET'])
def api_performance():
    """Endpoint para obter dados de performance do usuário"""
    try:
        # Obter usuário por token ou parâmetro
        auth_header = request.headers.get('Authorization')
        usuario_id = request.args.get('usuario_id')
        
        if not auth_header and not usuario_id:
            return jsonify({
                'success': False,
                'error': 'Token de autorização ou usuario_id necessário'
            }), 401
        
        # Se tiver token, extrair usuario_id do token
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            # Em produção, validar token e extrair usuario_id
            usuario_id = 'user_123'  # Simulado
        
        # Simular dados de performance (em produção, buscar do Firebase)
        questoes_respondidas = [
            {'acertou': True, 'tempo_resposta': 45, 'tema': 'SUS'},
            {'acertou': False, 'tempo_resposta': 60, 'tema': 'Direito Constitucional'},
            {'acertou': True, 'tempo_resposta': 30, 'tema': 'SUS'},
            {'acertou': True, 'tempo_resposta': 40, 'tema': 'Administração Pública'}
        ]
        
        # Calcular estatísticas de performance
        total_questoes = len(questoes_respondidas)
        total_acertos = sum(1 for q in questoes_respondidas if q.get('acertou'))
        total_erros = total_questoes - total_acertos
        taxa_acerto = round((total_acertos / total_questoes) * 100, 1) if total_questoes > 0 else 0
        
        # Calcular tempo médio
        tempos = [q.get('tempo_resposta', 0) for q in questoes_respondidas if q.get('tempo_resposta')]
        tempo_medio = round(sum(tempos) / len(tempos), 1) if tempos else 0
        
        # Distribuição por tema
        distribuicao_tema = {}
        for questao in questoes_respondidas:
            tema = questao.get('tema', 'Outros')
            if tema not in distribuicao_tema:
                distribuicao_tema[tema] = {'total': 0, 'acertos': 0}
            
            distribuicao_tema[tema]['total'] += 1
            if questao.get('acertou'):
                distribuicao_tema[tema]['acertos'] += 1
        
        # Calcular taxa por tema
        for tema in distribuicao_tema:
            total = distribuicao_tema[tema]['total']
            acertos = distribuicao_tema[tema]['acertos']
            distribuicao_tema[tema]['taxa_acerto'] = round((acertos / total) * 100, 1) if total > 0 else 0
        
        return jsonify({
            'success': True,
            'performance': {
                'total_questoes': total_questoes,
                'total_acertos': total_acertos,
                'total_erros': total_erros,
                'taxa_acerto': taxa_acerto,
                'tempo_medio_segundos': tempo_medio,
                'distribuicao_por_tema': distribuicao_tema,
                'ultima_atualizacao': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Erro na API de performance: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@app.route('/api/ranking', methods=['GET'])
def api_ranking():
    """Endpoint para obter ranking de usuários"""
    try:
        bloco = request.args.get('bloco')
        cargo = request.args.get('cargo')
        usuario_id = request.args.get('usuario_id')
        
        if not bloco or not cargo:
            return jsonify({
                'success': False,
                'error': 'Parâmetros bloco e cargo são obrigatórios'
            }), 400
        
        # Simular dados de ranking (em produção, calcular baseado em questões respondidas)
        ranking_data = [
            {'posicao': 1, 'nome_anonimo': 'Usuário***1', 'score': 950, 'taxa_acerto': 95.0},
            {'posicao': 2, 'nome_anonimo': 'Usuário***2', 'score': 920, 'taxa_acerto': 92.0},
            {'posicao': 3, 'nome_anonimo': 'Usuário***3', 'score': 890, 'taxa_acerto': 89.0},
            {'posicao': 4, 'nome_anonimo': 'Usuário***4', 'score': 860, 'taxa_acerto': 86.0},
            {'posicao': 5, 'nome_anonimo': 'Usuário***5', 'score': 830, 'taxa_acerto': 83.0},
            {'posicao': 6, 'nome_anonimo': 'Usuário***6', 'score': 800, 'taxa_acerto': 80.0},
            {'posicao': 7, 'nome_anonimo': 'Usuário***7', 'score': 770, 'taxa_acerto': 77.0},
            {'posicao': 8, 'nome_anonimo': 'Usuário***8', 'score': 740, 'taxa_acerto': 74.0},
            {'posicao': 9, 'nome_anonimo': 'Usuário***9', 'score': 710, 'taxa_acerto': 71.0},
            {'posicao': 10, 'nome_anonimo': 'Usuário***10', 'score': 680, 'taxa_acerto': 68.0}
        ]
        
        # Posição do usuário atual (simulado)
        posicao_usuario = {
            'posicao': 15,
            'score': 620,
            'taxa_acerto': 62.0,
            'total_participantes': 150
        }
        
        return jsonify({
            'success': True,
            'ranking': {
                'bloco': bloco,
                'cargo': cargo,
                'top_10': ranking_data,
                'posicao_usuario': posicao_usuario,
                'ultima_atualizacao': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Erro na API de ranking: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@app.route('/api/news', methods=['GET'])
def api_news():
    """Endpoint para obter notícias relacionadas a concursos"""
    try:
        # Simular busca de notícias (em produção, integrar com API de notícias)
        noticias = [
            {
                'id': 1,
                'titulo': 'Novo Concurso Público Federal com 500 Vagas',
                'fonte': 'Portal Gov.br',
                'resumo': 'Edital publicado para cargos de nível superior com salários até R$ 8.000',
                'url': 'https://www.gov.br/servidor/pt-br/acesso-a-informacao/concursos-publicos',
                'data_publicacao': '2024-01-15',
                'categoria': 'Editais'
            },
            {
                'id': 2,
                'titulo': 'Dicas de Estudo para Direito Constitucional',
                'fonte': 'Concursos Brasil',
                'resumo': 'Estratégias eficazes para dominar os principais temas da Constituição Federal',
                'url': 'https://www.concursosbrasil.com.br/noticias/dicas-direito-constitucional',
                'data_publicacao': '2024-01-14',
                'categoria': 'Dicas de Estudo'
            },
            {
                'id': 3,
                'titulo': 'Mudanças na Lei de Licitações - Lei 14.133/21',
                'fonte': 'JusBrasil',
                'resumo': 'Principais alterações que podem ser cobradas em concursos públicos',
                'url': 'https://www.jusbrasil.com.br/noticias/lei-licitacoes-14133',
                'data_publicacao': '2024-01-13',
                'categoria': 'Legislação'
            },
            {
                'id': 4,
                'titulo': 'Cronograma de Estudos: Como Organizar sua Rotina',
                'fonte': 'Estratégia Concursos',
                'resumo': 'Metodologia comprovada para otimizar o tempo de estudo e aumentar o rendimento',
                'url': 'https://www.estrategiaconcursos.com.br/blog/cronograma-estudos',
                'data_publicacao': '2024-01-12',
                'categoria': 'Metodologia'
            },
            {
                'id': 5,
                'titulo': 'Jurisprudência Recente do STF sobre Administração Pública',
                'fonte': 'STF Notícias',
                'resumo': 'Decisões importantes que podem impactar questões de concursos',
                'url': 'https://portal.stf.jus.br/noticias/',
                'data_publicacao': '2024-01-11',
                'categoria': 'Jurisprudência'
            }
        ]
        
        return jsonify({
            'success': True,
            'noticias': noticias,
            'total': len(noticias),
            'ultima_atualizacao': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Erro na API de notícias: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@app.route('/api/simulados/submit', methods=['POST'])
def api_simulados_submit():
    """Endpoint para submeter resultado de simulado"""
    try:
        data = request.get_json()
        usuario_id = data.get('usuario_id')
        bloco = data.get('bloco')
        cargo = data.get('cargo')
        respostas = data.get('respostas', [])
        
        if not all([usuario_id, bloco, cargo, respostas]):
            return jsonify({
                'success': False,
                'error': 'usuario_id, bloco, cargo e respostas são obrigatórios'
            }), 400
        
        # Processar respostas e calcular score
        total_questoes = len(respostas)
        total_acertos = 0
        tempo_total = 0
        detalhamento = []
        
        for resposta in respostas:
            questao_id = resposta.get('questao_id')
            resposta_usuario = resposta.get('resposta')
            tempo_resposta = resposta.get('tempo', 0)
            
            # Buscar gabarito da questão no Firebase
            db = firebase_config.get_firestore_client()
            questao_ref = db.collection('questoes_pool').document(questao_id)
            questao_doc = questao_ref.get()
            
            if questao_doc.exists:
                questao_data = questao_doc.to_dict()
                gabarito = questao_data.get('gabarito')
                acertou = resposta_usuario == gabarito
                
                if acertou:
                    total_acertos += 1
                
                detalhamento.append({
                    'questao_id': questao_id,
                    'tema': questao_data.get('tema', ''),
                    'resposta_usuario': resposta_usuario,
                    'gabarito': gabarito,
                    'acertou': acertou,
                    'tempo_resposta': tempo_resposta
                })
                
                tempo_total += tempo_resposta
        
        # Calcular estatísticas finais
        taxa_acerto = round((total_acertos / total_questoes) * 100, 1) if total_questoes > 0 else 0
        score = total_acertos * 10  # 10 pontos por acerto
        tempo_total_minutos = round(tempo_total / 60, 1)
        
        # Salvar resultado do simulado no Firebase
        resultado_simulado = {
            'usuario_id': usuario_id,
            'bloco': bloco,
            'cargo': cargo,
            'total_questoes': total_questoes,
            'total_acertos': total_acertos,
            'taxa_acerto': taxa_acerto,
            'score': score,
            'tempo_total_segundos': tempo_total,
            'tempo_total_minutos': tempo_total_minutos,
            'detalhamento': detalhamento,
            'data_realizacao': datetime.now(),
            'tipo': 'simulado_completo'
        }
        
        db.collection('simulados_realizados').add(resultado_simulado)
        
        # Registrar questões respondidas individualmente
        for detalhe in detalhamento:
            questao_respondida = {
                'usuario_id': usuario_id,
                'questao_id': detalhe['questao_id'],
                'tema': detalhe['tema'],
                'resposta': detalhe['resposta_usuario'],
                'gabarito': detalhe['gabarito'],
                'acertou': detalhe['acertou'],
                'tempo_resposta': detalhe['tempo_resposta'],
                'data_resposta': datetime.now(),
                'origem': 'simulado'
            }
            db.collection('questoes_respondidas').add(questao_respondida)
        
        return jsonify({
            'success': True,
            'resultado': {
                'score': score,
                'total_questoes': total_questoes,
                'total_acertos': total_acertos,
                'taxa_acerto': taxa_acerto,
                'tempo_total_minutos': tempo_total_minutos,
                'detalhamento_por_questao': detalhamento,
                'data_realizacao': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        print(f"Erro no submit do simulado: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500
 
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Gabarit-AI Backend API',
        'version': '1.0.0',
        'status': 'online',
        'endpoints': {
            'health': '/health',
            'auth': '/api/auth/*',
            'questoes': '/api/questoes/*',
            'payments': '/api/payments/*'
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# Rota de login removida - agora está no auth_bp

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
        return jsonify({'erro': 'Cargo ou bloco não encontrado'}), 404
    
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
            return jsonify({'questao': questao_frontend})
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
        
        return jsonify({
            'questao': questao_personalizada
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

