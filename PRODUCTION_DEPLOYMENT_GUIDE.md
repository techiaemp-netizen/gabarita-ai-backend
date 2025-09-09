# Guia de Deploy em Produção - Gabarita AI

## 📋 Visão Geral

Este guia fornece instruções completas para deploy do projeto Gabarita AI em ambiente de produção.

## 🏗️ Arquitetura do Sistema

- **Frontend**: Next.js 14 (React)
- **Backend**: Flask (Python)
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Autenticação**: JWT
- **Integração IA**: OpenAI GPT

## 🔧 Pré-requisitos

### Ambiente de Desenvolvimento
- Node.js 20.15.1+
- Python 3.9+
- npm ou yarn
- Git

### Serviços Externos
- Conta OpenAI (para geração de questões)
- Plataforma de deploy (Vercel, Render, etc.)
- Banco de dados PostgreSQL (produção)

## 🚀 Deploy Frontend (Vercel)

### 1. Preparação
```bash
cd gabarita-frontend-deploy
npm install
npm run build
```

### 2. Configuração Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://seu-backend.render.com/api/$1"
    }
  ]
}
```

### 3. Variáveis de Ambiente Frontend
```env
# .env.production
NEXT_PUBLIC_API_URL=https://seu-backend.render.com
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-super-forte
NEXTAUTH_URL=https://seu-app.vercel.app
```

## 🖥️ Deploy Backend (Render)

### 1. Preparação
```bash
cd gabarita-ai-backend
pip install -r requirements.txt
```

### 2. Configuração Render
Crie um arquivo `render.yaml`:
```yaml
services:
  - type: web
    name: gabarita-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python run.py
    envVars:
      - key: FLASK_ENV
        value: production
      - key: SECRET_KEY
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: gabarita-db
          property: connectionString
      - key: OPENAI_API_KEY
        sync: false

databases:
  - name: gabarita-db
    databaseName: gabarita
    user: gabarita_user
```

### 3. Variáveis de Ambiente Backend
```env
# .env.production
FLASK_ENV=production
SECRET_KEY=sua-chave-jwt-super-secreta-256-bits
DATABASE_URL=postgresql://user:pass@host:port/dbname
OPENAI_API_KEY=sk-sua-chave-openai
CORS_ORIGINS=https://seu-app.vercel.app
JWT_SECRET_KEY=sua-chave-jwt-diferente-da-flask
```

## 🔒 Configurações de Segurança

### 1. CORS Produção
```python
# config/config.py
class ProductionConfig(Config):
    DEBUG = False
    CORS_ORIGINS = [
        "https://seu-app.vercel.app",
        "https://seu-dominio.com"
    ]
    CORS_ALLOW_CREDENTIALS = True
```

### 2. Headers de Segurança
```python
# middleware/security.py
from flask import Flask
from flask_talisman import Talisman

def configure_security(app: Flask):
    Talisman(app, 
        force_https=True,
        strict_transport_security=True,
        content_security_policy={
            'default-src': "'self'",
            'script-src': "'self' 'unsafe-inline'",
            'style-src': "'self' 'unsafe-inline'"
        }
    )
```

### 3. Rate Limiting
```python
# middleware/rate_limit.py
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```

## 📊 Monitoramento

### 1. Health Check
```python
# routes/health.py
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }
```

### 2. Logging
```python
# config/logging.py
import logging
from logging.handlers import RotatingFileHandler

def configure_logging(app):
    if not app.debug:
        file_handler = RotatingFileHandler(
            'logs/gabarita.log', 
            maxBytes=10240, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s'
        ))
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
```

## 🗄️ Banco de Dados

### 1. Migração para PostgreSQL
```python
# config/database.py
import os
from sqlalchemy import create_engine

class ProductionConfig:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

### 2. Backup Automático
```bash
#!/bin/bash
# scripts/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## ✅ Checklist de Deploy

### Pré-Deploy
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Build do frontend sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado
- [ ] Chaves de API válidas

### Deploy
- [ ] Frontend deployado no Vercel
- [ ] Backend deployado no Render
- [ ] Banco de dados migrado
- [ ] DNS configurado
- [ ] SSL/HTTPS ativo

### Pós-Deploy
- [ ] Health check funcionando
- [ ] Autenticação funcionando
- [ ] Geração de questões funcionando
- [ ] Logs sendo coletados
- [ ] Monitoramento ativo
- [ ] Backup configurado

## 🚨 Troubleshooting

### Problemas Comuns

1. **CORS Error**
   - Verificar CORS_ORIGINS no backend
   - Confirmar URLs corretas

2. **JWT Token Invalid**
   - Verificar JWT_SECRET_KEY
   - Confirmar sincronização de tempo

3. **Database Connection**
   - Verificar DATABASE_URL
   - Confirmar credenciais

4. **OpenAI API Error**
   - Verificar OPENAI_API_KEY
   - Confirmar créditos disponíveis

### Comandos Úteis
```bash
# Verificar logs do backend
curl https://seu-backend.render.com/health

# Testar autenticação
curl -X POST https://seu-backend.render.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Verificar status do frontend
curl https://seu-app.vercel.app/api/health
```

## 📞 Suporte

Para suporte técnico:
- Documentação: `/docs`
- Issues: GitHub Issues
- Email: suporte@gabarita.ai

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Autor**: Equipe Gabarita AI