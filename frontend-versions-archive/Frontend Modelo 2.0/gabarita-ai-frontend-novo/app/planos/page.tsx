'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Plan } from '@/types';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Star,
  CreditCard,
  Shield,
  Infinity
} from 'lucide-react';

export default function PlanosPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await apiService.getPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      alert('Você precisa estar logado para assinar um plano');
      return;
    }

    setProcessingPayment(planId);
    try {
      const response = await apiService.createPayment(planId);
      if (response.success && response.data?.paymentUrl) {
        window.open(response.data.paymentUrl, '_blank');
      } else {
        alert('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Acelere seus estudos para o CNU 2025 com nossos planos premium. 
            Recursos avançados de IA, análises detalhadas e muito mais.
          </p>
        </div>

        {/* Current Plan Status */}
        {user && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  user.plan === 'free' ? 'bg-gray-100' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {user.plan === 'free' ? (
                    <Shield className="h-6 w-6 text-gray-600" />
                  ) : (
                    <Crown className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Plano Atual: {user.plan === 'free' ? 'Gratuito' : 'Premium'}
                  </h3>
                  <p className="text-gray-600">
                    {user.plan === 'free' 
                      ? 'Upgrade para desbloquear todos os recursos'
                      : 'Você tem acesso a todos os recursos premium'
                    }
                  </p>
                </div>
              </div>
              {user.plan === 'free' && (
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                  ⚠️ Limitado
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.id === 'premium' ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {plan.id === 'premium' && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-medium">
                  ⭐ Mais Popular
                </div>
              )}

              <div className={`p-8 ${plan.id === 'premium' ? 'pt-12' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    plan.id === 'free' 
                      ? 'bg-gray-100' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {plan.id === 'free' ? (
                      <Shield className="h-8 w-8 text-gray-600" />
                    ) : (
                      <Crown className="h-8 w-8 text-white" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">/mês</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Detailed Features */}
                <div className="border-t border-gray-200 pt-6 mb-8">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Simulados</span>
                      <span className="font-medium">
                        {plan.maxSimulations === -1 ? (
                          <Infinity className="h-4 w-4 text-green-500" />
                        ) : (
                          plan.maxSimulations
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Questões/dia</span>
                      <span className="font-medium">
                        {plan.maxQuestions === -1 ? (
                          <Infinity className="h-4 w-4 text-green-500" />
                        ) : (
                          plan.maxQuestions
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">IA Personalizada</span>
                      {plan.hasAI ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Ranking</span>
                      {plan.hasRanking ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between col-span-2">
                      <span className="text-gray-600">Análise Detalhada</span>
                      {plan.hasDetailedAnalysis ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={
                    processingPayment === plan.id || 
                    (user?.plan === plan.id) ||
                    !user
                  }
                  className={`w-full py-4 px-6 rounded-xl font-medium transition-all ${
                    plan.id === 'free'
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : user?.plan === plan.id
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : processingPayment === plan.id
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg'
                  }`}
                >
                  {processingPayment === plan.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span>Processando...</span>
                    </div>
                  ) : user?.plan === plan.id ? (
                    'Plano Atual'
                  ) : plan.id === 'free' ? (
                    'Plano Gratuito'
                  ) : !user ? (
                    'Faça login para assinar'
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Assinar Agora</span>
                    </div>
                  )}
                </button>

                {plan.id === 'premium' && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    💳 Pagamento seguro via Mercado Pago
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Posso cancelar minha assinatura a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento. 
                Você continuará tendo acesso aos recursos premium até o final do período pago.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Como funciona a IA personalizada?
              </h3>
              <p className="text-gray-600">
                Nossa IA analisa seu desempenho e adapta as questões ao seu nível de conhecimento, 
                focando nas áreas onde você tem mais dificuldade para maximizar seu aprendizado.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                O que acontece se eu não passar no concurso?
              </h3>
              <p className="text-gray-600">
                Oferecemos garantia de satisfação. Se você não ficar satisfeito com nossos resultados, 
                entre em contato conosco para discutir opções de reembolso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

