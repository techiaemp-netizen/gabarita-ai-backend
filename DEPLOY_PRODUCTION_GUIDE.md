/@2# 🚀 Guia de Deploy em Produção - Gabarita AI

## 📋 Pré-requisitos Concluídos

✅ **Backup realizado**: Versões atuais arquivadas em repositórios separados  
✅ **Código atualizado**: Backend e frontend com todas as correções implementadas  
✅ **Configurações de deploy**: Arquivos `render.yaml` criados para ambos os serviços  

## 🔧 Configuração de Variáveis de Ambiente

### 🔴 Backend (Render)

No painel do Render, configure as seguintes variáveis de ambiente para o serviço **gabarita-ai-backend**:

#### 🔥 Firebase
```
FIREBASE_PROJECT_ID=seu_project_id_aqui
FIREBASE_PRIVATE_KEY_ID=sua_private_key_id_aqui
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua_chave_privada_aqui\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu_client_id_aqui
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

#### 🤖 APIs de IA
```
OPENAI_API_KEY=sk-sua_chave_openai_aqui
OPENAI_API_BASE=https://api.openai.com/v1
PERPLEXITY_API_KEY=pplx-sua_chave_perplexity_aqui
```

#### 💳 Mercado Pago
```
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_public_key_aqui
MERCADO_PAGO_CLIENT_ID=seu_client_id_aqui
MERCADO_PAGO_CLIENT_SECRET=seu_client_secret_aqui
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

#### ⚙️ Configurações Gerais
```
ENVIRONMENT=production
SECRET_KEY=sua_chave_secreta_super_forte_aqui
DEBUG=False
FRONTEND_URL=https://gabarita-ai-frontend.onrender.com
BACKEND_URL=https://gabarita-ai-backend.onrender.com
CORS_ORIGINS=https://gabarita-ai-frontend.onrender.com
PORT=5000
PYTHON_VERSION=3.11.0
```

### 🔵 Frontend (Render)

No painel do Render, configure as seguintes variáveis de ambiente para o serviço **gabarita-ai-frontend**:

#### 🌐 URLs da API
```
NEXT_PUBLIC_API_URL=https://gabarita-ai-backend.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://gabarita-ai-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://gabarita-ai-frontend.onrender.com
```

#### 🔥 Firebase (Público)
```
NEXT_PUBLIC_FIREBASE_API_KEY=sua_firebase_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id_aqui
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id_aqui
```

#### 💳 Mercado Pago (Público)
```
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=sua_public_key_aqui
```

#### 🤖 APIs (Opcional - se usado no frontend)
```
NEXT_PUBLIC_OPENAI_API_KEY=sua_chave_openai_aqui
NEXT_PUBLIC_PPX_API_KEY=sua_chave_perplexity_aqui
```

#### ⚙️ Node.js
```
NODE_VERSION=18
PORT=3000
```

## 🚀 Passos para Deploy

### 1. **Criar Serviços no Render**

#### Backend:
1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em "New" → "Web Service"
3. Conecte o repositório: `techiaemp-netizen/gabarita-ai-backend`
4. Configure:
   - **Name**: `gabarita-ai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT src.main:app`
   - **Plan**: Free (ou superior)

#### Frontend:
1. Clique em "New" → "Web Service"
2. Conecte o repositório: `techiaemp-netizen/gabarita-ai-frontend`
3. Configure:
   - **Name**: `gabarita-ai-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou superior)

### 2. **Configurar Variáveis de Ambiente**

1. Para cada serviço, vá em "Environment"
2. Adicione todas as variáveis listadas acima
3. **IMPORTANTE**: Use valores reais das suas credenciais

### 3. **Deploy Automático**

1. O Render detectará automaticamente os arquivos `render.yaml`
2. O deploy iniciará automaticamente
3. Monitore os logs para verificar se tudo está funcionando

### 4. **Verificação Pós-Deploy**

#### ✅ Checklist de Testes:
- [ ] Backend responde em: `https://gabarita-ai-backend.onrender.com/health`
- [ ] Frontend carrega em: `https://gabarita-ai-frontend.onrender.com`
- [ ] Login/cadastro funcionando
- [ ] Questões carregando corretamente
- [ ] Simulados funcionando
- [ ] Pagamentos processando (teste em sandbox)
- [ ] Explicações de IA funcionando

## 🔒 Segurança

### ⚠️ IMPORTANTE:
- **NUNCA** commite arquivos `.env` no Git
- Use chaves diferentes para produção
- Configure webhooks do Mercado Pago para a URL de produção
- Ative HTTPS em todos os serviços
- Configure CORS apenas para domínios necessários

## 🆘 Troubleshooting

### Problemas Comuns:

1. **Erro 500 no Backend**:
   - Verifique logs no Render
   - Confirme todas as variáveis de ambiente
   - Teste conexão com Firebase

2. **Frontend não conecta com Backend**:
   - Verifique `NEXT_PUBLIC_API_URL`
   - Confirme CORS no backend
   - Teste endpoints manualmente

3. **Erro de Build**:
   - Verifique `requirements.txt` (backend)
   - Verifique `package.json` (frontend)
   - Confirme versões do Python/Node

## 📞 Suporte

Em caso de problemas:
1. Verifique logs no painel do Render
2. Teste localmente primeiro
3. Confirme todas as credenciais
4. Verifique conectividade entre serviços

---

**🎉 Após seguir este guia, sua aplicação Gabarita AI estará rodando em produção!**