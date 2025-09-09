# Relatório de Mapeamento Frontend-Backend APIs

## Status Atual da Integração

### ✅ Endpoints Implementados no Backend

#### 1. **Autenticação** (`/api/auth/*`)
- `POST /api/auth/signup` - Cadastro de usuário com Firebase
- `POST /api/auth/login` - Login com verificação de hash
- `POST /api/auth/refresh-token` - Renovação de token (interceptor)

#### 2. **Usuários** (`/api/user/*`)
- `GET /api/user/profile` - Obter perfil do usuário autenticado
- `PUT /api/user/profile` - Atualizar perfil do usuário
- `GET /api/user/<user_id>` - Obter dados de usuário específico
- `PUT /api/user/<user_id>` - Atualizar usuário específico
- `DELETE /api/user/<user_id>` - Remover usuário

#### 3. **Planos** (`/api/planos`)
- `GET /api/planos` - Listar todos os planos disponíveis
- `GET /api/plans` - Alias em inglês para planos
- `GET /api/planos/usuario` - Obter plano atual do usuário
- `POST /api/planos/ativar` - Ativar plano para usuário

#### 4. **Questões** (`/api/questoes/*`)
- `POST /api/questoes/gerar` - Gerar questões com IA (OpenAI/ChatGPT)
- `POST /api/questoes/<questao_id>/responder` - Responder questão específica
- `GET /api/questoes/materias/<cargo>/<bloco>` - Buscar matérias por cargo/bloco

#### 5. **Opções/Conteúdos de Edital** (`/api/opcoes/*`)
- `GET /api/opcoes/cargos-blocos` - Lista de cargos e blocos
- `GET /api/opcoes/blocos-cargos` - Lista de blocos e cargos (formato frontend)
- `GET /api/opcoes/cargos-por-bloco/<bloco>` - Cargos por bloco específico
- `GET /api/opcoes/blocos-por-cargo/<cargo>` - Blocos por cargo específico
- `GET /api/opcoes/diagnostico` - Diagnóstico do sistema

#### 6. **Simulados**
- `POST /api/simulados/submit` - Submeter simulado e calcular score

#### 7. **Performance e Ranking**
- `GET /api/performance` - Dados de performance do usuário
- `GET /api/ranking` - Ranking de usuários

#### 8. **IA e Explicações**
- `POST /api/perplexity/explicacao` - Explicações detalhadas via IA

#### 9. **Jogos** (`/api/jogos/*`)
- Implementado no backend (arquivo jogos.py)

#### 10. **Notícias** (`/api/news` ou `/api/*`)
- Implementado no backend (arquivo news.py)

### 🔄 Status de Integração Frontend

#### ✅ **Já Integrado**
1. **Autenticação**: Login/Signup funcionando com Firebase
2. **Geração de Questões**: Integrado com OpenAI/ChatGPT
3. **Perfil de Usuário**: Busca e atualização de perfil
4. **Simulados**: Submit de respostas e cálculo de score

#### 🚧 **Parcialmente Integrado**
1. **Planos**: Backend implementado, frontend usa dados mock
2. **Opções**: Backend implementado, frontend pode não estar usando
3. **Performance/Ranking**: Backend implementado, frontend usa dados mock

#### ❌ **Não Integrado (Usando Mocks)**
1. **Pagamentos**: Mercado Pago não integrado
2. **Jogos**: Navegação implementada, mas sem integração com backend
3. **Notícias**: Backend implementado, frontend não integrado
4. **Dashboard**: Dados de performance não integrados

## 📋 Plano de Integração

### Fase 1: Substituir Mocks por APIs Reais

#### 1.1 **Tela de Planos**
- ✅ Backend: `GET /api/planos` implementado
- 🔄 Frontend: Substituir dados mock por chamada real
- 🔄 Integração: Conectar seleção de plano com cadastro

#### 1.2 **Tela de Cadastro**
- ✅ Backend: `POST /api/auth/signup` implementado
- ✅ Frontend: Já integrado com Firebase
- 🔄 Melhoria: Usar `GET /api/opcoes/cargos-blocos` para popular dropdowns

#### 1.3 **Dashboard/Performance**
- ✅ Backend: `GET /api/performance` implementado
- 🔄 Frontend: Substituir dados mock por chamada real
- 🔄 Integração: Conectar com dados reais do usuário

#### 1.4 **Ranking**
- ✅ Backend: `GET /api/ranking` implementado
- 🔄 Frontend: Substituir dados mock por chamada real

### Fase 2: Implementar Integrações Faltantes

#### 2.1 **Pagamentos (Mercado Pago)**
- ❌ Backend: Não implementado
- ❌ Frontend: Não implementado
- 🚨 **CRÍTICO**: Implementar fluxo completo de pagamento

#### 2.2 **Jogos**
- ✅ Backend: Rotas implementadas
- 🔄 Frontend: Conectar navegação com backend
- 🔄 Integração: Usar questões do backend nos jogos

#### 2.3 **Notícias**
- ✅ Backend: Implementado
- ❌ Frontend: Não integrado
- 🔄 Integração: Implementar tela de notícias

### Fase 3: Melhorias e Otimizações

#### 3.1 **Verificação de Adimplência**
- 🔄 Implementar verificação de status de pagamento
- 🔄 Bloquear funcionalidades para usuários inadimplentes

#### 3.2 **Integração com IAs**
- ✅ OpenAI: Implementado para questões
- 🔄 Perplexity: Implementado para explicações
- 🔄 PECLEST: Não identificado no código

## 🔧 Configurações Necessárias

### Variáveis de Ambiente
```env
# API Backend
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000

# Firebase (já configurado)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... outras configs Firebase

# Mercado Pago (FALTANTE)
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=...
MERCADO_PAGO_ACCESS_TOKEN=...

# OpenAI (já configurado no backend)
OPENAI_API_KEY=...
```

## 🚨 Ações Prioritárias

1. **CRÍTICO**: Implementar integração com Mercado Pago
2. **ALTO**: Substituir mocks de planos por API real
3. **ALTO**: Integrar dashboard com dados reais de performance
4. **MÉDIO**: Conectar jogos com backend
5. **MÉDIO**: Implementar tela de notícias
6. **BAIXO**: Otimizar chamadas de API e tratamento de erros

## 📊 Resumo Estatístico

- **Total de Endpoints Backend**: 20+
- **Endpoints Integrados**: 8 (40%)
- **Endpoints Parcialmente Integrados**: 6 (30%)
- **Endpoints Não Integrados**: 6 (30%)
- **Funcionalidades Críticas Faltantes**: Mercado Pago
- **Estimativa de Conclusão**: 2-3 sprints

---

**Última Atualização**: Janeiro 2025
**Status**: Em Desenvolvimento
**Próxima Revisão**: Após implementação da Fase 1