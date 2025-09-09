# Projeto Gabarita.AI

Este repositório contém uma cópia estática do backend (não modificada) e um novo frontend em Next.js/TypeScript que implementa um cliente moderno e responsivo para a API.

## Estrutura

```
project/
├─ backend/                 # referência ao backend original (não foi modificado)
│  └─ README.md             # instruções para buscar o backend original
├─ gabarita-fe/             # novo frontend Next.js
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ next.config.js
│  ├─ .env.example
│  ├─ .env.local            # baseURL da API (edite conforme necessário)
│  ├─ src/
│  │  ├─ lib/
│  │  │  └─ api.ts          # cliente Axios com interceptor para normalizar responses
│  │  ├─ sdk/
│  │  │  └─ index.ts        # funções para cada endpoint
│  │  └─ app/
│  │     ├─ page.tsx        # página inicial
│  │     ├─ status/
│  │     │  └─ page.tsx
│  │     ├─ opcoes/
│  │     │  ├─ page.tsx
│  │     │  ├─ cargos/
│  │     │  │  └─ [bloco]/page.tsx
│  │     │  └─ blocos/
│  │     │     └─ [cargo]/page.tsx
│  │     ├─ questoes/
│  │     │  └─ page.tsx
│  │     ├─ payments/
│  │     │  └─ page.tsx
│  │     └─ perfil/
│  │        └─ [id]/page.tsx
│  ├─ scripts/
│  │  └─ smoke.mjs          # testes de contrato automatizados
├─ contracts/
│  └─ openapi.yaml          # contrato OpenAPI 3.0 inicial
└─ README.md                # este arquivo
```

## Como utilizar

1. **Backend**: o backend não foi incluído neste pacote. Consulte o arquivo `backend/README.md` para obter instruções de acesso ao repositório original do backend.

2. **Frontend**:
   - Navegue até `project/gabarita-fe`.
   - Crie um arquivo `.env.local` (já incluído com um valor de exemplo) e defina `NEXT_PUBLIC_API_URL` para a URL base do backend (sem o sufixo `/api`).
   - Instale as dependências e execute o projeto localmente:
     ```bash
     npm install
     npm run dev
     ```
   - A aplicação será executada em `http://localhost:3000`. Navegue pelas rotas listadas na home para testar a integração com a API.

3. **Testes de contrato**:
   - Para executar o script de verificação do contrato, defina a mesma variável de ambiente `NEXT_PUBLIC_API_URL` e rode:
     ```bash
     node scripts/smoke.mjs
     ```
   - O script emite um relatório em JSON com o status de cada endpoint.

## Observações

- Este frontend foi construído de forma independente, sem reutilizar código do frontend anterior. O objetivo é oferecer uma base limpa e moderna, alinhada ao contrato do backend.
- Quaisquer ajustes adicionais, como estilização avançada ou novas rotas, podem ser implementados em cima desta estrutura básica.