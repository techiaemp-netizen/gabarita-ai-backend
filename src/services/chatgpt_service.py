"""
Serviço de integração com ChatGPT para geração de questões
"""
import os
import openai
import json
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from src.utils.logger import StructuredLogger, log_external_api_call

load_dotenv()

class ChatGPTService:
    """Serviço para integração com ChatGPT"""
    
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY'),
            base_url=os.getenv('OPENAI_API_BASE', 'https://api.openai.com/v1')
        )
        self.model = "gpt-4"  # Usando GPT-4 com 250k tokens mensais
        self.temperature = 0.7
        self.max_tokens = 1500
        self.logger = StructuredLogger(__name__)
    
    def _get_prompt_estatico(self) -> str:
        """Retorna o prompt estático para geração de questões FGV"""
        return """Você é um elaborador de questões da banca FGV. Seu papel é criar uma única questão objetiva, com base no edital do cargo abaixo. Siga as instruções com rigor:

- Formato da questão: pode ser de múltipla escolha (com 5 alternativas, apenas uma correta), verdadeiro ou falso, completar lacuna, ou ordenação lógica.
- A questão deve ser inédita, clara, com linguagem técnica adequada.
- A alternativa correta deve ser coerente e as erradas plausíveis, mas incorretas.
- No final, inclua o gabarito e uma explicação técnica da resposta.
- NÃO invente temas fora do edital. Utilize apenas o conteúdo que está listado no edital fornecido.

Retorne a resposta no seguinte formato JSON:
{
  "questao": "texto da questão",
  "tipo": "multipla_escolha|verdadeiro_falso|completar_lacuna|ordenacao",
  "alternativas": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
  "gabarito": "A",
  "explicacao": "explicação detalhada da resposta correta",
  "tema": "tema principal da questão",
  "dificuldade": "facil|medio|dificil"
}"""
    
    def _get_prompt_dinamico(self, cargo: str, conteudo_edital: str, tipo_questao: str = "múltipla escolha") -> str:
        """Gera o prompt dinâmico baseado no perfil do usuário"""
        return f"""
Cargo do aluno: {cargo}
Conteúdo do edital a ser cobrado: {conteudo_edital}
Tipo de questão desejada: {tipo_questao}
"""
    
    @log_external_api_call(StructuredLogger(__name__), "ChatGPT")
    def gerar_questao(self, cargo: str, conteudo_edital: str, tipo_questao: str = "múltipla escolha") -> Optional[Dict[str, Any]]:
        """
        Gera uma questão personalizada usando ChatGPT
        
        Args:
            cargo: Cargo pretendido pelo usuário
            conteudo_edital: Conteúdo específico do edital
            tipo_questao: Tipo de questão desejada
            
        Returns:
            Dict com a questão gerada ou None em caso de erro
        """
        try:
            self.logger.info("Iniciando geração de questão via ChatGPT", extra={
                'cargo': cargo,
                'tipo_questao': tipo_questao,
                'conteudo_length': len(conteudo_edital)
            })
            
            # Combinar prompts estático e dinâmico
            prompt_completo = self._get_prompt_estatico() + self._get_prompt_dinamico(cargo, conteudo_edital, tipo_questao)
            
            # Fazer chamada para ChatGPT
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Modelo disponível
                messages=[
                    {"role": "system", "content": "Você é um especialista em elaboração de questões para concursos públicos da banca FGV."},
                    {"role": "user", "content": prompt_completo}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            # Extrair resposta
            resposta = response.choices[0].message.content.strip()
            
            # Tentar extrair JSON da resposta
            questao_data = self._extrair_json_resposta(resposta)
            
            if questao_data:
                # Adicionar metadados
                questao_data['cargo'] = cargo
                questao_data['conteudo_edital'] = conteudo_edital
                questao_data['prompt_usado'] = prompt_completo[:200] + "..."
                
                self.logger.info("Questão gerada com sucesso via ChatGPT", extra={
                    'cargo': cargo,
                    'tema': questao_data.get('tema', 'N/A'),
                    'dificuldade': questao_data.get('dificuldade', 'N/A'),
                    'tipo': questao_data.get('tipo', 'N/A')
                })
                
                return questao_data
            else:
                self.logger.error("Erro ao extrair JSON da resposta ChatGPT", extra={
                    'cargo': cargo,
                    'resposta_preview': resposta[:200]
                })
                print(f"❌ Erro ao extrair JSON da resposta: {resposta[:200]}...")
                return None
                
        except Exception as e:
            self.logger.error("Erro na chamada para ChatGPT", extra={
                'error': str(e),
                'cargo': cargo,
                'tipo_questao': tipo_questao
            })
            print(f"❌ Erro ao gerar questão: {e}")
            return None
    
    def _extrair_json_resposta(self, resposta: str) -> Optional[Dict[str, Any]]:
        """Extrai JSON da resposta do ChatGPT"""
        try:
            # Tentar encontrar JSON na resposta
            json_match = re.search(r'\{.*\}', resposta, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            
            # Se não encontrar JSON, tentar parsear a resposta inteira
            return json.loads(resposta)
            
        except json.JSONDecodeError:
            # Se falhar, tentar extrair manualmente
            return self._extrair_manual_resposta(resposta)
    
    def _extrair_manual_resposta(self, resposta: str) -> Optional[Dict[str, Any]]:
        """Extrai dados manualmente se JSON falhar"""
        try:
            # Implementar extração manual básica
            questao_data = {
                "questao": "",
                "tipo": "multipla_escolha",
                "alternativas": [],
                "gabarito": "",
                "explicacao": "",
                "tema": "",
                "dificuldade": "medio"
            }
            
            # Extrair questão (primeira linha ou parágrafo)
            linhas = resposta.split('\n')
            for linha in linhas:
                if linha.strip() and not linha.startswith(('A)', 'B)', 'C)', 'D)', 'E)')):
                    questao_data["questao"] = linha.strip()
                    break
            
            # Extrair alternativas
            alternativas = []
            for linha in linhas:
                if re.match(r'^[A-E]\)', linha.strip()):
                    alternativas.append(linha.strip())
            
            questao_data["alternativas"] = alternativas
            
            # Extrair gabarito (procurar por "Gabarito:" ou similar)
            for linha in linhas:
                if "gabarito" in linha.lower() or "resposta" in linha.lower():
                    match = re.search(r'[A-E]', linha)
                    if match:
                        questao_data["gabarito"] = match.group()
                        break
            
            # Extrair explicação
            explicacao_iniciou = False
            explicacao_linhas = []
            for linha in linhas:
                if "explicação" in linha.lower() or "justificativa" in linha.lower():
                    explicacao_iniciou = True
                    continue
                if explicacao_iniciou and linha.strip():
                    explicacao_linhas.append(linha.strip())
            
            questao_data["explicacao"] = " ".join(explicacao_linhas)
            
            return questao_data if questao_data["questao"] else None
            
        except Exception as e:
            print(f"❌ Erro na extração manual: {e}")
            return None
    
    def validar_questao(self, questao_data: Dict[str, Any]) -> bool:
        """Valida se a questão gerada está completa"""
        campos_obrigatorios = ["questao", "alternativas", "gabarito", "explicacao"]
        
        for campo in campos_obrigatorios:
            if not questao_data.get(campo):
                return False
        
        # Validar alternativas (deve ter pelo menos 2)
        if len(questao_data.get("alternativas", [])) < 2:
            return False
        
        # Validar gabarito
        gabarito = questao_data.get("gabarito", "")
        if not gabarito or gabarito not in "ABCDE":
            return False
        
        return True
    
    def gerar_explicacao(self, prompt_explicacao: str) -> Optional[str]:
        """Gera explicação detalhada usando o Perplexity/ChatGPT"""
        try:
            print("🤖 Enviando prompt para gerar explicação...")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um professor especialista em concursos públicos. Forneça explicações claras, didáticas e fundamentadas em legislação quando aplicável."
                    },
                    {
                        "role": "user",
                        "content": prompt_explicacao
                    }
                ],
                temperature=0.3,  # Menor temperatura para respostas mais precisas
                max_tokens=800
            )
            
            explicacao = response.choices[0].message.content.strip()
            print(f"✅ Explicação gerada: {explicacao[:100]}...")
            return explicacao
            
        except Exception as e:
            print(f"❌ Erro ao gerar explicação: {e}")
            return None

# Instância global do serviço
chatgpt_service = ChatGPTService()

