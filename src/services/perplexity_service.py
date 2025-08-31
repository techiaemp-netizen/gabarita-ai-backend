"""
Serviço de integração com Perplexity AI para feedback educativo
"""
import os
import json
import requests
from typing import Dict, Any, Optional
from utils.logger import StructuredLogger, log_external_api_call

class PerplexityService:
    def __init__(self):
        self.api_key = os.getenv('PERPLEXITY_API_KEY', 'pplx-dummy-key')
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.model = "llama-3.1-sonar-small-128k-online"
        self.logger = StructuredLogger("perplexity_service")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        print(f"[PERPLEXITY] Configurado com modelo: {self.model}")
    
    @log_external_api_call(StructuredLogger(__name__), "Perplexity")
    def gerar_feedback_erro(self, questao: str, alternativa_escolhida: str, 
                           alternativa_correta: str, tema: str) -> Optional[Dict[str, Any]]:
        """
        Gera feedback detalhado para erros usando Perplexity
        
        Args:
            questao: Texto da questão
            alternativa_escolhida: Alternativa que o usuário escolheu
            alternativa_correta: Alternativa correta
            tema: Tema da questão
            
        Returns:
            Dict com feedback detalhado ou None em caso de erro
        """
        try:
            self.logger.info("Iniciando geração de feedback via Perplexity", extra={
                'tema': tema,
                'questao_length': len(questao),
                'alternativa_escolhida': alternativa_escolhida[:50],
                'alternativa_correta': alternativa_correta[:50]
            })
            prompt = f"""
            Analise o erro do estudante na seguinte questão sobre {tema}:
            
            Questão: {questao}
            Alternativa escolhida pelo estudante: {alternativa_escolhida}
            Alternativa correta: {alternativa_correta}
            
            Forneça um feedback educativo que inclua:
            1. Por que a alternativa escolhida está incorreta
            2. Conceitos importantes que o estudante deve revisar
            3. Fontes confiáveis para estudo adicional
            4. Dicas para evitar erros similares
            
            Responda em formato JSON com as chaves: explicacao_erro, conceitos_importantes, fontes_estudo, dicas
            """
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "Você é um tutor especializado em concursos públicos brasileiros."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                
                # Tentar extrair JSON da resposta
                feedback_data = self._extrair_json_resposta(content)
                
                if feedback_data:
                    self.logger.info("Feedback gerado com sucesso via Perplexity", extra={
                        'tema': tema,
                        'has_explicacao': 'explicacao_erro' in feedback_data,
                        'has_conceitos': 'conceitos_importantes' in feedback_data,
                        'has_fontes': 'fontes_estudo' in feedback_data
                    })
                    return feedback_data
                else:
                    self.logger.warning("Fallback para feedback estruturado - JSON inválido", extra={
                        'tema': tema,
                        'content_preview': content[:100]
                    })
                    # Fallback: criar feedback estruturado manualmente
                    return self._gerar_feedback_fallback(tema, alternativa_escolhida, alternativa_correta)
            else:
                self.logger.error("Erro na API Perplexity", extra={
                    'status_code': response.status_code,
                    'tema': tema,
                    'error_text': response.text[:200]
                })
                print(f"❌ Erro na API Perplexity: {response.status_code} - {response.text}")
                return self._gerar_feedback_fallback(tema, alternativa_escolhida, alternativa_correta)
                
        except Exception as e:
            self.logger.error("Erro ao gerar feedback via Perplexity", extra={
                'error': str(e),
                'tema': tema
            })
            print(f"❌ Erro ao gerar feedback: {e}")
            return self._gerar_feedback_fallback(tema, alternativa_escolhida, alternativa_correta)
    
    @log_external_api_call(StructuredLogger(__name__), "Perplexity")
    def pesquisar_conteudo(self, tema: str) -> Optional[str]:
        """
        Pesquisa conteúdo atualizado sobre um tema
        
        Args:
            tema: Tema para pesquisar
            
        Returns:
            Conteúdo encontrado ou None em caso de erro
        """
        try:
            self.logger.info("Iniciando pesquisa de conteúdo via Perplexity", extra={
                'tema': tema
            })
            prompt = f"Forneça informações atualizadas e precisas sobre: {tema}"
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 800
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                
                self.logger.info("Conteúdo pesquisado com sucesso via Perplexity", extra={
                    'tema': tema,
                    'content_length': len(content)
                })
                
                return content.strip()
            else:
                self.logger.error("Erro na pesquisa Perplexity", extra={
                    'status_code': response.status_code,
                    'tema': tema
                })
                print(f"❌ Erro na pesquisa Perplexity: {response.status_code}")
                return self._gerar_conteudo_fallback(tema)
                
        except Exception as e:
            self.logger.error("Erro ao pesquisar conteúdo via Perplexity", extra={
                'error': str(e),
                'tema': tema
            })
            print(f"❌ Erro na pesquisa: {e}")
            return self._gerar_conteudo_fallback(tema)
    
    def _gerar_feedback_fallback(self, tema: str, alternativa_escolhida: str, alternativa_correta: str) -> Dict[str, Any]:
        """Gera feedback usando conhecimento interno quando Perplexity não está disponível"""
        
        feedback_templates = {
            'Política Nacional de Atenção Básica': {
                'explicacao_erro': 'A alternativa escolhida não reflete corretamente os princípios estabelecidos na PNAB.',
                'conceitos_importantes': 'A PNAB estabelece diretrizes para organização da Atenção Básica como porta de entrada preferencial do SUS.',
                'fontes_estudo': [
                    'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2436_22_09_2017.html',
                    'https://aps.saude.gov.br/politicas/pnab'
                ],
                'dicas': 'Foque nos objetivos principais da PNAB: organização, qualificação e expansão da atenção básica.'
            },
            'Estratégia Saúde da Família': {
                'explicacao_erro': 'A ESF tem objetivos específicos que diferem do modelo tradicional de atenção.',
                'conceitos_importantes': 'A ESF é uma estratégia prioritária para reorganização da atenção básica no Brasil.',
                'fontes_estudo': [
                    'https://aps.saude.gov.br/estrategia/estrategiasf',
                    'https://bvsms.saude.gov.br/bvs/publicacoes/estrategia_saude_familia.pdf'
                ],
                'dicas': 'Lembre-se: a ESF reorganiza, não substitui o modelo de atenção à saúde.'
            },
            'Política Nacional de Atenção Básica e Estratégia Saúde da Família': {
                'explicacao_erro': 'A alternativa escolhida não corresponde aos objetivos principais da ESF conforme estabelecido na PNAB.',
                'conceitos_importantes': 'A ESF é uma estratégia prioritária para expansão e consolidação da atenção básica.',
                'fontes_estudo': [
                    'https://bvsms.saude.gov.br/bvs/saudelegis/gm/2017/prt2436_22_09_2017.html',
                    'https://aps.saude.gov.br/estrategia/estrategiasf'
                ],
                'dicas': 'Lembre-se que a ESF não substitui, mas reorganiza o modelo de atenção à saúde.'
            }
        }
        
        # Buscar template específico ou usar genérico
        template = feedback_templates.get(tema, {
            'explicacao_erro': f'A alternativa {alternativa_escolhida} não está correta. A resposta correta é {alternativa_correta}.',
            'conceitos_importantes': f'Revise os conceitos fundamentais sobre {tema}.',
            'fontes_estudo': ['https://www.saude.gov.br/', 'https://bvsms.saude.gov.br/'],
            'dicas': 'Estude com atenção os documentos oficiais do Ministério da Saúde.'
        })
        
        return template
    
    def _gerar_conteudo_fallback(self, tema: str) -> str:
        """Gera conteúdo básico quando Perplexity não está disponível"""
        
        conteudos = {
            'Estratégia Saúde da Família': '''
            A Estratégia Saúde da Família (ESF) é uma estratégia de reorganização da atenção básica no Brasil.
            Principais características:
            - Equipes multiprofissionais
            - Território definido
            - População adscrita
            - Atenção integral e contínua
            - Foco na família e comunidade
            ''',
            'Política Nacional de Atenção Básica': '''
            A PNAB estabelece diretrizes para organização da Atenção Básica no SUS.
            Principais pontos:
            - Porta de entrada preferencial do SUS
            - Coordenação do cuidado
            - Integralidade da atenção
            - Participação social
            - Qualificação profissional
            '''
        }
        
        return conteudos.get(tema, f"Conteúdo sobre {tema} - consulte fontes oficiais do Ministério da Saúde.")
    
    def _extrair_json_resposta(self, resposta: str) -> Optional[Dict[str, Any]]:
        """Extrai JSON da resposta da API"""
        try:
            # Tentar encontrar JSON na resposta
            import re
            json_match = re.search(r'\{.*\}', resposta, re.DOTALL)
            
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                return None
                
        except Exception as e:
            print(f"❌ Erro ao extrair JSON: {e}")
            return None

# Instância global do serviço
perplexity_service = PerplexityService()

