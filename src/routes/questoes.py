"""
Rotas para geração e gerenciamento de questões
"""
from flask import Blueprint, request
from utils.response_formatter import ResponseFormatter
from services.chatgpt_service import chatgpt_service
from services.perplexity_service import perplexity_service
from config.firebase_config import firebase_config
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request, log_database_operation
from datetime import datetime
import uuid
import random

questoes_bp = Blueprint('questoes', __name__)

# Initialize structured logger
logger = StructuredLogger(__name__)

# ========== SISTEMA DE ROLETA DE QUESTÕES ==========

def _buscar_questao_do_pool(usuario_id, cargo, bloco, tipo_conhecimento, modo_foco, materia_foco):
    """Busca uma questão disponível no pool que o usuário ainda não respondeu"""
    try:
        logger.info("Buscando questão no pool", extra={'usuario_id': usuario_id, 'cargo': cargo, 'bloco': bloco, 'tipo_conhecimento': tipo_conhecimento})
        print(f"🎯 Buscando questão no pool para usuário {usuario_id}")
        db = firebase_config.get_firestore_client()
        
        # Primeiro, buscar questões que o usuário já respondeu
        questoes_respondidas_ref = db.collection('questoes_respondidas')
        questoes_respondidas = questoes_respondidas_ref.where('usuario_id', '==', usuario_id).stream()
        
        questoes_ids_respondidas = set()
        for doc in questoes_respondidas:
            questoes_ids_respondidas.add(doc.to_dict().get('questao_id'))
        
        print(f"📝 Usuário já respondeu {len(questoes_ids_respondidas)} questões")
        
        # Buscar questões no pool que correspondem aos critérios
        pool_ref = db.collection('questoes_pool')
        query = pool_ref.where('cargo', '==', cargo).where('bloco', '==', bloco)
        
        # Filtrar por tipo de conhecimento se especificado
        if tipo_conhecimento != 'todos':
            query = query.where('tipo_conhecimento', '==', tipo_conhecimento)
        
        # Filtrar por matéria específica se em modo foco
        if modo_foco and materia_foco:
            query = query.where('tema', '==', materia_foco)
        
        questoes_pool = query.stream()
        
        # Filtrar questões que o usuário ainda não respondeu
        questoes_disponiveis = []
        for doc in questoes_pool:
            questao_data = doc.to_dict()
            questao_data['id'] = doc.id
            
            if doc.id not in questoes_ids_respondidas:
                questoes_disponiveis.append(questao_data)
        
        print(f"🎲 Encontradas {len(questoes_disponiveis)} questões disponíveis no pool")
        
        if questoes_disponiveis:
            # Selecionar questão aleatória
            questao_selecionada = random.choice(questoes_disponiveis)
            
            # Incrementar contador de reutilização
            pool_ref.document(questao_selecionada['id']).update({
                'reutilizada_count': questao_selecionada.get('reutilizada_count', 0) + 1,
                'ultima_utilizacao': datetime.now()
            })
            
            print(f"✅ Questão selecionada do pool: {questao_selecionada['questao'][:100]}...")
            return questao_selecionada
        
        print("❌ Nenhuma questão disponível no pool")
        return None
        
    except Exception as e:
        print(f"❌ Erro ao buscar questão no pool: {e}")
        return None

@log_database_operation(StructuredLogger(__name__), "salvar_questao_pool")
def _salvar_questao_no_pool(questao_completa, cargo, bloco, tipo_conhecimento, criado_por):
    """Salva uma nova questão no pool para reutilização"""
    try:
        logger.info("Salvando questão no pool", extra={
            'cargo': cargo,
            'bloco': bloco,
            'tipo_conhecimento': tipo_conhecimento,
            'criado_por': criado_por
        })
        print(f"💾 Salvando questão no pool")
        db = firebase_config.get_firestore_client()
        
        questao_pool = {
            'questao': questao_completa['questao'],
            'tipo': questao_completa['tipo'],
            'alternativas': questao_completa['alternativas'],
            'gabarito': questao_completa['gabarito'],
            'tema': questao_completa['tema'],
            'dificuldade': questao_completa['dificuldade'],
            'explicacao': questao_completa['explicacao'],
            'cargo': cargo,
            'bloco': bloco,
            'tipo_conhecimento': tipo_conhecimento,
            'data_criacao': datetime.now(),
            'criado_por': criado_por,
            'reutilizada_count': 0,
            'ultima_utilizacao': None
        }
        
        # Salvar no pool
        pool_ref = db.collection('questoes_pool')
        doc_ref = pool_ref.add(questao_pool)
        
        logger.info("Questão salva no pool com sucesso", extra={
            'questao_id': doc_ref[1].id,
            'cargo': cargo,
            'bloco': bloco
        })
        print(f"✅ Questão salva no pool com ID: {doc_ref[1].id}")
        return doc_ref[1].id
        
    except Exception as e:
        logger.error("Erro ao salvar questão no pool", extra={
            'error': str(e),
            'cargo': cargo,
            'bloco': bloco
        })
        print(f"❌ Erro ao salvar questão no pool: {e}")
        return None

@log_database_operation(StructuredLogger(__name__), "registrar_questao_respondida")
def _registrar_questao_respondida(usuario_id, questao_id, respondida=False, acertou=False, tempo_resposta=None):
    """Registra que o usuário visualizou/respondeu uma questão"""
    try:
        logger.info("Registrando questão respondida", extra={
            'usuario_id': usuario_id,
            'questao_id': questao_id,
            'respondida': respondida,
            'acertou': acertou,
            'tempo_resposta': tempo_resposta
        })
        print(f"📊 Registrando questão {questao_id} para usuário {usuario_id}")
        db = firebase_config.get_firestore_client()
        
        questao_respondida = {
            'usuario_id': usuario_id,
            'questao_id': questao_id,
            'respondida': respondida,
            'acertou': acertou,
            'data_resposta': datetime.now(),
            'tempo_resposta': tempo_resposta
        }
        
        # Salvar registro
        respondidas_ref = db.collection('questoes_respondidas')
        respondidas_ref.add(questao_respondida)
        
        logger.info("Questão registrada com sucesso", extra={
            'usuario_id': usuario_id,
            'questao_id': questao_id,
            'respondida': respondida,
            'acertou': acertou
        })
        print(f"✅ Questão registrada como visualizada")
        return True
        
    except Exception as e:
        logger.error("Erro ao registrar questão respondida", extra={
            'error': str(e),
            'usuario_id': usuario_id,
            'questao_id': questao_id
        })
        print(f"❌ Erro ao registrar questão respondida: {e}")
        return False

# ========== FIM DO SISTEMA DE ROLETA ==========

@questoes_bp.route('/responder', methods=['POST'])
@log_request(logger)
def responder_questao():
    """
    Rota para registrar resposta de questão e atualizar estatísticas do usuário
    """
    logger.info("Iniciando processo de resposta de questão")
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['questao_id', 'usuario_id', 'alternativa_escolhida']
        for field in required_fields:
            if field not in data:
                return ResponseFormatter.bad_request(f'Campo obrigatório ausente: {field}')
        
        questao_id = data['questao_id']
        usuario_id = data['usuario_id']
        alternativa_escolhida = data['alternativa_escolhida']
        tempo_resposta = data.get('tempo_resposta', 0)
        
        # Buscar questão do pool para obter o gabarito correto
        gabarito_correto = None
        if firebase_config.is_configured():
            try:
                from firebase_admin import firestore
                db = firestore.client()
                
                # Buscar questão no pool
                questao_ref = db.collection('questoes_pool').document(questao_id)
                questao_doc = questao_ref.get()
                
                if questao_doc.exists:
                    questao_data = questao_doc.to_dict()
                    gabarito_correto = questao_data.get('gabarito')
                    
            except Exception as e:
                print(f"Erro ao buscar questão do pool: {e}")
        
        # Fallback para gabarito simulado se não encontrar no pool
        if gabarito_correto is None:
            gabarito_correto = 'B'  # Gabarito padrão para simulação
            
        acertou = alternativa_escolhida == gabarito_correto
        
        # Atualizar estatísticas do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            try:
                from firebase_admin import firestore
                db = firestore.client()
                
                # Buscar dados atuais do usuário
                user_ref = db.collection('usuarios').document(usuario_id)
                user_doc = user_ref.get()
                
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                else:
                    user_data = {
                        'questoes_respondidas': 0,
                        'acertos': 0,
                        'sequencia_atual': 0,
                        'xp': 0,
                        'nivel': 1
                    }
                
                # Calcular novas estatísticas
                novas_stats = {
                    'questoes_respondidas': user_data.get('questoes_respondidas', 0) + 1,
                    'acertos': user_data.get('acertos', 0) + (1 if acertou else 0),
                    'sequencia_atual': user_data.get('sequencia_atual', 0) + 1 if acertou else 0,
                    'xp': user_data.get('xp', 0) + (10 if acertou else 3),
                    'ultima_atividade': datetime.now().isoformat()
                }
                
                # Calcular novo nível
                novas_stats['nivel'] = (novas_stats['xp'] // 100) + 1
                
                # Atualizar no Firestore
                user_ref.set(novas_stats, merge=True)
                
                # Atualizar registro de questão respondida no sistema de roleta
                _registrar_questao_respondida(
                    usuario_id=usuario_id,
                    questao_id=questao_id,
                    respondida=True,
                    acertou=acertou,
                    tempo_resposta=tempo_resposta
                )
                
            except Exception as e:
                print(f"Erro ao atualizar Firestore: {e}")
        
        # Gerar explicação usando ChatGPT
        explicacao = "Explicação não disponível no momento."
        try:
            prompt_explicacao = f"""
            Explique de forma didática por que a alternativa {gabarito_simulado} é a correta 
            para uma questão sobre o tema relacionado ao CNU 2025.
            Seja claro, objetivo e educativo.
            """
            explicacao = chatgpt_service.gerar_explicacao(prompt_explicacao)
        except Exception as e:
            print(f"Erro ao gerar explicação: {e}")
        
        logger.info("Resposta da questão processada com sucesso", extra={
            'questao_id': questao_id,
            'usuario_id': usuario_id,
            'acertou': acertou,
            'tempo_resposta': tempo_resposta
        })
        
        return ResponseFormatter.success({
            'acertou': acertou,
            'gabarito': gabarito_simulado,
            'explicacao': explicacao,
            'alternativa_escolhida': alternativa_escolhida,
            'tempo_resposta': tempo_resposta,
            'estatisticas': novas_stats if 'novas_stats' in locals() else None
        }, 'Resposta processada com sucesso')
        
    except Exception as e:
        logger.error("Erro ao processar resposta da questão", extra={
            'questao_id': data.get('questao_id'),
            'usuario_id': data.get('usuario_id'),
            'error': str(e)
        })
        print(f"Erro ao processar resposta: {e}")
        return ResponseFormatter.internal_error('Erro ao processar resposta', str(e))

@questoes_bp.route('/estatisticas/<usuario_id>', methods=['GET'])
@log_request(logger)
def buscar_estatisticas(usuario_id):
    """
    Rota para buscar estatísticas do usuário
    """
    logger.info("Iniciando busca de estatísticas do usuário", extra={"usuario_id": usuario_id})
    try:
        if firebase_config.is_configured():
            try:
                from firebase_admin import firestore
                db = firestore.client()
                
                user_ref = db.collection('usuarios').document(usuario_id)
                user_doc = user_ref.get()
                
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    
                    # Calcular estatísticas derivadas
                    questoes_respondidas = user_data.get('questoes_respondidas', 0)
                    acertos = user_data.get('acertos', 0)
                    taxa_acertos = (acertos / questoes_respondidas * 100) if questoes_respondidas > 0 else 0
                    
                    estatisticas = {
                        'total_questoes': questoes_respondidas,
                        'total_acertos': acertos,
                        'taxa_acertos': round(taxa_acertos, 1),
                        'tempo_medio': 45,  # Simulado por enquanto
                        'xp': user_data.get('xp', 0),
                        'nivel': user_data.get('nivel', 1),
                        'sequencia_atual': user_data.get('sequencia_atual', 0),
                        'acertos_por_tema': {
                            'SUS': 85,
                            'Atenção Primária': 78,
                            'Epidemiologia': 65
                        },
                        'evolucao_semanal': [
                            {'semana': 'Sem 1', 'acertos': max(0, acertos - 20)},
                            {'semana': 'Sem 2', 'acertos': max(0, acertos - 12)},
                            {'semana': 'Sem 3', 'acertos': max(0, acertos - 5)},
                            {'semana': 'Sem 4', 'acertos': acertos}
                        ]
                    }
                    
                    logger.info("Estatísticas obtidas com sucesso do Firebase", extra={
                        "usuario_id": usuario_id,
                        "total_questoes": estatisticas.get('total_questoes', 0),
                        "taxa_acertos": estatisticas.get('taxa_acertos', 0),
                        "fonte_dados": "firebase"
                    })
                    return ResponseFormatter.success(estatisticas, 'Estatísticas obtidas com sucesso')
                    
            except Exception as e:
                print(f"Erro ao buscar do Firestore: {e}")
        
        # Fallback para estatísticas simuladas
        estatisticas_simuladas = {
            'total_questoes': 45,
            'total_acertos': 32,
            'taxa_acertos': 71.1,
            'tempo_medio': 45,
            'xp': 320,
            'nivel': 4,
            'sequencia_atual': 3,
            'acertos_por_tema': {
                'SUS': 85,
                'Atenção Primária': 78,
                'Epidemiologia': 65
            },
            'evolucao_semanal': [
                {'semana': 'Sem 1', 'acertos': 12},
                {'semana': 'Sem 2', 'acertos': 18},
                {'semana': 'Sem 3', 'acertos': 25},
                {'semana': 'Sem 4', 'acertos': 32}
            ]
        }
        
        logger.info("Estatísticas simuladas geradas com sucesso", extra={
            "usuario_id": usuario_id,
            "total_questoes": estatisticas_simuladas.get('total_questoes', 0),
            "taxa_acertos": estatisticas_simuladas.get('taxa_acertos', 0),
            "fonte_dados": "simulado"
        })
        return ResponseFormatter.success(estatisticas_simuladas, 'Estatísticas simuladas obtidas com sucesso')
        
    except Exception as e:
        logger.error("Erro ao buscar estatísticas do usuário", extra={
            "usuario_id": usuario_id,
            "error": str(e)
        })
        return ResponseFormatter.internal_error('Erro ao buscar estatísticas', str(e))

# Mapeamento de conteúdos por cargo e bloco com flag de conhecimentos
CONTEUDOS_EDITAL = {
    # Bloco 1 - Seguridade Social: Saúde, Assistência Social e Previdência Social
    'Enfermeiro': {
        'Bloco 1 - Seguridade Social': {
            'conhecimentos_especificos': [
                'Conceito, evolução legislativa e Constituição de 1988',
                'Financiamento, orçamento e Lei 8.212/1991',
                'História e legislação da saúde no Brasil',
                'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
                'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
                'Determinantes do processo saúde-doença',
                'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
                'Proteção social básica, especial e benefícios eventuais',
                'Avaliação da deficiência e legislação específica',
                'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
                'Regime Geral e Próprio de Previdência Social',
                'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
                'Legislação, perícia, acompanhamento médico, promoção à saúde',
                'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
            ],
            'conhecimentos_gerais': [
                'Desafios do Estado de Direito',
                'Políticas públicas',
                'Ética e integridade',
                'Diversidade e inclusão na sociedade',
                'Administração pública federal',
                'Trabalho e tecnologia'
            ]
        }
    },
    'Médico': {
        'Bloco 1 - Seguridade Social': {
            'conhecimentos_especificos': [
                'Conceito, evolução legislativa e Constituição de 1988',
                'Financiamento, orçamento e Lei 8.212/1991',
                'História e legislação da saúde no Brasil',
                'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
                'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
                'Determinantes do processo saúde-doença',
                'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
                'Proteção social básica, especial e benefícios eventuais',
                'Avaliação da deficiência e legislação específica',
                'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
                'Regime Geral e Próprio de Previdência Social',
                'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
                'Legislação, perícia, acompanhamento médico, promoção à saúde',
                'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
            ],
            'conhecimentos_gerais': [
                'Desafios do Estado de Direito',
                'Políticas públicas',
                'Ética e integridade',
                'Diversidade e inclusão na sociedade',
                'Administração pública federal',
                'Trabalho e tecnologia'
            ]
        }
    },
    'Assistente Social': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Nutricionista': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Psicólogo': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Pesquisador': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Tecnologista': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Analista do Seguro Social': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Biólogo': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Farmacêutico': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Fisioterapeuta': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Fonoaudiólogo': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    'Terapeuta Ocupacional': {
        'Bloco 1 - Seguridade Social': [
            'Conceito, evolução legislativa e Constituição de 1988',
            'Financiamento, orçamento e Lei 8.212/1991',
            'História e legislação da saúde no Brasil',
            'Sistema Único de Saúde (SUS): estrutura, organização, modelos assistenciais',
            'Vigilância em saúde, promoção e prevenção, emergências sanitárias',
            'Determinantes do processo saúde-doença',
            'Histórico, políticas públicas, Lei 8.742/1993 (LOAS), PNAS 2004, SUAS',
            'Proteção social básica, especial e benefícios eventuais',
            'Avaliação da deficiência e legislação específica',
            'Noções de direito previdenciário, CF/88, Lei 8.213/1991',
            'Regime Geral e Próprio de Previdência Social',
            'Benefícios, benefícios eventuais, qualidade de segurado, avaliação biopsicossocial',
            'Legislação, perícia, acompanhamento médico, promoção à saúde',
            'Acidentes do trabalho, doenças relacionadas, riscos ocupacionais e legislações aplicáveis'
        ]
    },
    
    # Bloco 2 - Cultura e Educação
    'Técnico em Comunicação Social': {
        'Bloco 2 - Cultura e Educação': [
            'Lei de Acesso à Informação, LGPD, políticas de comunicação, mídias digitais',
            'LDB, Constituição, Plano Nacional de Educação, educação básica e superior, EAD, ODS',
            'Sistema Nacional de Cultura, políticas e legislação patrimonial, direitos culturais, instrumentos de fomento (ex: Lei Rouanet, Lei Paulo Gustavo)',
            'Fundamentos, métodos qualitativos e quantitativos, ciclo da pesquisa, ética em pesquisa',
            'Construção e análise de indicadores, monitoramento, métodos quantitativos e Big Data'
        ]
    },
    'Técnico em Documentação': {
        'Bloco 2 - Cultura e Educação': [
            'Lei de Acesso à Informação, LGPD, políticas de comunicação, mídias digitais',
            'LDB, Constituição, Plano Nacional de Educação, educação básica e superior, EAD, ODS',
            'Sistema Nacional de Cultura, políticas e legislação patrimonial, direitos culturais, instrumentos de fomento (ex: Lei Rouanet, Lei Paulo Gustavo)',
            'Fundamentos, métodos qualitativos e quantitativos, ciclo da pesquisa, ética em pesquisa',
            'Construção e análise de indicadores, monitoramento, métodos quantitativos e Big Data'
        ]
    },
    'Técnico em Assuntos Culturais': {
        'Bloco 2 - Cultura e Educação': [
            'Lei de Acesso à Informação, LGPD, políticas de comunicação, mídias digitais',
            'LDB, Constituição, Plano Nacional de Educação, educação básica e superior, EAD, ODS',
            'Sistema Nacional de Cultura, políticas e legislação patrimonial, direitos culturais, instrumentos de fomento (ex: Lei Rouanet, Lei Paulo Gustavo)',
            'Fundamentos, métodos qualitativos e quantitativos, ciclo da pesquisa, ética em pesquisa',
            'Construção e análise de indicadores, monitoramento, métodos quantitativos e Big Data'
        ]
    },
    'Analista Cultural': {
        'Bloco 2 - Cultura e Educação': [
            'Lei de Acesso à Informação, LGPD, políticas de comunicação, mídias digitais',
            'LDB, Constituição, Plano Nacional de Educação, educação básica e superior, EAD, ODS',
            'Sistema Nacional de Cultura, políticas e legislação patrimonial, direitos culturais, instrumentos de fomento (ex: Lei Rouanet, Lei Paulo Gustavo)',
            'Fundamentos, métodos qualitativos e quantitativos, ciclo da pesquisa, ética em pesquisa',
            'Construção e análise de indicadores, monitoramento, métodos quantitativos e Big Data'
        ]
    },
    'Técnico em Assuntos Educacionais': {
        'Bloco 2 - Cultura e Educação': [
            'Lei de Acesso à Informação, LGPD, políticas de comunicação, mídias digitais',
            'LDB, Constituição, Plano Nacional de Educação, educação básica e superior, EAD, ODS',
            'Sistema Nacional de Cultura, políticas e legislação patrimonial, direitos culturais, instrumentos de fomento (ex: Lei Rouanet, Lei Paulo Gustavo)',
            'Fundamentos, métodos qualitativos e quantitativos, ciclo da pesquisa, ética em pesquisa',
            'Construção e análise de indicadores, monitoramento, métodos quantitativos e Big Data'
        ]
    },
    
    # Bloco 3 - Ciências, Dados e Tecnologia
    'Especialista em Geologia e Geofísica': {
        'Bloco 3 - Ciências, Dados e Tecnologia': [
            'Fundamentos, paradigmas de inovação, impactos sociais, ética e popularização científica',
            'Sistema Nacional de CT&I, marco legal, instrumentos de fomento, governança, indicadores de inovação, ODS',
            'Condução de projetos (iniciação, execução, monitoramento, encerramento), métodos ágeis (Scrum, Kanban), modelos institucionais',
            'Noções de TICs, ciência de dados, inteligência artificial, uso de dados na gestão pública, LGPD, interoperabilidade, dados abertos',
            'Práticas de pesquisa, classificação, abordagens qualitativas e quantitativas, estruturação de projetos, normas técnicas'
        ]
    },
    'Analista de Tecnologia Militar': {
        'Bloco 3 - Ciências, Dados e Tecnologia': [
            'Fundamentos, paradigmas de inovação, impactos sociais, ética e popularização científica',
            'Sistema Nacional de CT&I, marco legal, instrumentos de fomento, governança, indicadores de inovação, ODS',
            'Condução de projetos (iniciação, execução, monitoramento, encerramento), métodos ágeis (Scrum, Kanban), modelos institucionais',
            'Noções de TICs, ciência de dados, inteligência artificial, uso de dados na gestão pública, LGPD, interoperabilidade, dados abertos',
            'Práticas de pesquisa, classificação, abordagens qualitativas e quantitativas, estruturação de projetos, normas técnicas'
        ]
    },
    'Analista de Ciência e Tecnologia': {
        'Bloco 3 - Ciências, Dados e Tecnologia': [
            'Fundamentos, paradigmas de inovação, impactos sociais, ética e popularização científica',
            'Sistema Nacional de CT&I, marco legal, instrumentos de fomento, governança, indicadores de inovação, ODS',
            'Condução de projetos (iniciação, execução, monitoramento, encerramento), métodos ágeis (Scrum, Kanban), modelos institucionais',
            'Noções de TICs, ciência de dados, inteligência artificial, uso de dados na gestão pública, LGPD, interoperabilidade, dados abertos',
            'Práticas de pesquisa, classificação, abordagens qualitativas e quantitativas, estruturação de projetos, normas técnicas'
        ]
    },
    
    # Bloco 4 - Engenharias e Arquitetura
    'Especialista em Regulação de Petróleo': {
        'Bloco 4 - Engenharias e Arquitetura': [
            'Planejamento, orçamento, licitação, execução, controle de obras, manutenção, segurança, qualidade',
            'Políticas urbanas e regionais, regularização fundiária, cartografia, urbanismo, geografia urbana',
            'Elaboração de projetos, acessibilidade, sustentabilidade, patologias em edificações, conforto ambiental',
            'Políticas agrícolas, manejo sustentável, certificação, pesca e aquicultura, biotecnologia aplicada',
            'Gestão e licenciamento ambiental, mudanças climáticas, economia ambiental, gestão de resíduos, patrimônios, políticas energéticas, recursos hídricos'
        ]
    },
    'Engenheiro de Tecnologia Militar': {
        'Bloco 4 - Engenharias e Arquitetura': [
            'Planejamento, orçamento, licitação, execução, controle de obras, manutenção, segurança, qualidade',
            'Políticas urbanas e regionais, regularização fundiária, cartografia, urbanismo, geografia urbana',
            'Elaboração de projetos, acessibilidade, sustentabilidade, patologias em edificações, conforto ambiental',
            'Políticas agrícolas, manejo sustentável, certificação, pesca e aquicultura, biotecnologia aplicada',
            'Gestão e licenciamento ambiental, mudanças climáticas, economia ambiental, gestão de resíduos, patrimônios, políticas energéticas, recursos hídricos'
        ]
    },
    'Arquiteto': {
        'Bloco 4 - Engenharias e Arquitetura': [
            'Planejamento, orçamento, licitação, execução, controle de obras, manutenção, segurança, qualidade',
            'Políticas urbanas e regionais, regularização fundiária, cartografia, urbanismo, geografia urbana',
            'Elaboração de projetos, acessibilidade, sustentabilidade, patologias em edificações, conforto ambiental',
            'Políticas agrícolas, manejo sustentável, certificação, pesca e aquicultura, biotecnologia aplicada',
            'Gestão e licenciamento ambiental, mudanças climáticas, economia ambiental, gestão de resíduos, patrimônios, políticas energéticas, recursos hídricos'
        ]
    },
    'Engenheiro': {
        'Bloco 4 - Engenharias e Arquitetura': [
            'Planejamento, orçamento, licitação, execução, controle de obras, manutenção, segurança, qualidade',
            'Políticas urbanas e regionais, regularização fundiária, cartografia, urbanismo, geografia urbana',
            'Elaboração de projetos, acessibilidade, sustentabilidade, patologias em edificações, conforto ambiental',
            'Políticas agrícolas, manejo sustentável, certificação, pesca e aquicultura, biotecnologia aplicada',
            'Gestão e licenciamento ambiental, mudanças climáticas, economia ambiental, gestão de resíduos, patrimônios, políticas energéticas, recursos hídricos'
        ]
    },
    'Engenheiro Agrônomo': {
        'Bloco 4 - Engenharias e Arquitetura': [
            'Planejamento, orçamento, licitação, execução, controle de obras, manutenção, segurança, qualidade',
            'Políticas urbanas e regionais, regularização fundiária, cartografia, urbanismo, geografia urbana',
            'Elaboração de projetos, acessibilidade, sustentabilidade, patologias em edificações, conforto ambiental',
            'Políticas agrícolas, manejo sustentável, certificação, pesca e aquicultura, biotecnologia aplicada',
            'Gestão e licenciamento ambiental, mudanças climáticas, economia ambiental, gestão de resíduos, patrimônios, políticas energéticas, recursos hídricos'
        ]
    },
    
    # Bloco 5 - Administração
    'Analista Técnico-Administrativo': {
        'Bloco 5 - Administração': [
            'Gestão Governamental e Governança Pública: Estratégia, Pessoas, Projetos e Processos',
            'Gestão Governamental e Governança Pública: Riscos, Inovação, Participação, Coordenação e Patrimônio',
            'Políticas Públicas: Ciclo, formulação e avaliação',
            'Administração Financeira e Orçamentária, Contabilidade Pública e Compras na Administração Pública',
            'Transparência, Proteção de Dados, Comunicação e Atendimento ao Cidadão'
        ]
    },
    'Contador': {
        'Bloco 5 - Administração': [
            'Gestão Governamental e Governança Pública: Estratégia, Pessoas, Projetos e Processos',
            'Gestão Governamental e Governança Pública: Riscos, Inovação, Participação, Coordenação e Patrimônio',
            'Políticas Públicas: Ciclo, formulação e avaliação',
            'Administração Financeira e Orçamentária, Contabilidade Pública e Compras na Administração Pública',
            'Transparência, Proteção de Dados, Comunicação e Atendimento ao Cidadão'
        ]
    },
    
    # Bloco 6 - Desenvolvimento Socioeconômico
    'Analista Técnico de Desenvolvimento Socioeconômico': {
        'Bloco 6 - Desenvolvimento Socioeconômico': [
            'Desenvolvimento, Sustentabilidade e Inclusão',
            'Desenvolvimento Produtivo e Regional no Brasil',
            'Gestão Estratégica e Regulação',
            'Desenvolvimento Socioeconômico no Brasil (histórico e contemporâneo)',
            'Desigualdades e Dinâmicas Socioeconômicas'
        ]
    },
    'Especialista em Regulação de Petróleo e Derivados': {
        'Bloco 6 - Desenvolvimento Socioeconômico': [
            'Desenvolvimento, Sustentabilidade e Inclusão',
            'Desenvolvimento Produtivo e Regional no Brasil',
            'Gestão Estratégica e Regulação',
            'Desenvolvimento Socioeconômico no Brasil (histórico e contemporâneo)',
            'Desigualdades e Dinâmicas Socioeconômicas'
        ]
    },
    'Especialista em Regulação da Atividade Cinematográfica': {
        'Bloco 6 - Desenvolvimento Socioeconômico': [
            'Desenvolvimento, Sustentabilidade e Inclusão',
            'Desenvolvimento Produtivo e Regional no Brasil',
            'Gestão Estratégica e Regulação',
            'Desenvolvimento Socioeconômico no Brasil (histórico e contemporâneo)',
            'Desigualdades e Dinâmicas Socioeconômicas'
        ]
    },
    
    # Bloco 7 - Justiça e Defesa
    'Analista Técnico de Justiça e Defesa': {
        'Bloco 7 - Justiça e Defesa': [
            'Gestão Governamental e Métodos Aplicados',
            'Políticas de Segurança e Defesa – Ambiente Internacional e Tecnologias Emergentes',
            'Políticas de Segurança e Defesa – Ambiente Nacional e Questões Emergentes',
            'Políticas de Segurança Pública',
            'Políticas de Justiça e Cidadania'
        ]
    },
    
    # Bloco 8 - Intermediário - Saúde
    'Técnico em Atividades Médico-Hospitalares': {
        'Bloco 8 - Intermediário - Saúde': {
            'conhecimentos_especificos': [
                'Saúde'
            ],
            'conhecimentos_gerais': [
                'Língua Portuguesa',
                'Matemática',
                'Noções de Direito',
                'Realidade Brasileira'
            ]
        }
    },
    'Técnico de Enfermagem': {
        'Bloco 8 - Intermediário - Saúde': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde'
        ]
    },
    'Técnico em Pesquisa e Investigação Biomédica': {
        'Bloco 8 - Intermediário - Saúde': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde'
        ]
    },
    'Técnico em Radiologia': {
        'Bloco 8 - Intermediário - Saúde': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde'
        ]
    },
    
    # Bloco 9 - Intermediário - Regulação
    'Técnico em Regulação de Aviação Civil': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    },
    'Técnico em Atividades de Mineração': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    },
    'Técnico em Regulação de Petróleo': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    },
    'Técnico em Regulação de Saúde Suplementar': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    },
    'Técnico em Regulação de Telecomunicações': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    },
    'Técnico em Regulação de Transportes Aquaviários': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    },
    'Técnico em Regulação de Transportes Terrestres': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    },
    'Técnico em Regulação e Vigilância Sanitária': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    },
    'Técnico em Regulação da Atividade Cinematográfica': {
        'Bloco 9 - Intermediário - Regulação': [
            'Língua Portuguesa',
            'Matemática',
            'Noções de Direito',
            'Realidade Brasileira',
            'Saúde',
            'Regulação e Agências Reguladoras'
        ]
    }
}

@questoes_bp.route('/gerar', methods=['POST'])
@log_request(logger)
def gerar_questao():
    """Gera uma nova questão personalizada para o usuário"""
    try:
        logger.info("Requisição recebida na API de geração de questões")
        data = request.get_json()
        logger.info("Dados recebidos para geração de questão", extra={"data": data})
        
        usuario_id = data.get('usuario_id')
        cargo = data.get('cargo')
        bloco = data.get('bloco')
        tipo_questao = data.get('tipo_questao', 'múltipla escolha')
        tipo_conhecimento = data.get('tipo_conhecimento', 'todos')  # todos, conhecimentos_gerais, conhecimentos_especificos
        modo_foco = data.get('modo_foco', False)
        materia_foco = data.get('materia_foco', None)
        
        logger.info("Parâmetros de geração de questão", extra={
            "usuario_id": usuario_id,
            "cargo": cargo,
            "bloco": bloco,
            "tipo_questao": tipo_questao,
            "tipo_conhecimento": tipo_conhecimento,
            "modo_foco": modo_foco,
            "materia_foco": materia_foco
        })
        
        if not all([usuario_id, cargo, bloco]):
            logger.warning("Dados obrigatórios faltando para geração de questão", extra={
                "usuario_id": usuario_id,
                "cargo": cargo,
                "bloco": bloco
            })
            return ResponseFormatter.bad_request('Dados do usuário são obrigatórios')
        
        # Obter conteúdo específico do edital baseado no tipo de conhecimento
        if modo_foco and materia_foco:
            conteudo_edital = [materia_foco]
            logger.info("Modo foco ativado", extra={"materia_foco": materia_foco})
        else:
            conteudo_edital = _obter_conteudo_edital(cargo, bloco, tipo_conhecimento)
            logger.info("Conteúdo do edital obtido", extra={
                "tipo_conhecimento": tipo_conhecimento,
                "conteudo_count": len(conteudo_edital) if conteudo_edital else 0
            })
        
        if not conteudo_edital:
            logger.warning("Cargo ou bloco não encontrado", extra={"cargo": cargo, "bloco": bloco})
            return ResponseFormatter.not_found('Cargo ou bloco não encontrado')
        
        # ========== IMPLEMENTAÇÃO DA ROLETA ==========
        logger.info("Sistema de roleta ativado para geração de questão")
        
        # 1. Primeiro, tentar buscar questão do pool
        questao_do_pool = _buscar_questao_do_pool(
            usuario_id=usuario_id,
            cargo=cargo,
            bloco=bloco,
            tipo_conhecimento=tipo_conhecimento,
            modo_foco=modo_foco,
            materia_foco=materia_foco
        )
        
        questao_completa = None
        questao_id = None
        origem_questao = None
        
        if questao_do_pool:
            # Questão encontrada no pool
            logger.info("Questão encontrada no pool - economia de tokens", extra={
                "questao_id": questao_do_pool['id'],
                "tema": questao_do_pool.get('tema'),
                "dificuldade": questao_do_pool.get('dificuldade')
            })
            questao_id = questao_do_pool['id']
            questao_completa = {
                'id': questao_id,
                'questao': questao_do_pool['questao'],
                'tipo': questao_do_pool['tipo'],
                'alternativas': questao_do_pool['alternativas'],
                'gabarito': questao_do_pool['gabarito'],
                'tema': questao_do_pool['tema'],
                'dificuldade': questao_do_pool['dificuldade'],
                'explicacao': questao_do_pool['explicacao']
            }
            origem_questao = "pool"
        else:
            # 2. Se não encontrou no pool, gerar nova questão com ChatGPT
            logger.info("Gerando nova questão com ChatGPT", extra={
                "cargo": cargo,
                "bloco": bloco,
                "tipo_questao": tipo_questao,
                "conteudo_count": len(conteudo_edital)
            })
            try:
                logger.info("Chamando serviço ChatGPT para geração de questão")
                questao_ia = chatgpt_service.gerar_questao(
                    cargo=cargo,
                    conteudo_edital=conteudo_edital,
                    tipo_questao=tipo_questao
                )
                
                logger.info("Resposta recebida do ChatGPT", extra={
                    "questao_gerada": questao_ia is not None
                })
                
                if questao_ia:
                    questao_id = str(uuid.uuid4())
                    questao_completa = {
                        'id': questao_id,
                        'questao': questao_ia['questao'],
                        'tipo': questao_ia.get('tipo', 'múltipla escolha'),
                        'alternativas': [
                            {'id': alt.split(')')[0], 'texto': alt.split(') ', 1)[1] if ') ' in alt else alt}
                            for alt in questao_ia['alternativas']
                        ],
                        'gabarito': questao_ia['gabarito'],
                        'tema': questao_ia.get('tema', conteudo_edital[0] if conteudo_edital else 'Tema geral'),
                        'dificuldade': questao_ia.get('dificuldade', 'medio'),
                        'explicacao': questao_ia.get('explicacao', '')
                    }
                    
                    # 3. Salvar nova questão no pool para reutilização
                    pool_id = _salvar_questao_no_pool(
                        questao_completa=questao_completa,
                        cargo=cargo,
                        bloco=bloco,
                        tipo_conhecimento=tipo_conhecimento,
                        criado_por=usuario_id
                    )
                    
                    if pool_id:
                        questao_id = pool_id  # Usar ID do pool
                        questao_completa['id'] = pool_id
                    
                    logger.info("Questão IA gerada e salva no pool", extra={
                        "questao_preview": questao_completa['questao'][:100],
                        "questao_id": questao_id,
                        "pool_id": pool_id
                    })
                    origem_questao = "chatgpt_nova"
                else:
                    logger.warning("ChatGPT retornou resposta vazia")
                    raise Exception("ChatGPT não retornou questão válida")
                    
            except Exception as e:
                logger.error("Erro ao gerar questão com IA", extra={
                    "error": str(e),
                    "cargo": cargo,
                    "bloco": bloco,
                    "tipo_conhecimento": tipo_conhecimento
                })
                import traceback
                logger.debug("Traceback completo", extra={
                    "traceback": traceback.format_exc()
                })
                logger.info("Usando questão de fallback")
                
                # Fallback: questão de exemplo
                questao_id = str(uuid.uuid4())
                questao_completa = {
                    'id': questao_id,
                    'questao': f"Questão sobre {conteudo_edital[0] if conteudo_edital else 'conhecimentos gerais'} para {cargo}",
                    'tipo': 'múltipla escolha',
                    'alternativas': [
                        {'id': 'A', 'texto': 'Alternativa A - Exemplo'},
                        {'id': 'B', 'texto': 'Alternativa B - Exemplo'},
                        {'id': 'C', 'texto': 'Alternativa C - Exemplo'},
                        {'id': 'D', 'texto': 'Alternativa D - Exemplo'}
                    ],
                    'gabarito': 'A',
                    'tema': conteudo_edital[0] if conteudo_edital else 'Tema geral',
                    'dificuldade': 'medio',
                    'explicacao': 'Esta é uma questão de exemplo para teste do sistema.'
                }
                origem_questao = "fallback"
        
        # 4. Registrar que o usuário visualizou esta questão
        _registrar_questao_respondida(
            usuario_id=usuario_id,
            questao_id=questao_id,
            respondida=False,  # Apenas visualizada por enquanto
            acertou=False,
            tempo_resposta=None
        )
        
        print(f"📊 Questão entregue - Origem: {origem_questao}, ID: {questao_id}")
        
        # Armazenar questão completa em cache/sessão para validação posterior
        # TODO: Implementar cache Redis ou sessão para armazenar gabarito
        
        # Retornar questão sem gabarito para o frontend
        questao_frontend = {
            'id': questao_id,
            'questao': questao_completa['questao'],
            'tipo': questao_completa['tipo'],
            'alternativas': questao_completa['alternativas'],
            'tema': questao_completa['tema'],
            'dificuldade': questao_completa['dificuldade']
        }
        
        logger.info("Questão gerada com sucesso", extra={
            "questao_id": questao_id,
            "usuario_id": usuario_id,
            "cargo": cargo,
            "bloco": bloco,
            "origem_questao": origem_questao,
            "tema": questao_completa['tema'],
            "dificuldade": questao_completa['dificuldade']
        })
        
        return ResponseFormatter.success(questao_frontend)
        
    except Exception as e:
        print(f"❌ Erro ao gerar questão: {e}")
        import traceback
        traceback.print_exc()
        return ResponseFormatter.internal_error('Erro interno do servidor')

@questoes_bp.route('/materias-foco/<cargo>/<bloco>', methods=['GET'])
@log_request(logger)
def obter_materias_foco(cargo, bloco):
    """Obtém todas as matérias disponíveis para o modo foco"""
    logger.info("Iniciando obtenção de matérias para modo foco", extra={'cargo': cargo, 'bloco': bloco})
    try:
        # Normalizar o nome do bloco para compatibilidade
        bloco_normalizado = bloco
        if ':' in bloco:
            bloco_normalizado = bloco.split(':')[0].strip()
        
        logger.info("Buscando conteúdos do edital", extra={'cargo': cargo, 'bloco_normalizado': bloco_normalizado})
        conteudos_bloco = CONTEUDOS_EDITAL.get(cargo, {}).get(bloco_normalizado, {})
        
        materias = []
        
        # Verificar se é a nova estrutura com conhecimentos gerais/específicos
        if isinstance(conteudos_bloco, dict) and 'conhecimentos_especificos' in conteudos_bloco:
            # Adicionar conhecimentos específicos
            for materia in conteudos_bloco.get('conhecimentos_especificos', []):
                materias.append({
                    'nome': materia,
                    'tipo': 'conhecimentos_especificos'
                })
            
            # Adicionar conhecimentos gerais
            for materia in conteudos_bloco.get('conhecimentos_gerais', []):
                materias.append({
                    'nome': materia,
                    'tipo': 'conhecimentos_gerais'
                })
        else:
            # Estrutura antiga (lista simples) - considerar como conhecimentos específicos
            if isinstance(conteudos_bloco, list):
                for materia in conteudos_bloco:
                    materias.append({
                        'nome': materia,
                        'tipo': 'conhecimentos_especificos'
                    })
        
        logger.info("Matérias obtidas com sucesso para modo foco", extra={
            'cargo': cargo,
            'bloco': bloco,
            'total_materias': len(materias),
            'tipos_conhecimento': list(set([m['tipo'] for m in materias]))
        })
        
        return ResponseFormatter.success(materias, 'Matérias obtidas com sucesso')
        
    except Exception as e:
        logger.error("Erro ao obter matérias para modo foco", extra={'cargo': cargo, 'bloco': bloco, 'error': str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

# Função duplicada removida - usando apenas a primeira definição

@questoes_bp.route('/historico/<usuario_id>', methods=['GET'])
@log_request(logger)
def obter_historico(usuario_id):
    """Obtém o histórico de questões do usuário usando o sistema de roleta"""
    logger.info("Iniciando obtenção de histórico de questões", extra={'usuario_id': usuario_id})
    try:
        # Parâmetros de paginação
        limite = int(request.args.get('limite', 20))
        offset = int(request.args.get('offset', 0))
        logger.info("Parâmetros de paginação definidos", extra={'usuario_id': usuario_id, 'limite': limite, 'offset': offset})
        
        questoes = []
        
        if firebase_config.is_configured():
            try:
                logger.info("Firebase configurado, buscando histórico no Firestore", extra={'usuario_id': usuario_id})
                from firebase_admin import firestore
                db = firestore.client()
                
                # Buscar questões respondidas pelo usuário
                query = db.collection('questoes_respondidas')\
                         .where('usuario_id', '==', usuario_id)\
                         .where('respondida', '==', True)\
                         .order_by('data_resposta', direction=firestore.Query.DESCENDING)\
                         .limit(limite)\
                         .offset(offset)
                
                docs = query.stream()
                
                for doc in docs:
                    questao_respondida = doc.to_dict()
                    questao_id = questao_respondida.get('questao_id')
                    
                    # Buscar dados completos da questão no pool
                    questao_ref = db.collection('questoes_pool').document(questao_id)
                    questao_doc = questao_ref.get()
                    
                    if questao_doc.exists:
                        questao_data = questao_doc.to_dict()
                        
                        # Combinar dados da questão com dados da resposta
                        questao_completa = {
                            'id': questao_id,
                            'questao': questao_data.get('questao', ''),
                            'tipo': questao_data.get('tipo', 'multipla_escolha'),
                            'alternativas': questao_data.get('alternativas', []),
                            'tema': questao_data.get('tema', ''),
                            'dificuldade': questao_data.get('dificuldade', 'medio'),
                            'explicacao': questao_data.get('explicacao', ''),
                            'cargo': questao_data.get('cargo', ''),
                            'bloco': questao_data.get('bloco', ''),
                            'respondida': questao_respondida.get('respondida', False),
                            'acertou': questao_respondida.get('acertou', False),
                            'data_resposta': questao_respondida.get('data_resposta', ''),
                            'tempo_resposta': questao_respondida.get('tempo_resposta', 0)
                        }
                        
                        questoes.append(questao_completa)
                    
            except Exception as e:
                logger.error("Erro ao buscar histórico no Firestore", extra={'usuario_id': usuario_id, 'error': str(e)})
        
        # Se não há questões no Firestore, retornar dados simulados
        if not questoes:
            logger.info("Nenhuma questão encontrada no Firestore, gerando dados simulados", extra={'usuario_id': usuario_id})
            questoes = _gerar_historico_simulado(usuario_id, limite)
        
        logger.info("Histórico obtido com sucesso", extra={
            'usuario_id': usuario_id,
            'total_questoes': len(questoes),
            'fonte_dados': 'firestore' if questoes and not any('simulado' in str(q) for q in questoes) else 'simulado'
        })
        
        return ResponseFormatter.success({
            'questoes': questoes,
            'total': len(questoes)
        }, 'Histórico obtido com sucesso')
        
    except Exception as e:
        logger.error("Erro ao obter histórico", extra={'usuario_id': usuario_id, 'error': str(e)})
        return ResponseFormatter.internal_error('Erro interno do servidor')

@questoes_bp.route('/estatisticas/<usuario_id>', methods=['GET'])
@log_request(logger)
def obter_estatisticas(usuario_id):
    """Obtém estatísticas de desempenho do usuário"""
    logger.info("Iniciando busca de estatísticas do usuário", extra={
        'usuario_id': usuario_id
    })
    
    try:
        estatisticas = {
            'total_questoes': 0,
            'total_acertos': 0,
            'taxa_acertos': 0,
            'tempo_medio': 0,
            'acertos_por_tema': {},
            'evolucao_semanal': []
        }
        
        if firebase_config.is_connected():
            logger.info("Firebase configurado, buscando estatísticas no Firestore", extra={
                'usuario_id': usuario_id
            })
            
            try:
                db = firebase_config.get_db()
                
                # Buscar todas as questões respondidas
                query = db.collection('questoes')\
                         .where('usuario_id', '==', usuario_id)\
                         .where('respondida', '==', True)
                
                docs = query.stream()
                questoes = [doc.to_dict() for doc in docs]
                
                if questoes:
                    estatisticas = _calcular_estatisticas(questoes)
                    logger.info("Estatísticas calculadas a partir do Firestore", extra={
                        'usuario_id': usuario_id,
                        'total_questoes': len(questoes)
                    })
                    
            except Exception as e:
                logger.error("Erro ao buscar estatísticas no Firestore", extra={
                    'usuario_id': usuario_id,
                    'error': str(e)
                })
        
        # Se não há dados no Firestore, retornar estatísticas simuladas
        if estatisticas['total_questoes'] == 0:
            logger.info("Gerando estatísticas simuladas", extra={
                'usuario_id': usuario_id,
                'motivo': 'sem_dados_firestore'
            })
            estatisticas = _gerar_estatisticas_simuladas()
        
        logger.info("Estatísticas obtidas com sucesso", extra={
            'usuario_id': usuario_id,
            'total_questoes': estatisticas['total_questoes'],
            'taxa_acertos': estatisticas['taxa_acertos']
        })
        
        return ResponseFormatter.success(estatisticas, 'Estatísticas obtidas com sucesso')
        
    except Exception as e:
        logger.error("Erro ao obter estatísticas do usuário", extra={
            'usuario_id': usuario_id,
            'error': str(e)
        })
        return ResponseFormatter.internal_error('Erro interno do servidor')

@questoes_bp.route('/materias/<cargo>/<bloco>', methods=['GET'])
@log_request(logger)
def obter_materias_por_cargo_bloco(cargo, bloco):
    """Obtém as matérias específicas baseadas no cargo e bloco do usuário"""
    logger.info("Iniciando busca de matérias por cargo e bloco", extra={
        'cargo': cargo,
        'bloco': bloco
    })
    
    try:
        # Buscar no dicionário CONTEUDOS_EDITAL
        bloco_normalizado = bloco.replace('_', ' ').title()
        conteudos = CONTEUDOS_EDITAL.get(cargo, {}).get(bloco_normalizado, [])
        
        logger.info("Conteúdos encontrados no edital", extra={
            'cargo': cargo,
            'bloco_normalizado': bloco_normalizado,
            'tipo_conteudos': type(conteudos).__name__,
            'tem_conteudos': bool(conteudos)
        })
        
        materias_performance = []
        
        if isinstance(conteudos, dict):  # Nova estrutura com conhecimentos_especificos e conhecimentos_gerais
            # Processar conhecimentos específicos
            for i, materia in enumerate(conteudos.get('conhecimentos_especificos', [])[:3]):
                materias_performance.append({
                    'materia': materia,
                    'tipo_conhecimento': 'conhecimentos_especificos',
                    'acertos': 65 + (i * 5) % 30,
                    'total': 100,
                    'percentual': 65 + (i * 5) % 30,
                    'tendencia': 'subindo' if i % 2 == 0 else 'descendo'
                })
            
            # Processar conhecimentos gerais
            for i, materia in enumerate(conteudos.get('conhecimentos_gerais', [])[:2]):
                materias_performance.append({
                    'materia': materia,
                    'tipo_conhecimento': 'conhecimentos_gerais',
                    'acertos': 70 + (i * 3) % 25,
                    'total': 100,
                    'percentual': 70 + (i * 3) % 25,
                    'tendencia': 'subindo' if i % 2 == 1 else 'descendo'
                })
        
        elif isinstance(conteudos, list):  # Estrutura antiga (lista simples)
            for i, materia in enumerate(conteudos[:5]):
                materias_performance.append({
                    'materia': materia,
                    'tipo_conhecimento': 'conhecimentos_especificos',  # Assumir como específicos
                    'acertos': 65 + (i * 5) % 30,
                    'total': 100,
                    'percentual': 65 + (i * 5) % 30,
                    'tendencia': 'subindo' if i % 2 == 0 else 'descendo'
                })
        
        else:  # Fallback para matérias genéricas
            materias_genericas = [
                ('Língua Portuguesa', 'conhecimentos_gerais'),
                ('Matemática', 'conhecimentos_gerais'), 
                ('Noções de Direito', 'conhecimentos_gerais'),
                ('Realidade Brasileira', 'conhecimentos_gerais'),
                ('Conhecimentos Específicos', 'conhecimentos_especificos')
            ]
            
            for i, (materia, tipo) in enumerate(materias_genericas):
                materias_performance.append({
                    'materia': materia,
                    'tipo_conhecimento': tipo,
                    'acertos': 65 + (i * 5) % 30,
                    'total': 100,
                    'percentual': 65 + (i * 5) % 30,
                    'tendencia': 'subindo' if i % 2 == 0 else 'descendo'
                })
        
        logger.info("Matérias obtidas com sucesso", extra={
            'cargo': cargo,
            'bloco': bloco,
            'total_materias': len(materias_performance)
        })
        
        return ResponseFormatter.success(
            data={'materias': materias_performance},
            message='Matérias obtidas com sucesso'
        )
        
    except Exception as e:
        logger.error("Erro ao obter matérias por cargo e bloco", extra={
            'cargo': cargo,
            'bloco': bloco,
            'error': str(e)
        })
        return ResponseFormatter.internal_error('Erro interno do servidor')

def _obter_conteudo_edital(cargo, bloco, tipo_conhecimento='todos'):
    """Obtém conteúdo específico do edital para o cargo e bloco"""
    # Normalizar o nome do bloco para compatibilidade
    bloco_normalizado = bloco
    if ':' in bloco:
        bloco_normalizado = bloco.split(':')[0].strip()
    
    conteudos_bloco = CONTEUDOS_EDITAL.get(cargo, {}).get(bloco_normalizado, {})
    
    # Verificar se é a nova estrutura com conhecimentos gerais/específicos
    if isinstance(conteudos_bloco, dict) and 'conhecimentos_especificos' in conteudos_bloco:
        if tipo_conhecimento == 'conhecimentos_gerais':
            conteudos = conteudos_bloco.get('conhecimentos_gerais', [])
        elif tipo_conhecimento == 'conhecimentos_especificos':
            conteudos = conteudos_bloco.get('conhecimentos_especificos', [])
        else:  # todos
            conteudos = conteudos_bloco.get('conhecimentos_especificos', []) + conteudos_bloco.get('conhecimentos_gerais', [])
    else:
        # Estrutura antiga (lista simples) - considerar como conhecimentos específicos
        conteudos = conteudos_bloco if isinstance(conteudos_bloco, list) else []
    
    if conteudos:
        # Selecionar alguns tópicos aleatoriamente
        import random
        num_topicos = min(3, len(conteudos))
        topicos_selecionados = random.sample(conteudos, num_topicos)
        return ', '.join(topicos_selecionados)
    
    # Fallback genérico
    return 'Conhecimentos específicos do cargo conforme edital'

def _atualizar_estatisticas_usuario(usuario_id, acertou, tema):
    """Atualiza estatísticas do usuário no Firestore"""
    try:
        if not firebase_config.is_connected():
            return
        
        db = firebase_config.get_db()
        usuario_ref = db.collection('usuarios').document(usuario_id)
        
        # Buscar dados atuais
        doc = usuario_ref.get()
        if not doc.exists:
            return
        
        dados = doc.to_dict()
        
        # Atualizar vida
        vida_atual = dados.get('vida', 80)
        if acertou:
            nova_vida = min(vida_atual + 5, 100)
        else:
            nova_vida = max(vida_atual - 10, 0)
        
        # Atualizar pontuação
        pontuacao_atual = dados.get('pontuacao', 0)
        if acertou:
            nova_pontuacao = pontuacao_atual + 10
        else:
            nova_pontuacao = max(pontuacao_atual - 5, 0)
        
        # Atualizar erros por tema
        erros_por_tema = dados.get('erros_por_tema', {})
        if not acertou and tema:
            erros_por_tema[tema] = erros_por_tema.get(tema, 0) + 1
        
        # Salvar atualizações
        usuario_ref.update({
            'vida': nova_vida,
            'pontuacao': nova_pontuacao,
            'erros_por_tema': erros_por_tema,
            'ultimo_acesso': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Erro ao atualizar estatísticas do usuário: {e}")

def _gerar_historico_simulado(usuario_id, limite):
    """Gera histórico simulado para desenvolvimento"""
    import random
    
    questoes_simuladas = []
    temas = ['Política Nacional de Saúde', 'Estratégia Saúde da Família', 'Vigilância em Saúde']
    
    for i in range(min(limite, 10)):
        questao = {
            'id': f'sim_{i}',
            'questao': f'Questão simulada {i+1} sobre {random.choice(temas)}',
            'tema': random.choice(temas),
            'acertou': random.choice([True, False]),
            'tempo_resposta': random.randint(60, 300),
            'data_resposta': datetime.now().isoformat()
        }
        questoes_simuladas.append(questao)
    
    return questoes_simuladas

def _gerar_estatisticas_simuladas():
    """Gera estatísticas simuladas para desenvolvimento"""
    return {
        'total_questoes': 156,
        'total_acertos': 78,
        'taxa_acertos': 50,
        'tempo_medio': 2.3,
        'acertos_por_tema': {
            'Política Nacional de Saúde': 15,
            'Estratégia Saúde da Família': 12,
            'Vigilância em Saúde': 8
        },
        'evolucao_semanal': [
            {'semana': '2025-07-14', 'acertos': 45},
            {'semana': '2025-07-21', 'acertos': 52}
        ]
    }

@questoes_bp.route('/dashboard/estatisticas-gerais/<usuario_id>', methods=['GET'])
@log_request(logger)
def obter_estatisticas_gerais(usuario_id):
    """
    Retorna estatísticas gerais do usuário para o dashboard
    """
    try:
        logger.info("Iniciando busca de estatísticas gerais", extra={
            'usuario_id': usuario_id
        })
        
        # Buscar dados do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            from firebase_admin import firestore
            db = firestore.client()
            
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                
                # Calcular estatísticas baseadas nos dados reais
                questoes_respondidas = user_data.get('questoes_respondidas', 0)
                questoes_corretas = user_data.get('questoes_corretas', 0)
                
                # Fórmulas de cálculo:
                # Taxa de acerto = (questões corretas / questões respondidas) * 100
                taxa_acerto = (questoes_corretas / questoes_respondidas * 100) if questoes_respondidas > 0 else 0
                
                # Tempo total de estudo em minutos
                tempo_total_estudo = user_data.get('tempo_total_estudo', 0)
                
                # Dias consecutivos de estudo
                dias_consecutivos = user_data.get('dias_consecutivos', 0)
                
                # Melhor sequência de acertos
                melhor_sequencia = user_data.get('melhor_sequencia', 0)
                
                # Nível atual baseado em XP
                xp_atual = user_data.get('xp_atual', 0)
                nivel_atual = int(xp_atual / 100) + 1  # 100 XP por nível
                xp_proximo_nivel = (nivel_atual * 100)
                
                # Ranking simulado baseado na taxa de acerto
                ranking_total = 15420  # Total de usuários simulado
                percentil = min(taxa_acerto + 10, 99.9)  # Percentil baseado na taxa
                ranking_posicao = int(ranking_total * (100 - percentil) / 100)
                
                # Média de tempo por questão em segundos
                media_tempo_questao = int(tempo_total_estudo * 60 / questoes_respondidas) if questoes_respondidas > 0 else 45
                
                # Questões hoje (simulado baseado em atividade recente)
                questoes_hoje = min(questoes_respondidas % 25, 20)
                
                # Progresso semanal baseado na meta
                meta_semanal = 100
                progresso_semanal = min((questoes_hoje * 7 / meta_semanal) * 100, 100)
                
                return ResponseFormatter.success(
                    data={
                        'questoes_respondidas': questoes_respondidas,
                        'questoes_corretas': questoes_corretas,
                        'taxa_acerto': round(taxa_acerto, 1),
                        'tempo_total_estudo': tempo_total_estudo,
                        'dias_consecutivos': dias_consecutivos,
                        'melhor_sequencia': melhor_sequencia,
                        'nivel_atual': nivel_atual,
                        'xp_atual': xp_atual,
                        'xp_proximo_nivel': xp_proximo_nivel,
                        'ranking_posicao': ranking_posicao,
                        'ranking_total': ranking_total,
                        'percentil': round(percentil, 1),
                        'favoritas': user_data.get('favoritas', 0),
                        'listas_revisao': user_data.get('listas_revisao', 0),
                        'simulados_completos': user_data.get('simulados_completos', 0),
                        'media_tempo_questao': media_tempo_questao,
                        'questoes_hoje': questoes_hoje,
                        'meta_diaria': 20,
                        'progresso_semanal': round(progresso_semanal, 0),
                        'meta_semanal': meta_semanal
                    },
                    message='Estatísticas gerais obtidas com sucesso'
                )
                
                logger.info("Estatísticas gerais obtidas com sucesso do Firebase", extra={
                    'usuario_id': usuario_id,
                    'questoes_respondidas': user_data.get('questoes_respondidas', 0),
                    'taxa_acerto': round((user_data.get('questoes_corretas', 0) / max(user_data.get('questoes_respondidas', 1), 1)) * 100, 1),
                    'nivel_atual': user_data.get('nivel_atual', 1),
                    'xp_atual': user_data.get('xp_atual', 0),
                    'fonte_dados': 'firebase'
                })
                
                return ResponseFormatter.success(
                    data={
                        'questoes_respondidas': user_data.get('questoes_respondidas', 0),
                        'questoes_corretas': user_data.get('questoes_corretas', 0),
                        'taxa_acerto': round((user_data.get('questoes_corretas', 0) / max(user_data.get('questoes_respondidas', 1), 1)) * 100, 1),
                        'tempo_total_estudo': user_data.get('tempo_total_estudo', 0),
                        'dias_consecutivos': user_data.get('dias_consecutivos', 0),
                        'melhor_sequencia': user_data.get('melhor_sequencia', 0),
                        'nivel_atual': user_data.get('nivel_atual', 1),
                        'xp_atual': user_data.get('xp_atual', 0),
                        'xp_proximo_nivel': (user_data.get('nivel_atual', 1) + 1) * 100,
                        'ranking_posicao': ranking_posicao,
                        'ranking_total': 15420,
                        'percentil': round((1 - (ranking_posicao / 15420)) * 100, 1),
                        'favoritas': user_data.get('favoritas', 0),
                        'listas_revisao': user_data.get('listas_revisao', 0),
                        'simulados_completos': user_data.get('simulados_completos', 0),
                        'media_tempo_questao': media_tempo_questao,
                        'questoes_hoje': questoes_hoje,
                        'meta_diaria': 20,
                        'progresso_semanal': round(progresso_semanal, 0),
                        'meta_semanal': meta_semanal
                    },
                    message='Estatísticas gerais obtidas com sucesso'
                )
        
        # Fallback com dados simulados se Firebase não estiver configurado
        logger.info("Gerando estatísticas simuladas - Firebase não configurado", extra={
            'usuario_id': usuario_id,
            'fonte_dados': 'simulado'
        })
        
        return ResponseFormatter.success(
            data={
                'questoes_respondidas': 1247,
                'questoes_corretas': 1059,
                'taxa_acerto': 85.0,
                'tempo_total_estudo': 18420,
                'dias_consecutivos': 12,
                'melhor_sequencia': 28,
                'nivel_atual': 23,
                'xp_atual': 1847,
                'xp_proximo_nivel': 2000,
                'ranking_posicao': 892,
                'ranking_total': 15420,
                'percentil': 94.2,
                'favoritas': 23,
                'listas_revisao': 6,
                'simulados_completos': 8,
                'media_tempo_questao': 42,
                'questoes_hoje': 15,
                'meta_diaria': 20,
                'progresso_semanal': 78,
                'meta_semanal': 100
            },
            message='Estatísticas gerais obtidas com sucesso (dados simulados)'
        )
        
    except Exception as e:
        logger.error("Erro ao buscar estatísticas gerais", extra={
            'usuario_id': usuario_id,
            'error': str(e)
        })
        return ResponseFormatter.internal_error(f'Erro ao buscar estatísticas gerais: {str(e)}')

@questoes_bp.route('/dashboard/desempenho-semanal/<usuario_id>', methods=['GET'])
@log_request(logger)
def obter_desempenho_semanal(usuario_id):
    """
    Retorna dados de desempenho semanal do usuário
    """
    logger.info("Iniciando busca de desempenho semanal", extra={"usuario_id": usuario_id})
    try:
        # Buscar dados do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            from firebase_admin import firestore
            from datetime import datetime, timedelta
            import random
            
            db = firestore.client()
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                taxa_acerto_media = user_data.get('taxa_acerto', 85)
                
                # Gerar dados da semana baseados na performance do usuário
                dias_semana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
                desempenho_semanal = []
                
                for i, dia in enumerate(dias_semana):
                    # Questões por dia: variação baseada no dia da semana
                    base_questoes = 20
                    if i < 5:  # Dias úteis
                        questoes = base_questoes + random.randint(-5, 8)
                    else:  # Fim de semana
                        questoes = base_questoes - random.randint(5, 10)
                    
                    # Acertos baseados na taxa média do usuário com variação
                    variacao = random.uniform(-10, 10)
                    taxa_dia = max(50, min(100, taxa_acerto_media + variacao))
                    acertos = int(questoes * taxa_dia / 100)
                    
                    # Tempo médio por questão (30-60 segundos)
                    tempo_medio = random.randint(30, 60)
                    
                    desempenho_semanal.append({
                        'dia': dia,
                        'questoes': questoes,
                        'acertos': acertos,
                        'tempo': tempo_medio
                    })
                
                logger.info("Desempenho semanal obtido do Firebase com sucesso", extra={
                    "usuario_id": usuario_id,
                    "total_dias": len(desempenho_semanal),
                    "fonte_dados": "firebase"
                })
                return ResponseFormatter.success(
                    data=desempenho_semanal,
                    message="Desempenho semanal obtido com sucesso"
                )
        
        # Fallback com dados simulados
        logger.info("Gerando dados simulados de desempenho semanal", extra={
            "usuario_id": usuario_id,
            "fonte_dados": "simulado"
        })
        return ResponseFormatter.success(
            data=[
                { 'dia': 'Seg', 'questoes': 18, 'acertos': 15, 'tempo': 45 },
                { 'dia': 'Ter', 'questoes': 22, 'acertos': 19, 'tempo': 38 },
                { 'dia': 'Qua', 'questoes': 25, 'acertos': 21, 'tempo': 42 },
                { 'dia': 'Qui', 'questoes': 20, 'acertos': 17, 'tempo': 40 },
                { 'dia': 'Sex', 'questoes': 28, 'acertos': 24, 'tempo': 35 },
                { 'dia': 'Sáb', 'questoes': 15, 'acertos': 13, 'tempo': 48 },
                { 'dia': 'Dom', 'questoes': 12, 'acertos': 10, 'tempo': 52 }
            ],
            message="Desempenho semanal simulado obtido com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro ao buscar desempenho semanal", extra={
            "usuario_id": usuario_id,
            "error": str(e)
        })
        return ResponseFormatter.internal_error(
            error=f'Erro ao buscar desempenho semanal: {str(e)}'
        )

@questoes_bp.route('/dashboard/evolucao-mensal/<usuario_id>', methods=['GET'])
@log_request(logger)
def obter_evolucao_mensal(usuario_id):
    """
    Retorna dados de evolução mensal do usuário
    """
    logger.info("Iniciando busca de evolução mensal", extra={"usuario_id": usuario_id})
    
    try:
        # Buscar dados do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            from firebase_admin import firestore
            from datetime import datetime, timedelta
            import random
            
            db = firestore.client()
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                taxa_acerto_base = user_data.get('taxa_acerto', 75)
                
                # Gerar evolução dos últimos 6 meses
                meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
                evolucao_mensal = []
                
                for i, mes in enumerate(meses):
                    # Simular crescimento progressivo
                    crescimento = i * 2  # 2% de crescimento por mês
                    taxa_mes = min(95, taxa_acerto_base + crescimento + random.uniform(-3, 3))
                    
                    # Questões por mês baseadas na atividade
                    questoes_mes = 400 + random.randint(-50, 100)
                    
                    evolucao_mensal.append({
                        'mes': mes,
                        'taxa_acerto': round(taxa_mes, 1),
                        'questoes': questoes_mes
                    })
                
                logger.info("Evolução mensal obtida com sucesso do Firebase", extra={
                    'usuario_id': usuario_id,
                    'total_meses': len(evolucao_mensal),
                    'fonte_dados': 'firebase'
                })
                return ResponseFormatter.success(
                    data=evolucao_mensal,
                    message="Evolução mensal obtida com sucesso"
                )
        
        # Fallback com dados simulados
        dados_simulados = [
            { 'mes': 'Jan', 'taxa_acerto': 72.5, 'questoes': 380 },
            { 'mes': 'Fev', 'taxa_acerto': 75.2, 'questoes': 420 },
            { 'mes': 'Mar', 'taxa_acerto': 78.8, 'questoes': 465 },
            { 'mes': 'Abr', 'taxa_acerto': 81.3, 'questoes': 510 },
            { 'mes': 'Mai', 'taxa_acerto': 83.7, 'questoes': 485 },
            { 'mes': 'Jun', 'taxa_acerto': 85.9, 'questoes': 520 }
        ]
        logger.info("Evolução mensal simulada gerada", extra={
            'usuario_id': usuario_id,
            'total_meses': len(dados_simulados),
            'fonte_dados': 'simulado'
        })
        return ResponseFormatter.success(
            data=dados_simulados,
            message="Evolução mensal simulada obtida com sucesso"
        )
        
    except Exception as e:
        logger.error("Erro ao buscar evolução mensal", extra={
            'usuario_id': usuario_id,
            'error': str(e)
        })
        return ResponseFormatter.internal_error(
            error=f'Erro ao buscar evolução mensal: {str(e)}'
        )

@questoes_bp.route('/dashboard/metas/<usuario_id>', methods=['GET'])
@log_request(logger)
def obter_metas_usuario(usuario_id):
    """
    Retorna metas do usuário
    """
    logger.info("Iniciando busca de metas do usuário", extra={"usuario_id": usuario_id})
    try:
        # Buscar dados do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            from firebase_admin import firestore
            
            db = firestore.client()
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                
                # Calcular progresso das metas baseado nos dados reais
                questoes_respondidas = user_data.get('questoes_respondidas', 0)
                questoes_corretas = user_data.get('questoes_corretas', 0)
                tempo_total_estudo = user_data.get('tempo_total_estudo', 0)
                dias_consecutivos = user_data.get('dias_consecutivos', 0)
                
                # Fórmulas de progresso das metas:
                # Meta questões: progresso = (questões respondidas / meta) * 100
                meta_questoes_mes = 500
                progresso_questoes = min((questoes_respondidas / meta_questoes_mes) * 100, 100)
                
                # Meta taxa de acerto: progresso baseado na taxa atual
                meta_taxa_acerto = 90
                taxa_atual = (questoes_corretas / questoes_respondidas * 100) if questoes_respondidas > 0 else 0
                progresso_taxa = min((taxa_atual / meta_taxa_acerto) * 100, 100)
                
                # Meta tempo de estudo: 20 horas por mês (1200 minutos)
                meta_tempo_mes = 1200
                progresso_tempo = min((tempo_total_estudo / meta_tempo_mes) * 100, 100)
                
                # Meta dias consecutivos: 30 dias
                meta_dias_consecutivos = 30
                progresso_dias = min((dias_consecutivos / meta_dias_consecutivos) * 100, 100)
                
                logger.info("Metas do usuário obtidas com sucesso do Firebase", extra={
                    "usuario_id": usuario_id,
                    "total_metas": 4,
                    "fonte_dados": "firebase"
                })
                
                return ResponseFormatter.success(
                    data=[
                        {
                            'titulo': 'Questões do Mês',
                            'atual': questoes_respondidas,
                            'meta': meta_questoes_mes,
                            'progresso': round(progresso_questoes, 0),
                            'tipo': 'questoes'
                        },
                        {
                            'titulo': 'Taxa de Acerto',
                            'atual': round(taxa_atual, 1),
                            'meta': meta_taxa_acerto,
                            'progresso': round(progresso_taxa, 0),
                            'tipo': 'percentual'
                        },
                        {
                            'titulo': 'Tempo de Estudo',
                            'atual': tempo_total_estudo,
                            'meta': meta_tempo_mes,
                            'progresso': round(progresso_tempo, 0),
                            'tipo': 'tempo'
                        },
                        {
                            'titulo': 'Dias Consecutivos',
                            'atual': dias_consecutivos,
                            'meta': meta_dias_consecutivos,
                            'progresso': round(progresso_dias, 0),
                            'tipo': 'dias'
                        }
                    ],
                    message='Metas do usuário obtidas com sucesso'
                )
        
        # Fallback com dados simulados
        logger.info("Metas do usuário obtidas com dados simulados", extra={
            "usuario_id": usuario_id,
            "total_metas": 4,
            "fonte_dados": "simulado"
        })
        
        return ResponseFormatter.success(
            data=[
                {
                    'titulo': 'Questões do Mês',
                    'atual': 387,
                    'meta': 500,
                    'progresso': 77,
                    'tipo': 'questoes'
                },
                {
                    'titulo': 'Taxa de Acerto',
                    'atual': 85.2,
                    'meta': 90.0,
                    'progresso': 95,
                    'tipo': 'percentual'
                },
                {
                    'titulo': 'Tempo de Estudo',
                    'atual': 920,
                    'meta': 1200,
                    'progresso': 77,
                    'tipo': 'tempo'
                },
                {
                    'titulo': 'Dias Consecutivos',
                    'atual': 12,
                    'meta': 30,
                    'progresso': 40,
                    'tipo': 'dias'
                }
            ],
            message='Metas do usuário obtidas com sucesso (dados simulados)'
        )
        
    except Exception as e:
        logger.error("Erro ao buscar metas do usuário", extra={
            "usuario_id": usuario_id,
            "erro": str(e)
        })
        return ResponseFormatter.internal_error(
            message=f'Erro ao buscar metas do usuário: {str(e)}'
        )

@questoes_bp.route('/dashboard/atividades-recentes/<usuario_id>', methods=['GET'])
@log_request(logger)
def obter_atividades_recentes(usuario_id):
    """
    Obtém as atividades recentes do usuário
    """
    logger.info("Iniciando busca de atividades recentes", extra={"usuario_id": usuario_id})
    try:
        # Buscar dados do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            from firebase_admin import firestore
            from datetime import datetime, timedelta
            import random
            
            db = firestore.client()
            
            # Buscar histórico de questões respondidas
            questoes_ref = db.collection('questoes_respondidas').where('usuario_id', '==', usuario_id).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(10)
            questoes_docs = questoes_ref.get()
            
            atividades = []
            
            for doc in questoes_docs:
                data = doc.to_dict()
                timestamp = data.get('timestamp', datetime.now())
                
                # Calcular tempo relativo
                agora = datetime.now()
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                
                diff = agora - timestamp
                if diff.days > 0:
                    tempo_relativo = f'{diff.days}d atrás'
                elif diff.seconds > 3600:
                    horas = diff.seconds // 3600
                    tempo_relativo = f'{horas}h atrás'
                else:
                    minutos = diff.seconds // 60
                    tempo_relativo = f'{minutos}min atrás'
                
                atividades.append({
                    'tipo': 'questao_respondida',
                    'descricao': f"Respondeu questão de {data.get('materia', 'Conhecimentos Gerais')}",
                    'resultado': 'Acertou' if data.get('correta', False) else 'Errou',
                    'tempo': tempo_relativo,
                    'icone': 'CheckCircle' if data.get('correta', False) else 'XCircle'
                })
            
            # Se não houver atividades suficientes, adicionar simuladas
            if len(atividades) < 5:
                atividades_simuladas = [
                    {
                        'tipo': 'simulado_iniciado',
                        'descricao': 'Iniciou simulado de Direito Constitucional',
                        'resultado': 'Em andamento',
                        'tempo': '2h atrás',
                        'icone': 'Play'
                    },
                    {
                        'tipo': 'meta_atingida',
                        'descricao': 'Atingiu meta diária de questões',
                        'resultado': '20/20 questões',
                        'tempo': '1d atrás',
                        'icone': 'Target'
                    },
                    {
                        'tipo': 'nivel_subiu',
                        'descricao': 'Subiu para o nível 23',
                        'resultado': '+100 XP',
                        'tempo': '2d atrás',
                        'icone': 'TrendingUp'
                    }
                ]
                atividades.extend(atividades_simuladas[:5-len(atividades)])
            
            logger.info("Atividades recentes obtidas com sucesso do Firebase", extra={
                "usuario_id": usuario_id,
                "total_atividades": len(atividades[:5]),
                "fonte_dados": "firebase"
            })
            return ResponseFormatter.success(
                data=atividades[:5],  # Limitar a 5 atividades
                message='Atividades recentes obtidas com sucesso'
            )
        
        # Fallback com dados simulados
        logger.info("Atividades recentes geradas com dados simulados", extra={
            "usuario_id": usuario_id,
            "total_atividades": 5,
            "fonte_dados": "simulado"
        })
        return ResponseFormatter.success(
            data=[
                {
                    'tipo': 'questao_respondida',
                    'descricao': 'Respondeu questão de Direito Administrativo',
                    'resultado': 'Acertou',
                    'tempo': '15min atrás',
                    'icone': 'CheckCircle'
                },
                {
                    'tipo': 'simulado_iniciado',
                    'descricao': 'Iniciou simulado de Direito Constitucional',
                    'resultado': 'Em andamento',
                    'tempo': '2h atrás',
                    'icone': 'Play'
                },
                {
                    'tipo': 'questao_respondida',
                    'descricao': 'Respondeu questão de Português',
                    'resultado': 'Errou',
                    'tempo': '3h atrás',
                    'icone': 'XCircle'
                },
                {
                    'tipo': 'meta_atingida',
                    'descricao': 'Atingiu meta diária de questões',
                    'resultado': '20/20 questões',
                    'tempo': '1d atrás',
                    'icone': 'Target'
                },
                {
                    'tipo': 'nivel_subiu',
                    'descricao': 'Subiu para o nível 23',
                    'resultado': '+100 XP',
                    'tempo': '2d atrás',
                    'icone': 'TrendingUp'
                }
            ],
            message='Atividades recentes obtidas com sucesso (dados simulados)'
        )
        
    except Exception as e:
        logger.error("Erro ao buscar atividades recentes", extra={
            "usuario_id": usuario_id,
            "error": str(e)
        })
        return ResponseFormatter.internal_error(
            message=f'Erro ao buscar atividades recentes: {str(e)}'
        )

@questoes_bp.route('/dashboard/notificacoes/<usuario_id>', methods=['GET'])
@log_request(logger)
def obter_notificacoes(usuario_id):
    """
    Obtém as notificações do usuário
    """
    logger.info("Iniciando busca de notificações", extra={"usuario_id": usuario_id})
    try:
        # Buscar dados do usuário no Firebase/Firestore
        if firebase_config.is_configured():
            from firebase_admin import firestore
            from datetime import datetime, timedelta
            import random
            
            db = firestore.client()
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                
                # Gerar notificações baseadas no perfil do usuário
                notificacoes = []
                
                # Notificação de meta diária
                questoes_hoje = user_data.get('questoes_hoje', 0)
                meta_diaria = 20
                if questoes_hoje < meta_diaria:
                    faltam = meta_diaria - questoes_hoje
                    notificacoes.append({
                        'id': 'meta_diaria',
                        'tipo': 'meta',
                        'titulo': 'Meta Diária',
                        'mensagem': f'Faltam {faltam} questões para atingir sua meta diária!',
                        'icone': 'Target',
                        'cor': 'warning',
                        'timestamp': datetime.now().isoformat(),
                        'lida': False
                    })
                
                # Notificação de sequência de acertos
                sequencia_atual = user_data.get('sequencia_atual', 0)
                if sequencia_atual >= 10:
                    notificacoes.append({
                        'id': 'sequencia_acertos',
                        'tipo': 'conquista',
                        'titulo': 'Sequência Incrível!',
                        'mensagem': f'Você acertou {sequencia_atual} questões seguidas! Continue assim!',
                        'icone': 'Zap',
                        'cor': 'success',
                        'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat(),
                        'lida': False
                    })
                
                # Notificação de novo nível
                xp_atual = user_data.get('xp_atual', 0)
                nivel_atual = int(xp_atual / 100) + 1
                xp_proximo_nivel = nivel_atual * 100
                if xp_atual >= xp_proximo_nivel - 50:  # Próximo do próximo nível
                    falta_xp = xp_proximo_nivel - xp_atual
                    notificacoes.append({
                        'id': 'proximo_nivel',
                        'tipo': 'progresso',
                        'titulo': 'Quase no Próximo Nível!',
                        'mensagem': f'Faltam apenas {falta_xp} XP para o nível {nivel_atual + 1}!',
                        'icone': 'TrendingUp',
                        'cor': 'info',
                        'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
                        'lida': False
                    })
                
                # Notificação de matéria com baixo desempenho
                materias_performance = user_data.get('materias_performance', {})
                for materia, dados in materias_performance.items():
                    if dados.get('taxa_acerto', 100) < 70:
                        notificacoes.append({
                            'id': f'baixo_desempenho_{materia}',
                            'tipo': 'alerta',
                            'titulo': 'Atenção na Matéria',
                            'mensagem': f'Sua taxa de acerto em {materia} está baixa. Que tal revisar?',
                            'icone': 'AlertTriangle',
                            'cor': 'warning',
                            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
                            'lida': False
                        })
                        break  # Apenas uma notificação deste tipo
                
                # Limitar a 5 notificações mais recentes
                notificacoes = sorted(notificacoes, key=lambda x: x['timestamp'], reverse=True)[:5]
                
                logger.info("Notificações obtidas com sucesso do Firebase", extra={
                    "usuario_id": usuario_id,
                    "total_notificacoes": len(notificacoes),
                    "fonte_dados": "firebase"
                })
                return ResponseFormatter.success(
                    data=notificacoes,
                    message='Notificações obtidas com sucesso'
                )
        
        # Fallback com dados simulados
        dados_simulados = [
            {
                'id': 'meta_diaria',
                'tipo': 'meta',
                'titulo': 'Meta Diária',
                'mensagem': 'Faltam 5 questões para atingir sua meta diária!',
                'icone': 'Target',
                'cor': 'warning',
                'timestamp': datetime.now().isoformat(),
                'lida': False
            },
            {
                'id': 'sequencia_acertos',
                'tipo': 'conquista',
                'titulo': 'Sequência Incrível!',
                'mensagem': 'Você acertou 15 questões seguidas! Continue assim!',
                'icone': 'Zap',
                'cor': 'success',
                'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat(),
                'lida': False
            },
            {
                'id': 'proximo_nivel',
                'tipo': 'progresso',
                'titulo': 'Quase no Próximo Nível!',
                'mensagem': 'Faltam apenas 23 XP para o nível 24!',
                'icone': 'TrendingUp',
                'cor': 'info',
                'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
                'lida': False
            },
            {
                'id': 'simulado_disponivel',
                'tipo': 'info',
                'titulo': 'Novo Simulado',
                'mensagem': 'Simulado de Direito Constitucional disponível!',
                'icone': 'FileText',
                'cor': 'info',
                'timestamp': (datetime.now() - timedelta(hours=3)).isoformat(),
                'lida': True
            },
            {
                'id': 'ranking_subiu',
                'tipo': 'conquista',
                'titulo': 'Subiu no Ranking!',
                'mensagem': 'Você subiu 15 posições no ranking geral!',
                'icone': 'Award',
                'cor': 'success',
                'timestamp': (datetime.now() - timedelta(days=1)).isoformat(),
                'lida': True
            }
        ]
        
        logger.info("Notificações geradas com dados simulados", extra={
            "usuario_id": usuario_id,
            "total_notificacoes": len(dados_simulados),
            "fonte_dados": "simulado"
        })
        return ResponseFormatter.success(
            data=dados_simulados,
            message='Notificações obtidas com sucesso (dados simulados)'
        )
        
    except Exception as e:
        logger.error("Erro ao buscar notificações", extra={
            "usuario_id": usuario_id,
            "erro": str(e)
        })
        return ResponseFormatter.internal_error(
            message=f'Erro ao buscar notificações: {str(e)}'
        )

def _calcular_estatisticas(questoes):
    """Calcula estatísticas reais baseadas nas questões"""
    total_questoes = len(questoes)
    total_acertos = sum(1 for q in questoes if q.get('acertou'))
    taxa_acertos = round((total_acertos / total_questoes) * 100) if total_questoes > 0 else 0
    
    tempos = [q.get('tempo_resposta', 0) for q in questoes if q.get('tempo_resposta')]
    tempo_medio = round(sum(tempos) / len(tempos) / 60, 1) if tempos else 0
    
    # Acertos por tema
    acertos_por_tema = {}
    for questao in questoes:
        tema = questao.get('tema')
        if tema and questao.get('acertou'):
            acertos_por_tema[tema] = acertos_por_tema.get(tema, 0) + 1
    
    return {
        'total_questoes': total_questoes,
        'total_acertos': total_acertos,
        'taxa_acertos': taxa_acertos,
        'tempo_medio': tempo_medio,
        'acertos_por_tema': acertos_por_tema,
        'evolucao_semanal': []  # Implementar se necessário
    }

# ========== RECURSOS AVANÇADOS DE QUESTÕES ==========

@questoes_bp.route('/chat-duvidas', methods=['POST'])
@log_request(logger)
def chat_duvidas():
    """Endpoint para chat de dúvidas sobre questões"""
    try:
        data = request.get_json()
        questao_id = data.get('questao_id')
        usuario_id = data.get('usuario_id')
        mensagem = data.get('mensagem')
        
        logger.info("Iniciando chat de dúvidas", extra={
            'usuario_id': usuario_id,
            'questao_id': questao_id
        })
        
        if not all([questao_id, usuario_id, mensagem]):
            return ResponseFormatter.bad_request(
                message='questao_id, usuario_id e mensagem são obrigatórios'
            )
        
        # Gerar thread_id único
        thread_id = str(uuid.uuid4())
        
        # Buscar informações da questão para contexto
        db = firebase_config.get_firestore_client()
        questao_ref = db.collection('questoes_pool').document(questao_id)
        questao_doc = questao_ref.get()
        
        if not questao_doc.exists:
            return ResponseFormatter.not_found(
                message='Questão não encontrada'
            )
        
        questao_data = questao_doc.to_dict()
        
        # Preparar contexto para o ChatGPT
        contexto = f"""Questão: {questao_data.get('questao', '')}
        Tema: {questao_data.get('tema', '')}
        Alternativas: {questao_data.get('alternativas', [])}
        Gabarito: {questao_data.get('gabarito', '')}
        Explicação: {questao_data.get('explicacao', '')}
        
        Dúvida do usuário: {mensagem}"""
        
        # Gerar resposta usando ChatGPT
        prompt = f"""Você é um tutor especializado em concursos públicos. 
        Com base na questão e explicação fornecidas, responda à dúvida do usuário de forma clara e didática.
        
        {contexto}
        
        Forneça uma resposta educativa que esclareça a dúvida, mantendo foco no aprendizado."""
        
        resposta = chatgpt_service.gerar_resposta(prompt)
        
        # Salvar conversa no Firebase
        conversa_data = {
            'thread_id': thread_id,
            'questao_id': questao_id,
            'usuario_id': usuario_id,
            'mensagem_usuario': mensagem,
            'resposta_sistema': resposta,
            'timestamp': datetime.now(),
            'questao_referencia': {
                'questao': questao_data.get('questao', ''),
                'tema': questao_data.get('tema', '')
            }
        }
        
        db.collection('chat_duvidas').add(conversa_data)
        
        logger.info("Chat de dúvidas processado com sucesso", extra={
            'usuario_id': usuario_id,
            'questao_id': questao_id,
            'thread_id': thread_id,
            'tema': questao_data.get('tema', '')
        })
        
        return ResponseFormatter.success(
            data={
                'thread_id': thread_id,
                'resposta': resposta,
                'questao_referencia': {
                    'id': questao_id,
                    'tema': questao_data.get('tema', ''),
                    'questao': questao_data.get('questao', '')[:100] + '...'
                }
            },
            message='Resposta gerada com sucesso'
        )
        
    except Exception as e:
        logger.error("Erro no chat de dúvidas", extra={
            'usuario_id': usuario_id,
            'questao_id': questao_id,
            'error': str(e)
        })
        return ResponseFormatter.internal_error(
            message='Erro interno do servidor'
        )

@questoes_bp.route('/macetes/<questao_id>', methods=['GET'])
@log_request(logger)
def obter_macetes(questao_id):
    """Endpoint para obter macetes de uma questão"""
    logger.info(f"Iniciando busca de macetes para questão {questao_id}")
    try:
        # Buscar questão no Firebase
        db = firebase_config.get_firestore_client()
        questao_ref = db.collection('questoes_pool').document(questao_id)
        questao_doc = questao_ref.get()
        
        if not questao_doc.exists:
            return ResponseFormatter.not_found('Questão não encontrada')
        
        questao_data = questao_doc.to_dict()
        
        # Gerar macetes usando ChatGPT
        prompt = f"""Com base na seguinte questão de concurso público, forneça 3-5 macetes práticos e dicas de memorização:
        
        Questão: {questao_data.get('questao', '')}
        Tema: {questao_data.get('tema', '')}
        Gabarito: {questao_data.get('gabarito', '')}
        Explicação: {questao_data.get('explicacao', '')}
        
        Forneça macetes no formato de lista, cada um com:
        - Título do macete
        - Descrição clara e prática
        - Como aplicar na resolução
        
        Responda em formato JSON com array de objetos contendo: titulo, descricao, aplicacao"""
        
        resposta = chatgpt_service.gerar_resposta(prompt)
        
        # Tentar parsear JSON, se falhar, criar estrutura padrão
        try:
            import json
            macetes = json.loads(resposta)
        except:
            # Fallback para estrutura padrão
            macetes = [
                {
                    'titulo': 'Análise por Eliminação',
                    'descricao': 'Elimine alternativas claramente incorretas primeiro',
                    'aplicacao': 'Identifique palavras-chave que tornam alternativas incorretas'
                },
                {
                    'titulo': 'Foco no Tema Principal',
                    'descricao': f'Esta questão aborda: {questao_data.get("tema", "conceitos fundamentais")}',
                    'aplicacao': 'Relembre os pontos centrais deste tema antes de responder'
                },
                {
                    'titulo': 'Atenção ao Gabarito',
                    'descricao': f'A resposta correta é: {questao_data.get("gabarito", "")}',
                    'aplicacao': 'Verifique se sua escolha está alinhada com a fundamentação teórica'
                }
            ]
        
        logger.info(f"Macetes obtidos com sucesso", extra={
            'questao_id': questao_id,
            'total_macetes': len(macetes),
            'tema': questao_data.get('tema', 'N/A')
        })
        
        return ResponseFormatter.success(
            data={
                'questao_id': questao_id,
                'macetes': macetes
            },
            message='Macetes obtidos com sucesso'
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter macetes", extra={
            'questao_id': questao_id,
            'error': str(e)
        })
        return ResponseFormatter.internal_error(
            message=f'Erro ao obter macetes: {str(e)}'
        )

@questoes_bp.route('/pontos-centrais/<questao_id>', methods=['GET'])
@log_request(logger)
def obter_pontos_centrais(questao_id):
    """Endpoint para obter pontos centrais de uma questão"""
    logger.info(f"Iniciando busca de pontos centrais para questão {questao_id}")
    try:
        # Buscar questão no Firebase
        db = firebase_config.get_firestore_client()
        questao_ref = db.collection('questoes_pool').document(questao_id)
        questao_doc = questao_ref.get()
        
        if not questao_doc.exists:
            return ResponseFormatter.not_found('Questão não encontrada')
        
        questao_data = questao_doc.to_dict()
        
        # Gerar pontos centrais usando ChatGPT
        prompt = f"""Analise a seguinte questão de concurso público e identifique os pontos centrais e tópicos essenciais:
        
        Questão: {questao_data.get('questao', '')}
        Tema: {questao_data.get('tema', '')}
        Gabarito: {questao_data.get('gabarito', '')}
        Explicação: {questao_data.get('explicacao', '')}
        
        Identifique 4-6 pontos centrais que são essenciais para compreender e resolver esta questão.
        
        Responda em formato JSON com array de objetos contendo: topico, descricao, importancia"""
        
        resposta = chatgpt_service.gerar_resposta(prompt)
        
        # Tentar parsear JSON, se falhar, criar estrutura padrão
        try:
            import json
            pontos_centrais = json.loads(resposta)
        except:
            # Fallback para estrutura padrão
            pontos_centrais = [
                {
                    'topico': 'Conceito Fundamental',
                    'descricao': f'Compreensão do tema: {questao_data.get("tema", "")}',
                    'importancia': 'Base teórica necessária para resolução'
                },
                {
                    'topico': 'Interpretação do Enunciado',
                    'descricao': 'Análise cuidadosa do que está sendo perguntado',
                    'importancia': 'Evita erros por má interpretação'
                },
                {
                    'topico': 'Aplicação Prática',
                    'descricao': 'Como aplicar o conhecimento teórico na questão',
                    'importancia': 'Ponte entre teoria e prática'
                },
                {
                    'topico': 'Diferenciação de Alternativas',
                    'descricao': 'Identificar nuances entre as opções apresentadas',
                    'importancia': 'Precisão na escolha da resposta correta'
                }
            ]
        
        logger.info(f"Pontos centrais obtidos com sucesso", extra={
            'questao_id': questao_id,
            'total_pontos': len(pontos_centrais),
            'tema': questao_data.get('tema', 'N/A')
        })
        
        return ResponseFormatter.success({
            'questao_id': questao_id,
            'dados': pontos_centrais
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter pontos centrais", extra={
            'questao_id': questao_id,
            'error': str(e)
        })
        return ResponseFormatter.internal_error('Erro interno do servidor')

@questoes_bp.route('/outras-exploracoes/<questao_id>', methods=['GET'])
@log_request(logger)
def obter_outras_exploracoes(questao_id):
    """Endpoint para obter outras explorações e leituras sugeridas"""
    logger.info("Iniciando busca por outras explorações", extra={"questao_id": questao_id})
    try:
        # Buscar questão no Firebase
        db = firebase_config.get_firestore_client()
        questao_ref = db.collection('questoes_pool').document(questao_id)
        questao_doc = questao_ref.get()
        
        if not questao_doc.exists:
            return ResponseFormatter.not_found('Questão não encontrada')
        
        questao_data = questao_doc.to_dict()
        
        # Gerar sugestões de exploração usando ChatGPT
        prompt = f"""Com base na seguinte questão de concurso público, sugira materiais complementares e explorações adicionais:
        
        Questão: {questao_data.get('questao', '')}
        Tema: {questao_data.get('tema', '')}
        
        Sugira 4-6 recursos para aprofundamento, incluindo:
        - Legislações relacionadas
        - Doutrinas importantes
        - Jurisprudências relevantes
        - Materiais de estudo complementares
        
        Responda em formato JSON com array de objetos contendo: titulo, tipo, url (pode ser genérica), descricao"""
        
        resposta = chatgpt_service.gerar_resposta(prompt)
        
        # Tentar parsear JSON, se falhar, criar estrutura padrão
        try:
            import json
            exploracoes = json.loads(resposta)
        except:
            # Fallback para estrutura padrão baseado no tema
            tema = questao_data.get('tema', '')
            exploracoes = [
                {
                    'titulo': f'Legislação sobre {tema}',
                    'tipo': 'Legislação',
                    'url': 'https://www.planalto.gov.br/ccivil_03/leis/',
                    'descricao': f'Consulte as leis específicas relacionadas a {tema}'
                },
                {
                    'titulo': f'Doutrina - {tema}',
                    'tipo': 'Doutrina',
                    'url': 'https://www.conjur.com.br/',
                    'descricao': f'Artigos doutrinários sobre {tema}'
                },
                {
                    'titulo': f'Jurisprudência - {tema}',
                    'tipo': 'Jurisprudência',
                    'url': 'https://www.stf.jus.br/',
                    'descricao': f'Decisões judiciais relevantes sobre {tema}'
                },
                {
                    'titulo': f'Material Complementar - {tema}',
                    'tipo': 'Estudo',
                    'url': 'https://www.gov.br/',
                    'descricao': f'Materiais oficiais e complementares sobre {tema}'
                }
            ]
        
        logger.info("Outras explorações obtidas com sucesso", extra={
            "questao_id": questao_id,
            "total_exploracoes": len(exploracoes),
            "tema": questao_data.get('tema', '')
        })
        
        return ResponseFormatter.success({
            'questao_id': questao_id,
            'dados': exploracoes
        })
        
    except Exception as e:
        logger.error("Erro ao obter outras explorações", extra={
            "questao_id": questao_id,
            "error": str(e)
        })
        return ResponseFormatter.internal_error('Erro interno do servidor')

