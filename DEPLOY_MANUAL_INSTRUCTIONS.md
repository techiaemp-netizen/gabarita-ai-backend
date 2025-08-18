# Instruções para Deploy Manual no Render

Como a API do Render está retornando erro 400 sem detalhes específicos, siga estas instruções para criar o serviço manualmente:

## 1. Acesse o Dashboard do Render
- Vá para https://render.com
- Faça login com sua conta

## 2. Criar Novo Web Service
- Clique em "New +" no canto superior direito
- Selecione "Web Service"

## 3. Conectar Repositório
- Conecte sua conta GitHub se ainda não estiver conectada
- Selecione o repositório: `techiaemp-netizen/gabarita-ai-backend`
- Branch: `master`

## 4. Configurações do Serviço
- **Name**: `gabarita-ai-backend`
- **Region**: Oregon (US West)
- **Branch**: `master`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python src/main.py`

## 5. Variáveis de Ambiente
Adicione as seguintes variáveis de ambiente:

```
PYTHON_VERSION=3.11.0
PORT=10000
```

## 6. Configurações Avançadas
- **Health Check Path**: `/health`
- **Instance Type**: Free (ou Starter se preferir)

## 7. Deploy
- Clique em "Create Web Service"
- Aguarde o deploy ser concluído
- A URL do serviço será algo como: `https://gabarita-ai-backend.onrender.com`

## 8. Configurar Variáveis de Ambiente Adicionais
Após o serviço ser criado, adicione as variáveis de ambiente do arquivo `.env`:

```
OPENAI_API_KEY=sua_chave_openai
PERPLEXITY_API_KEY=sua_chave_perplexity
FIREBASE_PROJECT_ID=gabarit-ai
MERCADO_PAGO_ACCESS_TOKEN=seu_token_mercado_pago
SECRET_KEY=sua_chave_secreta
FRONTEND_URL=https://gabarita-ai-frontend-l53jpd83n-rafaels-projects-dbcb8980.vercel.app
BACKEND_URL=https://gabarita-ai-backend.onrender.com
CORS_ORIGINS=https://gabaritai.app.br,https://gabarita-ai-frontend-l53jpd83n-rafaels-projects-dbcb8980.vercel.app,https://gabarita-ai-frontend-pied.vercel.app
```

## 9. Testar o Serviço
Após o deploy, teste o endpoint de saúde:
```
curl https://gabarita-ai-backend.onrender.com/health
```

## Notas Importantes
- Serviços gratuitos no Render "hibernam" após inatividade
- O primeiro acesso após hibernação pode demorar ~1 minuto
- Para produção, considere usar um plano pago para evitar hibernação