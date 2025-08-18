'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Performance } from '@/types';
import { BarChart3, TrendingUp, Target, Clock, Calendar, Award } from 'lucide-react';

export default function DesempenhoPage() {
  const { user } = useAuth();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      const response = await apiService.getPerformance();
      if (response.success && response.data) {
        setPerformance(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado para ver seu desempenho.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de desempenho...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Análise de Desempenho</h1>
          <p className="text-gray-600">Acompanhe seu progresso e identifique áreas de melhoria</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Questões</p>
                <p className="text-3xl font-bold text-blue-600">{performance?.totalQuestions || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acertos</p>
                <p className="text-3xl font-bold text-green-600">{performance?.correctAnswers || 0}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Precisão</p>
                <p className="text-3xl font-bold text-purple-600">{performance?.accuracy || 0}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-3xl font-bold text-orange-600">{performance?.averageTime || 0}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        {performance?.subjectPerformance && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Desempenho por Matéria</h2>
            <div className="space-y-6">
              {Object.entries(performance.subjectPerformance).map(([subject, data]) => (
                <div key={subject} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{subject}</h3>
                    <span className="text-sm font-medium text-blue-600">{data.accuracy}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{data.correct} de {data.total} questões corretas</span>
                    <span>{Math.round((data.correct / data.total) * 100)}% de aproveitamento</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${data.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Progress */}
          {performance?.weeklyProgress && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Progresso Semanal</h2>
              <div className="space-y-4">
                {performance.weeklyProgress.map((week, index) => (
                  <div key={week.week} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="font-medium text-gray-900">Semana {index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{week.questionsAnswered} questões</span>
                      <span className="font-medium text-green-600">{week.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Progress */}
          {performance?.monthlyProgress && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Progresso Mensal</h2>
              <div className="space-y-4">
                {performance.monthlyProgress.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">{month.month}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{month.questionsAnswered} questões</span>
                      <span className="font-medium text-purple-600">{month.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">💡 Insights Personalizados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Pontos Fortes</h3>
              <ul className="text-blue-100 space-y-1">
                <li>• Consistência nos estudos</li>
                <li>• Boa performance em Português</li>
                <li>• Melhoria constante na precisão</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Áreas para Melhorar</h3>
              <ul className="text-blue-100 space-y-1">
                <li>• Foque mais em Matemática</li>
                <li>• Reduza o tempo por questão</li>
                <li>• Pratique mais questões difíceis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

