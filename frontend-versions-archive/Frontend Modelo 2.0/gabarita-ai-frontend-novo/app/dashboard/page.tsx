'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Performance } from '@/types';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock,
  Star,
  Zap,
  Award,
  BarChart3,
  Play,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
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
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar o dashboard.</p>
          <Link 
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Bem-vindo de volta ao seu painel de estudos para o CNU 2025
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Nível Atual</p>
                <p className="text-3xl font-bold">{user.level}</p>
              </div>
              <Star className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">XP Total</p>
                <p className="text-3xl font-bold">{user.xp.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Taxa de Acerto</p>
                <p className="text-3xl font-bold">{user.accuracy}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Questões Respondidas</p>
                <p className="text-3xl font-bold">{performance?.totalQuestions || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-4">
              <Link 
                href="/simulado"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Iniciar Simulado</h3>
                    <p className="text-sm text-gray-600">Comece um novo simulado personalizado</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link 
                href="/desempenho"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Ver Desempenho</h3>
                    <p className="text-sm text-gray-600">Analise suas estatísticas detalhadas</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </Link>

              <Link 
                href="/ranking"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Ver Ranking</h3>
                    <p className="text-sm text-gray-600">Compare seu desempenho com outros</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </Link>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Progresso Semanal</h2>
            {performance?.weeklyProgress ? (
              <div className="space-y-4">
                {performance.weeklyProgress.map((week, index) => (
                  <div key={week.week} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Semana {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {week.questionsAnswered} questões
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {week.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Comece a responder questões para ver seu progresso</p>
              </div>
            )}
          </div>
        </div>

        {/* Subject Performance */}
        {performance?.subjectPerformance && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Desempenho por Matéria</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(performance.subjectPerformance).map(([subject, data]) => (
                <div key={subject} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{subject}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Questões:</span>
                      <span className="font-medium">{data.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Acertos:</span>
                      <span className="font-medium text-green-600">{data.correct}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxa:</span>
                      <span className="font-medium text-blue-600">{data.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${data.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan Status */}
        {user.plan === 'free' && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Upgrade seu Plano</h2>
                <p className="text-orange-100">
                  Desbloqueie recursos premium e acelere seus estudos
                </p>
              </div>
              <Link 
                href="/planos"
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

