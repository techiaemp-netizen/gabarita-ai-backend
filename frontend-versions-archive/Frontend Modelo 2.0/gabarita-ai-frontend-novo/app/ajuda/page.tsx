'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Video,
  FileText
} from 'lucide-react';

export default function AjudaPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Como funciona o sistema de gamificação?',
      answer: 'O Gabarita.AI usa um sistema de níveis, XP e conquistas para tornar seus estudos mais motivadores. Você ganha XP respondendo questões corretamente e sobe de nível conforme progride.'
    },
    {
      question: 'Como são geradas as questões personalizadas?',
      answer: 'Nossa IA analisa seu histórico de respostas, identifica suas dificuldades e gera questões focadas nas áreas onde você precisa melhorar, adaptando-se ao seu ritmo de aprendizado.'
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer: 'Sim! Você pode cancelar sua assinatura premium a qualquer momento. Você continuará tendo acesso aos recursos premium até o final do período já pago.'
    },
    {
      question: 'Como funciona o ranking?',
      answer: 'O ranking é baseado na sua precisão, número de questões respondidas e consistência nos estudos. É atualizado em tempo real e permite comparar seu desempenho com outros estudantes.'
    },
    {
      question: 'Quantas questões posso responder por dia?',
      answer: 'No plano gratuito, você pode responder até 10 questões por dia. No plano premium, não há limite de questões diárias.'
    },
    {
      question: 'Como acompanhar meu progresso?',
      answer: 'Na seção "Desempenho", você encontra gráficos detalhados, estatísticas por matéria, evolução temporal e insights personalizados sobre seu aprendizado.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Ajuda</h1>
          <p className="text-gray-600">Encontre respostas para suas dúvidas sobre o Gabarita.AI</p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Guia de Início</h3>
            <p className="text-sm text-gray-600 mb-4">Aprenda a usar todas as funcionalidades da plataforma</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Ver Guia →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <Video className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Vídeo Tutoriais</h3>
            <p className="text-sm text-gray-600 mb-4">Assista tutoriais em vídeo sobre como estudar melhor</p>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              Assistir →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Documentação</h3>
            <p className="text-sm text-gray-600 mb-4">Acesse a documentação completa da plataforma</p>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Ler Docs →
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Entre em Contato</h2>
          <p className="text-gray-600 mb-6">
            Não encontrou a resposta que procurava? Nossa equipe está pronta para ajudar!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">E-mail</h3>
                <p className="text-sm text-gray-600">suporte@gabarita.ai</p>
                <p className="text-xs text-gray-500">Resposta em até 24h</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="bg-green-600 p-3 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Chat Online</h3>
                <p className="text-sm text-gray-600">Disponível 24/7</p>
                <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Iniciar Chat →
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Envie sua Dúvida</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Dúvida sobre funcionalidades</option>
                  <option>Problema técnico</option>
                  <option>Questão sobre pagamento</option>
                  <option>Sugestão de melhoria</option>
                  <option>Outro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva sua dúvida ou problema..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

