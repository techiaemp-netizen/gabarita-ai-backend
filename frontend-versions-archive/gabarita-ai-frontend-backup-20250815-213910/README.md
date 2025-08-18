# Gabarita.AI Frontend

Este repositório contém o código de interface do projeto **Gabarita.AI**, uma plataforma gamificada de estudos para concursos elaborados pela FGV. A aplicação foi construída com **Next.js** usando o **App Router**, **Tailwind CSS**, **Firebase** para autenticação e banco de dados, **Recharts** para gráficos e **Lucide React** para ícones. Além disso, alguns componentes de UI inspirados no [shadcn/ui](https://ui.shadcn.com/) foram recriados localmente para tornar a interface consistente.

## Funcionalidades principais

- **Autenticação com Google** via Firebase Auth.
- **Dashboard (Painel)** com barra de progresso do usuário, cartões de desempenho por tema e estatísticas diárias.
- **Simulados interativos** com perguntas de múltipla escolha, temporizador e barra de progresso.
- **Tela de desempenho** com gráficos de linha para acompanhar a evolução por tema.
- **Ranking nacional** filtrado por cargo e bloco, com medalhas para os primeiros colocados.
- **Feed de notícias** exibindo as últimas novidades sobre concursos (dados estáticos de exemplo).

## Estrutura de pastas

```
gabarita-ai-frontend/
├── app/               # Páginas da aplicação (App Router)
│   ├── layout.jsx      # Layout global com cabeçalho e navegação
│   ├── page.jsx        # Página raiz: redireciona para /painel ou /login
│   ├── login/page.jsx  # Tela de login
│   ├── painel/page.jsx # Dashboard
│   ├── simulado/page.jsx # Simulado de questões
│   ├── desempenho/page.jsx # Gráficos de desempenho
│   ├── ranking/page.jsx # Lista de ranking
│   └── noticias/page.jsx # Feed de notícias
├── components/        # Componentes reutilizáveis
│   ├── Header.jsx
│   ├── NavDrawer.jsx
│   ├── ProgressBar.jsx
│   ├── CardDesempenho.jsx
│   ├── SimuladoQuestionCard.jsx
│   └── NewsItem.jsx
├── components/ui/     # Componentes de UI inspirados em shadcn/ui
│   ├── Button.jsx
│   ├── Card.jsx
│   └── Input.jsx
├── config/
│   ├── tailwind.config.js
│   └── firebase.js
├── styles/
│   └── globals.css
├── utils/
│   ├── auth.js
│   └── firestore.js
├── public/
│   └── logo.png        # Logo da aplicação (placeholder)
├── .env.example        # Exemplo de variáveis de ambiente do Firebase
├── package.json
└── README.md
```

## Como executar

Para rodar o projeto localmente você precisará do **Node.js** (versão 18 ou superior).

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo `.env.example` para `.env.local` e preencha com as credenciais do seu projeto no Firebase:

   ```bash
   cp .env.example .env.local
   # edite o arquivo `.env.local` com suas chaves
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para visualizar a aplicação.

## Considerações

- Este projeto foi criado para fins de protótipo e demonstração. Alguns dados são estáticos e devem ser substituídos por chamadas ao Firestore ou outras APIs conforme sua necessidade.
- Os componentes de UI foram implementados manualmente para evitar dependências externas adicionais, mas seguem a filosofia de simplicidade e leveza do shadcn/ui.
- As cores, fontes e estilos foram escolhidos para refletir uma interface moderna e minimalista inspirada em Notion, ChatGPT e Duolingo.

Sinta‑se à vontade para ajustar o estilo e a lógica para atender aos requisitos específicos da sua aplicação. Bons estudos e boa sorte nos concursos!
