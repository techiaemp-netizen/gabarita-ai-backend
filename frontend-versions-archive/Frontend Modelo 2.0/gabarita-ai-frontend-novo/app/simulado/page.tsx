'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Question } from '@/types';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw,
  BookOpen,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Lightbulb,
  Search,
  X
} from 'lucide-react';

type SimulationState = 'setup' | 'running' | 'finished';

export default function SimuladoPage() {
  const { user } = useAuth();
  const [state, setState] = useState<SimulationState>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [showChat, setShowChat] = useState(false);


  // Setup form
  const [setupForm, setSetupForm] = useState({
    subject: '',
    difficulty: 'medium',
    questionCount: 10
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

  const startSimulation = async () => {
    setLoading(true);
    try {
      const response = await apiService.generateQuestions({
        subject: setupForm.subject || undefined,
        difficulty: setupForm.difficulty,
        count: setupForm.questionCount
      });

      if (response.success && response.data) {
        setQuestions(response.data);
        setAnswers(new Array(response.data.length).fill(-1));
        setState('running');
        setIsRunning(true);
        setTimeElapsed(0);
      }
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = async (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    // Lógica PECLEST: verificar resposta imediatamente
    const currentQ = questions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;

    try {
      // Enviar resposta para o backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/questoes/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questao_id: currentQ.id,
          usuario_id: user?.id,
          alternativa_escolhida: String.fromCharCode(65 + answerIndex), // A, B, C, D
          tempo_resposta: timeElapsed
        })
      });

      const result = await response.json();

      if (isCorrect) {
        // Questão correta: avançar automaticamente após 1.5s
        setTimeout(() => {
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
          } else {
            finishSimulation();
          }
        }, 1500);
      } else {
        // Questão errada: mostrar explicação
        if (result.explicacao) {
          setExplanation(result.explicacao);
          setShowExplanation(true);
        }
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishSimulation = async () => {
    setIsRunning(false);
    setLoading(true);

    try {
      const questionIds = questions.map(q => q.id);
      const response = await apiService.submitSimulation(answers, questionIds);
      
      if (response.success && response.data) {
        setResult(response.data);
        setState('finished');
      }
    } catch (error) {
      console.error('Erro ao finalizar simulado:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setState('setup');
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeElapsed(0);
    setIsRunning(false);
    setResult(null);
    // Reset explanation and chat states
    setExplanation('');
    setShowExplanation(false);
    setChatQuestion('');
    setChatResponse('');
    setShowChat(false);
  };

  // Funcionalidades Premium (Plano Black)
  const handleChatDuvidas = async () => {
    if (!chatQuestion.trim()) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/questoes/chat-duvidas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questao_id: questions[currentQuestion].id,
          usuario_id: user?.id,
          pergunta: chatQuestion
        })
      });
      
      const result = await response.json();
      if (result.sucesso) {
        setChatResponse(result.resposta);
      }
    } catch (error) {
      console.error('Erro no chat:', error);
    }
  };

  const getMacetes = async () => {
    try {
      setChatQuestion('Quais são os macetes para resolver esta questão?');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/questoes/macetes/${questions[currentQuestion].id}`);
      const result = await response.json();
      if (result.sucesso) {
        setChatResponse(result.macetes);
      }
    } catch (error) {
      console.error('Erro ao obter macetes:', error);
      setChatResponse('Desculpe, ocorreu um erro ao buscar os macetes desta questão.');
    }
  };

  const getPontosCentrais = async () => {
    try {
      setChatQuestion('Quais são os pontos centrais desta questão?');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/questoes/pontos-centrais/${questions[currentQuestion].id}`);
      const result = await response.json();
      if (result.sucesso) {
        setChatResponse(result.pontos_centrais);
      }
    } catch (error) {
      console.error('Erro ao obter pontos centrais:', error);
      setChatResponse('Desculpe, ocorreu um erro ao buscar os pontos centrais desta questão.');
    }
  };

  const getOutrasExploracoes = async () => {
    try {
      setChatQuestion('Como a banca pode explorar este tema em outras questões?');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/questoes/outras-exploracoes/${questions[currentQuestion].id}`);
      const result = await response.json();
      if (result.sucesso) {
        setChatResponse(result.outras_exploracoes);
      }
    } catch (error) {
      console.error('Erro ao obter outras explorações:', error);
      setChatResponse('Desculpe, ocorreu um erro ao buscar outras explorações desta questão.');
    }
  };

  const continueAfterExplanation = () => {
    setShowExplanation(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishSimulation();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar os simulados.</p>
        </div>
      </div>
    );
  }

  // Setup Screen
  if (state === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Simulado</h1>
              <p className="text-gray-600">Configure seu simulado personalizado</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matéria (Opcional)
                </label>
                <select
                  value={setupForm.subject}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as matérias</option>
                  <option value="Português">Português</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Direito">Direito</option>
                  <option value="Conhecimentos Gerais">Conhecimentos Gerais</option>
                  <option value="Informática">Informática</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificuldade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSetupForm(prev => ({ ...prev, difficulty: level }))}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        setupForm.difficulty === level
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {level === 'easy' && 'Fácil'}
                      {level === 'medium' && 'Médio'}
                      {level === 'hard' && 'Difícil'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Questões
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setSetupForm(prev => ({ ...prev, questionCount: count }))}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        setupForm.questionCount === count
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startSimulation}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Gerando questões...</span>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Iniciar Simulado</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Running Simulation
  if (state === 'running') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = answers.filter(a => a !== -1).length;

    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-gray-500" />
                  <span>Questão {currentQuestion + 1} de {questions.length}</span>
                </div>
              </div>
              <button
                onClick={isRunning ? () => setIsRunning(false) : () => setIsRunning(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isRunning ? 'Pausar' : 'Continuar'}</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Respondidas: {answeredCount}/{questions.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{question.subject}</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{question.difficulty}</span>
              </div>
              <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
                {question.question}
              </h2>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-700">
                      {String.fromCharCode(65 + index)})
                    </span>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat AI Premium (Plano Black) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="bg-black text-white px-2 py-1 rounded text-sm mr-2">BLACK</span>
                <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
                Chat AI - Assistente da Questão
              </h3>
            </div>
            
            {/* Área de Conversa */}
            <div className="p-4 bg-gray-50/50 min-h-[180px] max-h-[280px] overflow-y-auto">
              {chatResponse ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm">{chatQuestion}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 max-w-[85%]">
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{chatResponse}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    <p className="text-sm">Use os atalhos ou digite sua pergunta</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Campo de Entrada com Botões Integrados */}
            <div className="p-4 border-t border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Pergunte sobre esta questão..."
                  className="w-full pl-4 pr-32 py-3 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleChatDuvidas()}
                />
                
                {/* Botões de Ação Integrados */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={getMacetes}
                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                    title="Macetes"
                  >
                    <Lightbulb className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={getPontosCentrais}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Pontos Centrais"
                  >
                    <BookOpen className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={getOutrasExploracoes}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Explorações"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  
                  <button
                    onClick={handleChatDuvidas}
                    disabled={!chatQuestion.trim()}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent rounded-full transition-colors"
                    title="Enviar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>

            <div className="flex space-x-4">
              <button
                onClick={finishSimulation}
                disabled={loading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg transition-colors"
              >
                {loading ? 'Finalizando...' : 'Finalizar'}
              </button>

              <button
                onClick={nextQuestion}
                disabled={currentQuestion === questions.length - 1}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                <span>Próxima</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (state === 'finished' && result) {
    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-8">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulado Concluído!</h1>
              <p className="text-gray-600">Confira seu desempenho</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{accuracy}%</div>
                <div className="text-sm text-gray-600">Precisão</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-gray-600">Tempo Total</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetSimulation}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Novo Simulado</span>
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de Explicação */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Explicação da Questão</h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{explanation}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={continueAfterExplanation}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
}

