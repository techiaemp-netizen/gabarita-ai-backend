'use client';

import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { BookOpen, Play, CheckCircle, XCircle, Target } from 'lucide-react';

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

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
    correctAnswer: 1
  }
];

export default function QuestoesPage() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const startQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion?.correctAnswer;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  if (currentQuestion) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(null)}
              className="mb-6"
            >
              Voltar
            </Button>

            <Card className="p-6">
              <div className="mb-6">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                  {currentQuestion.subject}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mt-4">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showResult = selectedAnswer !== null;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : isSelected
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{String.fromCharCode(65 + index)}. {option}</span>
                        {showResult && isCorrect && <CheckCircle className="w-5 h-5" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Questões</h1>
            <p className="text-gray-600">Pratique com questões personalizadas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{score.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Acertos</p>
                  <p className="text-2xl font-bold">{score.correct}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Aproveitamento</p>
                  <p className="text-2xl font-bold">
                    {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockQuestions.map((question) => (
              <Card key={question.id} className="p-6">
                <div className="mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    {question.subject}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-2 mb-4">
                    {question.question}
                  </h3>
                </div>
                <Button 
                  onClick={() => startQuestion(question)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Responder
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}