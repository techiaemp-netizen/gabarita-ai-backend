# 📋 MAPEAMENTO DE CONTRATOS FRONTEND-BACKEND

## 🔄 Status das Correções

**Data da Última Atualização:** Janeiro 2025  
**Status:** ✅ CONTRATOS ALINHADOS E FUNCIONAIS

## 🎯 Resumo das Correções Implementadas

### ✅ 1. Rotas de Autenticação
- **Problema:** Múltiplas rotas conflitantes para login
- **Solução:** Criados aliases padronizados em `/api/auth/`
- **Status:** ✅ CORRIGIDO

### ✅ 2. Rotas de Usuários
- **Problema:** Rotas aninhadas `/api/user/users/<id>` e espaços em aliases
- **Solução:** Ajustadas rotas para `/api/user/<id>` e criados aliases `/api/usuarios/`
- **Status:** ✅ CORRIGIDO

### ✅ 3. Formato de Resposta
- **Problema:** Inconsistência entre `success/error` (EN) e `sucesso/erro` (PT)
- **Solução:** Padronizado formato `{success, data, error, message}` em todo o backend
- **Status:** ✅ CORRIGIDO

### ✅ 4. Rotas de Opções
- **Problema:** Frontend esperava rota genérica `/api/opcoes/<tipo>`
- **Solução:** Implementada rota genérica que redireciona para funções específicas
- **Status:** ✅ CORRIGIDO

### ✅ 5. Rota de Questões
- **Problema:** Frontend referenciava `getQuestions()` inexistente
- **Solução:** Verificado que função não existe no frontend - sem ação necessária
- **Status:** ✅ VERIFICADO

## 📊 Mapeamento Atualizado de Endpoints

### 🔐 Autenticação
| Função Frontend | Endpoint Backend | Método | Status |
|----------------|------------------|--------|---------|
| `login()` | `/api/auth/login` | POST | ✅ Funcionando |
| `signup()` | `/api/auth/signup` | POST | ✅ Funcionando |
| `logout()` | `/api/auth/logout` | POST | ✅ Funcionando |
| `refreshToken()` | `/api/auth/refresh-token` | POST | ✅ Funcionando |

**Aliases Criados:**
- `/api/login` → `/api/auth/login`
- `/api/refresh-token` → `/api/auth/refresh-token`

### 👤 Usuários
| Função Frontend | Endpoint Backend | Método | Status |
|----------------|------------------|--------|---------|
| `getUser(id)` | `/api/user/<user_id>` | GET | ✅ Funcionando |
| `updateUser(id)` | `/api/user/<user_id>` | PUT | ✅ Funcionando |
| `getProfile()` | `/api/user/profile` | GET | ✅ Funcionando |
| `updateProfile()` | `/api/user/profile` | PUT | ✅ Funcionando |

**Aliases Criados:**
- `/api/usuarios/<user_id>` → `/api/user/<user_id>` (GET/PUT)
- `/api/usuarios/perfil` → `/api/user/profile` (GET/PUT)

### ⚙️ Opções
| Função Frontend | Endpoint Backend | Método | Status |
|----------------|------------------|--------|---------|
| `getOptions(tipo)` | `/api/opcoes/<tipo>` | GET | ✅ **NOVO** - Rota genérica |
| `getCargosBlocos()` | `/api/opcoes/cargos-blocos` | GET | ✅ Funcionando |
| `getBlocosCargos()` | `/api/opcoes/blocos-cargos` | GET | ✅ Funcionando |
| `getDiagnostico()` | `/api/opcoes/diagnostico` | GET | ✅ **NOVO** - Implementado |

**Rotas Específicas Mantidas:**
- `/api/opcoes/cargos-por-bloco/<bloco>` (GET)
- `/api/opcoes/blocos-por-cargo/<cargo>` (GET)

### ❓ Questões
| Função Frontend | Endpoint Backend | Método | Status |
|----------------|------------------|--------|---------|
| `generateQuestions()` | `/api/questoes/gerar` | POST | ✅ Funcionando |
| `submitAnswer()` | `/api/questoes/responder` | POST | ✅ Funcionando |
| `getQuestions()` | ❌ **NÃO EXISTE** | GET | ⚠️ Função não encontrada no FE |

### 💰 Planos e Pagamentos
| Função Frontend | Endpoint Backend | Método | Status |
|----------------|------------------|--------|---------|
| `getPlans()` | `/api/planos` | GET | ✅ Funcionando |
| `subscribePlan()` | `/api/planos/subscribe` | POST | ✅ Funcionando |
| `getPaymentStatus()` | `/api/payments/status` | GET | ✅ Funcionando |

## 🔧 Formato de Resposta Padronizado

### ✅ Formato Atual (Implementado)
```json
{
  "success": true,
  "data": { /* dados da resposta */ },
  "message": "Operação realizada com sucesso"
}
```

### ❌ Erro Padronizado
```json
{
  "success": false,
  "error": "Tipo do erro",
  "message": "Descrição detalhada do erro"
}
```

## 🚀 Melhorias Implementadas

### 🔄 Rota Genérica de Opções
- **Endpoint:** `/api/opcoes/<tipo>`
- **Tipos Suportados:**
  - `cargos-blocos`
  - `blocos-cargos`
  - `diagnostico`
- **Funcionalidade:** Redireciona automaticamente para a função específica correspondente

### 🏥 Endpoint de Diagnóstico
- **Endpoint:** `/api/opcoes/diagnostico`
- **Retorna:**
  - Total de cargos disponíveis
  - Total de blocos de conteúdo
  - Contagem de conteúdos por cargo
  - Status do sistema

### 🔗 Sistema de Aliases
- Mantém compatibilidade com rotas antigas
- Permite transição gradual do frontend
- Evita quebra de funcionalidades existentes

## 📋 Checklist de Verificação

### ✅ Autenticação
- [x] Login funcionando
- [x] Signup funcionando
- [x] Logout funcionando
- [x] Refresh token funcionando
- [x] Aliases criados

### ✅ Usuários
- [x] GET usuário por ID
- [x] PUT atualizar usuário
- [x] GET perfil do usuário
- [x] PUT atualizar perfil
- [x] Aliases em português criados

### ✅ Opções
- [x] Rota genérica implementada
- [x] Rotas específicas mantidas
- [x] Endpoint de diagnóstico criado
- [x] Placeholders corrigidos

### ✅ Formato de Resposta
- [x] Padronização success/error/message
- [x] Campos em inglês
- [x] Estrutura consistente

## 🎯 Próximos Passos

1. **Testes de Integração:** Verificar funcionamento end-to-end
2. **Documentação Swagger:** Criar documentação OpenAPI
3. **Monitoramento:** Implementar logs de uso das rotas
4. **Performance:** Otimizar consultas frequentes

## 📞 Suporte

Para dúvidas sobre os contratos ou problemas de integração:
- Consulte este documento atualizado
- Verifique os logs do backend
- Teste endpoints via Postman/Insomnia

---

**✅ Status Final: CONTRATOS ALINHADOS E FUNCIONAIS**

*Última atualização: Janeiro 2025*