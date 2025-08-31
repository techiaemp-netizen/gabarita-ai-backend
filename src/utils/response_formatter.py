from flask import jsonify
from typing import Any, Optional, Union

class ResponseFormatter:
    """
    Classe utilitária para padronizar respostas da API
    Formato padrão: {"success": boolean, "data": any, "message": string, "error": string}
    """
    
    @staticmethod
    def success(data: Any = None, message: str = "") -> tuple:
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
            "message": message,
            "error": ""
        }
        return jsonify(response), 200
    
    @staticmethod
    def error(error_message: str, status_code: int = 500, data: Any = None) -> tuple:
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
            "message": "",
            "error": error_message
        }
        return jsonify(response), status_code
    
    @staticmethod
    def not_found(message: str = "Recurso não encontrado") -> tuple:
        """
        Retorna uma resposta 404 padronizada
        """
        return ResponseFormatter.error(message, 404)
    
    @staticmethod
    def unauthorized(message: str = "Não autorizado") -> tuple:
        """
        Retorna uma resposta 401 padronizada
        """
        return ResponseFormatter.error(message, 401)
    
    @staticmethod
    def bad_request(message: str = "Requisição inválida") -> tuple:
        """
        Retorna uma resposta 400 padronizada
        """
        return ResponseFormatter.error(message, 400)
    
    @staticmethod
    def internal_error(message: str = "Erro interno do servidor") -> tuple:
        """
        Retorna uma resposta 500 padronizada
        """
        return ResponseFormatter.error(message, 500)
    
    @staticmethod
    def conflict(message: str = "Conflito de dados") -> tuple:
        """
        Retorna uma resposta 409 padronizada
        """
        return ResponseFormatter.error(message, 409)
    
    @staticmethod
    def created(data: Any = None, message: str = "Recurso criado com sucesso") -> tuple:
        """
        Retorna uma resposta 201 padronizada
        """
        response = {
            "success": True,
            "data": data,
            "message": message,
            "error": ""
        }
        return jsonify(response), 201

# Funções de conveniência para compatibilidade com código existente
def success_response(data: Any = None, message: str = "") -> tuple:
    """Função de conveniência para resposta de sucesso"""
    return ResponseFormatter.success(data, message)

def error_response(error_message: str, status_code: int = 500, data: Any = None) -> tuple:
    """Função de conveniência para resposta de erro"""
    return ResponseFormatter.error(error_message, status_code, data)