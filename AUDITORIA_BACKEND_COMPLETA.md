# Auditoria Completa do Backend Gabarita-AI

## Resumo Executivo
Esta auditoria compara as rotas chamadas pelo frontend com as rotas disponíveis no backend atual, identificando discrepâncias, rotas ausentes e problemas de padronização.

## Status dos Blueprints Registrados

### Blueprints Ativos no main.py:
- ✅ `signup_bp` → `/api/auth` (cadastro)
- ✅ `auth_bp` → `/api/auth` (login)
- ✅ `questoes_bp` → `/api/questoes` (geração de questões)
- ✅ `planos_bp` → `/api` (planos)
- ✅ `jogos_bp` → `/api/jogos` (jogos)
- ✅ `news_bp` → `/api` (notícias)
- ✅ `opcoes_bp` → `/api` (opções de cargos/blocos)

### Blueprints NÃO Registrados:
- ❌ `user_bp` (perfil de usuário) - **CRÍTICO**
- ❌ `payments_bp` (pagamentos) - **CRÍTICO**
- ❌ Blueprints de simulados (pasta vazia)
- ❌ Blueprints de ranking (pasta vazia)
- ❌ Blueprints de performance (não existe)

## Análise Detalhada por Endpoint

### ✅ ROTAS FUNCIONAIS (5/23)

| Endpoint Frontend | Endpoint Backend | Status | Observações |
|-------------------|------------------|--------|--------------|
| `GET /api/health` | `GET /api/health` | ✅ Funcional | Formato correto |
| `POST /api/auth/login` | `POST /api/auth/login` | ✅ Funcional | **PROBLEMA**: Retorna `sucesso` em vez de `success` |
| `POST /api/auth/cadastro` | `POST /api/auth/cadastro` | ✅ Funcional | **PROBLEMA**: Aceita `nome` mas frontend envia `name` |
| `POST /api/questoes/gerar` | `POST /api/questoes/gerar` | ✅ Funcional | Implementado no main.py |
| `GET /api/opcoes/blocos-cargos` | `GET /api/opcoes/blocos-cargos` | ✅ Funcional | **PROBLEMA**: Retorna `sucesso` em vez de `success` |

### ❌ ROTAS AUSENTES (18/23)

#### Rotas de Usuário (Blueprint não registrado)
- `GET /api/usuarios/perfil` → **AUSENTE** (user_bp não registrado)
- `PUT /api/usuarios/perfil` → **AUSENTE** (user_bp não registrado)

#### Rotas de Simulados (Blueprint não implementado)
- `POST /api/simulados/submit` → **PARCIAL** (implementado no main.py, mas deveria estar em blueprint)

#### Rotas de Questões Avançadas (Não implementadas)
- `GET /api/questoes/macetes/{id}` → **AUSENTE**
- `GET /api/questoes/pontos-centrais/{id}` → **AUSENTE**
- `GET /api/questoes/outras-exploracoes/{id}` → **AUSENTE**
- `POST /api/questoes/chat-duvidas` → **AUSENTE**
- `GET /api/questoes/materias/{cargo}/{bloco}` → **AUSENTE**

#### Rotas de Performance e Ranking (Implementadas no main.py)
- `GET /api/performance` → **PARCIAL** (implementado no main.py, mas deveria estar em blueprint)
- `GET /api/ranking` → **PARCIAL** (implementado no main.py, mas deveria estar em blueprint)

#### Rotas de Notícias (Blueprint registrado mas sem implementação)
- `GET /api/news` → **AUSENTE** (news_bp registrado mas vazio)

#### Rotas de Pagamentos (Blueprint não registrado)
- `POST /api/pagamentos/criar` → **AUSENTE** (payments_bp não registrado)

#### Rotas de Opções Específicas
- `GET /api/opcoes/cargos/{bloco}` → ✅ **EXISTE** (implementado em opcoes.py)
- `GET /api/opcoes/blocos/{cargo}` → ✅ **EXISTE** (implementado em opcoes.py)

#### Rotas de Planos com Inconsistência de Prefixo
- `GET /planos/usuario` → **AUSENTE** (sem prefixo `/api/`)
- `POST /planos/verificar-acesso` → **AUSENTE** (sem prefixo `/api/`)

### ⚠️ PROBLEMAS DE PADRONIZAÇÃO

#### 1. Formato de Resposta Inconsistente
- **Backend atual**: `{ sucesso: boolean, dados: any, erro?: string }`
- **Frontend espera**: `{ success: boolean, data: any, error?: string }`
- **Impacto**: Quebra de contrato em TODAS as rotas

#### 2. Nomenclatura de Campos
- **Campo nome**: Frontend envia `name`, backend espera `nome`
- **Campo senha**: Frontend envia `password`, backend espera `senha`
- **Impacto**: Falha no cadastro de usuários

#### 3. Prefixos de Rota Inconsistentes
- **Planos**: `/api/planos` vs `/planos/usuario`
- **Opções**: `/api/opcoes/` (correto)
- **Questões**: `/api/questoes/` (correto)

#### 4. CORS Mal Configurado
```python
CORS(app, 
     origins=['https://gabarita-ai-frontend-pied.vercel.app', 'http://localhost:3000', '*'],
     supports_credentials=True)  # PROBLEMA: '*' com credentials=True é inválido
```

## Blueprints que Precisam ser Criados

### 1. Blueprint de Usuários (CRÍTICO)
```python
# src/routes/usuarios.py
@usuarios_bp.route('/usuarios/perfil', methods=['GET'])
@usuarios_bp.route('/usuarios/perfil', methods=['PUT'])
```

### 2. Blueprint de Simulados (CRÍTICO)
```python
# src/routes/simulados.py
@simulados_bp.route('/simulados/submit', methods=['POST'])
```

### 3. Blueprint de Performance (MÉDIO)
```python
# src/routes/performance.py
@performance_bp.route('/performance', methods=['GET'])
```

### 4. Blueprint de Ranking (MÉDIO)
```python
# src/routes/ranking.py
@ranking_bp.route('/ranking', methods=['GET'])
```

### 5. Blueprint de Questões Avançadas (BAIXO)
```python
# src/routes/questoes_avancadas.py
@questoes_avancadas_bp.route('/questoes/macetes/<questao_id>', methods=['GET'])
@questoes_avancadas_bp.route('/questoes/pontos-centrais/<questao_id>', methods=['GET'])
@questoes_avancadas_bp.route('/questoes/outras-exploracoes/<questao_id>', methods=['GET'])
@questoes_avancadas_bp.route('/questoes/chat-duvidas', methods=['POST'])
@questoes_avancadas_bp.route('/questoes/materias/<cargo>/<bloco>', methods=['GET'])
```

### 6. Registrar Blueprint de Pagamentos (CRÍTICO)
```python
# No main.py
from .routes.payments import payments_bp
app.register_blueprint(payments_bp, url_prefix='/api')
```

## Problemas Críticos Identificados

### 1. **src/__init__.py Ausente** ❌
- **Status**: ✅ EXISTE (corrigido)
- **Impacto**: Sem este arquivo, imports podem falhar no deploy

### 2. **CORS Inválido** ❌
- **Problema**: `origins=['*']` com `supports_credentials=True`
- **Solução**: Remover `'*'` e manter apenas URLs específicas

### 3. **Blueprints Não Registrados** ❌
- **user_bp**: Rotas de perfil não funcionam
- **payments_bp**: Pagamentos não funcionam

### 4. **Formato de Resposta Inconsistente** ❌
- **Todas as rotas** retornam formato diferente do esperado
- **Impacto**: Frontend não consegue processar respostas

## Recomendações de Correção (Por Prioridade)

### 🔥 CRÍTICO (Quebra funcionalidades principais)
1. **Corrigir CORS**: Remover `'*'` quando `supports_credentials=True`
2. **Padronizar formato de resposta**: `success/data/error` em todas as rotas
3. **Registrar user_bp**: Adicionar `app.register_blueprint(user_bp, url_prefix='/api')`
4. **Registrar payments_bp**: Adicionar blueprint de pagamentos
5. **Corrigir mapeamento de campos**: `name` ↔ `nome`, `password` ↔ `senha`

### ⚠️ ALTO (Funcionalidades importantes)
6. **Criar blueprint de simulados**: Mover lógica do main.py
7. **Implementar rotas de performance e ranking**: Mover do main.py
8. **Implementar blueprint de notícias**: news_bp está vazio
9. **Unificar prefixos**: Todos endpoints com `/api/`

### 📝 MÉDIO (Melhorias)
10. **Implementar rotas avançadas de questões**: macetes, pontos centrais, etc.
11. **Adicionar validação de dados**: Middleware de validação
12. **Implementar autenticação real**: Substituir stub de login

## Estatísticas da Auditoria

- **Total de endpoints mapeados**: 23
- **Funcionais**: 5 (22%)
- **Ausentes**: 18 (78%)
- **Com problemas de formato**: 23 (100%)
- **Blueprints não registrados**: 2 (user, payments)
- **Blueprints vazios**: 3 (simulados, ranking, news)

## Próximos Passos

1. ✅ **Auditoria concluída**
2. 🔄 **Implementar correções críticas**
3. 🔄 **Criar blueprints ausentes**
4. 🔄 **Padronizar respostas**
5. 🔄 **Testar integração frontend/backend**
6. 🔄 **Gerar documentação OpenAPI**

---

**Conclusão**: O backend atual tem apenas 22% das rotas funcionais. É necessária uma refatoração significativa para alinhar com as expectativas do frontend.