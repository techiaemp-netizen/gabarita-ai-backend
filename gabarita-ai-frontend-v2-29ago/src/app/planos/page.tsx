'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Plan } from '@/types';
import { Check, Star, Zap, Crown, ArrowRight, Loader2, AlertTriangle, Shield, Users } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';

const PLAN_FEATURES = {
  free: [
    '5 questões por dia',
    'Simulados básicos',
    'Estatísticas simples',
    'Suporte por email'
  ],
  premium: [
    'Questões ilimitadas',
    'Todos os simulados',
    'Estatísticas avançadas',
    'Jogos educativos',
    'Ranking nacional',
    'Suporte prioritário',
    'Relatórios detalhados',
    'Histórico completo'
  ],
  vip: [
    'Tudo do Premium',
    'IA personalizada',
    'Simulados personalizados',
    'Mentoria individual',
    'Acesso antecipado',
    'Suporte 24/7',
    'Certificados',
    'Grupo VIP exclusivo'
  ]
};

const PLAN_CONFIGS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    originalPrice: null,
    period: 'Sempre grátis',
    description: 'Perfeito para começar seus estudos',
    icon: Shield,
    color: 'gray',
    popular: false,
    features: PLAN_FEATURES.free
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.90,
    originalPrice: 49.90,
    period: '/mês',
    description: 'Ideal para estudantes dedicados',
    icon: Star,
    color: 'blue',
    popular: true,
    features: PLAN_FEATURES.premium
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 79.90,
    originalPrice: 129.90,
    period: '/mês',
    description: 'Para quem busca a excelência',
    icon: Crown,
    color: 'purple',
    popular: false,
    features: PLAN_FEATURES.vip
  }
];

const TESTIMONIALS = [
  {
    name: 'Maria Silva',
    role: 'Aprovada em Medicina',
    content: 'O Gabarita AI foi fundamental na minha aprovação. As questões são muito bem elaboradas e o sistema de estatísticas me ajudou a focar nos pontos fracos.',
    rating: 5,
    plan: 'Premium'
  },
  {
    name: 'João Santos',
    role: 'Concurso Público',
    content: 'Excelente plataforma! Os simulados são muito realistas e me prepararam perfeitamente para a prova. Recomendo demais!',
    rating: 5,
    plan: 'VIP'
  },
  {
    name: 'Ana Costa',
    role: 'Estudante ENEM',
    content: 'Uso há 6 meses e já vejo uma grande melhora nas minhas notas. A gamificação torna o estudo muito mais interessante.',
    rating: 5,
    plan: 'Premium'
  }
];

export default function PlanosPage() {
  const { user, isPaymentPending } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentPendingParam = searchParams.get('payment_pending');
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserPlan, setCurrentUserPlan] = useState<string>('free');

  useEffect(() => {
    if (user) {
      // Buscar plano atual do usuário
      setCurrentUserPlan(user.planId || 'free');
    }
  }, [user]);

  const handlePlanSelection = async (planId: string) => {
    if (planId === 'free') {
      // Plano gratuito - não precisa de pagamento
      return;
    }

    setIsLoading(true);
    try {
      // Redirecionar para pagamento com plano selecionado
      window.location.href = `/pagamento?plano=${planId}`;
    } catch (error) {
      console.error('Erro ao selecionar plano:', error);
      alert('Erro ao selecionar plano');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (color: string) => {
    const colors = {
      gray: 'border-gray-200 text-gray-600',
      blue: 'border-blue-500 text-blue-600 bg-blue-50',
      purple: 'border-purple-500 text-purple-600 bg-purple-50'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getPlanButtonColor = (color: string, isCurrentPlan: boolean) => {
    if (isCurrentPlan) {
      return 'bg-gray-400 text-white cursor-not-allowed';
    }
    
    const colors = {
      gray: 'bg-gray-600 hover:bg-gray-700 text-white',
      blue: 'bg-blue-600 hover:bg-blue-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <ProtectedRoute feature="planos">
      <div className="min-h-screen bg-gray-50">
        <Navigation />
      
      {/* Aviso de Pagamento Pendente */}
      {(paymentPendingParam === 'true' || isPaymentPending()) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Pagamento Pendente:</strong> Você possui um pagamento pendente. 
                  Para acessar todas as funcionalidades, escolha um plano e efetue o pagamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha o Plano Ideal
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Acelere seus estudos com nossa plataforma completa
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>+50.000 estudantes</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              <span>IA avançada</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <span>4.9/5 estrelas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planos e Preços
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Escolha o plano que melhor se adapta ao seu ritmo de estudos e objetivos acadêmicos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLAN_CONFIGS.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentUserPlan === plan.id;
              const isPopular = plan.popular;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                    isPopular ? 'border-blue-500 scale-105' : 'border-gray-200'
                  } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Atual
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 mb-4 ${
                        getPlanColor(plan.color)
                      }`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="mb-4">
                        {plan.originalPrice && (
                          <div className="text-sm text-gray-500 line-through mb-1">
                            R$ {plan.originalPrice.toFixed(2)}
                          </div>
                        )}
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900">
                            {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-gray-600 ml-1">{plan.period}</span>
                          )}
                        </div>
                        {plan.price === 0 && (
                          <div className="text-sm text-gray-600">{plan.period}</div>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePlanSelection(plan.id)}
                      disabled={isLoading || isCurrentPlan}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        getPlanButtonColor(plan.color, isCurrentPlan)
                      }`}
                    >
                      {isCurrentPlan 
                        ? 'Plano Atual' 
                        : isLoading 
                        ? 'Processando...' 
                        : plan.price === 0 
                        ? 'Começar Grátis' 
                        : 'Assinar Agora'
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Perguntas Frequentes
            </h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Posso cancelar minha assinatura a qualquer momento?
                </h3>
                <p className="text-gray-600">
                  Sim! Você pode cancelar sua assinatura a qualquer momento através do seu painel de controle. 
                  Não há taxas de cancelamento e você continuará tendo acesso até o final do período pago.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Como funciona o período de teste?
                </h3>
                <p className="text-gray-600">
                  Oferecemos 7 dias grátis para novos usuários testarem todos os recursos premium. 
                  Após o período, você pode escolher continuar com o plano pago ou voltar ao plano gratuito.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quais formas de pagamento são aceitas?
                </h3>
                <p className="text-gray-600">
                  Aceitamos cartões de crédito, débito, PIX e boleto bancário através do Mercado Pago. 
                  Todos os pagamentos são processados de forma segura.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Posso mudar de plano depois?
                </h3>
                <p className="text-gray-600">
                  Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As alterações entram em vigor no próximo ciclo de cobrança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              O que nossos alunos dizem
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 font-medium">Plano {testimonial.plan}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para acelerar seus estudos?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de estudantes que já estão alcançando seus objetivos
          </p>
          <button
            onClick={() => !user ? window.location.href = '/cadastro' : handlePlanSelection('premium')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {user ? 'Assinar Premium' : 'Começar Agora'}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}