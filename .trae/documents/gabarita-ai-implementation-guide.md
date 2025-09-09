# Gabarita.AI - Frontend Implementation Guide

**Detailed Implementation Roadmap with Code Examples**

**Autor:** SOLO Document\
**Data:** Janeiro 2025\
**Versão:** 2.0

## 1. Project Setup and Structure

### 1.1 Recommended Folder Structure

```
gabarita-ai-frontend/
├── public/
│   ├── images/
│   └── icons/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Navigation.tsx
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProfileForm.tsx
│   │   ├── charts/
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── ProgressChart.tsx
│   │   │   └── AccuracyChart.tsx
│   │   └── features/
│   │       ├── questions/
│   │       ├── simulations/
│   │       ├── dashboard/
│   │       └── plans/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── QuestionsPage.tsx
│   │   ├── SimulationsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── PlansPage.tsx
│   │   ├── RankingPage.tsx
│   │   ├── NewsPage.tsx
│   │   └── HelpPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePerformance.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── storage.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── question.ts
│   │   ├── simulation.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

### 1.2 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "lucide-react": "^0.263.0",
    "recharts": "^2.5.0",
    "react-hook-form": "^7.43.0",
    "zod": "^3.20.0",
    "@hookform/resolvers": "^2.9.0",
    "clsx": "^1.2.0",
    "tailwind-merge": "^1.10.0",
    "framer-motion": "^10.0.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.2.0",
    "typescript": "^4.9.0",
    "vite": "^4.1.0"
  }
}
```

## 2. Core Components Implementation

### 2.1 Layout Components

**Sidebar Component (Notion-style)**

```tsx
// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Timer, 
  User, 
  CreditCard, 
  Trophy, 
  Newspaper, 
  HelpCircle 
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Questões', href: '/questoes', icon: BookOpen },
  { name: 'Simulados', href: '/simulados', icon: Timer },
  { name: 'Perfil', href: '/perfil', icon: User },
  { name: 'Planos', href: '/planos', icon: CreditCard },
  { name: 'Ranking', href: '/ranking', icon: Trophy },
  { name: 'Notícias', href: '/noticias', icon: Newspaper },
  { name: 'Ajuda', href: '/aj
```

