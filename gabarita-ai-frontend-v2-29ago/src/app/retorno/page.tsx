'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PaymentResult {
  payment_id?: string;
  status?: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'failure';
  merchant_order_id?: string;
  preference_id?: string;
  external_reference?: string;
}

export default function RetornoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processPaymentReturn();
  }, [user]);

  const processPaymentReturn = async () => {
    try {
      setLoading(true);
      
      // Extrair parâmetros da URL
      const paymentId = searchParams.get('payment_id');
      const status = searchParams.get('status') as PaymentResult['status'];
      const merchantOrderId = searchParams.get('merchant_order_id');
      const preferenceId = searchParams.get('preference_id');
      const externalReference = searchParams.get('external_reference');
      
      const result: PaymentResult = {
        payment_id: paymentId || undefined,
        status: status || 'failure',
        merchant_order_id: merchantOrderId || undefined,
        preference_id: preferenceId || undefined,
        external_reference: externalReference || undefined
      };
      
      setPaymentResult(result);
      
      // Se temos um payment_id, verificar o status no backend
      if (paymentId) {
        try {
          const response = await apiService.checkPaymentStatus(paymentId);
          
          if (response.success && response.data) {
            // Atualizar com dados reais do backend
            setPaymentResult(prev => ({
              ...prev,
              status: response.data.status
            }));
            
            // Processar resultado baseado no status
            await handlePaymentStatus(response.data.status, paymentId);
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
          setError('Erro ao verificar status do pagamento');
        }
      } else {
        // Processar resultado baseado apenas nos parâmetros da URL
        await handlePaymentStatus(status || 'failure');
      }
      
    } catch (error) {
      console.error('Erro ao processar retorno:', error);
      setError('Erro ao processar resultado do pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatus = async (status: string, paymentId?: string) => {
    switch (status) {
      case 'approved':
        toast.success('Pagamento aprovado com sucesso!');
        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
          router.push('/dashboard?payment=success');
        }, 3000);
        break;
        
      case 'pending':
        toast.info('Pagamento pendente. Aguardando confirmação.');
        setTimeout(() => {
          router.push('/dashboard?payment=pending');
        }, 3000);
        break;
        
      case 'rejected':
      case 'cancelled':
      case 'failure':
        toast.error('Pagamento não foi aprovado.');
        break;
        
      default:
        setError('Status de pagamento desconhecido');
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />;
      case 'rejected':
      case 'cancelled':
      case 'failure':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500 mx-auto" />;
      default:
        return <AlertTriangle className="w-16 h-16 text-gray-500 mx-auto" />;
    }
  };

  const getStatusTitle = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'Pagamento Aprovado!';
      case 'rejected':
        return 'Pagamento Rejeitado';
      case 'cancelled':
        return 'Pagamento Cancelado';
      case 'pending':
        return 'Pagamento Pendente';
      case 'failure':
        return 'Falha no Pagamento';
      default:
        return 'Processando Pagamento';
    }
  };

  const getStatusMessage = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'Seu plano foi ativado com sucesso! Você será redirecionado para o dashboard.';
      case 'rejected':
        return 'Não foi possível processar seu pagamento. Verifique os dados do cartão e tente novamente.';
      case 'cancelled':
        return 'O pagamento foi cancelado. Você pode tentar novamente quando desejar.';
      case 'pending':
        return 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.';
      case 'failure':
        return 'Ocorreu um erro durante o processamento. Tente novamente ou entre em contato com o suporte.';
      default:
        return 'Processando resultado do pagamento...';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
      case 'cancelled':
      case 'failure':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute feature="retorno">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Processando resultado do pagamento...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute feature="retorno">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-xl text-red-600">
                Erro no Processamento
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">{error}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/planos')} 
                  className="w-full"
                >
                  Voltar aos Planos
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/ajuda')} 
                  className="w-full"
                >
                  Contatar Suporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute feature="retorno">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {getStatusIcon(paymentResult?.status)}
          <CardTitle className={`text-xl mt-4 ${getStatusColor(paymentResult?.status)}`}>
            {getStatusTitle(paymentResult?.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {getStatusMessage(paymentResult?.status)}
            </p>
          </div>

          {paymentResult?.payment_id && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ID do Pagamento:</p>
              <p className="font-mono text-sm break-all">
                {paymentResult.payment_id}
              </p>
            </div>
          )}

          {paymentResult?.external_reference && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Referência:</p>
              <p className="font-mono text-sm break-all">
                {paymentResult.external_reference}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {paymentResult?.status === 'approved' && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Redirecionando em alguns segundos...
                </p>
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  className="w-full"
                >
                  Ir para Dashboard
                </Button>
              </div>
            )}

            {paymentResult?.status === 'pending' && (
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  className="w-full"
                >
                  Ir para Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/planos')} 
                  className="w-full"
                >
                  Ver Planos
                </Button>
              </div>
            )}

            {(paymentResult?.status === 'rejected' || 
              paymentResult?.status === 'cancelled' || 
              paymentResult?.status === 'failure') && (
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/planos')} 
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/ajuda')} 
                  className="w-full"
                >
                  Contatar Suporte
                </Button>
              </div>
            )}
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Em caso de dúvidas, entre em contato com nosso suporte.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  );
}