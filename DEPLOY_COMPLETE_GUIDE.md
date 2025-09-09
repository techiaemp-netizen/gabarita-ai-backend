# Guia Completo de Deploy - Gabarita.AI

## 🚀 Deploy do Backend no Render

### Pré-requisitos
- Conta no Render (https://render.com)
- Repositório Git com o código do backend

### Passos Detalhados

#### 1. Preparar o Repositório
```bash
# No diretório gabarita-ai-backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/seu-usuario/gabarita-ai-backend.git
git push -u origin main
```

#### 2. Criar Serviço no Render
1. Acesse https://render.com e faça login
2. Clique em "New +" > "Web Service"
3. Conecte seu repositório Git
4. Configure:
   - **Name**: `gabarita-ai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT run:app`
   - **Python Version**: `3.11.0`

#### 3. Configurar Variáveis de Ambiente
**OBRIGATÓRIAS - Configure com suas chaves reais:**

```env
# Aplicação
FLASK_APP=run.py
FLASK_ENV=production
FLASK_DEBUG=false
ENVIRONMENT=production
SECRET_KEY=gabarita-ai-production-secret-key-2025
DEBUG=False

# URLs
FRONTEND_URL=https://gabarita-ai.vercel.app
BACKEND_URL=https://gabarita-ai-backend.onrender.com
CORS_ORIGINS=https://gabarita-ai.vercel.app,http://localhost:3000

# Firebase (SUBSTITUA PELOS SEUS VALORES)
FIREBASE_PROJECT_ID=seu_projeto_firebase
FIREBASE_PRIVATE_KEY_ID=sua_chave_privada_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua_chave_privada\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40seu-projeto.iam.gserviceaccount.com

# OpenAI (SUBSTITUA PELA SUA CHAVE)
OPENAI_API_KEY=sk-sua_chave_openai_real
OPENAI_API_BASE=https://api.openai.com/v1

# Perplexity (SUBSTITUA PELA SUA CHAVE)
PERPLEXITY_API_KEY=pplx-sua_chave_perplexity_real

# Mercado Pago (SUBSTITUA PELAS SUAS CHAVES)
MERCADO_PAGO_ACCESS_TOKEN=sua_chave_access_token_real
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_real
MERCADO_PAGO_CLIENT_ID=seu_client_id_real
MERCADO_PAGO_CLIENT_SECRET=seu_client_secret_real
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_real

# Python
PYTHON_VERSION=3.11.0
```

#### 4. Deploy
1. Clique em "Create Web Service"
2. Aguarde o build e deploy (pode levar alguns minutos)
3. Sua URL será: `https://gabarita-ai-backend.onrender.com`

---

## 🌐 Deploy do Frontend no Vercel

### Método 1: Via Interface Web (Recomendado)

#### 1. Preparar o Repositório Frontend
```bash
# No diretório gabarita-frontend-minimal
git init
git add .
git commit -m "Initial frontend commit"
git remote add origin https://github.com/seu-usuario/gabarita-ai-frontend.git
git push -u origin main
```

#### 2. Deploy no Vercel
1. Acesse https://vercel.com e faça login
2. Clique em "New Project"
3. Importe seu repositório do frontend
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### 3. Configurar Variáveis de Ambiente
```env
NEXT_PUBLIC_API_URL=https://gabarita-ai-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://gabarita-ai.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
```

### Método 2: Via CLI do Vercel

#### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

#### 2. Fazer Login
```bash
vercel login
```

#### 3. Deploy
```bash
# No diretório do frontend
vercel --prod
```

---

## ✅ Verificação e Testes

### 1. Testar Backend
```bash
# Teste de saúde
curl https://gabarita-ai-backend.onrender.com/health

# Teste de autenticação
curl https://gabarita-ai-backend.onrender.com/api/auth/status
```

### 2. Testar Frontend
1. Acesse https://gabarita-ai.vercel.app
2. Teste o login/registro
3. Verifique se todas as páginas carregam
4. Teste a comunicação com o backend

### 3. Verificar Logs
- **Render**: Painel > Logs
- **Vercel**: Painel > Functions > View Function Logs

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Backend não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se as chaves de API são válidas
- Verifique os logs no painel do Render

#### Frontend não conecta ao backend
- Confirme se `NEXT_PUBLIC_API_URL` está correto
- Verifique se o CORS está configurado corretamente no backend
- Teste as rotas da API diretamente

#### Erro de autenticação
- Verifique as configurações do Firebase
- Confirme se as chaves estão no formato correto
- Teste a autenticação localmente primeiro

### Comandos Úteis

```bash
# Verificar logs do Vercel
vercel logs

# Redeployar no Vercel
vercel --prod --force

# Verificar variáveis de ambiente
vercel env ls
```

---

## 📋 Checklist Final

### Backend ✅
- [ ] Repositório criado e código enviado
- [ ] Serviço criado no Render
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Rotas `/health` e `/api/auth/status` funcionando
- [ ] Logs sem erros críticos

### Frontend ✅
- [ ] Repositório criado e código enviado
- [ ] Projeto criado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Site acessível e carregando
- [ ] Comunicação com backend funcionando

### Integração ✅
- [ ] Login/registro funcionando
- [ ] Todas as páginas carregando
- [ ] APIs respondendo corretamente
- [ ] CORS configurado adequadamente
- [ ] URLs de produção atualizadas

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs de ambos os serviços
2. Confirme se todas as variáveis estão configuradas
3. Teste as APIs individualmente
4. Verifique se as chaves de API são válidas

**URLs Finais:**
- Backend: https://gabarita-ai-backend.onrender.com
- Frontend: https://gabarita-ai.vercel.app