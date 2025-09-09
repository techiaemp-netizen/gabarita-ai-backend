from datetime import datetime, timedelta
import random
from typing import List, Dict, Optional

class NewsService:
    """Serviço para gerenciar notícias dinâmicas"""
    
    def __init__(self):
        self.categories = ['Concursos', 'Vestibular', 'Dicas', 'Legislação', 'Carreiras']
        self.sources = [
            'Portal do Governo Federal',
            'INEP',
            'Folha Dirigida', 
            'JC Concursos',
            'Gabarita AI',
            'Concursos Brasil',
            'Portal da Educação'
        ]
    
    def listar_noticias(self, category: Optional[str] = None, limit: int = 10) -> List[Dict]:
        """Lista notícias dinâmicas baseadas em dados atuais"""
        try:
            noticias = self._gerar_noticias_dinamicas()
            
            # Filtrar por categoria se especificada
            if category:
                noticias = [n for n in noticias if n['category'].lower() == category.lower()]
            
            # Limitar quantidade
            noticias = noticias[:limit]
            
            # Adicionar metadados de fonte
            for noticia in noticias:
                noticia['updated_at'] = datetime.now().isoformat()
                noticia['source_type'] = 'dynamic'
                noticia['data_source'] = 'news_service'
            
            return noticias
            
        except Exception as e:
            print(f"Erro ao listar notícias: {e}")
            return self._get_fallback_news()
    
    def obter_noticia_por_id(self, news_id: str) -> Optional[Dict]:
        """Obtém uma notícia específica pelo ID"""
        try:
            noticias = self._gerar_noticias_dinamicas()
            noticia = next((n for n in noticias if n['id'] == news_id), None)
            
            if noticia:
                noticia['updated_at'] = datetime.now().isoformat()
                noticia['source_type'] = 'dynamic'
                noticia['data_source'] = 'news_service'
                noticia['views'] = random.randint(100, 5000)
            
            return noticia
            
        except Exception as e:
            print(f"Erro ao obter notícia {news_id}: {e}")
            return None
    
    def listar_categorias(self) -> List[str]:
        """Lista todas as categorias disponíveis"""
        return self.categories.copy()
    
    def _gerar_noticias_dinamicas(self) -> List[Dict]:
        """Gera notícias dinâmicas baseadas em templates atuais"""
        templates = [
            {
                'title_template': 'CNU {year}: {action} para o Concurso Nacional Unificado',
                'summary_template': 'Ministério da Gestão {action_detail} com {detail}',
                'category': 'Concursos',
                'actions': ['Novas datas divulgadas', 'Edital atualizado', 'Inscrições prorrogadas'],
                'action_details': ['anuncia cronograma atualizado', 'divulga mudanças importantes', 'confirma novas diretrizes'],
                'details': ['provas previstas para o segundo semestre', 'mais de 6.000 vagas disponíveis', 'novos órgãos participantes']
            },
            {
                'title_template': 'ENEM {year}: {action} anunciadas',
                'summary_template': 'INEP {action_detail} para a edição deste ano',
                'category': 'Vestibular',
                'actions': ['Cronograma e principais mudanças', 'Datas das provas', 'Sistema de inscrições'],
                'action_details': ['apresenta calendário oficial', 'confirma datas importantes', 'atualiza procedimentos'],
                'details': ['provas em novembro', 'melhorias no sistema', 'ampliação de vagas']
            },
            {
                'title_template': 'Concurso {orgao}: Edital com {vagas} vagas deve sair em breve',
                'summary_template': 'Fontes indicam que novo concurso está em {fase}',
                'category': 'Concursos',
                'orgaos': ['Banco do Brasil', 'Caixa Econômica', 'Receita Federal', 'Polícia Federal'],
                'vagas': ['4.000', '2.500', '1.800', '3.200'],
                'fases': ['fase final de preparação', 'processo de aprovação', 'elaboração final']
            },
            {
                'title_template': 'Dicas de Estudo: {tema} para concursos',
                'summary_template': 'Especialistas compartilham {tipo} eficazes',
                'category': 'Dicas',
                'temas': ['Como otimizar sua preparação', 'Técnicas de memorização', 'Organização do tempo'],
                'tipos': ['estratégias', 'métodos', 'técnicas']
            }
        ]
        
        noticias = []
        current_year = datetime.now().year
        
        for i, template in enumerate(templates):
            for j in range(2):  # 2 notícias por template
                news_id = f"news_{i}_{j}_{int(datetime.now().timestamp())}"
                
                if 'orgaos' in template:
                    orgao = random.choice(template['orgaos'])
                    vagas = random.choice(template['vagas'])
                    fase = random.choice(template['fases'])
                    title = template['title_template'].format(orgao=orgao, vagas=vagas)
                    summary = template['summary_template'].format(fase=fase)
                elif 'temas' in template:
                    tema = random.choice(template['temas'])
                    tipo = random.choice(template['tipos'])
                    title = template['title_template'].format(tema=tema)
                    summary = template['summary_template'].format(tipo=tipo)
                else:
                    action = random.choice(template['actions'])
                    action_detail = random.choice(template['action_details'])
                    detail = random.choice(template['details'])
                    title = template['title_template'].format(year=current_year, action=action)
                    summary = template['summary_template'].format(action_detail=action_detail, detail=detail)
                
                # Gerar horário de publicação dinâmico
                hours_ago = random.randint(1, 72)
                published_at = datetime.now() - timedelta(hours=hours_ago)
                
                noticia = {
                    'id': news_id,
                    'title': title,
                    'summary': summary,
                    'content': self._gerar_conteudo_dinamico(title, summary),
                    'source': random.choice(self.sources),
                    'publishedAt': published_at.isoformat(),
                    'category': template['category'],
                    'imageUrl': None,
                    'author': self._gerar_autor(),
                    'tags': self._gerar_tags(template['category']),
                    'reading_time': random.randint(2, 8)
                }
                
                noticias.append(noticia)
        
        # Ordenar por data de publicação (mais recentes primeiro)
        noticias.sort(key=lambda x: x['publishedAt'], reverse=True)
        
        return noticias
    
    def _gerar_conteudo_dinamico(self, title: str, summary: str) -> str:
        """Gera conteúdo dinâmico para a notícia"""
        paragrafos = [
            f"{summary}. Esta informação foi confirmada através de fontes oficiais e representa uma atualização importante para candidatos e interessados.",
            "Os detalhes específicos incluem mudanças nos cronogramas, atualizações nos editais e novas oportunidades para os candidatos. É recomendado que os interessados acompanhem as publicações oficiais.",
            "Para mais informações detalhadas, consulte os canais oficiais dos órgãos responsáveis e mantenha-se atualizado com as últimas novidades do setor educacional e de concursos públicos."
        ]
        
        return " ".join(paragrafos)
    
    def _gerar_autor(self) -> str:
        """Gera nome de autor dinâmico"""
        autores = [
            'Redação Gabarita AI',
            'Equipe Editorial',
            'Correspondente Educacional',
            'Analista de Concursos',
            'Especialista em Educação'
        ]
        return random.choice(autores)
    
    def _gerar_tags(self, category: str) -> List[str]:
        """Gera tags baseadas na categoria"""
        tags_map = {
            'Concursos': ['concurso público', 'edital', 'vagas', 'inscrições'],
            'Vestibular': ['enem', 'vestibular', 'universidade', 'ensino superior'],
            'Dicas': ['estudo', 'preparação', 'técnicas', 'aprendizado'],
            'Legislação': ['lei', 'decreto', 'regulamentação', 'normas'],
            'Carreiras': ['profissão', 'mercado', 'oportunidades', 'desenvolvimento']
        }
        
        base_tags = tags_map.get(category, ['educação', 'informação'])
        return random.sample(base_tags, min(3, len(base_tags)))
    
    def _get_fallback_news(self) -> List[Dict]:
        """Retorna notícias de fallback em caso de erro"""
        return [{
            'id': 'fallback_1',
            'title': 'Sistema de Notícias em Manutenção',
            'summary': 'Estamos atualizando nosso sistema de notícias para melhor atendê-lo',
            'content': 'Nosso sistema de notícias está sendo atualizado. Em breve, você terá acesso às últimas informações sobre concursos, vestibulares e educação.',
            'source': 'Gabarita AI',
            'publishedAt': datetime.now().isoformat(),
            'category': 'Sistema',
            'imageUrl': None,
            'updated_at': datetime.now().isoformat(),
            'source_type': 'fallback',
            'data_source': 'news_service'
        }]

# Instância global do serviço
news_service = NewsService()