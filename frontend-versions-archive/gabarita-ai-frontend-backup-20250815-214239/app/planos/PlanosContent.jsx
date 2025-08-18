"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

/**
 * PlanosContent component with useSearchParams fix for Vercel
 */
export default function PlanosContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Get plan from URL parameters
  const planoSelecionado = searchParams.get('plano');

  const plans = [
    {
      id: 'semanal',
      name: 'Semanal',
      price: 'R$ 5,90',
      period: '7 dias',
      description: 'Acesso básico por 1 semana',
      features: ['Questões ilimitadas'],
      color: 'blue',
      icon: '⚡'
    },
    {
      id: 'mensal',
      name: 'Mensal',
      price: 'R$ 14,90',
      period: '30 dias',
      description: 'Acesso completo por 1 mês',
      features: ['Questões ilimitadas'],
      color: 'green',
      icon: '⭐',
      popular: true
    },
    {
      id: 'bimestral',
      name: 'Bimestral',
      price: 'R$ 20,00',
      period: '60 dias',
      description: 'Acesso completo por 2 meses',
      features: ['Questões ilimitadas'],
      color: 'purple',
      icon: '👑'
    }
  ];

  useEffect(() => {
    if (planoSelecionado) {
      const plan = plans.find(p => p.id === planoSelecionado);
      if (plan) {
        setSelectedPlan(plan);
      }
    }
  }, [planoSelecionado]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    // Update URL with selected plan
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('plano', plan.id);
    router.push(newUrl.pathname + newUrl.search);
  };

  const handleSubscribe = async (plan) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // Implement subscription logic here
      console.log('Subscribing to plan:', plan);
      // Redirect to payment or success page
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/painel" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Painel
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano ideal para seus estudos e tenha acesso completo à plataforma Gabarita AI
          </p>
          
          {planoSelecionado && (
            <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-lg inline-block">
              Plano selecionado: <strong>{planoSelecionado}</strong>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-green-500' : ''
              } ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{plan.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">{plan.price}</div>
                  <div className="text-gray-600">por {plan.period}</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      selectedPlan?.id === plan.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPlan?.id === plan.id ? 'Selecionado' : 'Selecionar'}
                  </button>
                  
                  {selectedPlan?.id === plan.id && (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      className="w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Assinar Agora
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Todos os planos incluem acesso completo às funcionalidades da plataforma
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ Suporte 24/7</span>
            <span>✓ Atualizações gratuitas</span>
            <span>✓ Cancelamento a qualquer momento</span>
          </div>
        </div>
      </div>
    </div>
  );
}