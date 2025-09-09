'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Plan } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  status_detail: string;
  transaction_amount: number;
  date_created: string;
  date_approved?: string;
  payment_method_id: string;
  payment_type_id: string;
}

export default function PagamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const planId = searchParams.get('plano');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  useEffect(() => {
    if (paymentId && status) {
      // Usuário retornou do Mercado Pago
      handlePaymentReturn();
    } else if (planId) {
      // Carregar dados do plano selecionado
      loadPlanData();
    } else {
      router.push('/planos');
    }
  }, [planId, paymentId, status]);

  const loadPlanData = async () => {
    if (!planId) return;

    try {
      setLoading(true);
      const response = await apiService.getPlans();
      
      if (response.success && response.data) {
        const selectedPlan = response.data.find(p => p.id === planId);
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          toast.error('Plano não encontrado');
          router.push('/planos');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar plano:', error);
      toast.error('Erro ao carregar dados do plano');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentReturn = async () => {
    if (!paymentId) return;

    try {
      setCheckingPayment(true);
      const response = await apiService.checkPaymentStatus(paymentId);
      
      if (response.success && response.data) {
        setPaymentStatus(response.data);
        
        if (response.data.status === 'approved') {
          toast.success('Pagamento aprovado! Redirecionando...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else if (response.data.status === 'rejected') {
          toast.error('Pagamento rejeitado. Tente novamente.');
        } else if (response.data.status === 'pending') {
          toast.info('Pagamento pendente. Aguardando confirmação.');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast.error('Erro ao verificar status do pagamento');
    } finally {
      setCheckingPayment(false);
    }
  };

  const createPayment = async () => {
    if (!user || !plan) return;

    try {
      setLoading(true);
      const response = await apiService.createPayment({
        plano_id: plan.id,
        user_id: user.uid
      });
      
      if (response.success && response.data?.init_point) {
        // Redirecionar para o Mercado Pago
        window.location.href = response.data.init_point;
      } else {
        toast.error('Erro ao criar pagamento');
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      default:
        return <CreditCard className="w-8 h-8 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Pagamento Aprovado';
      case 'rejected':
        return 'Pagamento Rejeitado';
      case 'cancelled':
        return 'Pagamento Cancelado';
      case 'pending':
        return 'Pagamento Pendente';
      default:
        return 'Processando Pagamento';
    }
  };

  if (loading || checkingPayment) {
    return (
      <ProtectedRoute feature="pagamento">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">
              {checkingPayment ? 'Verificando pagamento...' : 'Carregando...'}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Tela de retorno do pagamento
  if (paymentStatus) {
    return (
      <ProtectedRoute feature="pagamento">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon(paymentStatus.status)}
            </div>
            <CardTitle className="text-xl">
              {getStatusText(paymentStatus.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-600">ID do Pagamento:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {paymentStatus.id}
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-gray-600">Valor:</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {paymentStatus.transaction_amount.toFixed(2)}
              </p>
            </div>

            {paymentStatus.status === 'approved' && (
              <div className="text-center space-y-2">
                <p className="text-green-600 font-medium">
                  Seu plano foi ativado com sucesso!
                </p>
                <p className="text-sm text-gray-500">
                  Redirecionando para o dashboard...
                </p>
              </div>
            )}

            {paymentStatus.status === 'rejected' && (
              <div className="space-y-3">
                <p className="text-red-600 text-center">
                  Não foi possível processar seu pagamento.
                </p>
                <Button 
                  onClick={() => router.push('/planos')} 
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
              </div>
            )}

            {paymentStatus.status === 'pending' && (
              <div className="space-y-3">
                <p className="text-yellow-600 text-center">
                  Seu pagamento está sendo processado.
                </p>
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  className="w-full"
                >
                  Ir para Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </ProtectedRoute>
    );
  }

  // Tela de confirmação do pagamento
  if (plan) {
    return (
      <ProtectedRoute feature="pagamento">
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finalizar Pagamento
            </h1>
            <p className="text-gray-600">
              Confirme os detalhes do seu plano antes de prosseguir
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <div>
                  <h3 className="font-semibold text-lg">{plan.nome}</h3>
                  <p className="text-gray-600 text-sm">{plan.descricao}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {plan.preco.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">/{plan.periodo}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Recursos inclusos:</h4>
                <ul className="space-y-1">
                  {plan.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {recurso}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.limitacoes && plan.limitacoes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Limitações:</h4>
                  <ul className="space-y-1">
                    {plan.limitacoes.map((limitacao, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        {limitacao}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 border rounded-lg mb-4">
                <CreditCard className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-medium">Mercado Pago</p>
                  <p className="text-sm text-gray-600">
                    Cartão de crédito, débito, PIX e boleto
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={createPayment}
                  disabled={loading}
                  className="w-full h-12 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pagar R$ {plan.preco.toFixed(2)}
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => router.push('/planos')}
                  className="w-full"
                >
                  Voltar aos Planos
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Pagamento seguro processado pelo Mercado Pago.
                  Seus dados estão protegidos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute feature="pagamento">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando dados do pagamento...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}