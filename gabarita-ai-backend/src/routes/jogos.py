"""\nRotas para sistema de jogos educativos\n"""
from flask import Blueprint, request, jsonify
from ..services.chatgpt_service import chatgpt_service
from ..config.firebase_config import firebase_config
from datetime import datetime, timedelta
import uuid
import random
import json
from typing import Dict, List, Any

# Importações dos prompts especializados
try:
    from ..services.prompts_jogos import (
        get_prompt_forca, get_prompt_quiz, get_prompt_memoria,
        get_prompt_palavras_cruzadas, get_prompt_validacao_resposta,
        get_prompt_dica_jogo, get_prompt_feedback_sessao,
        get_contextos_bloco, get_categorias_bloco, ajustar_prompt_por_dificuldade
    )
except ImportError:
    # Mock functions para prompts
    def get_prompt_forca(bloco, nivel='medio'): return f"Mock prompt forca {bloco}"
    def get_prompt_quiz(bloco, qtd=5): return f"Mock prompt quiz {bloco}"
    def get_prompt_memoria(bloco, pares=6): return f"Mock prompt memoria {bloco}"
    def get_prompt_palavras_cruzadas(bloco, qtd=8): return f"Mock prompt palavras {bloco}"
    def get_prompt_validacao_resposta(p, r_user, r_correct): return "Mock validation"
    def get_prompt_dica_jogo(tipo, contexto, bloco): return "Mock dica"
    def get_prompt_feedback_sessao(tipo, pontos, acertos, total, tempo): return "Mock feedback"
    def get_contextos_bloco(bloco): return []
    def get_categorias_bloco(bloco): return []
    def ajustar_prompt_por_dificuldade(prompt, dif): return prompt

jogos_bp = Blueprint('jogos', __name__)

@jogos_bp.route('/', methods=['GET'])
@jogos_bp.route('/api/jogos', methods=['GET'])
def get_jogos():
    """Endpoint principal para listar jogos disponíveis"""
    try:
        usuario_id = request.args.get('usuario_id')
        
        # Se não tiver usuario_id, retornar lista básica
        if not usuario_id:
            jogos_basicos = []
            for jogo_id, config in JOGOS_CONFIG.items():
                jogos_basicos.append({
                    'id': jogo_id,
                    'nome': config['nome'],
                    'descricao': config['descricao'],
                    'disponivel': False,
                    'motivo': 'Login necessário'
                })
            
            return jsonify({
                'success': True,
                'data': {
                    'jogos': jogos_basicos,
                    'total': len(jogos_basicos)
                },
                'message': 'Lista de jogos obtida com sucesso'
            }), 200
        
        # Buscar plano do usuário
        plano_usuario = obter_plano_usuario(usuario_id)
        
        jogos_disponiveis = []
        for jogo_id, config in JOGOS_CONFIG.items():
            if plano_usuario in config['planos_permitidos']:
                jogos_disponiveis.append({
                    'id': jogo_id,
                    'nome': config['nome'],
                    'descricao': config['descricao'],
                    'disponivel': True,
                    'configuracao': {
                        'max_tentativas': config.get('max_tentativas'),
                        'tempo_limite': config.get('tempo_limite'),
                        'pontos_acerto': config.get('pontos_acerto'),
                        'pontos_erro': config.get('pontos_erro')
                    }
                })
            else:
                jogos_disponiveis.append({
                    'id': jogo_id,
                    'nome': config['nome'],
                    'descricao': config['descricao'],
                    'disponivel': False,
                    'motivo': 'Upgrade para Premium necessário'
                })
        
        return jsonify({
            'success': True,
            'data': {
                'jogos': jogos_disponiveis,
                'plano_atual': plano_usuario,
                'total': len(jogos_disponiveis)
            },
            'message': 'Lista de jogos obtida com sucesso'
        }), 200
    
    except Exception as e:
        print(f"Erro ao obter jogos: {e}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor',
            'message': 'Erro ao obter lista de jogos'
        }), 500

# Configurações dos jogos
JOGOS_CONFIG = {
    'forca': {
        'nome': 'Jogo da Forca',
        'descricao': 'Descubra a palavra relacionada ao seu bloco de concurso',
        'planos_permitidos': ['trial', 'premium', 'ate_final_concurso'],
        'max_tentativas': 6,
        'pontos_acerto': 10,
        'pontos_erro': -2
    },
    'quiz': {
        'nome': 'Quiz Rápido',
        'descricao': 'Responda questões de múltipla escolha',
        'planos_permitidos': ['premium', 'ate_final_concurso'],
        'max_questoes': 10,
        'tempo_limite': 300,  # 5 minutos
        'pontos_acerto': 15,
        'pontos_erro': -3
    },
    'memoria': {
        'nome': 'Jogo da Memória',
        'descricao': 'Encontre os pares de conceitos relacionados',
        'planos_permitidos': ['premium', 'ate_final_concurso'],
        'max_pares': 8,
        'tempo_limite': 180,  # 3 minutos
        'pontos_acerto': 20,
        'pontos_erro': -1
    },
    'palavras_cruzadas': {
        'nome': 'Palavras Cruzadas',
        'descricao': 'Complete as palavras cruzadas com termos do seu bloco',
        'planos_permitidos': ['premium', 'ate_final_concurso'],
        'max_palavras': 6,
        'tempo_limite': 600,  # 10 minutos
        'pontos_acerto': 25,
        'pontos_erro': -2
    }
}

@jogos_bp.route('/listar', methods=['GET'])
def listar_jogos():
    """Lista todos os jogos disponíveis para o usuário"""
    try:
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            return jsonify({
                'success': False,
                'error': 'ID do usuário é obrigatório'
            }), 400
        
        # Buscar plano do usuário
        plano_usuario = obter_plano_usuario(usuario_id)
        
        jogos_disponiveis = []
        for jogo_id, config in JOGOS_CONFIG.items():
            if plano_usuario in config['planos_permitidos']:
                jogos_disponiveis.append({
                    'id': jogo_id,
                    'nome': config['nome'],
                    'descricao': config['descricao'],
                    'disponivel': True
                })
            else:
                jogos_disponiveis.append({
                    'id': jogo_id,
                    'nome': config['nome'],
                    'descricao': config['descricao'],
                    'disponivel': False,
                    'motivo': 'Upgrade para Premium necessário'
                })
        
        return jsonify({
            'jogos': jogos_disponiveis,
            'plano_atual': plano_usuario
        })
    
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@jogos_bp.route('/iniciar/<jogo_tipo>', methods=['POST'])
def iniciar_jogo(jogo_tipo):
    """Inicia uma nova sessão de jogo com conteúdo gerado via GPT"""
    try:
        data = request.get_json()
        usuario_id = data.get('usuario_id')
        bloco_usuario = data.get('bloco', 'geral')
        dificuldade = data.get('dificuldade', 'medio')
        
        if not usuario_id:
            return jsonify({'erro': 'ID do usuário é obrigatório'}), 400
        
        if jogo_tipo not in JOGOS_CONFIG:
            return jsonify({'erro': 'Tipo de jogo inválido'}), 400
        
        # Verificar se o usuário tem acesso ao jogo
        plano_usuario = obter_plano_usuario(usuario_id)
        config_jogo = JOGOS_CONFIG[jogo_tipo]
        
        if plano_usuario not in config_jogo['planos_permitidos']:
            return jsonify({
                'erro': 'Acesso negado',
                'mensagem': 'Upgrade para Premium necessário para este jogo'
            }), 403
        
        # Gerar sessão de jogo com dificuldade
        sessao_id = str(uuid.uuid4())
        
        if jogo_tipo == 'forca':
            sessao = iniciar_jogo_forca_melhorado(sessao_id, usuario_id, bloco_usuario, dificuldade)
        elif jogo_tipo == 'quiz':
            sessao = iniciar_jogo_quiz_melhorado(sessao_id, usuario_id, bloco_usuario, dificuldade)
        elif jogo_tipo == 'memoria':
            sessao = iniciar_jogo_memoria_melhorado(sessao_id, usuario_id, bloco_usuario, dificuldade)
        elif jogo_tipo == 'palavras_cruzadas':
            sessao = iniciar_jogo_palavras_cruzadas_melhorado(sessao_id, usuario_id, bloco_usuario, dificuldade)
        
        # Salvar sessão no Firebase
        salvar_sessao_jogo(sessao)
        
        return jsonify({
            'sessao_id': sessao_id,
            'jogo': sessao,
            'sucesso': True,
            'contextos_disponiveis': get_contextos_bloco(bloco_usuario),
            'categorias_disponiveis': get_categorias_bloco(bloco_usuario)
        })
    
    except Exception as e:
        print(f"Erro ao iniciar jogo: {e}")
        return jsonify({'erro': str(e)}), 500

@jogos_bp.route('/jogada', methods=['POST'])
def processar_jogada():
    """Processa uma jogada do usuário"""
    try:
        data = request.get_json()
        sessao_id = data.get('sessao_id')
        jogada = data.get('jogada')
        
        if not sessao_id or not jogada:
            return jsonify({'erro': 'Sessão ID e jogada são obrigatórios'}), 400
        
        # Buscar sessão do jogo
        sessao = buscar_sessao_jogo(sessao_id)
        if not sessao:
            return jsonify({'erro': 'Sessão não encontrada'}), 404
        
        # Processar jogada baseado no tipo de jogo
        jogo_tipo = sessao['tipo']
        
        if jogo_tipo == 'forca':
            resultado = processar_jogada_forca(sessao, jogada)
        elif jogo_tipo == 'quiz':
            resultado = processar_jogada_quiz(sessao, jogada)
        elif jogo_tipo == 'memoria':
            resultado = processar_jogada_memoria(sessao, jogada)
        elif jogo_tipo == 'palavras_cruzadas':
            resultado = processar_jogada_palavras_cruzadas(sessao, jogada)
        
        # Atualizar sessão
        atualizar_sessao_jogo(sessao_id, resultado['sessao_atualizada'])
        
        # Atualizar pontuação do usuário se o jogo terminou
        if resultado.get('jogo_finalizado'):
            atualizar_pontuacao_usuario(sessao['usuario_id'], resultado['pontos_finais'])
        
        return jsonify(resultado)
    
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@jogos_bp.route('/ranking', methods=['GET'])
def ranking_jogos():
    """Retorna o ranking dos jogadores"""
    try:
        bloco = request.args.get('bloco', 'geral')
        limite = int(request.args.get('limite', 10))
        
        ranking = obter_ranking_jogos(bloco, limite)
        
        return jsonify({
            'ranking': ranking,
            'bloco': bloco
        })
    
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@jogos_bp.route('/estatisticas/<usuario_id>', methods=['GET'])
def estatisticas_usuario(usuario_id):
    """Retorna estatísticas de jogos do usuário"""
    try:
        stats = obter_estatisticas_usuario(usuario_id)
        return jsonify(stats)
    
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Funções auxiliares para cada tipo de jogo

def iniciar_jogo_forca_melhorado(sessao_id, usuario_id, bloco, dificuldade='medio'):
    """Inicia uma sessão do jogo da forca com prompts melhorados"""
    # Gerar palavra usando GPT baseada no bloco e dificuldade
    palavra_dados = gerar_palavra_forca(bloco, dificuldade)
    
    return {
        'id': sessao_id,
        'tipo': 'forca',
        'usuario_id': usuario_id,
        'bloco': bloco,
        'dificuldade': dificuldade,
        'palavra': palavra_dados['palavra'].upper(),
        'dica': palavra_dados['dica'],
        'categoria': palavra_dados['categoria'],
        'letras_descobertas': ['_'] * len(palavra_dados['palavra']),
        'letras_tentadas': [],
        'tentativas_restantes': 6,
        'status': 'ativo',
        'pontos': 0,
        'inicio': datetime.now().isoformat(),
        'contextos_bloco': get_contextos_bloco(bloco)
    }

def iniciar_jogo_quiz_melhorado(sessao_id, usuario_id, bloco, dificuldade='medio'):
    """Inicia uma sessão do quiz com prompts melhorados"""
    questoes = gerar_questoes_quiz(bloco, 10, dificuldade)
    
    return {
        'id': sessao_id,
        'tipo': 'quiz',
        'usuario_id': usuario_id,
        'bloco': bloco,
        'dificuldade': dificuldade,
        'questoes': questoes,
        'questao_atual': 0,
        'respostas': [],
        'pontos': 0,
        'tempo_inicio': datetime.now().isoformat(),
        'tempo_limite': 300,
        'status': 'ativo',
        'categorias_bloco': get_categorias_bloco(bloco)
    }

def iniciar_jogo_memoria_melhorado(sessao_id, usuario_id, bloco, dificuldade='medio'):
    """Inicia uma sessão do jogo da memória com prompts melhorados"""
    pares = gerar_pares_memoria(bloco, 8, dificuldade)
    
    # Embaralhar as cartas
    cartas = []
    for i, par in enumerate(pares):
        cartas.extend([
            {'id': f'{i}_a', 'conteudo': par['termo'], 'par_id': i, 'tipo': 'termo'},
            {'id': f'{i}_b', 'conteudo': par['definicao'], 'par_id': i, 'tipo': 'definicao'}
        ])
    
    random.shuffle(cartas)
    
    return {
        'id': sessao_id,
        'tipo': 'memoria',
        'usuario_id': usuario_id,
        'bloco': bloco,
        'dificuldade': dificuldade,
        'cartas': cartas,
        'cartas_viradas': [],
        'pares_encontrados': [],
        'tentativas': 0,
        'pontos': 0,
        'tempo_inicio': datetime.now().isoformat(),
        'tempo_limite': 180,
        'status': 'ativo',
        'contextos_bloco': get_contextos_bloco(bloco)
    }

def iniciar_jogo_palavras_cruzadas_melhorado(sessao_id, usuario_id, bloco, dificuldade='medio'):
    """Inicia uma sessão do jogo de palavras cruzadas com prompts melhorados"""
    palavras = gerar_palavras_cruzadas(bloco, 6, dificuldade)
    
    return {
        'id': sessao_id,
        'tipo': 'palavras_cruzadas',
        'usuario_id': usuario_id,
        'bloco': bloco,
        'dificuldade': dificuldade,
        'palavras': palavras,
        'grid': gerar_grid_palavras_cruzadas(palavras),
        'palavras_completadas': [],
        'pontos': 0,
        'tempo_inicio': datetime.now().isoformat(),
        'tempo_limite': 600,
        'status': 'ativo',
        'categorias_bloco': get_categorias_bloco(bloco)
    }

# Funções de processamento de jogadas

def processar_jogada_forca(sessao, jogada):
    """Processa uma jogada do jogo da forca"""
    letra = jogada.get('letra', '').upper()
    
    if not letra or len(letra) != 1:
        return {'erro': 'Letra inválida'}
    
    if letra in sessao['letras_tentadas']:
        return {'erro': 'Letra já tentada'}
    
    sessao['letras_tentadas'].append(letra)
    
    # Verificar se a letra está na palavra
    palavra = sessao['palavra']
    acertou = letra in palavra
    
    if acertou:
        # Revelar letras
        for i, char in enumerate(palavra):
            if char == letra:
                sessao['letras_descobertas'][i] = letra
        
        # Verificar se completou a palavra
        if '_' not in sessao['letras_descobertas']:
            sessao['status'] = 'venceu'
            sessao['pontos'] = JOGOS_CONFIG['forca']['pontos_acerto']
    else:
        sessao['tentativas_restantes'] -= 1
        if sessao['tentativas_restantes'] <= 0:
            sessao['status'] = 'perdeu'
            sessao['pontos'] = JOGOS_CONFIG['forca']['pontos_erro']
    
    return {
        'acertou': acertou,
        'letra': letra,
        'letras_descobertas': sessao['letras_descobertas'],
        'tentativas_restantes': sessao['tentativas_restantes'],
        'status': sessao['status'],
        'pontos': sessao['pontos'],
        'jogo_finalizado': sessao['status'] in ['venceu', 'perdeu'],
        'pontos_finais': sessao['pontos'] if sessao['status'] in ['venceu', 'perdeu'] else 0,
        'sessao_atualizada': sessao
    }

def processar_jogada_quiz(sessao, jogada):
    """Processa uma jogada do quiz"""
    resposta = jogada.get('resposta')
    questao_atual = sessao['questao_atual']
    
    if questao_atual >= len(sessao['questoes']):
        return {'erro': 'Quiz já finalizado'}
    
    questao = sessao['questoes'][questao_atual]
    acertou = resposta == questao['resposta_correta']
    
    pontos_questao = JOGOS_CONFIG['quiz']['pontos_acerto'] if acertou else JOGOS_CONFIG['quiz']['pontos_erro']
    sessao['pontos'] += pontos_questao
    
    sessao['respostas'].append({
        'questao_id': questao['id'],
        'resposta': resposta,
        'correta': acertou,
        'pontos': pontos_questao
    })
    
    sessao['questao_atual'] += 1
    
    # Verificar se terminou o quiz
    jogo_finalizado = sessao['questao_atual'] >= len(sessao['questoes'])
    if jogo_finalizado:
        sessao['status'] = 'finalizado'
    
    return {
        'acertou': acertou,
        'pontos_questao': pontos_questao,
        'pontos_total': sessao['pontos'],
        'questao_atual': sessao['questao_atual'],
        'total_questoes': len(sessao['questoes']),
        'jogo_finalizado': jogo_finalizado,
        'pontos_finais': sessao['pontos'] if jogo_finalizado else 0,
        'sessao_atualizada': sessao
    }

def processar_jogada_memoria(sessao, jogada):
    """Processa uma jogada do jogo da memória"""
    carta_id = jogada.get('carta_id')
    
    if len(sessao['cartas_viradas']) >= 2:
        return {'erro': 'Duas cartas já estão viradas'}
    
    # Encontrar a carta
    carta = next((c for c in sessao['cartas'] if c['id'] == carta_id), None)
    if not carta:
        return {'erro': 'Carta não encontrada'}
    
    sessao['cartas_viradas'].append(carta)
    
    if len(sessao['cartas_viradas']) == 2:
        carta1, carta2 = sessao['cartas_viradas']
        
        if carta1['par_id'] == carta2['par_id']:
            # Par encontrado
            sessao['pares_encontrados'].extend([carta1['id'], carta2['id']])
            sessao['pontos'] += JOGOS_CONFIG['memoria']['pontos_acerto']
            par_encontrado = True
        else:
            # Não é par
            sessao['pontos'] += JOGOS_CONFIG['memoria']['pontos_erro']
            par_encontrado = False
        
        sessao['tentativas'] += 1
        sessao['cartas_viradas'] = []
        
        # Verificar se terminou o jogo
        jogo_finalizado = len(sessao['pares_encontrados']) == len(sessao['cartas'])
        if jogo_finalizado:
            sessao['status'] = 'finalizado'
        
        return {
            'par_encontrado': par_encontrado,
            'cartas_viradas': [carta1, carta2],
            'pontos': sessao['pontos'],
            'tentativas': sessao['tentativas'],
            'jogo_finalizado': jogo_finalizado,
            'pontos_finais': sessao['pontos'] if jogo_finalizado else 0,
            'sessao_atualizada': sessao
        }
    
    return {
        'carta_virada': carta,
        'cartas_viradas': sessao['cartas_viradas'],
        'aguardando_segunda_carta': True,
        'sessao_atualizada': sessao
    }

def processar_jogada_palavras_cruzadas(sessao, jogada):
    """Processa uma jogada do jogo de palavras cruzadas"""
    palavra_id = jogada.get('palavra_id')
    resposta = jogada.get('resposta', '').upper()
    
    # Encontrar a palavra
    palavra = next((p for p in sessao['palavras'] if p['id'] == palavra_id), None)
    if not palavra:
        return {'erro': 'Palavra não encontrada'}
    
    acertou = resposta == palavra['resposta'].upper()
    
    if acertou and palavra_id not in sessao['palavras_completadas']:
        sessao['palavras_completadas'].append(palavra_id)
        sessao['pontos'] += JOGOS_CONFIG['palavras_cruzadas']['pontos_acerto']
    elif not acertou:
        sessao['pontos'] += JOGOS_CONFIG['palavras_cruzadas']['pontos_erro']
    
    # Verificar se terminou o jogo
    jogo_finalizado = len(sessao['palavras_completadas']) == len(sessao['palavras'])
    if jogo_finalizado:
        sessao['status'] = 'finalizado'
    
    return {
        'acertou': acertou,
        'palavra_id': palavra_id,
        'pontos': sessao['pontos'],
        'palavras_completadas': len(sessao['palavras_completadas']),
        'total_palavras': len(sessao['palavras']),
        'jogo_finalizado': jogo_finalizado,
        'pontos_finais': sessao['pontos'] if jogo_finalizado else 0,
        'sessao_atualizada': sessao
    }

# Funções de geração de conteúdo usando GPT

def gerar_palavra_forca(bloco, dificuldade='medio'):
    """Gera uma palavra para o jogo da forca usando GPT com prompts especializados"""
    try:
        # Usa o prompt especializado para forca
        prompt = get_prompt_forca(bloco, dificuldade)
        prompt = ajustar_prompt_por_dificuldade(prompt, dificuldade)
        
        response = chatgpt_service.generate_response(prompt)
        content = json.loads(response)
        
        # Adiciona informação de dificuldade
        content['dificuldade'] = dificuldade
        return content
        
    except Exception as e:
        print(f"Erro ao gerar palavra forca: {e}")
        # Fallback melhorado com mais opções
        palavras_mock = {
            'saude': [
                {'palavra': 'HIPERTENSAO', 'dica': 'Pressão arterial elevada', 'categoria': 'Cardiologia'},
                {'palavra': 'ANTIBIOTICO', 'dica': 'Medicamento contra bactérias', 'categoria': 'Farmacologia'}
            ],
            'educacao': [
                {'palavra': 'CONSTRUTIVISMO', 'dica': 'Teoria de aprendizagem ativa', 'categoria': 'Pedagogia'},
                {'palavra': 'INCLUSAO', 'dica': 'Educação para todos os alunos', 'categoria': 'Políticas'}
            ],
            'direito': [
                {'palavra': 'JURISPRUDENCIA', 'dica': 'Conjunto de decisões judiciais', 'categoria': 'Processual'},
                {'palavra': 'CONSTITUCIONAL', 'dica': 'Relativo à lei fundamental', 'categoria': 'Público'}
            ]
        }
        
        opcoes = palavras_mock.get(bloco.lower(), [
            {'palavra': 'CONSTITUICAO', 'dica': 'Lei fundamental de um país', 'categoria': 'Direito'}
        ])
        
        escolhida = random.choice(opcoes)
        escolhida['dificuldade'] = dificuldade
        return escolhida

def gerar_questoes_quiz(bloco, quantidade, dificuldade='medio'):
    """Gera questões para o quiz usando GPT com prompts especializados"""
    try:
        # Usa o prompt especializado para quiz
        prompt = get_prompt_quiz(bloco, quantidade)
        prompt = ajustar_prompt_por_dificuldade(prompt, dificuldade)
        
        response = chatgpt_service.generate_response(prompt)
        data = json.loads(response)
        
        # Adiciona informação de dificuldade às questões
        questoes = data.get('questoes', [])
        for questao in questoes:
            questao['dificuldade'] = dificuldade
            questao['bloco'] = bloco
            
        return questoes
        
    except Exception as e:
        print(f"Erro ao gerar questões quiz: {e}")
        # Fallback melhorado com questões por bloco
        questoes_mock = {
            'saude': [
                {
                    'id': 'q1',
                    'pergunta': 'Qual é a principal função do Sistema Único de Saúde (SUS)?',
                    'alternativas': {
                        'A': 'Garantir acesso universal à saúde',
                        'B': 'Atender apenas emergências',
                        'C': 'Focar em medicina preventiva',
                        'D': 'Atender apenas a população carente'
                    },
                    'resposta_correta': 'A',
                    'explicacao': 'O SUS garante acesso universal e integral à saúde.',
                    'dificuldade': dificuldade,
                    'bloco': bloco
                }
            ],
            'educacao': [
                {
                    'id': 'q1',
                    'pergunta': 'Qual lei estabelece as diretrizes da educação nacional?',
                    'alternativas': {
                        'A': 'Lei 9.394/96 (LDB)',
                        'B': 'Lei 8.069/90 (ECA)',
                        'C': 'Lei 11.340/06',
                        'D': 'Lei 12.527/11'
                    },
                    'resposta_correta': 'A',
                    'explicacao': 'A LDB estabelece as diretrizes e bases da educação nacional.',
                    'dificuldade': dificuldade,
                    'bloco': bloco
                }
            ]
        }
        
        questoes_bloco = questoes_mock.get(bloco.lower(), [
            {
                'id': 'q1',
                'pergunta': 'Qual é o princípio fundamental da administração pública?',
                'alternativas': {
                    'A': 'Legalidade',
                    'B': 'Moralidade',
                    'C': 'Eficiência',
                    'D': 'Publicidade'
                },
                'resposta_correta': 'A',
                'explicacao': 'O princípio da legalidade é fundamental na administração pública.',
                'dificuldade': dificuldade,
                'bloco': bloco
            }
        ])
        
        return questoes_bloco[:quantidade]

def gerar_pares_memoria(bloco, quantidade, dificuldade='medio'):
    """Gera pares termo-definição para o jogo da memória usando prompts especializados"""
    try:
        # Usa o prompt especializado para memória
        prompt = get_prompt_memoria(bloco, quantidade)
        prompt = ajustar_prompt_por_dificuldade(prompt, dificuldade)
        
        response = chatgpt_service.generate_response(prompt)
        data = json.loads(response)
        
        # Adiciona informação de dificuldade aos pares
        pares = data.get('pares', [])
        for par in pares:
            par['dificuldade'] = dificuldade
            par['bloco'] = bloco
            
        return pares
        
    except Exception as e:
        print(f"Erro ao gerar pares memória: {e}")
        # Fallback melhorado com pares por bloco
        pares_mock = {
            'saude': [
                {'termo': 'SUS', 'definicao': 'Sistema Único de Saúde'},
                {'termo': 'Epidemiologia', 'definicao': 'Estudo de doenças em populações'},
                {'termo': 'Profilaxia', 'definicao': 'Prevenção de doenças'},
                {'termo': 'Anamnese', 'definicao': 'Histórico médico do paciente'}
            ],
            'educacao': [
                {'termo': 'LDB', 'definicao': 'Lei de Diretrizes e Bases'},
                {'termo': 'BNCC', 'definicao': 'Base Nacional Comum Curricular'},
                {'termo': 'Inclusão', 'definicao': 'Educação para todos'},
                {'termo': 'Didática', 'definicao': 'Arte de ensinar'}
            ],
            'direito': [
                {'termo': 'Legalidade', 'definicao': 'Princípio que exige base legal'},
                {'termo': 'Moralidade', 'definicao': 'Princípio ético da administração'},
                {'termo': 'Impessoalidade', 'definicao': 'Tratamento igual a todos'},
                {'termo': 'Publicidade', 'definicao': 'Transparência dos atos'}
            ]
        }
        
        pares_bloco = pares_mock.get(bloco.lower(), [
            {'termo': 'Legalidade', 'definicao': 'Princípio que exige base legal'},
            {'termo': 'Moralidade', 'definicao': 'Princípio ético da administração'}
        ])
        
        # Adiciona metadados aos pares
        for par in pares_bloco:
            par['dificuldade'] = dificuldade
            par['bloco'] = bloco
            
        return pares_bloco[:quantidade]

def gerar_palavras_cruzadas(bloco, quantidade, dificuldade='medio'):
    """Gera palavras para o jogo de palavras cruzadas usando prompts especializados"""
    try:
        # Usa o prompt especializado para palavras cruzadas
        prompt = get_prompt_palavras_cruzadas(bloco, quantidade)
        prompt = ajustar_prompt_por_dificuldade(prompt, dificuldade)
        
        response = chatgpt_service.generate_response(prompt)
        data = json.loads(response)
        
        # Adiciona informação de dificuldade às palavras
        palavras = data.get('palavras', [])
        for palavra in palavras:
            palavra['dificuldade'] = dificuldade
            palavra['bloco'] = bloco
            palavra['tamanho'] = len(palavra['resposta'])
            
        return palavras
        
    except Exception as e:
        print(f"Erro ao gerar palavras cruzadas: {e}")
        # Fallback melhorado com palavras por bloco
        palavras_mock = {
            'saude': [
                {'id': 'p1', 'dica': 'Sistema público de saúde', 'resposta': 'SUS', 'direcao': 'horizontal'},
                {'id': 'p2', 'dica': 'Profissional que cuida de pacientes', 'resposta': 'ENFERMEIRO', 'direcao': 'vertical'},
                {'id': 'p3', 'dica': 'Exame de imagem com raios-X', 'resposta': 'RADIOGRAFIA', 'direcao': 'horizontal'}
            ],
            'educacao': [
                {'id': 'p1', 'dica': 'Lei de Diretrizes e Bases', 'resposta': 'LDB', 'direcao': 'horizontal'},
                {'id': 'p2', 'dica': 'Ciência da educação', 'resposta': 'PEDAGOGIA', 'direcao': 'vertical'},
                {'id': 'p3', 'dica': 'Educação para todos', 'resposta': 'INCLUSAO', 'direcao': 'horizontal'}
            ],
            'direito': [
                {'id': 'p1', 'dica': 'Princípio da administração pública', 'resposta': 'LEGALIDADE', 'direcao': 'horizontal'},
                {'id': 'p2', 'dica': 'Lei fundamental do país', 'resposta': 'CONSTITUICAO', 'direcao': 'vertical'},
                {'id': 'p3', 'dica': 'Conjunto de decisões judiciais', 'resposta': 'JURISPRUDENCIA', 'direcao': 'horizontal'}
            ]
        }
        
        palavras_bloco = palavras_mock.get(bloco.lower(), [
            {'id': 'p1', 'dica': 'Princípio da administração pública', 'resposta': 'LEGALIDADE', 'direcao': 'horizontal'}
        ])
        
        # Adiciona metadados às palavras
        for palavra in palavras_bloco:
            palavra['dificuldade'] = dificuldade
            palavra['bloco'] = bloco
            palavra['tamanho'] = len(palavra['resposta'])
            
        return palavras_bloco[:quantidade]

def gerar_grid_palavras_cruzadas(palavras):
    """Gera o grid para as palavras cruzadas (simplificado)"""
    # Implementação simplificada - em produção seria mais complexa
    grid = [['' for _ in range(15)] for _ in range(15)]
    
    for i, palavra in enumerate(palavras):
        if palavra['direcao'] == 'horizontal':
            row = i * 2 + 1
            col = 1
            for j, letra in enumerate(palavra['resposta']):
                if col + j < 15:
                    grid[row][col + j] = letra
        else:
            row = 1
            col = i * 2 + 1
            for j, letra in enumerate(palavra['resposta']):
                if row + j < 15:
                    grid[row + j][col] = letra
    
    return grid

# Funções de persistência e busca

def obter_plano_usuario(usuario_id):
    """Obtém o plano do usuário"""
    if firebase_config.is_configured():
        try:
            db = firebase_config.get_db()
            
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                return user_data.get('plano', 'trial')
        except:
            pass
    
    return 'trial'  # Padrão

def salvar_sessao_jogo(sessao):
    """Salva a sessão do jogo no Firebase"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            db.collection('jogos_sessoes').document(sessao['id']).set(sessao)
        except Exception as e:
            print(f'Erro ao salvar sessão: {e}')

def buscar_sessao_jogo(sessao_id):
    """Busca uma sessão de jogo no Firebase"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            doc = db.collection('jogos_sessoes').document(sessao_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            print(f'Erro ao buscar sessão: {e}')
    
    return None

def atualizar_sessao_jogo(sessao_id, sessao_atualizada):
    """Atualiza uma sessão de jogo no Firebase"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            db.collection('jogos_sessoes').document(sessao_id).update(sessao_atualizada)
        except Exception as e:
            print(f'Erro ao atualizar sessão: {e}')

def atualizar_pontuacao_usuario(usuario_id, pontos):
    """Atualiza a pontuação do usuário"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                pontos_atuais = user_data.get('pontos_jogos', 0)
                
                user_ref.update({
                    'pontos_jogos': pontos_atuais + pontos,
                    'ultima_atividade_jogos': datetime.now().isoformat()
                })
        except Exception as e:
            print(f'Erro ao atualizar pontuação: {e}')

def obter_ranking_jogos(bloco, limite):
    """Obtém o ranking de jogadores"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            query = db.collection('usuarios')
            if bloco != 'geral':
                query = query.where('bloco', '==', bloco)
            
            docs = query.order_by('pontos_jogos', direction=firestore.Query.DESCENDING).limit(limite).get()
            
            ranking = []
            for i, doc in enumerate(docs):
                data = doc.to_dict()
                ranking.append({
                    'posicao': i + 1,
                    'nome': data.get('nome', 'Usuário'),
                    'pontos': data.get('pontos_jogos', 0),
                    'bloco': data.get('bloco', 'Não informado')
                })
            
            return ranking
        except Exception as e:
            print(f'Erro ao obter ranking: {e}')
    
    return []

def obter_estatisticas_usuario(usuario_id):
    """Obtém estatísticas de jogos do usuário"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            # Buscar dados do usuário
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                
                # Buscar sessões de jogos do usuário
                sessoes_query = db.collection('jogos_sessoes').where('usuario_id', '==', usuario_id)
                sessoes_docs = sessoes_query.get()
                
                stats = {
                    'pontos_total': user_data.get('pontos_jogos', 0),
                    'jogos_jogados': len(sessoes_docs),
                    'jogos_por_tipo': {},
                    'ultima_atividade': user_data.get('ultima_atividade_jogos')
                }
                
                for doc in sessoes_docs:
                    sessao = doc.to_dict()
                    tipo = sessao.get('tipo', 'desconhecido')
                    
                    if tipo not in stats['jogos_por_tipo']:
                        stats['jogos_por_tipo'][tipo] = {
                            'total': 0,
                            'vitorias': 0,
                            'pontos': 0
                        }
                    
                    stats['jogos_por_tipo'][tipo]['total'] += 1
                    
                    if sessao.get('status') == 'venceu' or sessao.get('status') == 'finalizado':
                        stats['jogos_por_tipo'][tipo]['vitorias'] += 1
                    
                    stats['jogos_por_tipo'][tipo]['pontos'] += sessao.get('pontos', 0)
                
                return stats
        except Exception as e:
            print(f'Erro ao obter estatísticas: {e}')
    
    return {
        'pontos_total': 0,
        'jogos_jogados': 0,
        'jogos_por_tipo': {},
        'ultima_atividade': None
    }

# Rotas para validação e dicas com GPT
@jogos_bp.route('/validar-resposta', methods=['POST'])
def validar_resposta_gpt():
    """Valida resposta do usuário usando GPT para feedback personalizado"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        pergunta = data.get('pergunta')
        resposta_usuario = data.get('resposta_usuario')
        resposta_correta = data.get('resposta_correta')
        
        if not all([session_id, pergunta, resposta_usuario, resposta_correta]):
            return jsonify({'erro': 'Dados incompletos'}), 400
            
        # Busca sessão do jogo
        sessao = obter_sessao_jogo(session_id)
        if not sessao:
            return jsonify({'erro': 'Sessão não encontrada'}), 404
            
        # Gera validação usando GPT
        prompt = get_prompt_validacao_resposta(pergunta, resposta_usuario, resposta_correta)
        
        try:
            response = chatgpt_service.generate_response(prompt)
            validacao = json.loads(response)
        except:
            # Fallback para validação simples
            if resposta_usuario.lower().strip() == resposta_correta.lower().strip():
                validacao = {
                    'avaliacao': 'CORRETA',
                    'pontos': 10,
                    'feedback': 'Resposta correta! Parabéns!',
                    'dica_melhoria': None
                }
            else:
                validacao = {
                    'avaliacao': 'INCORRETA',
                    'pontos': 0,
                    'feedback': f'Resposta incorreta. A resposta correta é: {resposta_correta}',
                    'dica_melhoria': 'Revise o conteúdo relacionado a este tema.'
                }
        
        # Atualiza sessão com a validação
        if 'historico_jogadas' not in sessao:
            sessao['historico_jogadas'] = []
            
        sessao['historico_jogadas'].append({
            'pergunta': pergunta,
            'resposta_usuario': resposta_usuario,
            'resposta_correta': resposta_correta,
            'validacao': validacao,
            'timestamp': datetime.now().isoformat()
        })
        
        salvar_sessao_jogo(session_id, sessao)
        
        return jsonify({
            'validacao': validacao,
            'sucesso': True
        })
        
    except Exception as e:
        print(f"Erro ao validar resposta: {e}")
        return jsonify({'erro': str(e)}), 500

@jogos_bp.route('/dica', methods=['POST'])
def obter_dica_gpt():
    """Obtém dica contextual usando GPT"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        contexto = data.get('contexto', '')
        
        if not session_id:
            return jsonify({'erro': 'session_id é obrigatório'}), 400
            
        # Busca sessão do jogo
        sessao = obter_sessao_jogo(session_id)
        if not sessao:
            return jsonify({'erro': 'Sessão não encontrada'}), 404
            
        tipo_jogo = sessao.get('tipo')
        bloco = sessao.get('bloco')
        
        # Gera dica usando GPT
        prompt = get_prompt_dica_jogo(tipo_jogo, contexto, bloco)
        
        try:
            response = chatgpt_service.generate_response(prompt)
            dica_data = json.loads(response)
        except:
            # Fallback para dica genérica
            dica_data = {
                'dica': 'Pense nos conceitos fundamentais relacionados ao tema.',
                'tipo': 'conceitual',
                'custo_pontos': 5
            }
        
        # Verifica se o usuário tem pontos suficientes
        pontos_atuais = sessao.get('pontos', 0)
        custo = dica_data.get('custo_pontos', 5)
        
        if pontos_atuais < custo:
            return jsonify({
                'erro': 'Pontos insuficientes para obter dica',
                'pontos_necessarios': custo,
                'pontos_atuais': pontos_atuais
            }), 400
            
        # Deduz pontos e salva dica
        sessao['pontos'] -= custo
        sessao['dicas_usadas'] = sessao.get('dicas_usadas', 0) + 1
        
        salvar_sessao_jogo(session_id, sessao)
        
        return jsonify({
            'dica': dica_data,
            'pontos_restantes': sessao['pontos'],
            'sucesso': True
        })
        
    except Exception as e:
        print(f"Erro ao obter dica: {e}")
        return jsonify({'erro': str(e)}), 500

@jogos_bp.route('/feedback-sessao', methods=['POST'])
def obter_feedback_sessao():
    """Obtém feedback personalizado ao final da sessão usando GPT"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'erro': 'session_id é obrigatório'}), 400
            
        # Busca sessão do jogo
        sessao = obter_sessao_jogo(session_id)
        if not sessao:
            return jsonify({'erro': 'Sessão não encontrada'}), 404
            
        tipo_jogo = sessao.get('tipo')
        pontos = sessao.get('pontos', 0)
        
        # Calcula estatísticas da sessão
        historico = sessao.get('historico_jogadas', [])
        acertos = len([j for j in historico if j.get('validacao', {}).get('avaliacao') == 'CORRETA'])
        total = len(historico)
        
        inicio = datetime.fromisoformat(sessao.get('inicio', datetime.now().isoformat()))
        tempo_gasto = int((datetime.now() - inicio).total_seconds())
        
        # Gera feedback usando GPT
        prompt = get_prompt_feedback_sessao(tipo_jogo, pontos, acertos, total, tempo_gasto)
        
        try:
            response = chatgpt_service.generate_response(prompt)
            feedback_data = json.loads(response)
        except:
            # Fallback para feedback genérico
            if acertos / max(total, 1) >= 0.8:
                nivel = 'excelente'
                mensagem = 'Excelente desempenho!'
            elif acertos / max(total, 1) >= 0.6:
                nivel = 'bom'
                mensagem = 'Bom desempenho!'
            else:
                nivel = 'precisa_melhorar'
                mensagem = 'Continue praticando!'
                
            feedback_data = {
                'feedback': mensagem,
                'pontos_fortes': ['Participação ativa'],
                'areas_melhoria': ['Continue estudando'],
                'proximos_passos': 'Pratique mais jogos para melhorar',
                'nivel_desempenho': nivel
            }
        
        # Salva feedback na sessão
        sessao['feedback_final'] = feedback_data
        sessao['status'] = 'finalizado'
        salvar_sessao_jogo(session_id, sessao)
        
        return jsonify({
            'feedback': feedback_data,
            'estatisticas': {
                'pontos': pontos,
                'acertos': acertos,
                'total': total,
                'tempo_gasto': tempo_gasto,
                'percentual_acerto': round((acertos / max(total, 1)) * 100, 1)
            },
            'sucesso': True
        })
        
    except Exception as e:
        print(f"Erro ao obter feedback: {e}")
        return jsonify({'erro': str(e)}), 500

# Sistema de roleta para economizar questões
@jogos_bp.route('/roleta', methods=['POST'])
def sistema_roleta():
    """Sistema de roleta para economizar questões - usuário pode ganhar tentativas extras"""
    try:
        data = request.get_json()
        usuario_id = data.get('usuario_id')
        
        if not usuario_id:
            return jsonify({'erro': 'ID do usuário é obrigatório'}), 400
        
        # Verificar se o usuário pode usar a roleta (limite diário)
        pode_usar = verificar_limite_roleta(usuario_id)
        if not pode_usar:
            return jsonify({
                'erro': 'Limite diário de roleta atingido',
                'proximo_uso': 'amanhã'
            }), 429
        
        # Definir prêmios da roleta
        premios = [
            {'tipo': 'tentativas_extra', 'valor': 3, 'probabilidade': 30, 'descricao': '3 tentativas extras'},
            {'tipo': 'tentativas_extra', 'valor': 5, 'probabilidade': 20, 'descricao': '5 tentativas extras'},
            {'tipo': 'pontos_bonus', 'valor': 50, 'probabilidade': 25, 'descricao': '50 pontos bônus'},
            {'tipo': 'pontos_bonus', 'valor': 100, 'probabilidade': 15, 'descricao': '100 pontos bônus'},
            {'tipo': 'jogo_gratis', 'valor': 1, 'probabilidade': 8, 'descricao': '1 jogo premium grátis'},
            {'tipo': 'sem_premio', 'valor': 0, 'probabilidade': 2, 'descricao': 'Tente novamente amanhã'}
        ]
        
        # Sortear prêmio
        premio_sorteado = sortear_premio_roleta(premios)
        
        # Aplicar prêmio
        aplicar_premio_roleta(usuario_id, premio_sorteado)
        
        # Registrar uso da roleta
        registrar_uso_roleta(usuario_id)
        
        descricao_premio = premio_sorteado.get('descricao', premio_sorteado.get('tipo', 'prêmio'))
        return jsonify({
            'premio': premio_sorteado,
            'sucesso': True,
            'mensagem': f'Parabéns! Você ganhou: {descricao_premio}'
        })
    
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

def verificar_limite_roleta(usuario_id):
    """Verifica se o usuário pode usar a roleta hoje"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            hoje = datetime.now().date().isoformat()
            
            doc = db.collection('roleta_usos').document(f'{usuario_id}_{hoje}').get()
            
            if doc.exists:
                data = doc.to_dict()
                return data.get('usos', 0) < 3  # Máximo 3 usos por dia
            
            return True
        except:
            pass
    
    return True

def sortear_premio_roleta(premios):
    """Sorteia um prêmio baseado nas probabilidades"""
    total_probabilidade = sum(p['probabilidade'] for p in premios)
    sorteio = random.randint(1, total_probabilidade)
    
    acumulado = 0
    for premio in premios:
        acumulado += premio['probabilidade']
        if sorteio <= acumulado:
            return premio
    
    return premios[-1]  # Fallback

def aplicar_premio_roleta(usuario_id, premio):
    """Aplica o prêmio sorteado ao usuário"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                updates = {}
                
                if premio['tipo'] == 'tentativas_extra':
                    user_data = user_doc.to_dict()
                    tentativas_atuais = user_data.get('tentativas_extra_jogos', 0)
                    updates['tentativas_extra_jogos'] = tentativas_atuais + premio['valor']
                
                elif premio['tipo'] == 'pontos_bonus':
                    user_data = user_doc.to_dict()
                    pontos_atuais = user_data.get('pontos_jogos', 0)
                    updates['pontos_jogos'] = pontos_atuais + premio['valor']
                
                elif premio['tipo'] == 'jogo_gratis':
                    user_data = user_doc.to_dict()
                    jogos_gratis = user_data.get('jogos_premium_gratis', 0)
                    updates['jogos_premium_gratis'] = jogos_gratis + premio['valor']
                
                if updates:
                    user_ref.update(updates)
        except Exception as e:
            print(f'Erro ao aplicar prêmio: {e}')

def registrar_uso_roleta(usuario_id):
    """Registra o uso da roleta pelo usuário"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            hoje = datetime.now().date().isoformat()
            doc_id = f'{usuario_id}_{hoje}'
            
            doc_ref = db.collection('roleta_usos').document(doc_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                usos_atuais = data.get('usos', 0)
                doc_ref.update({'usos': usos_atuais + 1})
            else:
                doc_ref.set({
                    'usuario_id': usuario_id,
                    'data': hoje,
                    'usos': 1
                })
        except Exception as e:
            print(f'Erro ao registrar uso da roleta: {e}')