from flask import jsonify
from typing import Any, Optional, Dict

def ok(data: Any = None, message: str = "") -> tuple:
    """
    Retorna uma resposta de sucesso padronizada
    
    Args:
        data: Dados a serem retornados
        message: Mensagem de sucesso opcional
        
    Returns:
        tuple: (jsonify response, status_code)
    """
    response = {
        "success": True,
        "data": data,
        "error": None
    }
    
    if message:
        response["message"] = message
        
    return jsonify(response), 200

def fail(error_message: str, status_code: int = 400, data: Any = None) -> tuple:
    """
    Retorna uma resposta de erro padronizada
    
    Args:
        error_message: Mensagem de erro
        status_code: Código de status HTTP
        data: Dados adicionais opcionais
        
    Returns:
        tuple: (jsonify response, status_code)
    """
    response = {
        "success": False,
        "data": data,
        "error": error_message
    }
    
    return jsonify(response), status_code

def created(data: Any = None, message: str = "") -> tuple:
    """
    Retorna uma resposta de criação bem-sucedida
    
    Args:
        data: Dados criados
        message: Mensagem de sucesso opcional
        
    Returns:
        tuple: (jsonify response, status_code)
    """
    response = {
        "success": True,
        "data": data,
        "error": None
    }
    
    if message:
        response["message"] = message
        
    return jsonify(response), 201

def not_found(message: str = "Resource not found") -> tuple:
    """
    Retorna uma resposta de recurso não encontrado
    
    Args:
        message: Mensagem de erro personalizada
        
    Returns:
        tuple: (jsonify response, status_code)
    """
    return fail(message, 404)

def unauthorized(message: str = "Unauthorized") -> tuple:
    """
    Retorna uma resposta de não autorizado
    
    Args:
        message: Mensagem de erro personalizada
        
    Returns:
        tuple: (jsonify response, status_code)
    """
    return fail(message, 401)

def forbidden(message: str = "Forbidden") -> tuple:
    """
    Retorna uma resposta de acesso proibido
    
    Args:
        message: Mensagem de erro personalizada
        
    Returns:
        tuple: (jsonify response, status_code)
    """
    return fail(message, 403)

def internal_error(message: str = "Internal server error") -> tuple:
    """
    Retorna uma resposta de erro interno do servidor
    
    Args:
        message: Mensagem de erro personalizada
        
    Returns:
        tuple: (jsonify response, status_code)
    """
    return fail(message, 500)