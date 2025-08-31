"""
Rotas para sistema de jogos educativos
"""
from flask import Blueprint, request
from services.chatgpt_service import chatgpt_service
from config.firebase_config import firebase_config
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request
from datetime import datetime, timedelta
import uuid
import random
import json
from typing import Dict, List, Any

# Importações dos prompts especializados
try:
    from services.prompts_jogos import (
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

# Inicializar logger estruturado
logger = StructuredLogger('jogos')

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
@log_request(logger)
def listar_jogos():
    """Lista todos os jogos disponíveis para o usuário"""
    logger.info("Iniciando listagem de jogos")
    try:
        usuario_id = request.args.get('usuario_id')
        if not usuario_id:
            logger.warning("ID do usuário não fornecido")
            return ResponseFormatter.bad_request('ID do usuário é obrigatório')
        
        logger.info("Buscando plano do usuário", extra={'usuario_id': usuario_id})
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
        
        logger.info("Jogos listados com sucesso", extra={
            'usuario_id': usuario_id,
            'plano_usuario': plano_usuario,
            'total_jogos': len(jogos_disponiveis),
            'jogos_disponiveis': len([j for j in jogos_disponiveis if j['disponivel']])
        })
        
        return ResponseFormatter.success({
            'jogos': jogos_disponiveis,
            'plano_atual': plano_usuario
        }, 'Jogos listados com sucesso')
    
    except Exception as e:
        logger.error("Erro ao listar jogos", extra={'error': str(e)})
        return ResponseFormatter.internal_error('Erro ao listar jogos', str(e))

# Funções auxiliares simplificadas para evitar arquivo muito longo
def obter_plano_usuario(usuario_id):
    """Obtém o plano do usuário"""
    logger.info("Iniciando obtenção do plano do usuário", extra={'usuario_id': usuario_id})
    
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            logger.info("Buscando usuário no Firestore", extra={'usuario_id': usuario_id})
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                plano = user_data.get('plano', 'trial')
                logger.info("Plano do usuário obtido com sucesso", extra={
                    'usuario_id': usuario_id,
                    'plano': plano
                })
                return plano
            else:
                logger.warning("Usuário não encontrado no Firestore", extra={'usuario_id': usuario_id})
        except Exception as e:
            logger.error("Erro ao buscar plano do usuário no Firebase", extra={
                'usuario_id': usuario_id,
                'error': str(e)
            })
    else:
        logger.warning("Firebase não configurado, usando plano padrão")
    
    logger.info("Retornando plano padrão 'trial'", extra={'usuario_id': usuario_id})
    return 'trial'  # Padrão

# Outras funções auxiliares seriam implementadas aqui...
# (Mantendo o arquivo menor para o deploy inicial)
