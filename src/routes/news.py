from flask import Blueprint, request
from datetime import datetime, timedelta
from utils.response_formatter import ResponseFormatter
from utils.logger import StructuredLogger, log_request
import random

news_bp = Blueprint('news', __name__)
logger = StructuredLogger('news')

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

@news_bp.route('/noticias', methods=['GET'])
@log_request(logger)
def obter_noticias():
    """Retorna lista de notícias"""
    logger.info("Iniciando busca de notícias")
    try:
        # Parâmetros de filtro opcionais
        category = request.args.get('category')
        limit = request.args.get('limit', 10, type=int)
        
        logger.info("Aplicando filtros de busca", extra={
            'category': category,
            'limit': limit
        })
        
        # Filtrar por categoria se especificada
        filtered_news = MOCK_NEWS
        if category:
            filtered_news = [news for news in MOCK_NEWS if news['category'].lower() == category.lower()]
        
        # Limitar quantidade de resultados
        filtered_news = filtered_news[:limit]
        
        logger.info("Notícias obtidas com sucesso", extra={
            'total_noticias': len(filtered_news),
            'categoria_filtro': category
        })
        
        return ResponseFormatter.success({
            'dados': filtered_news,
            'total': len(filtered_news)
        }, 'Notícias obtidas com sucesso')
        
    except Exception as e:
        logger.error("Erro ao buscar notícias", extra={'error': str(e)})
        return ResponseFormatter.internal_error('Erro ao buscar notícias', str(e))

@news_bp.route('/news/<news_id>', methods=['GET'])
@log_request(logger)
def get_news_by_id(news_id):
    """Retorna uma notícia específica pelo ID"""
    logger.info("Iniciando busca de notícia por ID", extra={'news_id': news_id})
    try:
        news_item = next((news for news in MOCK_NEWS if news['id'] == news_id), None)
        
        if not news_item:
            logger.warning("Notícia não encontrada", extra={'news_id': news_id})
            return ResponseFormatter.not_found('Notícia não encontrada')
        
        logger.info("Notícia obtida com sucesso", extra={
            'news_id': news_id,
            'news_title': news_item['title'],
            'news_category': news_item['category']
        })
        
        return ResponseFormatter.success(news_item, 'Notícia obtida com sucesso')
        
    except Exception as e:
        logger.error("Erro ao buscar notícia", extra={'news_id': news_id, 'error': str(e)})
        return ResponseFormatter.internal_error('Erro ao buscar notícia', str(e))

@news_bp.route('/noticias/categorias', methods=['GET'])
@log_request(logger)
def obter_categorias_noticias():
    """Retorna lista de categorias disponíveis"""
    logger.info("Iniciando busca de categorias de notícias")
    try:
        categories = list(set([news['category'] for news in MOCK_NEWS]))
        
        logger.info("Categorias obtidas com sucesso", extra={
            'total_categorias': len(categories),
            'categorias': categories
        })
        
        return ResponseFormatter.success(categories, 'Categorias obtidas com sucesso')
        
    except Exception as e:
        logger.error("Erro ao buscar categorias", extra={'error': str(e)})
        return ResponseFormatter.internal_error('Erro ao buscar categorias', str(e))
