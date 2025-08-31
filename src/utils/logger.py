import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from functools import wraps
import traceback
import os

class StructuredLogger:
    """
    Logger estruturado para facilitar debugging e monitoramento
    
    Fornece logging em formato JSON com contexto adicional,
    níveis de log configuráveis e integração com sistemas de monitoramento.
    """
    
    def __init__(self, name: str = __name__, level: str = None):
        self.logger = logging.getLogger(name)
        
        # Configurar nível baseado no ambiente
        log_level = level or os.getenv('LOG_LEVEL', 'INFO').upper()
        self.logger.setLevel(getattr(logging, log_level, logging.INFO))
        
        # Evitar duplicação de handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Configurar handlers de logging"""
        # Handler para console
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        
        # Formatter estruturado
        formatter = StructuredFormatter()
        console_handler.setFormatter(formatter)
        
        self.logger.addHandler(console_handler)
        
        # Handler para arquivo (se especificado)
        log_file = os.getenv('LOG_FILE')
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setLevel(logging.INFO)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def _create_log_entry(self, level: str, message: str, **kwargs) -> Dict[str, Any]:
        """Criar entrada de log estruturada"""
        entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': level,
            'message': message,
            'service': 'gabarita-ai-backend',
            'environment': os.getenv('FLASK_ENV', 'development')
        }
        
        # Adicionar contexto extra
        if kwargs:
            entry['context'] = kwargs
            
        return entry
    
    def debug(self, message: str, **kwargs):
        """Log de debug"""
        entry = self._create_log_entry('DEBUG', message, **kwargs)
        self.logger.debug(json.dumps(entry, ensure_ascii=False))
    
    def info(self, message: str, **kwargs):
        """Log informativo"""
        entry = self._create_log_entry('INFO', message, **kwargs)
        self.logger.info(json.dumps(entry, ensure_ascii=False))
    
    def warning(self, message: str, **kwargs):
        """Log de aviso"""
        entry = self._create_log_entry('WARNING', message, **kwargs)
        self.logger.warning(json.dumps(entry, ensure_ascii=False))
    
    def error(self, message: str, error: Exception = None, **kwargs):
        """Log de erro"""
        entry = self._create_log_entry('ERROR', message, **kwargs)
        
        if error:
            entry['error'] = {
                'type': type(error).__name__,
                'message': str(error),
                'traceback': traceback.format_exc()
            }
        
        self.logger.error(json.dumps(entry, ensure_ascii=False))
    
    def critical(self, message: str, error: Exception = None, **kwargs):
        """Log crítico"""
        entry = self._create_log_entry('CRITICAL', message, **kwargs)
        
        if error:
            entry['error'] = {
                'type': type(error).__name__,
                'message': str(error),
                'traceback': traceback.format_exc()
            }
        
        self.logger.critical(json.dumps(entry, ensure_ascii=False))

class StructuredFormatter(logging.Formatter):
    """Formatter personalizado para logs estruturados"""
    
    def format(self, record):
        # Se a mensagem já é JSON, retornar como está
        try:
            json.loads(record.getMessage())
            return record.getMessage()
        except (json.JSONDecodeError, ValueError):
            # Se não é JSON, criar estrutura básica
            entry = {
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'level': record.levelname,
                'message': record.getMessage(),
                'service': 'gabarita-ai-backend',
                'logger': record.name
            }
            return json.dumps(entry, ensure_ascii=False)

def log_request(logger: StructuredLogger):
    """Decorator para logging de requisições HTTP"""
    def request_decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            from flask import request, g
            
            # Log da requisição
            request_data = {
                'method': request.method,
                'path': request.path,
                'remote_addr': request.remote_addr,
                'user_agent': request.headers.get('User-Agent', ''),
                'content_length': request.content_length
            }
            
            # Adicionar user_id se disponível
            if hasattr(g, 'user_id'):
                request_data['user_id'] = g.user_id
            
            logger.info(f"Requisição recebida: {func.__name__}", **request_data)
            
            try:
                # Executar função
                start_time = datetime.utcnow()
                result = func(*args, **kwargs)
                end_time = datetime.utcnow()
                
                # Log da resposta
                duration_ms = (end_time - start_time).total_seconds() * 1000
                
                response_data = {
                    'duration_ms': round(duration_ms, 2),
                    'status': 'success'
                }
                
                logger.info(f"Requisição processada: {func.__name__}", **response_data)
                
                return result
                
            except Exception as e:
                # Log do erro
                error_data = {
                    'function': func.__name__,
                    'error_type': type(e).__name__
                }
                
                logger.error(f"Erro ao processar requisição: {func.__name__}", error=e, **error_data)
                raise
        
        return wrapper
    return request_decorator

def log_database_operation(logger: StructuredLogger, operation: str):
    """Decorator para logging de operações de banco de dados"""
    def db_decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = datetime.utcnow()
            
            logger.debug(f"Iniciando operação de BD: {operation}", function=func.__name__)
            
            try:
                result = func(*args, **kwargs)
                end_time = datetime.utcnow()
                duration_ms = (end_time - start_time).total_seconds() * 1000
                
                logger.debug(
                    f"Operação de BD concluída: {operation}",
                    function=func.__name__,
                    duration_ms=round(duration_ms, 2)
                )
                
                return result
                
            except Exception as e:
                logger.error(
                    f"Erro na operação de BD: {operation}",
                    error=e,
                    function=func.__name__
                )
                raise
        
        return wrapper
    return db_decorator

def log_external_api_call(logger: StructuredLogger, service: str):
    """Decorator para logging de chamadas para APIs externas"""
    def api_decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = datetime.utcnow()
            
            logger.info(f"Chamada para API externa: {service}", function=func.__name__)
            
            try:
                result = func(*args, **kwargs)
                end_time = datetime.utcnow()
                duration_ms = (end_time - start_time).total_seconds() * 1000
                
                logger.info(
                    f"API externa respondeu: {service}",
                    function=func.__name__,
                    duration_ms=round(duration_ms, 2),
                    status='success'
                )
                
                return result
                
            except Exception as e:
                logger.error(
                    f"Erro na API externa: {service}",
                    error=e,
                    function=func.__name__
                )
                raise
        
        return wrapper
    return api_decorator

# Instância global do logger
app_logger = StructuredLogger('gabarita-ai')

# Funções de conveniência
def debug(message: str, **kwargs):
    app_logger.debug(message, **kwargs)

def info(message: str, **kwargs):
    app_logger.info(message, **kwargs)

def warning(message: str, **kwargs):
    app_logger.warning(message, **kwargs)

def error(message: str, error_obj: Exception = None, **kwargs):
    app_logger.error(message, error=error_obj, **kwargs)

def critical(message: str, error_obj: Exception = None, **kwargs):
    app_logger.critical(message, error=error_obj, **kwargs)

# Configuração de logging para desenvolvimento
def setup_development_logging():
    """Configurar logging para ambiente de desenvolvimento"""
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Reduzir verbosidade de bibliotecas externas
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)
    logging.getLogger('werkzeug').setLevel(logging.WARNING)

# Configuração de logging para produção
def setup_production_logging():
    """Configurar logging para ambiente de produção"""
    # Em produção, usar apenas logs estruturados
    root_logger = logging.getLogger()
    
    # Remover handlers existentes
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Configurar apenas handler estruturado
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)

# Auto-configuração baseada no ambiente
if os.getenv('FLASK_ENV') == 'development':
    setup_development_logging()
else:
    setup_production_logging()