# Mapeamento de Contratos do Frontend (services/api.ts)

## Resumo Executivo
Este documento mapeia todos os endpoints chamados pelo frontend do Gabarita-AI, incluindo métodos HTTP, payloads esperados e formatos de resposta.

## Tabela de Contratos

| Método da API | Endpoint | Método HTTP | Payload Enviado | Response Esperado | Observações |
|---------------|----------|-------------|-----------------|-------------------|-------------|
| `healthCheck()` | `/api/health` | GET | - | `{ success: boolean, data: any }` | Verificação de status |
| `login(email, password)` | `/api/auth/login` | POST | `{ email: string, password: string }` | `{ success: boolean, data: { user: User, token: string } }` | Autenticação básica |
| `signup(userData, firebaseToken?)` | `/api/auth/cadastro` | POST | `{ nome: string, email: string, cpf: string, senha: string, cargo: string, bloco: string, ... }` | `{ success: boolean, data: { user: User, token: string } }` | **ERRO**: Frontend envia `name`, backend espera `nome` |
| `logout()` | - | - | - | `void` | Remove token do localStorage |
| `getProfile()` | `/api/usuarios/perfil` | GET | - | `{ success: boolean, data: User }` | **ERRO**: Rota não existe no backend |
| `updateProfile(userData)` | `/api/usuarios/perfil` | PUT | `Partial<User>` | `{ success: boolean, data: User }` | **ERRO**: Rota não existe no backend |
| `generateQuestions(params)` | `/api/questoes/gerar` | POST | `{ subject?: string, difficulty?: string, count?: number, bloco?: string, cargo?: string, usuario_id: string }` | `{ success: boolean, data: Question[] }` | ✅ Existe no backend |
| `submitSimulation(answers, questionIds)` | `/api/simulados/submit` | POST | `{ answers: number[], questionIds: string[] }` | `{ success: boolean, data: SimulationResult }` | **ERRO**: Rota não existe no backend |
| `getMacetes(questaoId)` | `/api/questoes/macetes/{id}` | GET | - | `{ success: boolean, data: any }` | **ERRO**: Rota não existe no backend |
| `getPontosCentrais(questaoId)` | `/api/questoes/pontos-centrais/{id}` | GET | - | `{ success: boolean, data: any }` | **ERRO**: Rota não existe no backend |
| `getOutrasExploracoes(questaoId)` | `/api/questoes/outras-exploracoes/{id}` | GET | - | `{ success: boolean, data: any }` | **ERRO**: Rota não existe no backend |
| `chatDuvidas(questaoId, usuarioId, mensagem)` | `/api/questoes/chat-duvidas` | POST | `{ questao_id: string, usuario_id: string, mensagem: string }` | `{ success: boolean, data: any }` | **ERRO**: Rota não existe no backend |
| `getPerformance()` | `/api/performance` | GET | - | `{ success: boolean, data: Performance }` | **ERRO**: Rota não existe no backend |
| `getPlans()` | `/api/planos` | GET | - | `{ success: boolean, data: Plan[] }` | **CONFLITO**: Frontend chama `/api/planos`, mas também existe `/api/plans` |
| `getRanking()` | `/api/ranking` | GET | - | `{ success: boolean, data: RankingEntry[] }` | **ERRO**: Rota não existe no backend |
| `getNews()` | `/api/news` | GET | - | `{ success: boolean, data: News[] }` | **ERRO**: Rota não existe no backend |
| `createPayment(planId)` | `/api/pagamentos/criar` | POST | `{ plano: string, userId: string, userEmail: string }` | `{ success: boolean, data: { paymentUrl: string } }` | **ERRO**: Rota não existe no backend |
| `getCargosEBlocos()` | `/api/opcoes/blocos-cargos` | GET | - | `{ success: boolean, data: { todos_cargos: string[], todos_blocos: string[], cargos_blocos: Record<string, string[]> } }` | **ERRO**: Rota não existe no backend público |
| `getBlocosCargos()` | `/api/opcoes/blocos-cargos` | GET | - | `{ success: boolean, data: { blocos_cargos: Record<string, string[]>, todos_blocos: string[], todos_cargos: string[] } }` | **ERRO**: Rota não existe no backend público |
| `getCargosPorBloco(bloco)` | `/api/opcoes/cargos/{bloco}` | GET | - | `{ success: boolean, data: { bloco: string, cargos: string[] } }` | **ERRO**: Rota não existe no backend |
| `getBlocosPorCargo(cargo)` | `/api/opcoes/blocos/{cargo}` | GET | - | `{ success: boolean, data: { cargo: string, blocos: string[] } }` | **ERRO**: Rota não existe no backend |
| `getMateriasPorCargoBloco(cargo, bloco)` | `/api/questoes/materias/{cargo}/{bloco}` | GET | - | `{ success: boolean, data: any[] }` | **ERRO**: Rota não existe no backend |
| `getUserPlan()` | `/planos/usuario` | GET | - | `{ success: boolean, data: any }` | **ERRO**: Inconsistência de prefixo `/api` |
| `checkResourceAccess(resource)` | `/planos/verificar-acesso` | POST | `{ recurso: string }` | `{ success: boolean, data: { tem_acesso: boolean } }` | **ERRO**: Inconsistência de prefixo `/api` |

## Problemas Identificados

### 1. Inconsistências de Nomenclatura
- **Campo `name` vs `nome`**: Frontend envia `name`, backend espera `nome`
- **Resposta `success` vs `sucesso`**: Formatos diferentes entre endpoints
- **Prefixos inconsistentes**: Alguns endpoints usam `/api/`, outros não

### 2. Rotas Ausentes no Backend
As seguintes rotas são chamadas pelo frontend mas não existem no backend público:
- `/api/usuarios/perfil` (GET/PUT)
- `/api/simulados/submit` (POST)
- `/api/questoes/macetes/{id}` (GET)
- `/api/questoes/pontos-centrais/{id}` (GET)
- `/api/questoes/outras-exploracoes/{id}` (GET)
- `/api/questoes/chat-duvidas` (POST)
- `/api/performance` (GET)
- `/api/ranking` (GET)
- `/api/news` (GET)
- `/api/pagamentos/criar` (POST)
- `/api/opcoes/blocos-cargos` (GET)
- `/api/opcoes/cargos/{bloco}` (GET)
- `/api/opcoes/blocos/{cargo}` (GET)
- `/api/questoes/materias/{cargo}/{bloco}` (GET)

### 3. Conflitos de Nomenclatura
- **Planos**: Frontend usa `/api/planos`, mas backend também tem `/api/plans`
- **Idiomas**: Mistura entre português e inglês nos endpoints

### 4. Formato de Resposta Inconsistente
O frontend espera sempre `{ success: boolean, data: any, error?: string }`, mas o backend retorna formatos variados:
- `{ sucesso: boolean, dados: any, erro?: string }`
- `{ success: boolean, user: User, token: string }`
- Respostas diretas sem wrapper

## Recomendações

1. **Padronizar formato de resposta**: Usar sempre `{ success: boolean, data: any, error?: string }`
2. **Implementar rotas ausentes** ou remover chamadas do frontend
3. **Unificar nomenclatura**: Escolher português ou inglês consistentemente
4. **Corrigir mapeamento de campos**: `name` ↔ `nome`, `password` ↔ `senha`
5. **Adicionar prefixo `/api/`** em todas as rotas para consistência
6. **Implementar blueprints faltantes** no backend

## Status das Rotas

- ✅ **Funcionais**: 2 rotas (`/api/health`, `/api/questoes/gerar`)
- ❌ **Ausentes**: 18 rotas
- ⚠️ **Conflitos**: 3 rotas (nomenclatura/formato)

**Total de problemas identificados**: 21 de 23 rotas (91% com problemas)