'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
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
  Users, 
  Settings, 
  CreditCard, 
  Shield, 
  Smartphone, 
  Monitor, 
  Send,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

const FAQ_DATA: FAQ[] = [
  {
    id: '1',
    question: 'Como faço para criar uma conta no Gabarita AI?',
    answer: 'Para criar uma conta, clique no botão "Cadastrar" no canto superior direito da página inicial. Preencha seus dados pessoais (nome, e-mail, CPF) e crie uma senha segura. Após o cadastro, você receberá um e-mail de confirmação.',
    category: 'conta'
  },
  {
    id: '2',
    question: 'Esqueci minha senha, como posso recuperá-la?',
    answer: 'Na página de login, clique em "Esqueci minha senha". Digite seu e-mail cadastrado e você receberá um link para redefinir sua senha. O link é válido por 24 horas.',
    category: 'conta'
  },
  {
    id: '3',
    question: 'Quais são os planos disponíveis?',
    answer: 'Oferecemos três planos: Gratuito (acesso limitado), Premium (R$ 29,90/mês com acesso completo) e VIP (R$ 49,90/mês com recursos exclusivos e suporte prioritário). Você pode comparar os planos na página "Planos".',
    category: 'planos'
  },
  {
    id: '4',
    question: 'Como funciona o sistema de pontuação?',
    answer: 'Você ganha pontos ao responder questões corretamente. Questões fáceis valem 10 pontos, médias 20 pontos e difíceis 30 pontos. Bônus de sequência multiplicam seus pontos quando você acerta várias questões seguidas.',
    category: 'gamificacao'
  },
  {
    id: '5',
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento através do seu perfil, na seção "Planos e Pagamentos". O cancelamento será efetivo no final do período já pago.',
    category: 'planos'
  },
  {
    id: '6',
    question: 'Como acompanhar meu progresso nos estudos?',
    answer: 'Acesse a página "Desempenho" para ver estatísticas detalhadas: questões respondidas, taxa de acerto, progresso por matéria, gráficos de evolução e metas semanais.',
    category: 'estudos'
  },
  {
    id: '7',
    question: 'O que são simulados personalizados?',
    answer: 'Simulados personalizados permitem que você escolha matérias específicas, nível de dificuldade, número de questões e tempo limite. Disponível para usuários Premium e VIP.',
    category: 'estudos'
  },
  {
    id: '8',
    question: 'Como funciona o ranking?',
    answer: 'O ranking é atualizado semanalmente baseado na pontuação total, taxa de acerto e atividade. Há rankings gerais e por categoria de concurso.',
    category: 'gamificacao'
  },
  {
    id: '9',
    question: 'Posso usar o Gabarita AI no celular?',
    answer: 'Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente em smartphones e tablets. Também estamos desenvolvendo um aplicativo nativo.',
    category: 'tecnico'
  },
  {
    id: '10',
    question: 'Como alterar meus dados pessoais?',
    answer: 'Acesse seu perfil clicando no seu nome no canto superior direito, depois clique em "Editar" na seção de informações pessoais. Alguns dados como CPF e e-mail não podem ser alterados.',
    category: 'conta'
  },
  {
    id: '11',
    question: 'Qual a diferença entre os tipos de simulado?',
    answer: 'Simulado Rápido: 20 questões em 30 minutos. Simulado Completo: 60 questões em 4 horas. Simulado Personalizado: você define as regras (Premium/VIP apenas).',
    category: 'estudos'
  },
  {
    id: '12',
    question: 'Como entrar em contato com o suporte?',
    answer: 'Você pode nos contatar através do chat online (usuários Premium/VIP), e-mail (suporte@gabarita-ai.com.br) ou WhatsApp. Nosso horário de atendimento é de segunda a sexta, das 8h às 18h.',
    category: 'suporte'
  }
];

const CATEGORIES = [
  { id: 'todas', name: 'Todas as Categorias', icon: HelpCircle },
  { id: 'conta', name: 'Conta e Perfil', icon: Users },
  { id: 'planos', name: 'Planos e Pagamentos', icon: CreditCard },
  { id: 'estudos', name: 'Estudos e Simulados', icon: BookOpen },
  { id: 'gamificacao', name: 'Gamificação', icon: Settings },
  { id: 'tecnico', name: 'Suporte Técnico', icon: Monitor },
  { id: 'suporte', name: 'Atendimento', icon: MessageCircle }
];

export default function AjudaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'geral'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envio do formulário
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitSuccess(true);
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'geral'
      });
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">🆘 Central de Ajuda</h1>
            <p className="text-xl opacity-90 mb-8">
              Encontre respostas para suas dúvidas ou entre em contato conosco
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar por dúvidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resposta Rápida</h3>
              <p className="text-gray-600">Média de 2 horas para resposta via e-mail</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat Online</h3>
              <p className="text-gray-600">Disponível para usuários Premium e VIP</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600">Suporte via WhatsApp das 8h às 18h</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* FAQ Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h2>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {expandedFAQ === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedFAQ === faq.id && (
                          <div className="px-6 pb-4">
                            <div className="border-t border-gray-200 pt-4">
                              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma pergunta encontrada para sua pesquisa.</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Tente usar termos diferentes ou entre em contato conosco.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-6">
              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Entre em Contato</h3>
                
                {submitSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">Mensagem enviada com sucesso!</span>
                  </div>
                )}
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={contactForm.category}
                      onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="geral">Dúvida Geral</option>
                      <option value="tecnico">Problema Técnico</option>
                      <option value="pagamento">Pagamento</option>
                      <option value="conta">Conta e Perfil</option>
                      <option value="sugestao">Sugestão</option>
                      <option value="reclamacao">Reclamação</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Resumo da sua dúvida"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descreva sua dúvida ou problema em detalhes..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Outros Canais</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">E-mail</p>
                      <p className="text-sm text-gray-600">suporte@gabarita-ai.com.br</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-sm text-gray-600">(11) 99999-9999</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Horário</p>
                      <p className="text-sm text-gray-600">Seg-Sex: 8h às 18h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Dicas para um atendimento mais rápido:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Seja específico sobre o problema</li>
                      <li>• Inclua capturas de tela se necessário</li>
                      <li>• Informe seu plano atual</li>
                      <li>• Mencione o navegador que está usando</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plataforma Web</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Operacional</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API de Questões</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Operacional</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sistema de Pagamentos</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Operacional</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notificações</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-600">Manutenção</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Última atualização: há 5 minutos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}