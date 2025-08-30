# Como Executar o Gabarita.AI Localmente

## Estrutura do Projeto

Este é um monorepo que contém:
- **Backend Flask** (pasta `src/`)
- **Frontend Next.js** (pasta `gabarita-ai-frontend/`)
- **Landing Page** (pasta `gabarita-ai-landing/`)

## Pré-requisitos

- **Python 3.8+** (para o backend)
- **Node.js 18+** (para o frontend)
- **npm** (gerenciador de pacotes)

## Instalação Rápida

### 1. Instalar todas as dependências
```bash
npm run install-all
```

### 2. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure as variáveis necessárias.

## Comandos Disponíveis

### Executar o projeto completo (recomendado)
```bash
npm run dev
```
Este comando inicia simultaneamente:
- Backend Flask na porta 5000
- Frontend Next.js na porta 3000

### Executar componentes separadamente

#### Apenas o Backend
```bash
npm run backend
```
Ou diretamente:
```bash
cd src
python main.py
```

#### Apenas o Frontend
```bash
npm run frontend
```
Ou diretamente:
```bash
cd gabarita-ai-frontend
npm run dev
```

#### Apenas a Landing Page
```bash
npm run landing
```

### Comandos de Build

```bash
# Build do frontend
npm run build-frontend

# Build da landing page
npm run build-landing
```

### Comandos de Teste

```bash
# Testes do frontend
npm run test-frontend

# Lint do frontend
npm run lint-frontend
```

## URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Landing Page**: http://localhost:3001 (quando executada separadamente)

## Solução de Problemas

### Erro "Command not found"
Certifique-se de que está na pasta raiz do projeto (`gabarita-ai-completo-20250723`).

### Erro de dependências
Execute:
```bash
npm run install-all
```

### Backend não inicia
Verifique se o Python está instalado e as dependências do backend:
```bash
cd src
pip install -r ../requirements.txt
```

### Frontend não inicia
Verifique se o Node.js está instalado:
```bash
cd gabarita-ai-frontend
npm install
```

## Estrutura de Pastas

```
gabarita-ai-completo-20250723/
├── src/                     # Backend Flask
├── gabarita-ai-frontend/    # Frontend Next.js
├── gabarita-ai-landing/     # Landing Page
├── package.json             # Scripts do monorepo
└── requirements.txt         # Dependências Python
```

## Desenvolvimento

Para desenvolvimento, recomenda-se usar o comando `npm run dev` que inicia ambos os serviços simultaneamente com hot-reload ativado.