# Deploy do Backend Gabarita AI no Render

## ✅ STATUS: PRONTO PARA DEPLOY

### 📋 Pré-requisitos Completos
- ✅ Conta no Render (https://render.com)
- ✅ Repositório GitHub atualizado: `https://github.com/techiaemp-netizen/gabarita-ai-frontend`
- ✅ Branch: `gabarita-frontend-deploy`
- ✅ Código do backend em: `gabarita-ai-backend/`
- ✅ requirements.txt configurado
- ✅ Arquivos de configuração criados

## 🚀 DEPLOY MANUAL (RECOMENDADO)

### Passo 1: Acesse o Render
1. Vá para https://render.com
2. Faça login na sua conta
3. Clique em **"New +"** → **"Web Service"**

### Passo 2: Conecte o Repositório
1. Selecione **"Build and deploy from a Git repository"**
2. Conecte sua conta GitHub se necessário
3. Selecione o repositório: `techiaemp-netizen/gabarita-ai-frontend`
4. Branch: `gabarita-frontend-deploy`

### Passo 3: Configurações do Serviço
```
Name: gabarita-ai-backend
Region: Oregon (US West)
Branch: gabarita-frontend-deploy
Root Directory: gabarita-ai-backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn --bind 0.0.0.0:$PORT src.main:app
Instance Type: Free
```

### Passo 4: Variáveis de Ambiente
Adicione estas variáveis no Render:

```bash
# Configurações Flask
FLASK_ENV=production
FLASK_DEBUG=False
PYTHON_VERSION=3.11.0

# Configurações de Produção
PORT=10000
CORS_ORIGINS=*

# APIs (Configure conforme necessário)
OPENAI_API_KEY=sua_chave_openai_aqui
FIREBASE_CREDENTIALS=seu_json_firebase_base64_aqui

# Configurações de Banco (se necessário)
DATABASE_URL=sua_url_banco_aqui
```

### Passo 5: Deploy
1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (5-10 minutos)
3. Sua aplicação estará disponível em: `https://gabarita-ai-backend.onrender.com`

## 🔧 DEPLOY AUTOMÁTICO (OPCIONAL)

### Usando Script Python
```bash
# 1. Obtenha sua API key do Render
# Acesse: https://dashboard.render.com/account/api-keys

# 2. Configure a API key
set RENDER_API_KEY=sua_api_key_aqui

# 3. Execute o script
python deploy_render.py
```

## 📊 VERIFICAÇÃO DO DEPLOY

### Endpoints para Testar
```bash
# Health Check
curl https://gabarita-ai-backend.onrender.com/health

# API Auth
curl -X POST https://gabarita-ai-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# API Status
curl https://gabarita-ai-backend.onrender.com/api/status
```

### Logs e Monitoramento
- Dashboard: https://dashboard.render.com
- Logs em tempo real no dashboard
- Métricas de performance disponíveis

## 🔗 CONFIGURAÇÃO DO FRONTEND

Após o deploy, atualize a URL da API no frontend:

```javascript
// Em gabarita-frontend-clean/src/config/api.js
const API_BASE_URL = 'https://gabarita-ai-backend.onrender.com';
```

## 🐛 TROUBLESHOOTING

### Problemas Comuns
1. **Build falha**: Verifique requirements.txt
2. **Start falha**: Confirme o comando gunicorn
3. **502 Error**: Verifique se a aplicação está rodando na porta $PORT
4. **CORS Error**: Configure CORS_ORIGINS corretamente

### Comandos de Debug
```bash
# Testar localmente
gunicorn --bind 0.0.0.0:5000 src.main:app

# Verificar dependências
pip install -r requirements.txt

# Testar endpoints
python test_api.py
```

## 📁 ESTRUTURA DE ARQUIVOS

```
garabita-ai-backend/
├── src/
│   ├── main.py          # Aplicação Flask principal
│   ├── auth/            # Sistema de autenticação
│   └── api/             # Endpoints da API
├── requirements.txt     # Dependências Python
├── render.yaml         # Configuração Infrastructure as Code
├── deploy_render.py    # Script de deploy automático
└── test_api.py         # Testes da API
```

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Deploy Manual**: Siga os passos acima
2. ⚙️ **Configure Variáveis**: Adicione suas API keys
3. 🧪 **Teste Endpoints**: Verifique se tudo funciona
4. 🔗 **Conecte Frontend**: Atualize URLs no frontend
5. 🚀 **Deploy Frontend**: Deploy do frontend no Vercel

## 📞 SUPORTE

- Documentação Render: https://render.com/docs
- Dashboard: https://dashboard.render.com
- Status Page: https://status.render.com

---

**🎉 DEPLOY PRONTO! Sua aplicação está configurada e pronta para produção!**