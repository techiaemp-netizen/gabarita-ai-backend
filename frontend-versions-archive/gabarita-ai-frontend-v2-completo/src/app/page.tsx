'use client';

import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Users, 
  Zap, 
  Target, 
  Star, 
  ArrowRight,
  CheckCircle,
  Play,
  BarChart3,
  Award
} from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'IA Personalizada',
      description: 'Questões geradas por inteligência artificial adaptadas ao seu nível de conhecimento.'
    },
    {
      icon: Trophy,
      title: 'Gamificação',
      description: 'Sistema de pontos, níveis e conquistas para tornar seus estudos mais engajantes.'
    },
    {
      icon: Target,
      title: 'Simulados Realistas',
      description: 'Simulados que reproduzem fielmente o formato dos principais concursos.'
    },
    {
      icon: BarChart3,
      title: 'Análise de Desempenho',
      description: 'Relatórios detalhados sobre seu progresso e áreas que precisam de mais atenção.'
    },
    {
      icon: Users,
      title: 'Ranking Global',
      description: 'Compete com outros estudantes e acompanhe sua posição no ranking.'
    },
    {
      icon: Zap,
      title: 'Aprendizado Rápido',
      description: 'Metodologia otimizada para maximizar seu aprendizado em menos tempo.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Estudantes Ativos' },
    { number: '1M+', label: 'Questões Resolvidas' },
    { number: '95%', label: 'Taxa de Aprovação' },
    { number: '24/7', label: 'Suporte Disponível' }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Aprovada em Concurso Federal',
      content: 'O Gabarita AI revolucionou minha forma de estudar. A gamificação me manteve motivada e as questões personalizadas foram fundamentais para minha aprovação.',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'Estudante de Direito',
      content: 'A plataforma é incrível! Os simulados são muito realistas e o sistema de ranking me incentiva a estudar mais. Recomendo para todos.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Concurseira',
      content: 'Nunca vi uma plataforma tão completa. A análise de desempenho me ajuda a focar nas matérias certas. Simplesmente perfeito!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Transforme seus estudos com
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Inteligência Artificial</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A plataforma mais avançada para concurseiros. Questões personalizadas, gamificação e análise de desempenho em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cadastro"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o Gabarita AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recursos inovadores que fazem a diferença na sua preparação
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O que nossos estudantes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de sucesso
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Pronto para acelerar seus estudos?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a milhares de estudantes que já estão usando a IA para estudar de forma mais inteligente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cadastro"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Criar Conta Gratuita
            </Link>
            <Link
              href="/planos"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Gabarita AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma de estudos mais avançada do Brasil. Transforme sua preparação com inteligência artificial.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/simulados" className="hover:text-white transition-colors">Simulados</Link></li>
                <li><Link href="/jogos" className="hover:text-white transition-colors">Jogos</Link></li>
                <li><Link href="/ranking" className="hover:text-white transition-colors">Ranking</Link></li>
                <li><Link href="/planos" className="hover:text-white transition-colors">Planos</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/contato" className="hover:text-white transition-colors">Contato</Link></li>
                <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Gabarita AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
