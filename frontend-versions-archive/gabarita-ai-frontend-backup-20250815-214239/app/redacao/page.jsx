"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * Redação page
 *
 * Essay writing practice with AI-powered feedback and correction
 */
export default function RedacaoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [essayData, setEssayData] = useState({
    tema: '',
    tipoTextual: '',
    conteudo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const tiposTextuais = [
    'Dissertativo-argumentativo',
    'Narrativo',
    'Descritivo',
    'Expositivo',
    'Injuntivo'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEssayData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!essayData.tema.trim() || !essayData.tipoTextual || !essayData.conteudo.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock feedback response
      setFeedback({
        nota: 8.5,
        pontosFortes: [
          'Boa estrutura argumentativa',
          'Uso adequado de conectivos',
          'Proposta de intervenção clara'
        ],
        pontosAMelhorar: [
          'Desenvolver melhor os argumentos do segundo parágrafo',
          'Incluir mais dados estatísticos',
          'Revisar algumas concordâncias'
        ],
        sugestoes: [
          'Utilize mais exemplos concretos para fortalecer seus argumentos',
          'Varie o vocabulário para evitar repetições',
          'Conecte melhor as ideias entre os parágrafos'
        ]
      });
    } catch (error) {
      console.error('Erro ao processar redação:', error);
      alert('Erro ao processar redação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewEssay = () => {
    setEssayData({
      tema: '',
      tipoTextual: '',
      conteudo: ''
    });
    setFeedback(null);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 bg-blue-700">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Gabarit-AI" width={40} height={40} className="mr-3" />
          <span className="text-xl font-bold text-white">Gabarit-AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-blue-100">12 NÍVEL</span>
          <span className="text-sm text-blue-100">8 450 ACERTOS</span>
          <span className="text-sm text-blue-100">73%</span>
          <span className="text-sm font-medium text-white">CNU 2025</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-300">⚠️ Sem plano ativo</span>
            <button className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium">
              Desempenho
            </button>
            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">
              Planos
            </button>
          </div>
        </div>
      </header>

      {/* Title Section */}
      <div className="bg-blue-700 text-white text-center py-8">
        <h1 className="text-3xl font-bold mb-2">📝 Redação CNU</h1>
        <p className="text-blue-100">Pratique sua redação e receba correção detalhada com IA</p>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        {!feedback ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">📝</span>
                <h2 className="text-2xl font-bold text-gray-800">Nova Redação</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tema" className="block text-sm font-medium text-gray-700 mb-2">
                      Tema da Redação
                    </label>
                    <input
                      type="text"
                      id="tema"
                      name="tema"
                      value={essayData.tema}
                      onChange={handleInputChange}
                      placeholder="Digite o tema da redação"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipoTextual" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo Textual
                    </label>
                    <select
                      id="tipoTextual"
                      name="tipoTextual"
                      value={essayData.tipoTextual}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione o tipo textual</option>
                      {tiposTextuais.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700 mb-2">
                    Sua Redação
                  </label>
                  <textarea
                    id="conteudo"
                    name="conteudo"
                    value={essayData.conteudo}
                    onChange={handleInputChange}
                    placeholder="Escreva sua redação aqui... (mínimo 200 palavras)"
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="text-right mt-2">
                    <span className="text-sm text-gray-500">
                      {essayData.conteudo.split(' ').filter(word => word.length > 0).length} palavras
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processando com IA...
                      </>
                    ) : (
                      <>🤖 Corrigir com IA</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  <h2 className="text-2xl font-bold text-gray-800">Resultado da Correção</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{feedback.nota}</div>
                  <div className="text-sm text-gray-600">Nota Final</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center">
                    <span className="mr-2">✅</span>
                    Pontos Fortes
                  </h3>
                  <ul className="space-y-2">
                    {feedback.pontosFortes.map((ponto, index) => (
                      <li key={index} className="text-green-700 text-sm">
                        • {ponto}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Pontos a Melhorar
                  </h3>
                  <ul className="space-y-2">
                    {feedback.pontosAMelhorar.map((ponto, index) => (
                      <li key={index} className="text-yellow-700 text-sm">
                        • {ponto}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    Sugestões
                  </h3>
                  <ul className="space-y-2">
                    {feedback.sugestoes.map((sugestao, index) => (
                      <li key={index} className="text-blue-700 text-sm">
                        • {sugestao}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleNewEssay}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  📝 Nova Redação
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  🖨️ Imprimir Resultado
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}