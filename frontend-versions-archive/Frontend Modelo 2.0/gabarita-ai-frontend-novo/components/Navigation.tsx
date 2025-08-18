'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  BarChart3, 
  CreditCard, 
  Trophy, 
  TrendingUp, 
  Newspaper, 
  HelpCircle,
  LogOut,
  BookOpen,
  Home
} from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const menuItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/simulado', icon: BookOpen, label: 'Simulado' },
    { href: '/desempenho', icon: BarChart3, label: 'Desempenho' },
    { href: '/ranking', icon: Trophy, label: 'Ranking' },
    { href: '/planos', icon: CreditCard, label: 'Planos' },
    { href: '/noticias', icon: Newspaper, label: 'Notícias' },
    { href: '/perfil', icon: User, label: 'Perfil' },
    { href: '/ajuda', icon: HelpCircle, label: 'Ajuda' },
  ];

  if (!user) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/images/logo.jpg" 
                alt="Gabarita.AI" 
                width={32} 
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">Gabarita.AI</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </Link>
              <Link 
                href="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image 
              src="/images/logo.jpg" 
              alt="Gabarita.AI" 
              width={32} 
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-gray-900">Gabarita.AI</span>
          </Link>

          {/* Gamification Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">NÍVEL</span>
                <span className="font-bold text-blue-600">{user.level}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">XP</span>
                <span className="font-bold text-green-600">{user.xp.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">ACERTOS</span>
                <span className="font-bold text-purple-600">{user.accuracy}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">CNU 2025</span>
              </div>
            </div>

            {/* Plan Status */}
            <div className="flex items-center space-x-2">
              {user.plan === 'free' && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  ⚠️ Sem plano ativo
                </span>
              )}
              <Link 
                href="/desempenho"
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                📊 Desempenho
              </Link>
              <Link 
                href="/planos"
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm font-medium"
              >
                💳 Planos
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {/* Mobile stats */}
            <div className="flex justify-between items-center px-3 py-2 text-sm">
              <div className="flex space-x-4">
                <span>Nível: <strong>{user.level}</strong></span>
                <span>XP: <strong>{user.xp.toLocaleString()}</strong></span>
                <span>Acertos: <strong>{user.accuracy}%</strong></span>
              </div>
            </div>
            
            {/* Menu items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-left"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

