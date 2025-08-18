"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Home page
 *
 * Landing page with welcome message, logo and navigation options
 */
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      // If user is authenticated, redirect to dashboard after a brief delay
      const timer = setTimeout(() => {
        router.push('/painel');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user && showWelcome) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para o painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Gabarit-AI" width={40} height={40} className="mr-3" />
          <span className="text-xl font-bold text-gray-800">Gabarit-AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">12 NÍVEL</span>
          <span className="text-sm text-gray-600">8 450 ACERTOS</span>
          <span className="text-sm text-gray-600">73%</span>
          <span className="text-sm font-medium text-blue-600">CNU 2025</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-500">⚠️ Sem plano ativo</span>
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium">
              Desempenho
            </button>
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">
              Planos
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <Image src="/logo.png" alt="Gabarit-AI" width={80} height={80} className="mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Gabarita.AI</h1>
            <p className="text-xl text-gray-600">Simulado Inteligente para o CNU 2025</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-center">
              Entrar
            </Link>
            <Link href="/cadastro" className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium transition-colors text-center">
              Cadastrar
            </Link>
            <Link href="/redacao" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-center">
              📝 Redação
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
