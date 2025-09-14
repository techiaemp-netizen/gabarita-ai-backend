# Deploy do Backend Gabarita AI no Render

## Pré-requisitos
- Conta no Render (https://render.com)
- Repositório GitHub com o código do backend
- Variáveis de ambiente configuradas

## Passos para Deploy

### 1. Configuração no Render
1. Acesse https://render.com e faça login
2. Clique em "New +" e selecione "Web Service"
3. Conecte seu repositório GitHub: `https://github.com/techiaemp-netizen/gabarita-ai-backend-deploy`
4. Configure as seguintes opções:
   - **Name**: `gabarita-ai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT src.main:app`
   - **Instance Type**: `Free` (ou conforme necessário)

### 2. Variáveis de Ambiente
Configure as seguintes variáveis de ambiente no Render:

```
FLASK_ENV=production
FLASK_DEBUG=False
OPENAI_API_KEY=sua_chave_openai
FIREBASE_CREDENTIALS=seu_json_firebase_base64
CORS_ORIGINS=https://seu-frontend.vercel.app
PORT=10000
```

### 3. Arquivos de Configuração
- `Procfile`: Configurado para Gunicorn
- `requirements.txt`: Todas as dependências listadas
- `runtime.txt`: Python 3.11.0
- `render.yaml`: Configuração Infrastructure as Code (opcional)

### 4. Verificação do Deploy
Após o deploy, teste os endpoints:
- Health Check: `https://seu-app.onrender.com/health`
- API Auth: `https://seu-app.onrender.com/api/auth/login`

### 5. Configuração do Frontend
Atualize a URL da API no frontend para apontar para:
`https://seu-app.onrender.com`

## Troubleshooting
- Verifique os logs no dashboard do Render
- Confirme se todas as variáveis de ambiente estão configuradas
- Teste os endpoints localmente antes do deploy
- Verifique se o Firebase está configurado corretamente

## URLs Importantes
- Dashboard Render: https://dashboard.render.com
- Repositório Backend: https://github.com/techiaemp-netizen/gabarita-ai-backend-deploy
- Documentação Render: https://render.com/docs