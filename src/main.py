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
from routes.simulados import simulados_bp
from routes.performance import performance_bp
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

# Logging básico para todas as requisições
@app.before_request
def log_request_info():
    """Log informações da requisição antes do processamento"""
    logger.info("Request received", extra={
        'method': request.method,
        'url': request.url,
        'remote_addr': request.remote_addr,
        'user_agent': request.headers.get('User-Agent', 'Unknown')
    })

@app.after_request
def log_response_info(response):
    """Log informações da resposta após o processamento"""
    logger.info("Response sent", extra={
        'status_code': response.status_code,
        'method': request.method,
        'url': request.url
    })
    return response

# Registrar blueprints com prefixo /api padronizado
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(questoes_bp, url_prefix='/api/questoes')
app.register_blueprint(planos_bp, url_prefix='/api/planos')
app.register_blueprint(jogos_bp, url_prefix='/api/jogos')
app.register_blueprint(news_bp, url_prefix='/api/noticias')
app.register_blueprint(opcoes_bp, url_prefix='/api/opcoes')
app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
app.register_blueprint(payments_bp, url_prefix='/api/payments')
app.register_blueprint(simulados_bp, url_prefix='/api/simulados')
app.register_blueprint(performance_bp, url_prefix='/api')

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

@app.route('/api/health', methods=['GET'])
@log_request(logger)
def api_health_check():
    """Endpoint de verificação de saúde da API com prefixo /api"""
    logger.info("API health check endpoint accessed")
    return ResponseFormatter.success({
        'status': 'healthy',
        'timestamp': str(datetime.now()),
        'version': '1.0.0'
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





if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
