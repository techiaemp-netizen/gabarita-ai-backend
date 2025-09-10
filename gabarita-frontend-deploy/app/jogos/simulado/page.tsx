'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, ArrowLeft, Trophy, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameState {
  currentQuestion: number;
  answers: (number | null)[];
  timeElapsed: number;
  gameStatus: 'playing' | 'finished';
  score: number;
  startTime: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Segundo a Constituição Federal de 1988, qual é o prazo para a propositura de ação rescisória?",
    options: [
      "1 ano",
      "2 anos",
      "3 anos",
      "5 anos"
    ],
    correctAnswer: 1,
    explanation: "O prazo para propositura de ação rescisória é de 2 anos, conforme art. 975 do CPC.",
    subject: "Direito Processual Civil",
    difficulty: 'medium'
  },
  {
    id: 2,
    question: "Qual é o quórum mínimo para aprovação de emenda constitucional?",
    options: [
      "Maioria simples",
      "Maioria absoluta",
      "3/5 dos membros",
      "2/3 dos membros"
    ],
    correctAnswer: 2,
    explanation: "As emendas constitucionais devem ser aprovadas por 3/5 dos membros de cada Casa do Congresso Nacional, em dois turnos de votação.",
    subject: "Direito Constitucional",
    difficulty: 'hard'
  },
  {
    id: 3,
    question: "No direito penal, qual é o prazo prescricional para crimes com pena máxima de 4 anos?",
    options: [
      "4 anos",
      "8 anos",
      "12 anos",
      "16 anos"
    ],
    correctAnswer: 1,
    explanation: "Para crimes com pena máxima superior a 2 e não excedente a 4 anos, o prazo prescricional é de 8 anos, conforme art. 109, IV do CP.",
    subject: "Direito Penal",
    difficulty: 'medium'
  },
  {
    id: 4,
    question: "Qual é o prazo para contestação no processo civil?",
    options: [
      "10 dias",
      "15 dias",
      "20 dias",
      "30 dias"
    ],
    correctAnswer: 1,
    explanation: "O prazo para contestação é de 15 dias, conforme art. 335 do CPC.",
    subject: "Direito Processual Civil",
    difficulty: 'easy'
  },
  {
    id: 5,
    question: "Segundo o CTN, qual é o prazo decadencial para constituição do crédito tributário?",
    options: [
      "3 anos",
      "5 anos",
      "10 anos",
      "20 anos"
    ],
    correctAnswer: 1,
    explanation: "O prazo decadencial para constituição do crédito tributário é de 5 anos, conforme art. 173 do CTN.",
    subject: "Direito Tributário",
    difficulty: 'hard'
  },
  {
    id: 6,
    question: "Qual é a idade mínima para ser nomeado Ministro do STF?",
    options: [
      "30 anos",
      "35 anos",
      "40 anos",
      "45 anos"
    ],
    correctAnswer: 1,
    explanation: "A idade mínima para ser nomeado Ministro do STF é de 35 anos, conforme art. 101 da CF/88.",
    subject: "Direito Constitucional",
    difficulty: 'easy'
  },
  {
    id: 7,
    question: "No direito do trabalho, qual é o prazo para ajuizamento de ação trabalhista após a extinção do contrato?",
    options: [
      "6 meses",
      "1 ano",
      "2 anos",
      "5 anos"
    ],
    correctAnswer: 2,
    explanation: "O prazo prescricional para ação trabalhista é de 2 anos após a extinção do contrato, conforme art. 7º, XXIX da CF/88.",
    subject: "Direito do Trabalho",
    difficulty: 'medium'
  },
  {
    id: 8,
    question: "Qual é o percentual máximo de juros reais que podem ser cobrados, segundo a Constituição?",
    options: [
      "6% ao ano",
      "12% ao ano",
      "18% ao ano",
      "Não há limite constitucional específico"
    ],
    correctAnswer: 3,
    explanation: "A Constituição não estabelece um limite específico para juros reais, sendo esta matéria regulada por legislação infraconstitucional.",
    subject: "Direito Constitucional",
    difficulty: 'hard'
  },
  {
    id: 9,
    question: "Qual é o prazo para interposição de recurso de apelação?",
    options: [
      "10 dias",
      "15 dias",
      "20 dias",
      "30 dias"
    ],
    correctAnswer: 1,
    explanation: "O prazo para interposição de apelação é de 15 dias, conforme art. 1003 do CPC.",
    subject: "Direito Processual Civil",
    difficulty: 'easy'
  },
  {
    id: 10,
    question: "Segundo o Código Penal, qual é a pena máxima para o crime de homicídio simples?",
    options: [
      "15 anos",
      "20 anos",
      "25 anos",
      "30 anos"
    ],
    correctAnswer: 1,
    explanation: "A pena para homicídio simples é de reclusão de 6 a 20 anos, conforme art. 121 do CP.",
    subject: "Direito Penal",
    difficulty: 'medium'
  }
];

const EXAM_DURATION = 180; // 3 hours in minutes

export default function SimuladoPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    answers: new Array(questions.length).fill(null),
    timeElapsed: 0,
    gameStatus: 'playing',
    score: 0,
    startTime: Date.now()
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    // Timer
    if (gameState.gameStatus === 'playing') {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        setGameState(prev => ({ ...prev, timeElapsed: elapsed }));
        
        // Auto-finish when time runs out
        if (elapsed >= EXAM_DURATION * 60) {
          finishExam();
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.gameStatus, gameState.startTime]);

  useEffect(() => {
    // Load saved answer for current question
    setSelectedAnswer(gameState.answers[gameState.currentQuestion]);
  }, [gameState.currentQuestion, gameState.answers]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...gameState.answers];
    newAnswers[gameState.currentQuestion] = answerIndex;
    setGameState(prev => ({ ...prev, answers: newAnswers }));
  };

  const goToQuestion = (questionIndex: number) => {
    setGameState(prev => ({ ...prev, currentQuestion: questionIndex }));
  };

  const goToNextQuestion = () => {
    if (gameState.currentQuestion < questions.length - 1) {
      setGameState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    }
  };

  const goToPreviousQuestion = () => {
    if (gameState.currentQuestion > 0) {
      setGameState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
    }
  };

  const finishExam = () => {
    const correctAnswers = gameState.answers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    
    setGameState(prev => ({
      ...prev,
      gameStatus: 'finished',
      score: finalScore
    }));
  };

  const resetExam = () => {
    setGameState({
      currentQuestion: 0,
      answers: new Array(questions.length).fill(null),
      timeElapsed: 0,
      gameStatus: 'playing',
      score: 0,
      startTime: Date.now()
    });
    setSelectedAnswer(null);
    setShowReview(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    const remaining = Math.max(0, (EXAM_DURATION * 60) - gameState.timeElapsed);
    return remaining;
  };

  const getAnsweredCount = () => {
    return gameState.answers.filter(answer => answer !== null).length;
  };

  const currentQuestion = questions[gameState.currentQuestion];
  const progress = ((gameState.currentQuestion + 1) / questions.length) * 100;
  const remainingTime = getRemainingTime();
  const answeredCount = getAnsweredCount();

  if (gameState.gameStatus === 'finished') {
    const correctAnswers = gameState.answers.filter((answer, index) => 
      answer === questions[index].correctAnswer
    ).length;
    const incorrectAnswers = gameState.answers.filter((answer, index) => 
      answer !== null && answer !== questions[index].correctAnswer
    ).length;
    const unanswered = questions.length - answeredCount;

    if (showReview) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Revisão do Simulado</h1>
            <Button variant="outline" onClick={() => setShowReview(false)}>
              Voltar ao Resultado
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = gameState.answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              const wasAnswered = userAnswer !== null;

              return (
                <Card key={question.id} className={`border-l-4 ${
                  !wasAnswered ? 'border-l-gray-400' :
                  isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Questão {index + 1}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{question.subject}</Badge>
                        <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                          {question.difficulty === 'easy' ? 'Fácil' : question.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                        </Badge>
                        {!wasAnswered ? (
                          <AlertCircle className="w-5 h-5 text-gray-500" />
                        ) : isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 mb-4">{question.question}</p>
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => {
                        let bgColor = 'bg-gray-50';
                        if (optionIndex === question.correctAnswer) {
                          bgColor = 'bg-green-100 border-green-300';
                        } else if (optionIndex === userAnswer && userAnswer !== question.correctAnswer) {
                          bgColor = 'bg-red-100 border-red-300';
                        }

                        return (
                          <div key={optionIndex} className={`p-3 rounded-lg border ${bgColor}`}>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{String.fromCharCode(65 + optionIndex)})</span>
                              <span>{option}</span>
                              {optionIndex === question.correctAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                              )}
                              {optionIndex === userAnswer && userAnswer !== question.correctAnswer && (
                                <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Explicação:</strong> {question.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl inline-block mb-6">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simulado Concluído!</h1>
          
          <Card className="max-w-3xl mx-auto mb-8">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{gameState.score}%</div>
                  <div className="text-sm text-gray-600">Aproveitamento</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-gray-600">Acertos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">{incorrectAnswers}</div>
                  <div className="text-sm text-gray-600">Erros</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-600">{unanswered}</div>
                  <div className="text-sm text-gray-600">Em Branco</div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Tempo utilizado: <strong>{formatTime(gameState.timeElapsed)}</strong>
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setShowReview(true)}>
                  Ver Revisão
                </Button>
                <Button variant="outline" onClick={resetExam}>
                  Novo Simulado
                </Button>
                <Button variant="outline" onClick={() => router.push('/jogos')}>
                  Voltar aos Jogos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="p-3 bg-gradient-to-r from-red-400 to-red-600 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Simulado</h1>
            <p className="text-gray-600">Teste completo de conhecimentos</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${remainingTime < 600 ? 'text-red-500' : 'text-gray-500'}`} />
            <span className={`text-sm font-semibold ${remainingTime < 600 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatTime(remainingTime)}
            </span>
          </div>
          <Badge variant="outline">
            {answeredCount}/{questions.length} respondidas
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Question Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navegação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => {
                  const isAnswered = gameState.answers[index] !== null;
                  const isCurrent = index === gameState.currentQuestion;
                  
                  return (
                    <Button
                      key={index}
                      variant={isCurrent ? 'secondary' : isAnswered ? 'secondary' : 'outline'}
                      size="sm"
                      className="aspect-square p-0"
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Atual</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span>Respondida</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border border-gray-300 rounded"></div>
                  <span>Não respondida</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Questão {gameState.currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progress)}% concluído
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Questão {gameState.currentQuestion + 1}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{currentQuestion.subject}</Badge>
                  <Badge variant={currentQuestion.difficulty === 'easy' ? 'secondary' : currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'}>
                    {currentQuestion.difficulty === 'easy' ? 'Fácil' : currentQuestion.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 mb-6 text-lg leading-relaxed">{currentQuestion.question}</p>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? 'secondary' : 'outline'}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="font-semibold text-sm mt-1">
                        {String.fromCharCode(65 + index)})
                      </span>
                      <span className="flex-1">{option}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={goToPreviousQuestion}
              disabled={gameState.currentQuestion === 0}
            >
              Anterior
            </Button>
            
            <div className="flex space-x-4">
              {gameState.currentQuestion === questions.length - 1 ? (
                <Button onClick={finishExam} className="bg-red-600 hover:bg-red-700">
                  Finalizar Simulado
                </Button>
              ) : (
                <Button onClick={goToNextQuestion}>
                  Próxima
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}