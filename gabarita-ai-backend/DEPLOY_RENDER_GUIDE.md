# Guia de Deploy do Backend no Render

## Pré-requisitos
- Conta no Render (https://render.com)
- Repositório Git com o código do backend

## Passos para Deploy

### 1. Preparar o Repositório
1. Faça commit de todos os arquivos do backend
2. Push para um repositório Git (GitHub, GitLab, etc.)

### 2. Criar Serviço no Render
1. Acesse https://render.com e faça login
2. Clique em "New +" > "Web Service"
3. Conecte seu repositório Git
4. Configure:
   - **Name**: `gabarita-ai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT run:app`

### 3. Configurar Variáveis de Ambiente
No painel do Render, adicione estas variáveis:

```
FLASK_APP=run.py
FLASK_ENV=production
FLASK_DEBUG=false
PYTHON_VERSION=3.11.0
ENVIRONMENT=production
SECRET_KEY=gabarita-ai-production-secret-key-2025
DEBUG=False
FRONTEND_URL=https://gabarita-ai.vercel.app
BACKEND_URL=https://gabarita-ai-backend.onrender.com
CORS_ORIGINS=https://gabarita-ai.vercel.app,http://localhost:3000
```

### 4. Configurar APIs (OBRIGATÓRIO)
Você DEVE configurar estas variáveis com suas chaves reais:

**Firebase:**
```
FIREBASE_PROJECT_ID=seu_projeto_firebase
FIREBASE_PRIVATE_KEY_ID=sua_chave_privada_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua_chave_privada\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

**OpenAI:**
```
OPENAI_API_KEY=sk-sua_chave_openai_real
OPENAI_API_BASE=https://api.openai.com/v1
```

**Perplexity:**
```
PERPLEXITY_API_KEY=pplx-sua_chave_perplexity_real
```

**Mercado Pago:**
```
MERCADO_PAGO_ACCESS_TOKEN=sua_chave_access_token_real
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_real
MERCADO_PAGO_CLIENT_ID=seu_client_id_real
MERCADO_PAGO_CLIENT_SECRET=seu_client_secret_real
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret_real
```

### 5. Configurar Banco de Dados
1. No Render, crie um PostgreSQL database
2. Conecte ao seu web service
3. A variável `DATABASE_URL` será configurada automaticamente

### 6. Deploy
1. Clique em "Create Web Service"
2. Aguarde o build e deploy
3. Sua URL será: `https://gabarita-ai-backend.onrender.com`

### 7. Verificar Deploy
Teste as rotas principais:
- `GET /health` - Status da aplicação
- `GET /api/auth/status` - Status da autenticação

## Arquivos Importantes
- `render.yaml` - Configuração do Render
- `requirements.txt` - Dependências Python
- `Procfile` - Comando de inicialização
- `runtime.txt` - Versão do Python

## Próximos Passos
Após o deploy do backend:
1. Anote a URL final do backend
2. Configure o frontend para usar esta URL
3. Faça o deploy do frontend no Vercel

## Troubleshooting
- Verifique os logs no painel do Render
- Certifique-se de que todas as variáveis de ambiente estão configuradas
- Teste as APIs individualmente