from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
from utils.logger import log_request, app_logger as logger
from utils.response_formatter import ResponseFormatter

# Criar blueprint para simulados
simulados_bp = Blueprint('simulados', __name__)

@simulados_bp.route('/enviar', methods=['POST'])
@log_request(logger)
def enviar_simulado():
    print("📊 Requisição recebida para submissão de simulado")
    sys.stdout.flush()
    
    data = request.get_json()
    usuario_id = data.get('usuario_id', 'user-default')
    respostas = data.get('respostas', [])
    tempo_gasto = data.get('tempo_gasto', 0)
    
    print(f"👤 Usuario ID: {usuario_id}")
    print(f"📝 Respostas: {len(respostas)} questões")
    print(f"⏱️ Tempo gasto: {tempo_gasto} segundos")
    sys.stdout.flush()
    
    # Calcular pontuação (simulação)
    total_questoes = len(respostas)
    acertos = sum(1 for r in respostas if r.get('correto', False))
    percentual = (acertos / total_questoes * 100) if total_questoes > 0 else 0
    
    resultado = {
        'id': f'sim-{usuario_id}-{datetime.now().strftime("%Y%m%d%H%M%S")}',
        'usuario_id': usuario_id,
        'total_questoes': total_questoes,
        'acertos': acertos,
        'erros': total_questoes - acertos,
        'percentual': round(percentual, 2),
        'tempo_gasto': tempo_gasto,
        'data_realizacao': datetime.now().isoformat(),
        'status': 'concluido'
    }
    
    print(f"✅ Simulado processado: {acertos}/{total_questoes} ({percentual:.1f}%)")
    sys.stdout.flush()
    
    return ResponseFormatter.success({
        'resultado': resultado,
        'mensagem': f'Simulado concluído! Você acertou {acertos} de {total_questoes} questões ({percentual:.1f}%)'
    })