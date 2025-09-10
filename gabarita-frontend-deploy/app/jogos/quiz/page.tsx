'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowLeft, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface GameState {
  currentQuestion: number;
  score: number;
  answers: number[];
  gameStatus: 'playing' | 'finished';
  timeElapsed: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Qual é o princípio fundamental da Constituição Federal de 1988?",
    options: [
      "Princípio da Legalidade",
      "Princípio da Dignidade da Pessoa Humana",
      "Princípio da Moralidade",
      "Princípio da Eficiência"
    ],
    correctAnswer: 1,
    explanation: "O princípio da dignidade da pessoa humana é um dos fundamentos da República Federativa do Brasil, conforme art. 1º, III da CF/88."
  },
  {
    id: 2,
    question: "Quantos anos dura o mandato do Presidente da República?",
    options: ["3 anos", "4 anos", "5 anos", "6 anos"],
    correctAnswer: 1,
    explanation: "O mandato do Presidente da República é de 4 anos, conforme art. 82 da Constituição Federal."
  },
  {
    id: 3,
    question: "Qual órgão é responsável pelo controle externo da União?",
    options: [
      "Supremo Tribunal Federal",
      "Tribunal de Contas da União",
      "Controladoria-Geral da União",
      "Ministério Público Federal"
    ],
    correctAnswer: 1,
    explanation: "O Tribunal de Contas da União é o órgão responsável pelo controle externo da União, conforme art. 71 da CF/88."
  },
  {
    id: 4,
    question: "Qual é a idade mínima para ser eleito Deputado Federal?",
    options: ["18 anos", "21 anos", "25 anos", "30 anos"],
    correctAnswer: 1,
    explanation: "A idade mínima para ser eleito Deputado Federal é de 21 anos, conforme art. 14, §3º, III da CF/88."
  },
  {
    id: 5,
    question: "Quantos Ministros compõem o Supremo Tribunal Federal?",
    options: ["9 Ministros", "11 Ministros", "13 Ministros", "15 Ministros"],
    correctAnswer: 1,
    explanation: "O STF é composto por 11 Ministros, conforme art. 101 da Constituição Federal."
  }
];

export default function QuizPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    gameStatus: 'playing',
    timeElapsed: 0
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Timer
    if (gameState.gameStatus === 'playing') {
      const timer = setInterval(() => {
        setGameState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.gameStatus]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQ = questions[gameState.currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const newAnswers = [...gameState.answers, selectedAnswer];
    const newScore = isCorrect ? gameState.score + 20 : gameState.score;

    setGameState(prev => ({
      ...prev,
      answers: newAnswers,
      score: newScore
    }));

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    const nextQuestion = gameState.currentQuestion + 1;
    
    if (nextQuestion >= questions.length) {
      setGameState(prev => ({ ...prev, gameStatus: 'finished' }));
    } else {
      setGameState(prev => ({ ...prev, currentQuestion: nextQuestion }));
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      gameStatus: 'playing',
      timeElapsed: 0
    });
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[gameState.currentQuestion];
  const progress = ((gameState.currentQuestion + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  if (gameState.gameStatus === 'finished') {
    const finalScore = gameState.score;
    const correctAnswers = gameState.answers.filter((answer, index) => answer === questions[index].correctAnswer).length;
    const percentage = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl inline-block mb-6">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Quiz Finalizado!</h1>
          
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{finalScore}</div>
                  <div className="text-sm text-gray-600">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{correctAnswers}/{questions.length}</div>
                  <div className="text-sm text-gray-600">Acertos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">Aproveitamento</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{formatTime(gameState.timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Tempo</div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={resetGame}>
                  Jogar Novamente
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Jurídico</h1>
            <p className="text-gray-600">Teste seus conhecimentos!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formatTime(gameState.timeElapsed)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold">{gameState.score} pts</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Pergunta {gameState.currentQuestion + 1} de {questions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% concluído
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonVariant: "secondary" | "outline" | "destructive" = "outline";
              let icon = null;
              
              if (showResult) {
                if (index === currentQuestion.correctAnswer) {
                  buttonVariant = "secondary";
                  icon = <CheckCircle className="w-4 h-4 ml-2" />;
                } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                  buttonVariant = "destructive";
                  icon = <XCircle className="w-4 h-4 ml-2" />;
                }
              } else if (selectedAnswer === index) {
                buttonVariant = "secondary";
              }
              
              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <span className="flex-1">{option}</span>
                  {icon}
                </Button>
              );
            })}
          </div>
          
          {showResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className="font-semibold">
                  {isCorrect ? 'Correto!' : 'Incorreto!'}
                </span>
              </div>
              <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            {!showResult ? (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                Confirmar Resposta
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {gameState.currentQuestion + 1 >= questions.length ? 'Finalizar Quiz' : 'Próxima Pergunta'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}