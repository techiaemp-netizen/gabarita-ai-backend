'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Crown, CreditCard, Zap, Shield, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';
import { Plan } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  premium?: boolean;
  color: string;
  icon: React.ReactNode;
}

interface PaymentHistory {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  method: string;
}

const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { user } = useAuth();

  // Carregar planos da API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await apiService.getPlans();
        if (response.success && response.data) {
          setPlans(response.data);
        } else {
          console.error('Erro ao carregar planos:', response.error);
          // Fallback para dados mock em caso de erro
          setPlans([
            {
              id: 'gratuito',
              nome: 'Gratuito',
              descricao: 'Perfeito para começar',
              preco: 0,
              periodo: 'mensal',
              duracao: '1 mês',
              recursos: [
                '50 questões por mês',
                '2 simulados por mês',
                'Estatísticas básicas',
                'Acesso ao ranking',
                'Suporte por email'
              ],
              tipo: 'gratuito',
              popular: false
            },
            {
              id: 'premium',
              nome: 'Premium',
              descricao: 'Ideal para estudos intensivos',
              preco: 29.90,
              periodo: 'mensal',
              duracao: '1 mês',
              recursos: [
                'Questões ilimitadas',
                'Simulados ilimitados',
                'Explicações detalhadas',
                'Relatórios avançados',
                'Estatísticas completas',
                'Acesso prioritário ao ranking',
                'Suporte prioritário'
              ],
              tipo: 'premium',
              popular: true
            },
            {
              id: 'vip',
              nome: 'VIP',
              descricao: 'Máximo desempenho',
              preco: 59.90,
              periodo: 'mensal',
              duracao: '1 mês',
              recursos: [
                'Tudo do Premium',
                'Mentoria personalizada',
                'Plano de estudos customizado',
                'Análise de desempenho avançada',
                'Acesso antecipado a novos recursos',
                'Suporte 24/7',
                'Sessões de coaching'
              ],
              tipo: 'vip',
              popular: false
            }
          ]);
        }
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

const paymentHistory: PaymentHistory[] = [
  {
    id: '1',
    date: '2024-01-15',
    plan: 'Premium',
    amount: 29.90,
    status: 'paid',
    method: 'Cartão de Crédito'
  },
  {
    id: '2',
    date: '2023-12-15',
    plan: 'Premium',
    amount: 29.90,
    status: 'paid',
    method: 'PIX'
  },
  {
    id: '3',
    date: '2023-11-15',
    plan: 'Premium',
    amount: 29.90,
    status: 'paid',
    method: 'Cartão de Crédito'
  }
];

export default function PlanosPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [currentPlan] = useState('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planId: string) => {
    console.log('Plano selecionado:', planId);
    
    // Se usuário não está logado, redirecionar para cadastro com plano pré-selecionado
    if (!user) {
      router.push(`/cadastro?plano=${planId}`);
      return;
    }
    
    // Se usuário já está logado, redirecionar para pagamento
    router.push(`/pagamento?plano=${planId}`);
  };

  const getStatusColor = (status: PaymentHistory['status']) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: PaymentHistory['status']) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return 'Desconhecido';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Planos e Assinatura</h1>
            <p className="text-gray-600">Escolha o plano ideal para seus estudos</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'plans'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Planos Disponíveis
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Histórico de Pagamentos
            </button>
          </div>

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div>
              {/* Billing Period Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-white p-1 rounded-lg border">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      billingPeriod === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors relative ${
                      billingPeriod === 'yearly'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Anual
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      -40%
                    </span>
                  </button>
                </div>
              </div>

              {/* Current Plan Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Plano Atual: Premium</h3>
                    <p className="text-blue-700 text-sm">Próxima cobrança em 15 de fevereiro de 2024</p>
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {loadingPlans ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="p-6 animate-pulse">
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full"></div>
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="space-y-3 mb-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </Card>
                  ))
                ) : (
                  plans.map((plan) => {
                    const isCurrentPlan = user?.plano === plan.id;
                    const yearlyPrice = billingPeriod === 'yearly' ? plan.preco * 12 * 0.6 : plan.preco;
                    
                    // Definir ícone baseado no tipo do plano
                    const getIcon = (tipo: string) => {
                      switch (tipo) {
                        case 'gratuito': return <Users className="w-6 h-6" />;
                        case 'premium': return <Zap className="w-6 h-6" />;
                        case 'vip': return <Crown className="w-6 h-6" />;
                        default: return <Shield className="w-6 h-6" />;
                      }
                    };
                    
                    const getColor = (tipo: string) => {
                      switch (tipo) {
                        case 'premium': return 'blue';
                        case 'vip': return 'purple';
                        default: return 'gray';
                      }
                    };
                    
                    return (
                      <Card 
                        key={plan.id} 
                        className={`relative p-6 transition-all duration-200 hover:shadow-lg ${
                          plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                        } ${
                          isCurrentPlan ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                              Mais Popular
                            </span>
                          </div>
                        )}
                        
                        {plan.tipo === 'vip' && (
                          <div className="absolute -top-3 right-4">
                            <Crown className="w-6 h-6 text-purple-600" />
                          </div>
                        )}

                        <div className="text-center mb-6">
                          <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                            getColor(plan.tipo) === 'blue' ? 'bg-blue-100 text-blue-600' :
                            getColor(plan.tipo) === 'purple' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getIcon(plan.tipo)}
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.nome}</h3>
                          
                          <div className="mb-2">
                            <span className="text-3xl font-bold text-gray-900">
                              R$ {billingPeriod === 'yearly' ? yearlyPrice.toFixed(2) : plan.preco.toFixed(2)}
                            </span>
                            <span className="text-gray-600 text-sm ml-1">
                              {billingPeriod === 'yearly' ? '/ano' : `/${plan.periodo}`}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm">{plan.descricao}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                          {plan.recursos.map((recurso, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{recurso}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={() => handleSelectPlan(plan.id)}
                          disabled={isCurrentPlan}
                          className={`w-full ${
                            isCurrentPlan 
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : plan.popular 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {isCurrentPlan ? 'Plano Atual' : `Escolher ${plan.nome}`}
                        </Button>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Features Comparison */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Compare os Recursos</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Recursos</th>
                        <th className="text-center py-3 px-4">Gratuito</th>
                        <th className="text-center py-3 px-4">Premium</th>
                        <th className="text-center py-3 px-4">VIP</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b">
                        <td className="py-3 px-4">Questões por mês</td>
                        <td className="text-center py-3 px-4">50</td>
                        <td className="text-center py-3 px-4">Ilimitadas</td>
                        <td className="text-center py-3 px-4">Ilimitadas</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Simulados</td>
                        <td className="text-center py-3 px-4">2/mês</td>
                        <td className="text-center py-3 px-4">Ilimitados</td>
                        <td className="text-center py-3 px-4">Ilimitados</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Explicações detalhadas</td>
                        <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                        <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                        <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Relatórios avançados</td>
                        <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                        <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                        <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Mentoria personalizada</td>
                        <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                        <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                        <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Suporte prioritário</td>
                        <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                        <td className="text-center py-3 px-4">Email</td>
                        <td className="text-center py-3 px-4">24/7</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === 'history' && (
            <div>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Histórico de Pagamentos</h3>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Atualizar Método de Pagamento
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Data</th>
                        <th className="text-left py-3 px-4">Plano</th>
                        <th className="text-left py-3 px-4">Valor</th>
                        <th className="text-left py-3 px-4">Método</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {new Date(payment.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 font-medium">{payment.plan}</td>
                          <td className="py-3 px-4">R$ {payment.amount.toFixed(2)}</td>
                          <td className="py-3 px-4">{payment.method}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getStatusColor(payment.status)
                            }`}>
                              {getStatusText(payment.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">
                              Ver Recibo
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {paymentHistory.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum pagamento encontrado</p>
                  </div>
                )}
              </Card>

              {/* Payment Methods */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">**** **** **** 1234</span>
                      </div>
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Principal</span>
                    </div>
                    <p className="text-sm text-gray-600">Visa • Expira em 12/2025</p>
                  </div>
                  
                  <button className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xl text-gray-600">+</span>
                      </div>
                      <span className="text-sm text-gray-600">Adicionar Cartão</span>
                    </div>
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}