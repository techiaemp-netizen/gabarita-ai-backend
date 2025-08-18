# Configuração Automática de Variáveis de Ambiente no Render

Este guia explica como configurar automaticamente todas as variáveis de ambiente necessárias no Render usando a API.

## 📋 Pré-requisitos

### 1. Render API Key
- Acesse: https://dashboard.render.com/account/api-keys
- Clique em "Create API Key"
- Copie a chave gerada

### 2. Service ID do seu serviço
- Acesse: https://dashboard.render.com
- Clique no seu serviço "gabarita-ai-backend"
- Na URL, copie o ID após `/web/` (exemplo: `srv-xxxxxxxxx`)

### 3. Chaves das APIs necessárias
- **OpenAI API Key** (obrigatória)
- **Firebase Credentials** (obrigatórias)
- **Perplexity API Key** (opcional)
- **MercadoPago Credentials** (opcional)

## 🚀 Uso do Script

### Comando Básico (apenas variáveis obrigatórias)
```powershell
.\configure-env-vars.ps1 `
  -RenderApiKey "rnd_xxxxxxxxxxxxxxxx" `
  -ServiceId "srv-xxxxxxxxx" `
  -OpenAIApiKey "sk-xxxxxxxxxxxxxxxx" `
  -FirebaseProjectId "seu-projeto-firebase" `
  -FirebasePrivateKeyId "sua-private-key-id" `
  -FirebasePrivateKey "-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----" `
  -FirebaseClientEmail "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com" `
  -FirebaseClientId "123456789012345678901"
```

### Comando Completo (todas as variáveis)
```powershell
.\configure-env-vars.ps1 `
  -RenderApiKey "rnd_xxxxxxxxxxxxxxxx" `
  -ServiceId "srv-xxxxxxxxx" `
  -OpenAIApiKey "sk-xxxxxxxxxxxxxxxx" `
  -PerplexityApiKey "pplx-xxxxxxxxxxxxxxxx" `
  -FirebaseProjectId "seu-projeto-firebase" `
  -FirebasePrivateKeyId "sua-private-key-id" `
  -FirebasePrivateKey "-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----" `
  -FirebaseClientEmail "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com" `
  -FirebaseClientId "123456789012345678901" `
  -MercadoPagoAccessToken "APP_USR-xxxxxxxxxxxxxxxx" `
  -MercadoPagoWebhookSecret "seu-webhook-secret"
```

## 📝 Como obter as credenciais

### OpenAI API Key
1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Copie a chave (começa com `sk-`)

### Firebase Credentials
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em "Project Settings" > "Service accounts"
4. Clique em "Generate new private key"
5. Baixe o arquivo JSON
6. Extraia os valores:
   - `project_id` → FirebaseProjectId
   - `private_key_id` → FirebasePrivateKeyId
   - `private_key` → FirebasePrivateKey
   - `client_email` → FirebaseClientEmail
   - `client_id` → FirebaseClientId

### Perplexity API Key (opcional)
1. Acesse: https://www.perplexity.ai/settings/api
2. Gere uma nova chave
3. Copie a chave (começa com `pplx-`)

### MercadoPago Credentials (opcional)
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em "Suas integrações" > "Credenciais"
3. Copie o Access Token de produção
4. Configure o Webhook Secret nas configurações de webhook

## ⚠️ Importante

### Tratamento da Firebase Private Key
A chave privada do Firebase contém quebras de linha. Use uma das opções:

**Opção 1: Escape manual**
```powershell
-FirebasePrivateKey "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

**Opção 2: Usar arquivo temporário**
```powershell
# Salve a chave em um arquivo temporário
$privateKey = Get-Content "firebase-key.txt" -Raw
.\configure-env-vars.ps1 -FirebasePrivateKey $privateKey ...
```

## 🔍 Verificação

Após executar o script:

1. **Verifique no Dashboard do Render**
   - Acesse: https://dashboard.render.com/web/SEU_SERVICE_ID
   - Vá na aba "Environment"
   - Confirme se todas as variáveis foram criadas

2. **Faça um novo deploy**
   ```powershell
   .\deploy-render.ps1
   ```

3. **Teste a API**
   ```powershell
   .\test-api.ps1
   ```

## 🛠️ Troubleshooting

### Erro de autenticação
- Verifique se a Render API Key está correta
- Confirme se o Service ID está correto

### Erro de formato na Firebase Private Key
- Certifique-se de que as quebras de linha estão como `\n`
- Verifique se a chave está completa (BEGIN e END)

### Variável não aparece no dashboard
- Aguarde alguns segundos e recarregue a página
- Verifique se não há erro de sintaxe no valor

## 📚 Recursos Adicionais

- [Render API Documentation](https://api-docs.render.com/)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [MercadoPago API Documentation](https://www.mercadopago.com.br/developers/pt/docs)

---

**✅ Vantagens da configuração automática:**
- ⚡ Rápida e eficiente
- 🔒 Segura (não expõe credenciais no código)
- 📝 Documentada e reproduzível
- 🔄 Facilita atualizações futuras