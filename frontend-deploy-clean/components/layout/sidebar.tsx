'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileQuestion,
  Clock,
  User,
  CreditCard,
  Trophy,
  Newspaper,
  HelpCircle,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Gamepad2
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral'
  },
  {
    title: 'Questões',
    href: '/questoes',
    icon: FileQuestion,
    description: 'Pratique questões'
  },
  {
    title: 'Simulados',
    href: '/simulados',
    icon: Clock,
    description: 'Simulados completos'
  },
  {
    title: 'Jogos',
    href: '/jogos',
    icon: Gamepad2,
    description: 'Jogos educativos'
  },
  {
    title: 'Perfil',
    href: '/perfil',
    icon: User,
    description: 'Seus dados'
  },
  {
    title: 'Planos',
    href: '/planos',
    icon: CreditCard,
    description: 'Assinaturas'
  },
  {
    title: 'Ranking',
    href: '/ranking',
    icon: Trophy,
    description: 'Classificação'
  },
  {
    title: 'Notícias',
    href: '/noticias',
    icon: Newspaper,
    description: 'Atualizações'
  },
  {
    title: 'Ajuda',
    href: '/ajuda',
    icon: HelpCircle,
    description: 'Suporte'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const pathname = usePathname();

  return (
    <div className={cn(
      'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-semibold text-slate-800">Gabarita.AI</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
              )} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.title}</div>
                  <div className="text-xs text-slate-400 truncate">{item.description}</div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Link
          href="/configuracoes"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <Settings className="h-5 w-5 flex-shrink-0 text-slate-500" />
          {!isCollapsed && <span>Configurações</span>}
        </Link>
        
        <button
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export { Sidebar };