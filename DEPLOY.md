# Guia de Deploy - Gabarita AI

Este documento descreve como fazer o deploy da aplicação Gabarita AI usando diferentes métodos.

## Estrutura do Projeto

```
garabita-ai-completo/
├── src/                    # Backend (Flask/Python)
├── gabarita-ai-frontend/   # Frontend (Next.js)
├── Dockerfile             # Docker para backend
├── docker-compose.yml     # Orquestração completa
├── render.yaml           # Configuração Render (backend)
└── requirements.txt      # Dependências Python
```

## Métodos de Deploy

### 1. Deploy com Docker Compose (Recomendado para desenvolvimento)

#### Pré-requisitos
- Docker e Docker Compose instalados
- Arquivo `.env` configurado (use `.env.example` como base)

#### Comandos
```bash
# Clonar e configurar
git clone <repository-url>
cd gabarita-ai-completo
cp .env.example .env
# Editar .env com suas credenciais

# Build e execução
docker-compose up --build

# Executar em background
docker-compose up -d

# Parar serviços
docker-compose down
```

#### Acessos
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health Check: http://localhost:8000/health

### 2. Deploy no Render (Produção)

#### Backend
1. Conecte seu repositório no Render
2. Configure as variáveis de ambiente (ver `.env.example`)
3. Use o arquivo `render.yaml` existente
4. Deploy automático via Git push

#### Frontend
1. Crie um novo serviço web no Render
2. Configure:
   - Build Command: `cd gabarita-ai-frontend && npm ci && npm run build`
   - Start Command: `cd gabarita-ai-frontend && npm start`
   - Node Version: 18
3. Configure variáveis de ambiente do frontend

### 3. Deploy Manual

#### Backend
```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
export FLASK_ENV=production
# ... outras variáveis

# Executar
gunicorn -w 2 -k gthread -t 120 -b 0.0.0.0:8000 run:app
```

#### Frontend
```bash
cd gabarita-ai-frontend
npm ci
npm run build
npm start
```

## Variáveis de Ambiente

### Backend (.env)
```env
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# APIs
OPENAI_API_KEY=sk-your-key
MERCADOPAGO_ACCESS_TOKEN=your-token

# URLs
FRONTEND_URL=https://your-frontend-url
BACKEND_URL=https://your-backend-url
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
# ... outras variáveis Firebase
```

## CI/CD com GitHub Actions

O workflow `.github/workflows/deploy.yml` automatiza:

1. **Testes Backend**: Smoke tests e validações
2. **Testes Frontend**: Linting, testes unitários e build
3. **Deploy**: Automático para branch main/master

### Configuração de Secrets

No GitHub, configure os secrets:
```
RENDER_API_KEY=your-render-api-key
RENDER_BACKEND_SERVICE_ID=your-backend-service-id
RENDER_FRONTEND_SERVICE_ID=your-frontend-service-id
OPENAI_API_KEY=your-openai-key
FIREBASE_PROJECT_ID=your-firebase-project
```

## Monitoramento

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /` (página inicial)

### Logs
```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Render
# Acesse via dashboard do Render
```

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verifique `CORS_ORIGINS` no backend
   - Confirme URLs do frontend

2. **Firebase não conecta**
   - Verifique credenciais Firebase
   - Confirme formato da private key

3. **Build falha no frontend**
   - Verifique Node.js version (18+)
   - Confirme variáveis `NEXT_PUBLIC_*`

4. **Docker build lento**
   - Use `.dockerignore`
   - Considere multi-stage builds

### Comandos Úteis

```bash
# Verificar logs do Docker
docker-compose logs --tail=50 -f

# Rebuild específico
docker-compose up --build backend

# Limpar cache Docker
docker system prune -a

# Testar conectividade
curl http://localhost:8000/health
```

## Segurança

- ✅ Nunca commite arquivos `.env`
- ✅ Use secrets do GitHub/Render para credenciais
- ✅ Configure HTTPS em produção
- ✅ Mantenha dependências atualizadas
- ✅ Use usuários não-root nos containers

## Performance

- ✅ Gunicorn com múltiplos workers
- ✅ Next.js com output standalone
- ✅ Health checks configurados
- ✅ Restart policies definidas