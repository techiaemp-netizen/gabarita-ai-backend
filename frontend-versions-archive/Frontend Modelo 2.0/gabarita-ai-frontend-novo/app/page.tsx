'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  Target, 
  Trophy, 
  BarChart3, 
  Users, 
  Zap,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  // Se o usuário estiver logado, redirecionar para o dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Image 
              src="/images/logo.jpg" 
              alt="Gabarita.AI" 
              width={80} 
              height={80}
              className="mx-auto rounded-2xl mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gabarita.AI</h1>
            <p className="text-gray-600 mb-6">Simulado Inteligente para o CNU 2025</p>
            
            <div className="space-y-4">
              <Link 
                href="/dashboard"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Ir para Dashboard</span>
                <ArrowRight size={20} />
              </Link>
              
              <Link 
                href="/simulado"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Começar Simulado</span>
                <Target size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Image 
              src="/images/logo.jpg" 
              alt="Gabarita.AI" 
              width={120} 
              height={120}
              className="mx-auto rounded-3xl shadow-lg"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gabarita<span className="text-blue-600">.AI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Simulado Inteligente para o <span className="font-bold text-blue-600">CNU 2025</span>
          </p>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Prepare-se para o Concurso Nacional Unificado com nossa plataforma de estudos 
            gamificada, powered by IA. Simulados personalizados, análise detalhada de 
            desempenho e muito mais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Começar Agora - Grátis
            </Link>
            <Link 
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Por que escolher o Gabarita.AI?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">IA Personalizada</h3>
              <p className="text-gray-600">
                Nossa inteligência artificial adapta as questões ao seu nível de conhecimento, 
                focando nas suas dificuldades específicas.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gamificação</h3>
              <p className="text-gray-600">
                Sistema de níveis, XP, conquistas e ranking para manter você motivado 
                durante toda a jornada de estudos.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Análise Detalhada</h3>
              <p className="text-gray-600">
                Relatórios completos de desempenho com insights sobre seus pontos 
                fortes e áreas que precisam de mais atenção.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-blue-100">Questões Disponíveis</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5k+</div>
              <div className="text-blue-100">Estudantes Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Taxa de Aprovação</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-blue-100">Avaliação dos Usuários</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para gabaritar no CNU 2025?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Junte-se a milhares de estudantes que já estão se preparando com o Gabarita.AI
          </p>
          <Link 
            href="/signup"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
          >
            <span>Começar Agora - É Grátis</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
}
