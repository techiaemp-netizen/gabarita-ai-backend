'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  sidebarCollapsed: boolean;
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, title, subtitle }) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className={cn(
      'fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'left-16' : 'left-64'
    )}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Title Section */}
        <div className="flex-1">
          {title && (
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-600">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </span>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <h3 className="font-medium text-slate-800">Notificações</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <p className="text-sm font-medium text-slate-800">Nova questão disponível</p>
                    <p className="text-xs text-slate-600 mt-1">Matemática - Álgebra Linear</p>
                    <p className="text-xs text-slate-400 mt-1">há 2 horas</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <p className="text-sm font-medium text-slate-800">Simulado concluído</p>
                    <p className="text-xs text-slate-600 mt-1">Resultado: 85% de acertos</p>
                    <p className="text-xs text-slate-400 mt-1">há 1 dia</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <p className="text-sm font-medium text-slate-800">Plano renovado</p>
                    <p className="text-xs text-slate-600 mt-1">Plano Premium ativo até 15/02/2025</p>
                    <p className="text-xs text-slate-400 mt-1">há 3 dias</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-slate-100">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800">João Silva</p>
                <p className="text-xs text-slate-600">Plano Premium</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <a href="/perfil" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Meu Perfil
                </a>
                <a href="/configuracoes" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Configurações
                </a>
                <a href="/planos" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Meu Plano
                </a>
                <hr className="my-2 border-slate-100" />
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };