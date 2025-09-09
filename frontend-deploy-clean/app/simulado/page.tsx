'use client';

import React, { useState, useEffect } from 'react';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Target,
  Award,
  BookOpen,
  Settings,
  MessageCircle,
  Lightbulb,
  Brain,
  Search,
  Sparkles,
  ThumbsUp,
  Mic,
  MicOff,
  Send
} from 'lucide-react';

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface FeedbackState {
  show: boolean;
  type: 'correct' | 'incorrect' | null;
  message: string;
  explanation?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

type SimulationState = 'setup' | 'running' | 'finished';
type ChatType = 'macete' | 'pontos_centrais' | 'exploracao' | null;

const mockQuestions: Question[] = [
  {
    id: '1',
    subject: 'Direito Constitucional',
    question: 'Qual é o princípio fundamental que garante a igualdade de todos perante a lei?',
    options: [
      'Princípio da Legalidade',
      'Princípio da Isonomia',
      'Princípio da Moralidade', 
      'Princípio da Publicidade'
    ],
    correctAnswer: 1,
    explanation: 'O Princípio da Isonomia, previsto no art. 5º da CF/88, estabelece que todos são iguais perante a lei, sem distinção de qualquer natureza. É um dos pilares fundamentais do Estado Democrático de Direito.'
  },
  {
    id: '2',
    subject: 'Direito Administrativo',
    question: 'Sobre os atos administrativos, é correto afirmar que:',
    options: [
      'São sempre revogáveis',
      'Possuem presunção de legitimidade',
      'Não podem ser anulados',
      'São imutáveis após publicação'
    ],
    correctAnswer: 1,
    explanation: 'Os atos administrativos possuem presunção de legitimidade e veracidade, ou seja, presumem-se válidos até prova em contrário. Esta é uma característica fundamental que permite à Administração Pública atuar com eficiência.'
  }
];

export default function SimuladoPage() {
  const [state, setState] = useState<SimulationState>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Feedback system states
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    type: null,
    message: '',
    explanation: ''
  });
  
  // AI Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [userPlan, setUserPlan] = useState('premium'); // Mock user plan
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Setup form
  const [setupForm, setSetupForm] = useState({
    subject: 'Todas as matérias',
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 60 // minutos
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && state === 'running') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSimulation = () => {
    setQuestions(mockQuestions.slice(0, setupForm.questionCount));
    setAnswers(new Array(setupForm.questionCount).fill(-1));
    setState('running');
    setIsRunning(true);
    setTimeElapsed(0);
    setCurrentQuestion(0);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    
    // Show feedback
    const currentQ = questions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    
    setFeedback({
      show: true,
      type: isCorrect ? 'correct' : 'incorrect',
      message: isCorrect 
        ? getRandomCongratulationMessage()
        : 'Ops! Essa não é a resposta correta.',
      explanation: isCorrect ? '' : currentQ.explanation || ''
    });
    
    // Auto hide feedback after 3 seconds
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  const getRandomCongratulationMessage = () => {
    const messages = [
      'Parabéns! Resposta correta! 🎉',
      'Excelente! Você acertou! ⭐',
      'Muito bem! Continue assim! 👏',
      'Perfeito! Você está indo muito bem! 🚀',
      'Ótimo trabalho! Resposta certa! ✨'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishSimulation();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishSimulation = () => {
    setIsRunning(false);
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index]?.correctAnswer
    ).length;
    
    setResult({
      score: correctAnswers,
      total: questions.length,
      percentage: Math.round((correctAnswers / questions.length) * 100),
      timeSpent: timeElapsed
    });
    setState('finished');
  };

  const resetSimulation = () => {
    setState('setup');
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeElapsed(0);
    setIsRunning(false);
    setResult(null);
    setFeedback({ show: false, type: null, message: '', explanation: '' });
    setChatMessages([]);
    setShowChat(false);
  };
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'pt-BR';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const handleChatRequest = async (type: ChatType, customMessage?: string) => {
    if (userPlan === 'trial') return;
    
    setChatLoading(true);
    const currentQ = questions[currentQuestion];
    
    let messageContent = '';
    
    if (customMessage) {
      messageContent = customMessage;
    } else if (type) {
      const prompts = {
        macete: `Me dê um macete para resolver esta questão: ${currentQ.question}`,
        pontos_centrais: `Quais são os pontos centrais desta questão: ${currentQ.question}`,
        exploracao: `Como esta questão pode ser explorada pela banca: ${currentQ.question}`
      };
      messageContent = prompts[type];
    }
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response (in real app, this would call the backend API)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: customMessage 
          ? `Aqui está a resposta para sua pergunta: "${customMessage}". Esta é uma resposta simulada que seria fornecida pela IA baseada na questão atual.`
          : getAIResponse(type, currentQ),
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      setChatLoading(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    handleChatRequest(null, chatInput);
    setChatInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };
  
  const getAIResponse = (type: ChatType, question: Question): string => {
    const responses = {
      macete: `💡 **Macete para ${question.subject}:**\n\nPara questões sobre princípios constitucionais, lembre-se do acrônimo LIMPE: Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência. No caso desta questão, o princípio da isonomia (igualdade) é fundamental e está no art. 5º da CF/88.`,
      pontos_centrais: `🎯 **Pontos Centrais:**\n\n1. Princípios fundamentais da Constituição\n2. Art. 5º da CF/88 - Direitos e garantias fundamentais\n3. Diferença entre os princípios administrativos\n4. Aplicação prática da isonomia no direito brasileiro`,
      exploracao: `🔍 **Como a banca explora:**\n\n• Confunde princípios similares (legalidade vs isonomia)\n• Testa conhecimento literal do art. 5º\n• Cobra aplicação prática dos princípios\n• Mistura princípios administrativos com constitucionais`
    };
    
    return responses[type!] || 'Desculpe, não consegui processar sua solicitação.';
  };

  // Setup Screen
  if (state === 'setup') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Simulado</h1>
              <p className="text-gray-600">Configure seu simulado personalizado</p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matéria
                  </label>
                  <select
                    value={setupForm.subject}
                    onChange={(e) => setSetupForm({...setupForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Todas as matérias">Todas as matérias</option>
                    <option value="Direito Constitucional">Direito Constitucional</option>
                    <option value="Direito Administrativo">Direito Administrativo</option>
                    <option value="Direito Penal">Direito Penal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dificuldade
                  </label>
                  <select
                    value={setupForm.difficulty}
                    onChange={(e) => setSetupForm({...setupForm, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Médio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Questões
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={setupForm.questionCount}
                    onChange={(e) => setSetupForm({...setupForm, questionCount: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo Limite (minutos)
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="180"
                    value={setupForm.timeLimit}
                    onChange={(e) => setSetupForm({...setupForm, timeLimit: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={startSimulation}
                  size="lg"
                  className="flex items-center gap-2 px-8"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Simulado
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Running Screen
  if (state === 'running') {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const timeLimit = setupForm.timeLimit * 60;
    const timeRemaining = Math.max(0, timeLimit - timeElapsed);

    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex items-center gap-2"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Pausar' : 'Continuar'}
                </Button>
                
                <div className="text-sm text-gray-600">
                  Questão {currentQuestion + 1} de {questions.length}
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                timeRemaining <= 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <Card className="p-6 mb-6">
              <div className="mb-6">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                  {currentQ?.subject}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mt-4">
                  {currentQ?.question}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQ?.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === index;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Feedback Component */}
            {feedback.show && (
              <div className={`mt-6 p-4 rounded-lg border-l-4 animate-in slide-in-from-bottom-2 ${
                feedback.type === 'correct' 
                  ? 'bg-green-50 border-green-500 text-green-800' 
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}>
                <div className="flex items-start space-x-3">
                  {feedback.type === 'correct' ? (
                    <ThumbsUp className="w-5 h-5 mt-0.5 text-green-600" />
                  ) : (
                    <Lightbulb className="w-5 h-5 mt-0.5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{feedback.message}</p>
                    {feedback.explanation && (
                      <p className="mt-2 text-sm opacity-90">{feedback.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Chat Buttons */}
            {userPlan !== 'trial' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">IA Assistente</span>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleChatRequest('macete');
                      setShowChat(true);
                    }}
                    className="text-xs"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Macete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleChatRequest('pontos_centrais');
                      setShowChat(true);
                    }}
                    className="text-xs"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Pontos Centrais
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleChatRequest('exploracao');
                      setShowChat(true);
                    }}
                    className="text-xs"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    Exploração da Banca
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowChat(!showChat)}
                    className="text-xs"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {showChat ? 'Fechar Chat' : 'Abrir Chat'}
                  </Button>
                </div>
              </div>
            )}
            
            {/* AI Chat Panel */}
            {showChat && (
              <div className="mt-4 bg-white border rounded-lg shadow-lg">
                <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Chat com IA</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowChat(false)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
                <div className="p-4 max-h-64 flex flex-col">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {chatMessages.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        Use os botões acima para fazer perguntas sobre esta questão
                      </p>
                    ) : (
                      <>
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                                message.type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Digite sua dúvida..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={chatLoading}
                        />
                      </div>
                      
                      {/* Microphone Button */}
                      <button
                        onClick={toggleRecording}
                        disabled={chatLoading}
                        className={`p-2 rounded-lg transition-colors ${
                          isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } disabled:opacity-50`}
                        title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
                      >
                        {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                      
                      {/* Send Button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || chatLoading}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Enviar mensagem"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    
                    {/* Recording Indicator */}
                    {isRecording && (
                      <div className="mt-2 flex items-center justify-center text-red-500 text-sm">
                        <div className="animate-pulse flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Gravando... Fale agora</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Anterior
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={finishSimulation}
                >
                  Finalizar
                </Button>
                
                <Button onClick={nextQuestion}>
                  {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Results Screen
  if (state === 'finished' && result) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulado Concluído!</h1>
              <p className="text-gray-600">Confira seu desempenho abaixo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {result.score}/{result.total}
                </div>
                <p className="text-gray-600">Questões Corretas</p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {result.percentage}%
                </div>
                <p className="text-gray-600">Aproveitamento</p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatTime(result.timeSpent)}
                </div>
                <p className="text-gray-600">Tempo Gasto</p>
              </Card>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={resetSimulation}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Novo Simulado
              </Button>
              
              <Button onClick={() => window.location.href = '/dashboard'}>
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
}