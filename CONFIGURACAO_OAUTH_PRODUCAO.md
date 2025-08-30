# 🔐 Configuração OAuth para Produção - Gabarita AI

## 📋 Checklist de Configuração

### ✅ 1. Variáveis de Ambiente - Frontend

**Arquivo:** `.env` (frontend)
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_project_id_here.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_project_id_here.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
```

### ✅ 2. Variáveis de Ambiente - Backend

**Arquivo:** `.env` (backend) - ✅ **JÁ CONFIGURADO**
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=gabarit-ai
FIREBASE_PRIVATE_KEY_ID=77ccdbd48f33a776a5c256581872b19d88d066d0
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@gabarit-ai.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=102668131516317816637
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

## 🚨 AÇÕES MANUAIS OBRIGATÓRIAS

### 1. Firebase Console - Domínios Autorizados

1. **Acesse:** [Firebase Console](https://console.firebase.google.com/)
2. **Selecione o projeto:** `gabarit-ai`
3. **Navegue:** Authentication → Settings → Authorized domains
4. **Adicione os domínios:**
   - `localhost` (desenvolvimento)
   - `127.0.0.1` (desenvolvimento)
   - `gabarita-ai.vercel.app` (produção)
   - `gabarita-ai-frontend.vercel.app` (produção alternativa)
   - `gabarit-ai.firebaseapp.com` (Firebase hosting)

### 2. Google Cloud Console - OAuth 2.0

1. **Acesse:** [Google Cloud Console](https://console.cloud.google.com/)
2. **Selecione o projeto:** `gabarit-ai`
3. **Navegue:** APIs & Services → Credentials
4. **Edite o Web client OAuth 2.0**
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   https://gabarita-ai.vercel.app
   https://gabarita-ai-frontend.vercel.app
   https://gabarit-ai.firebaseapp.com
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/__/auth/handler
   https://gabarita-ai.vercel.app/__/auth/handler
   https://gabarita-ai-frontend.vercel.app/__/auth/handler
   https://gabarit-ai.firebaseapp.com/__/auth/handler
   ```

### 3. Vercel - Variáveis de Ambiente

1. **Acesse:** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Selecione o projeto:** gabarita-ai-frontend
3. **Navegue:** Settings → Environment Variables
4. **Adicione as variáveis:**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gabarit-ai.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=gabarit-ai
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gabarit-ai.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id_aqui
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id_aqui
   ```

### 4. Render - Variáveis de Ambiente

✅ **JÁ CONFIGURADO** - As variáveis do Firebase já estão no arquivo `.env` do backend.

## 🧪 Como Testar

### Teste Local (Desenvolvimento)
1. Configure as variáveis no arquivo `.env` do frontend
2. Execute `npm run dev`
3. Acesse `http://localhost:3000/login`
4. Teste o login com Google

### Teste em Produção
1. Configure as variáveis no Vercel
2. Faça deploy: `vercel --prod`
3. Acesse sua URL de produção
4. Teste o login com Google

## 🔍 Diagnóstico de Problemas

### Erro: "auth/unauthorized-domain"
**Solução:** Adicionar domínio nos Authorized domains do Firebase

### Erro: "auth/popup-blocked"
**Solução:** ✅ Já implementado fallback para redirect

### Erro: "Firebase not initialized"
**Solução:** Verificar se todas as variáveis de ambiente estão configuradas

### Console Warnings
- ⚠️ Firebase: Configurações faltando: [lista]
- 📝 Configure as variáveis de ambiente no arquivo .env

## 📝 Próximos Passos

1. ✅ **Concluído:** Atualizar arquivos de configuração
2. ✅ **Concluído:** Adicionar validação de configurações
3. 🔄 **Pendente:** Configurar domínios autorizados (manual)
4. 🔄 **Pendente:** Configurar OAuth no Google Cloud (manual)
5. 🔄 **Pendente:** Configurar variáveis no Vercel (manual)
6. 🔄 **Pendente:** Testar em produção

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs do Vercel/Render
3. Confirme se todos os domínios estão autorizados
4. Teste primeiro em desenvolvimento local

---

**Status:** 🔄 Configuração parcialmente concluída - Ações manuais pendentes  
**Última atualização:** $(date)  
**Responsável:** Assistente AI