from flask import Blueprint, jsonify, request
from src.services.news_service import news_service

news_bp = Blueprint('news', __name__)

@news_bp.route('/news', methods=['GET'])
def get_news():
    """Retorna lista de notícias dinâmicas"""
    try:
        # Parâmetros de filtro opcionais
        category = request.args.get('category')
        limit = request.args.get('limit', 10, type=int)
        
        # Buscar notícias através do serviço
        noticias = news_service.listar_noticias(category=category, limit=limit)
        
        return jsonify({
            'success': True,
            'data': noticias,
            'total': len(noticias),
            'source_type': 'dynamic',
            'updated_at': noticias[0]['updated_at'] if noticias else None
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar notícias: {str(e)}'
        }), 500

@news_bp.route('/news/<news_id>', methods=['GET'])
def get_news_by_id(news_id):
    """Retorna uma notícia específica pelo ID"""
    try:
        news_item = news_service.obter_noticia_por_id(news_id)
        
        if not news_item:
            return jsonify({
                'success': False,
                'error': 'Notícia não encontrada'
            }), 404
        
        return jsonify({
            'success': True,
            'data': news_item,
            'source_type': 'dynamic'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar notícia: {str(e)}'
        }), 500

@news_bp.route('/news/categories', methods=['GET'])
def get_news_categories():
    """Retorna lista de categorias disponíveis"""
    try:
        categories = news_service.listar_categorias()
        
        return jsonify({
            'success': True,
            'data': categories,
            'source_type': 'dynamic'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar categorias: {str(e)}'
        }), 500