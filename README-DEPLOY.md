# 🚀 Guia Completo de Deploy - Gabarita AI

## 📋 Checklist Pré-Deploy

### ✅ Arquivos de Configuração Criados
- [x] `gabarita-ai-backend/.env.example` - Template de variáveis de ambiente
- [x] `gabarita-ai-backend/requirements.txt` - Dependências Python
- [x] `gabarita-ai-backend/Procfile` - Configuração para Heroku/Render
- [x] `gabarita-ai-backend/runtime.txt` - Versão do Python
- [x] `gabarita-ai-backend/.gitignore` - Arquivos a ignorar
- [x] `gabarita-ai-frontend/vercel.json` - Configuração do Vercel
- [x] `gabarita-ai-frontend/.env.example` - Template de variáveis de ambiente
- [x] `gabarita-ai-frontend/.gitignore` - Arquivos a ignorar

### ✅ Dependências Instaladas
- [x] `mercadopago` - Integração de pagamentos
- [x] `gunicorn` - Servidor WSGI para produção
- [x] `recharts` - Biblioteca de gráficos para o frontend

## 🎯 Plataformas de Deploy

### Backend: Render.com
**URL de Produção:** `https://gabarita-ai-backend.onrender.com`

#### Configurações do Serviço
```
Name: gabarita-ai-backend
Region: Oregon (US West)
Branch: main
Root Directory: gabarita-ai-backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn --bind 0.0.0.0:$PORT src.main:app
```

#### Variáveis de Ambiente Necessárias
```bash
# Python e Flask
PYTHON_VERSION=3.11.0
FLASK_ENV=production
SECRET_KEY=sua_secret_key_segura_aqui
DEBUG=False

# APIs de IA
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...

# Firebase (JSON completo)
FIREBASE_CREDENTIALS='{"type":"service_account",...}'

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...

# URLs
FRONTEND_URL=https://gabarita-ai-frontend.vercel.app
BACKEND_URL=https://gabarita-ai-backend.onrender.com
CORS_ORIGINS=https://gabarita-ai-frontend.vercel.app,http://localhost:3000

# Deploy
PORT=10000
ENVIRONMENT=production
```

### Frontend: Vercel
**URL de Produção:** `https://gabarita-ai-frontend.vercel.app`

#### Configurações do Projeto
```
Framework Preset: Next.js
Root Directory: gabarita-ai-frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### Variáveis de Ambiente Necessárias
```bash
# API
NEXT_PUBLIC_API_URL=https://gabarita-ai-backend.onrender.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gabarita-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gabarita-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gabarita-ai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Mercado Pago (Frontend)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
```

## 🔧 Passos para Deploy

### 1. Preparar Repositório
```bash
# Commit todas as alterações
git add .
git commit -m "feat: configuração completa para deploy"
git push origin main
```

### 2. Deploy do Backend (Render)
1. Acesse [render.com](https://render.com)
2. Conecte sua conta GitHub
3. Clique em "New +" → "Web Service"
4. Selecione o repositório
5. Configure as opções acima
6. Adicione todas as variáveis de ambiente
7. Clique em "Create Web Service"
8. Aguarde o deploy (5-10 minutos)

### 3. Deploy do Frontend (Vercel)
1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório
5. Configure as opções acima
6. Adicione todas as variáveis de ambiente
7. Clique em "Deploy"
8. Aguarde o deploy (2-5 minutos)

## 🧪 Testes Pós-Deploy

### Backend
```bash
# Health Check
curl https://gabarita-ai-backend.onrender.com/health

# Teste de API
curl https://gabarita-ai-backend.onrender.com/api/performance
curl https://gabarita-ai-backend.onrender.com/api/ranking
curl https://gabarita-ai-backend.onrender.com/api/news
```

### Frontend
- Acesse: `https://gabarita-ai-frontend.vercel.app`
- Teste navegação entre páginas
- Verifique se os dados são carregados corretamente
- Teste funcionalidades de login/cadastro

## 🔒 Segurança

### Variáveis Sensíveis
- ✅ Todas as chaves de API estão em variáveis de ambiente
- ✅ Arquivos `.env` estão no `.gitignore`
- ✅ CORS configurado corretamente
- ✅ Headers de segurança configurados

### Monitoramento
- Logs disponíveis no painel do Render
- Métricas de performance no Vercel
- Alertas de erro configurados

## 🚨 Troubleshooting

### Problemas Comuns

#### Backend não inicia
1. Verifique os logs no Render
2. Confirme se todas as variáveis de ambiente estão configuradas
3. Verifique se o `requirements.txt` está correto

#### Frontend não carrega dados
1. Verifique se `NEXT_PUBLIC_API_URL` está correto
2. Teste os endpoints do backend diretamente
3. Verifique o console do navegador para erros

#### Erro de CORS
1. Confirme se `CORS_ORIGINS` inclui a URL do frontend
2. Verifique se as URLs estão corretas (com/sem barra final)

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs das plataformas
2. Confirme todas as configurações
3. Teste localmente primeiro
4. Consulte a documentação das plataformas

---

**Status: ✅ PRONTO PARA DEPLOY**

Todos os arquivos necessários foram criados e o projeto está configurado para deploy em produção.