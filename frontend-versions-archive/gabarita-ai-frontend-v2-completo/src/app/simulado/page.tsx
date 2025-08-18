'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Clock, BookOpen, Target, Trophy, Play, Pause, RotateCcw } from 'lucide-react';
import { questionsService } from '@/services/api';
import { Question, Simulation } from '@/types';

interface SimulationConfig {
  subject: string;
  questionCount: number;
  timeLimit: number; // em minutos
  difficulty: 'easy' | 'medium' | 'hard';
}

const SIMULATION_CONFIGS: SimulationConfig[] = [
  { subject: 'Matemática', questionCount: 10, timeLimit: 30, difficulty: 'medium' },
  { subject: 'Português', questionCount: 15, timeLimit: 45, difficulty: 'medium' },
  { subject: 'História', questionCount: 12, timeLimit: 35, difficulty: 'easy' },
  { subject: 'Geografia', questionCount: 12, timeLimit: 35, difficulty: 'easy' },
  { subject: 'Ciências', questionCount: 10, timeLimit: 30, difficulty: 'medium' },
  { subject: 'Simulado Completo', questionCount: 50, timeLimit: 120, difficulty: 'hard' }
];

export default function SimuladoPage() {
  const { user } = useAuth();
  const [selectedConfig, setSelectedConfig] = useState<SimulationConfig | null>(null);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            handleFinishSimulation();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeRemaining]);

  const startSimulation = async (config: SimulationConfig) => {
    setIsLoading(true);
    try {
      // Simular geração de questões (substituir pela API real)
      const mockQuestions: Question[] = Array.from({ length: config.questionCount }, (_, i) => ({
        id: `q${i + 1}`,
        question: `Questão ${i + 1} de ${config.subject}: Esta é uma questão de exemplo para testar o sistema de simulados.`,
        options: [
          'Alternativa A - Primeira opção',
          'Alternativa B - Segunda opção', 
          'Alternativa C - Terceira opção',
          'Alternativa D - Quarta opção'
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        subject: config.subject,
        difficulty: config.difficulty,
        explanation: 'Esta é uma explicação detalhada da resposta correta.'
      }));

      const newSimulation: Simulation = {
        id: `sim_${Date.now()}`,
        userId: user?.id || '',
        subject: config.subject,
        questions: mockQuestions,
        startTime: new Date(),
        timeLimit: config.timeLimit * 60, // converter para segundos
        status: 'in_progress'
      };

      setSimulation(newSimulation);
      setSelectedConfig(config);
      setTimeRemaining(config.timeLimit * 60);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setIsActive(true);
      setIsPaused(false);
      setShowResults(false);
    } catch (error) {
      console.error('Erro ao iniciar simulado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex.toString()
    }));
  };

  const handleNextQuestion = () => {
    if (simulation && currentQuestionIndex < simulation.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishSimulation = async () => {
    if (!simulation) return;

    setIsActive(false);
    
    // Calcular resultados
    let correctAnswers = 0;
    simulation.questions.forEach((question, index) => {
      if (answers[index] && parseInt(answers[index]) === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / simulation.questions.length) * 100;
    const timeUsed = (selectedConfig!.timeLimit * 60) - timeRemaining;

    const simulationResults = {
      simulation,
      answers,
      correctAnswers,
      totalQuestions: simulation.questions.length,
      score: Math.round(score),
      timeUsed,
      completedAt: new Date()
    };

    setResults(simulationResults);
    setShowResults(true);

    // Aqui você enviaria os resultados para a API
    try {
      // await questionsService.submitSimulation(simulationResults);
    } catch (error) {
      console.error('Erro ao enviar resultados:', error);
    }
  };

  const resetSimulation = () => {
    setSimulation(null);
    setSelectedConfig(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(0);
    setIsActive(false);
    setIsPaused(false);
    setShowResults(false);
    setResults(null);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600">Faça login para acessar os simulados.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-8">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulado Concluído!</h1>
                <p className="text-gray-600">{selectedConfig?.subject}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.score}%</div>
                  <div className="text-sm text-gray-600">Aproveitamento</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{results.correctAnswers}/{results.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Acertos</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatTime(results.timeUsed)}</div>
                  <div className="text-sm text-gray-600">Tempo Usado</div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetSimulation}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Novo Simulado
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (simulation) {
    const currentQuestion = simulation.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / simulation.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Header do Simulado */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-900">{selectedConfig?.subject}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Questão {currentQuestionIndex + 1} de {simulation.questions.length}</span>
                <span>{Math.round(progress)}% concluído</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Questão Atual */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestionIndex] === index.toString();
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-900' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium mr-3">{String.fromCharCode(65 + index)})</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navegação */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                
                <div className="flex space-x-2">
                  {simulation.questions.map((_, index) => {
                    const isAnswered = answers[index] !== undefined;
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-8 h-8 rounded text-sm font-medium ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : isAnswered
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                
                {currentQuestionIndex === simulation.questions.length - 1 ? (
                  <button
                    onClick={handleFinishSimulation}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Finalizar
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Próxima →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Simulados</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Teste seus conhecimentos com nossos simulados personalizados. 
              Escolha a matéria e o nível de dificuldade para começar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SIMULATION_CONFIGS.map((config, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">{config.subject}</h3>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Target className="w-4 h-4 mr-2" />
                    <span>{config.questionCount} questões</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{config.timeLimit} minutos</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span className="capitalize">{config.difficulty === 'easy' ? 'Fácil' : config.difficulty === 'medium' ? 'Médio' : 'Difícil'}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => startSimulation(config)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Carregando...' : 'Iniciar Simulado'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}