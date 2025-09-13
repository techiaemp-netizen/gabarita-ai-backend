from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random

news_bp = Blueprint('news', __name__)

# Mock data para notícias
MOCK_NEWS = [
    {
        'id': 'news_1',
        'title': 'CNU 2025: Novas datas divulgadas para o Concurso Nacional Unificado',
        'summary': 'Ministério da Gestão anuncia cronograma atualizado com provas previstas para o segundo semestre',
        'content': 'O Ministério da Gestão e da Inovação em Serviços Públicos (MGI) divulgou o novo cronograma do Concurso Nacional Unificado (CNU) 2025. As provas estão previstas para acontecer no segundo semestre do ano, com inscrições abertas a partir de março. O concurso oferecerá mais de 6.000 vagas em diversos órgãos federais.',
        'source': 'Portal do Governo Federal',
        'publishedAt': (datetime.now() - timedelta(hours=2)).isoformat(),
        'category': 'Concursos',
        'imageUrl': None
    },
    {
        'id': 'news_2',
        'title': 'ENEM 2025: Cronograma e principais mudanças anunciadas',
        'summary': 'INEP apresenta calendário oficial e novidades para a edição deste ano do exame',
        'content': 'O Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (INEP) anunciou o cronograma oficial do ENEM 2025. Entre as principais mudanças estão a ampliação do prazo de inscrições e melhorias no sistema de correção das redações. As provas serão aplicadas nos dias 2 e 9 de novembro.',
        'source': 'INEP',
        'publishedAt': (datetime.now() - timedelta(hours=5)).isoformat(),
        'category': 'Vestibular',
        'imageUrl': None
    },
    {
        'id': 'news_3',
        'title': 'Concurso Banco do Brasil: Edital com 4.000 vagas deve sair em breve',
        'summary': 'Fontes indicam que novo concurso do BB está em fase final de preparação',
        'content': 'Segundo informações de bastidores, o Banco do Brasil está finalizando os preparativos para lançar um novo concurso público com aproximadamente 4.000 vagas para diversos cargos. O edital deve ser publicado ainda no primeiro trimestre de 2025, com provas previstas para o meio do ano.',
        'source': 'Folha Dirigida',
        'publishedAt': (datetime.now() - timedelta(hours=8)).isoformat(),
        'category': 'Concursos',
        'imageUrl': None
    },
    {
        'id': 'news_4',
        'title': 'Dicas de Estudo: Como otimizar sua preparação para concursos',
        'summary': 'Especialistas compartilham estratégias eficazes para maximizar o aprendizado',
        'content': 'Professores e coaches especializados em concursos públicos revelam as melhores técnicas de estudo para 2025. Entre as dicas estão o uso de mapas mentais, técnicas de memorização ativa e a importância de simulados regulares. A organização do tempo e o equilíbrio entre disciplinas também são fundamentais.',
        'source': 'Gabarita AI',
        'publishedAt': (datetime.now() - timedelta(hours=12)).isoformat(),
        'category': 'Dicas',
        'imageUrl': None
    },
    {
        'id': 'news_5',
        'title': 'Concurso INSS: Expectativa de novo edital cresce entre candidatos',
        'summary': 'Déficit de servidores pode motivar abertura de concurso ainda em 2025',
        'content': 'O Instituto Nacional do Seguro Social (INSS) enfrenta um déficit significativo de servidores, o que aumenta as expectativas para a abertura de um novo concurso público. Especialistas estimam que podem ser oferecidas entre 1.000 e 2.000 vagas para técnico e analista do seguro social.',
        'source': 'JC Concursos',
        'publishedAt': (datetime.now() - timedelta(days=1)).isoformat(),
        'category': 'Concursos',
        'imageUrl': None
    }
]

@news_bp.route('/news', methods=['GET'])
def get_news():
    """Retorna lista de notícias"""
    try:
        # Parâmetros de filtro opcionais
        category = request.args.get('category')
        limit = request.args.get('limit', 10, type=int)
        
        # Filtrar por categoria se especificada
        filtered_news = MOCK_NEWS
        if category:
            filtered_news = [news for news in MOCK_NEWS if news['category'].lower() == category.lower()]
        
        # Limitar quantidade de resultados
        filtered_news = filtered_news[:limit]
        
        return jsonify({
            'success': True,
            'data': filtered_news,
            'total': len(filtered_news)
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
        news_item = next((news for news in MOCK_NEWS if news['id'] == news_id), None)
        
        if not news_item:
            return jsonify({
                'success': False,
                'error': 'Notícia não encontrada'
            }), 404
        
        return jsonify({
            'success': True,
            'data': news_item
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
        categories = list(set([news['category'] for news in MOCK_NEWS]))
        
        return jsonify({
            'success': True,
            'data': categories
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar categorias: {str(e)}'
        }), 500