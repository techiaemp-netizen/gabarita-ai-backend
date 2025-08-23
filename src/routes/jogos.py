"""
Rotas para sistema de jogos educativos
"""
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
            return jsonify({'erro': 'ID do usuário é obrigatório'}), 400
        
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

# Funções auxiliares simplificadas para evitar arquivo muito longo
def obter_plano_usuario(usuario_id):
    """Obtém o plano do usuário"""
    if firebase_config.is_configured():
        try:
            from firebase_admin import firestore
            db = firestore.client()
            
            user_ref = db.collection('usuarios').document(usuario_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                return user_data.get('plano', 'trial')
        except:
            pass
    
    return 'trial'  # Padrão

# Outras funções auxiliares seriam implementadas aqui...
# (Mantendo o arquivo menor para o deploy inicial)