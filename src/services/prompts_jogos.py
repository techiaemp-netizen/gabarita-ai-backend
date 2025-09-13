# -*- coding: utf-8 -*-
"""
Prompts otimizados para geração de conteúdo dos jogos via GPT
"""

def get_prompt_forca(bloco: str, nivel_dificuldade: str = 'medio') -> str:
    """
    Prompt para gerar palavras e dicas para o jogo da forca
    """
    return f"""
Você é um especialista em {bloco} e precisa gerar uma palavra para o jogo da forca.

Critérios:
- Palavra relacionada ao bloco: {bloco}
- Nível de dificuldade: {nivel_dificuldade}
- Palavra deve ter entre 5 a 12 letras
- Deve ser um termo técnico ou conceito importante da área
- Evitar palavras com acentos, cedilha ou caracteres especiais
- Evitar nomes próprios

Retorne APENAS um JSON no seguinte formato:
{{
    "palavra": "PALAVRA_AQUI",
    "dica": "Dica clara e educativa sobre o conceito",
    "categoria": "Subcategoria específica do {bloco}",
    "dificuldade": "{nivel_dificuldade}"
}}

Exemplo para Saúde:
{{
    "palavra": "HIPERTENSAO",
    "dica": "Condição caracterizada pela pressão arterial elevada",
    "categoria": "Cardiologia",
    "dificuldade": "medio"
}}
"""

def get_prompt_quiz(bloco: str, quantidade: int = 5) -> str:
    """
    Prompt para gerar questões de múltipla escolha para o quiz
    """
    return f"""
Você é um especialista em {bloco} e precisa gerar {quantidade} questões de múltipla escolha para um quiz educativo.

Critérios para cada questão:
- Relacionada ao bloco: {bloco}
- 4 alternativas (A, B, C, D)
- Apenas 1 alternativa correta
- Alternativas plausíveis mas claramente distintas
- Pergunta clara e objetiva
- Explicação educativa da resposta correta
- Nível adequado para concursos públicos

Retorne APENAS um JSON no seguinte formato:
{{
    "questoes": [
        {{
            "pergunta": "Pergunta clara e objetiva?",
            "alternativas": {{
                "A": "Primeira alternativa",
                "B": "Segunda alternativa",
                "C": "Terceira alternativa",
                "D": "Quarta alternativa"
            }},
            "resposta_correta": "A",
            "explicacao": "Explicação detalhada do porquê a resposta A está correta",
            "categoria": "Subcategoria específica",
            "dificuldade": "medio"
        }}
    ]
}}

Gere exatamente {quantidade} questões variadas e educativas sobre {bloco}.
"""

def get_prompt_memoria(bloco: str, quantidade_pares: int = 6) -> str:
    """
    Prompt para gerar pares conceito-definição para o jogo da memória
    """
    return f"""
Você é um especialista em {bloco} e precisa gerar {quantidade_pares} pares de conceito-definição para um jogo da memória educativo.

Critérios:
- Cada par deve ter um CONCEITO e sua DEFINIÇÃO
- Conceitos relacionados ao bloco: {bloco}
- Definições claras, concisas (máximo 80 caracteres)
- Conceitos importantes para concursos públicos
- Evitar ambiguidades
- Definições devem ser únicas e não confundíveis

Retorne APENAS um JSON no seguinte formato:
{{
    "pares": [
        {{
            "conceito": "CONCEITO_AQUI",
            "definicao": "Definição clara e concisa do conceito",
            "categoria": "Subcategoria específica"
        }}
    ]
}}

Exemplo para Saúde:
{{
    "pares": [
        {{
            "conceito": "TAQUICARDIA",
            "definicao": "Frequência cardíaca acima de 100 bpm",
            "categoria": "Cardiologia"
        }}
    ]
}}

Gere exatamente {quantidade_pares} pares educativos sobre {bloco}.
"""

def get_prompt_palavras_cruzadas(bloco: str, quantidade: int = 8) -> str:
    """
    Prompt para gerar palavras e dicas para palavras cruzadas
    """
    return f"""
Você é um especialista em {bloco} e precisa gerar {quantidade} palavras com dicas para um jogo de palavras cruzadas.

Critérios:
- Palavras relacionadas ao bloco: {bloco}
- Palavras de 4 a 12 letras
- Sem acentos, cedilha ou caracteres especiais
- Dicas claras mas desafiadoras
- Variedade no tamanho das palavras
- Termos técnicos importantes

Retorne APENAS um JSON no seguinte formato:
{{
    "palavras": [
        {{
            "palavra": "PALAVRA",
            "dica": "Dica desafiadora mas clara",
            "tamanho": 7,
            "categoria": "Subcategoria específica",
            "dificuldade": "medio"
        }}
    ]
}}

Exemplo para Saúde:
{{
    "palavras": [
        {{
            "palavra": "ENFERMAGEM",
            "dica": "Profissão que cuida da saúde dos pacientes",
            "tamanho": 10,
            "categoria": "Profissões de Saúde",
            "dificuldade": "facil"
        }}
    ]
}}

Gere exatamente {quantidade} palavras variadas sobre {bloco}.
"""

def get_prompt_validacao_resposta(pergunta: str, resposta_usuario: str, resposta_correta: str) -> str:
    """
    Prompt para validar e explicar respostas dos usuários
    """
    return f"""
Você é um professor especialista e precisa avaliar a resposta de um aluno.

Pergunta: {pergunta}
Resposta do aluno: {resposta_usuario}
Resposta correta: {resposta_correta}

Avalie se a resposta do aluno está:
- CORRETA: Exatamente igual ou equivalente à resposta correta
- PARCIAL: Contém elementos corretos mas incompleta
- INCORRETA: Completamente errada

Retorne APENAS um JSON no seguinte formato:
{{
    "avaliacao": "CORRETA|PARCIAL|INCORRETA",
    "pontos": 10,
    "feedback": "Explicação educativa sobre a resposta",
    "dica_melhoria": "Sugestão para melhorar o conhecimento (se aplicável)"
}}

Seja justo na avaliação e educativo no feedback.
"""

def get_prompt_dica_jogo(tipo_jogo: str, contexto: str, bloco: str) -> str:
    """
    Prompt para gerar dicas contextuais durante os jogos
    """
    return f"""
Você é um tutor especialista em {bloco} ajudando um aluno no jogo: {tipo_jogo}.

Contexto atual: {contexto}

Gere uma dica útil que:
- Ajude o aluno sem dar a resposta diretamente
- Seja educativa e construtiva
- Relacione-se ao contexto específico
- Incentive o aprendizado

Retorne APENAS um JSON no seguinte formato:
{{
    "dica": "Dica útil e educativa",
    "tipo": "conceitual|estrategica|motivacional",
    "custo_pontos": 5
}}

Exemplo:
{{
    "dica": "Pense em condições que afetam o sistema cardiovascular",
    "tipo": "conceitual",
    "custo_pontos": 5
}}
"""

def get_prompt_feedback_sessao(tipo_jogo: str, pontos: int, acertos: int, total: int, tempo_gasto: int) -> str:
    """
    Prompt para gerar feedback personalizado ao final da sessão
    """
    return f"""
Você é um tutor especialista que precisa dar feedback sobre o desempenho do aluno.

Jogo: {tipo_jogo}
Pontos obtidos: {pontos}
Acertos: {acertos} de {total}
Tempo gasto: {tempo_gasto} segundos

Gere um feedback:
- Positivo e motivador
- Específico sobre o desempenho
- Com sugestões de melhoria
- Educativo e construtivo

Retorne APENAS um JSON no seguinte formato:
{{
    "feedback": "Feedback motivador sobre o desempenho",
    "pontos_fortes": ["Lista de pontos fortes observados"],
    "areas_melhoria": ["Sugestões específicas de melhoria"],
    "proximos_passos": "Recomendação para continuar aprendendo",
    "nivel_desempenho": "excelente|bom|regular|precisa_melhorar"
}}

Seja sempre encorajador e focado no aprendizado.
"""

# Configurações específicas por bloco
BLOCOS_CONFIG = {
    'saude': {
        'categorias': ['Anatomia', 'Fisiologia', 'Patologia', 'Farmacologia', 'Enfermagem', 'Medicina'],
        'dificuldades': ['facil', 'medio', 'dificil'],
        'contextos_especificos': [
            'Sistema cardiovascular',
            'Sistema respiratório', 
            'Sistema nervoso',
            'Cuidados de enfermagem',
            'Medicamentos',
            'Procedimentos médicos'
        ]
    },
    'educacao': {
        'categorias': ['Pedagogia', 'Psicologia Educacional', 'Didática', 'Legislação', 'Gestão Escolar'],
        'dificuldades': ['facil', 'medio', 'dificil'],
        'contextos_especificos': [
            'Teorias de aprendizagem',
            'Desenvolvimento infantil',
            'Metodologias de ensino',
            'Avaliação educacional',
            'Inclusão escolar',
            'Gestão pedagógica'
        ]
    },
    'direito': {
        'categorias': ['Constitucional', 'Civil', 'Penal', 'Administrativo', 'Trabalhista', 'Tributário'],
        'dificuldades': ['facil', 'medio', 'dificil'],
        'contextos_especificos': [
            'Direitos fundamentais',
            'Contratos',
            'Crimes e penas',
            'Atos administrativos',
            'Relações trabalhistas',
            'Tributos e impostos'
        ]
    },
    'administracao': {
        'categorias': ['Gestão', 'Recursos Humanos', 'Finanças', 'Marketing', 'Operações', 'Estratégia'],
        'dificuldades': ['facil', 'medio', 'dificil'],
        'contextos_especificos': [
            'Planejamento estratégico',
            'Gestão de pessoas',
            'Análise financeira',
            'Processos organizacionais',
            'Liderança',
            'Tomada de decisão'
        ]
    }
}

def get_contextos_bloco(bloco: str) -> list:
    """
    Retorna contextos específicos para um bloco
    """
    return BLOCOS_CONFIG.get(bloco.lower(), {}).get('contextos_especificos', [])

def get_categorias_bloco(bloco: str) -> list:
    """
    Retorna categorias específicas para um bloco
    """
    return BLOCOS_CONFIG.get(bloco.lower(), {}).get('categorias', [])

def ajustar_prompt_por_dificuldade(prompt_base: str, dificuldade: str) -> str:
    """
    Ajusta o prompt baseado no nível de dificuldade
    """
    ajustes = {
        'facil': 'Use termos mais básicos e conceitos fundamentais.',
        'medio': 'Use termos técnicos moderados e conceitos intermediários.',
        'dificil': 'Use termos técnicos avançados e conceitos complexos.'
    }
    
    ajuste = ajustes.get(dificuldade, ajustes['medio'])
    return f"{prompt_base}\n\nAjuste de dificuldade: {ajuste}"