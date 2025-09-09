'use client';

import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle, 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Zap, 
  Shield, 
  CreditCard, 
  Settings, 
  Smartphone, 
  Monitor, 
  Headphones,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface HelpCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  count: number;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  availability: string;
  responseTime: string;
  action: string;
}

const mockCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Primeiros Passos',
    icon: <BookOpen className="w-6 h-6" />,
    description: 'Como começar a usar a plataforma',
    count: 8
  },
  {
    id: 'account',
    name: 'Conta e Perfil',
    icon: <Users className="w-6 h-6" />,
    description: 'Gerenciamento de conta e configurações',
    count: 12
  },
  {
    id: 'questions',
    name: 'Questões e Simulados',
    icon: <HelpCircle className="w-6 h-6" />,
    description: 'Dúvidas sobre questões e simulados',
    count: 15
  },
  {
    id: 'payment',
    name: 'Pagamentos e Planos',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Assinaturas, pagamentos e faturas',
    count: 10
  },
  {
    id: 'technical',
    name: 'Problemas Técnicos',
    icon: <Settings className="w-6 h-6" />,
    description: 'Bugs, erros e problemas técnicos',
    count: 7
  },
  {
    id: 'mobile',
    name: 'App Mobile',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'Dúvidas sobre o aplicativo móvel',
    count: 6
  }
];

const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'Como criar uma conta no Gabarita.AI?',
    answer: 'Para criar uma conta, clique no botão "Cadastrar" no canto superior direito da página inicial. Preencha seus dados pessoais, escolha um email e senha seguros. Após o cadastro, você receberá um email de confirmação.',
    category: 'getting-started',
    helpful: 45,
    notHelpful: 2
  },
  {
    id: '2',
    question: 'Como funciona o sistema de pontuação?',
    answer: 'Você ganha pontos ao responder questões corretamente. Questões mais difíceis valem mais pontos. Manter uma sequência de acertos também dá bônus. Os pontos são usados no ranking e para desbloquear conquistas.',
    category: 'questions',
    helpful: 38,
    notHelpful: 5
  },
  {
    id: '3',
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. O cancelamento será efetivo no final do período já pago.',
    category: 'payment',
    helpful: 52,
    notHelpful: 1
  },
  {
    id: '4',
    question: 'Como alterar minha senha?',
    answer: 'Vá para Configurações > Segurança e clique em "Alterar Senha". Digite sua senha atual e a nova senha duas vezes. Clique em "Salvar" para confirmar a alteração.',
    category: 'account',
    helpful: 29,
    notHelpful: 3
  },
  {
    id: '5',
    question: 'O que fazer se o simulado não carregar?',
    answer: 'Primeiro, verifique sua conexão com a internet. Se o problema persistir, tente atualizar a página ou limpar o cache do navegador. Se ainda não funcionar, entre em contato com o suporte.',
    category: 'technical',
    helpful: 33,
    notHelpful: 8
  },
  {
    id: '6',
    question: 'Como baixar o aplicativo móvel?',
    answer: 'O aplicativo está disponível na App Store (iOS) e Google Play Store (Android). Procure por "Gabarita.AI" e faça o download gratuito.',
    category: 'mobile',
    helpful: 41,
    notHelpful: 2
  }
];

const supportOptions: SupportOption[] = [
  {
    id: 'chat',
    title: 'Chat ao Vivo',
    description: 'Converse com nossa equipe em tempo real',
    icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
    availability: 'Seg-Sex, 9h-18h',
    responseTime: 'Imediato',
    action: 'Iniciar Chat'
  },
  {
    id: 'email',
    title: 'Email',
    description: 'Envie sua dúvida por email',
    icon: <Mail className="w-8 h-8 text-green-600" />,
    availability: '24/7',
    responseTime: 'Até 24h',
    action: 'Enviar Email'
  },
  {
    id: 'phone',
    title: 'Telefone',
    description: 'Ligue para nosso suporte',
    icon: <Phone className="w-8 h-8 text-purple-600" />,
    availability: 'Seg-Sex, 9h-17h',
    responseTime: 'Imediato',
    action: '(11) 1234-5678'
  }
];

export default function AjudaPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<{[key: string]: 'helpful' | 'not-helpful' | null}>({});

  const filteredFAQs = mockFAQs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleHelpfulVote = (faqId: string, vote: 'helpful' | 'not-helpful') => {
    setHelpfulVotes(prev => ({
      ...prev,
      [faqId]: prev[faqId] === vote ? null : vote
    }));
  };

  const getCategoryName = (categoryId: string) => {
    const category = mockCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Geral';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Central de Ajuda</h1>
            <p className="text-xl text-gray-600 mb-8">Como podemos ajudar você hoje?</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Busque por dúvidas, tutoriais ou problemas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-4 text-lg"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Tutoriais em Vídeo</h3>
              <p className="text-gray-600 text-sm mb-4">Aprenda com nossos vídeos explicativos</p>
              <Button variant="outline" size="sm">
                Ver Tutoriais
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Guia do Usuário</h3>
              <p className="text-gray-600 text-sm mb-4">Manual completo da plataforma</p>
              <Button variant="outline" size="sm">
                Baixar PDF
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Comunidade</h3>
              <p className="text-gray-600 text-sm mb-4">Participe do fórum de discussões</p>
              <Button variant="outline" size="sm">
                Acessar Fórum
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories */}
              <Card className="p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categorias</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5" />
                      <span className="font-medium">Todas</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {mockFAQs.length}
                    </span>
                  </button>
                  
                  {mockCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {category.icon}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500">{category.description}</div>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Contact Support */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Precisa de Mais Ajuda?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Não encontrou o que procurava? Nossa equipe está pronta para ajudar!
                </p>
                <Button className="w-full">
                  <Headphones className="w-4 h-4 mr-2" />
                  Falar com Suporte
                </Button>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* FAQ Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedCategory === 'all' ? 'Perguntas Frequentes' : `${getCategoryName(selectedCategory)} - FAQ`}
                </h2>
                
                <div className="space-y-4">
                  {filteredFAQs.map(faq => (
                    <Card key={faq.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {getCategoryName(faq.category)}
                            </span>
                          </div>
                          {expandedFAQ === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6 border-t bg-gray-50">
                          <p className="text-gray-700 leading-relaxed mb-4 pt-4">{faq.answer}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">Esta resposta foi útil?</span>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleHelpfulVote(faq.id, 'helpful')}
                                  className={helpfulVotes[faq.id] === 'helpful' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                                >
                                  <ThumbsUp className="w-4 h-4 mr-1" />
                                  {faq.helpful + (helpfulVotes[faq.id] === 'helpful' ? 1 : 0)}
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleHelpfulVote(faq.id, 'not-helpful')}
                                  className={helpfulVotes[faq.id] === 'not-helpful' ? 'bg-red-50 border-red-200 text-red-700' : ''}
                                >
                                  <ThumbsDown className="w-4 h-4 mr-1" />
                                  {faq.notHelpful + (helpfulVotes[faq.id] === 'not-helpful' ? 1 : 0)}
                                </Button>
                              </div>
                            </div>
                            
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Ainda preciso de ajuda
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
                
                {filteredFAQs.length === 0 && (
                  <Card className="p-12 text-center">
                    <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma pergunta encontrada</h3>
                    <p className="text-gray-600 mb-6">Tente usar outros termos de busca ou entre em contato conosco.</p>
                    <Button>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Falar com Suporte
                    </Button>
                  </Card>
                )}
              </div>

              {/* Support Options */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Entre em Contato</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {supportOptions.map(option => (
                    <Card key={option.id} className="p-6 text-center hover:shadow-lg transition-shadow">
                      <div className="mb-4">{option.icon}</div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                      
                      <div className="space-y-2 mb-6 text-sm">
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          {option.availability}
                        </div>
                        <div className="text-gray-700 font-medium">
                          Resposta: {option.responseTime}
                        </div>
                      </div>
                      
                      <Button className="w-full">
                        {option.action}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}