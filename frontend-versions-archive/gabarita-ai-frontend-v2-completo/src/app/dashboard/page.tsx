'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import {
  BookOpen,
  Brain,
  Trophy,
  Target,
  TrendingUp,
  Users,
  Clock,
  Star,
  Zap,
  Award,
  BarChart3,
  Calendar,
  Play,
  ChevronRight,
  Fire,
  Medal
} from 'lucide-react';

interface DashboardStats {
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  totalXP: number;
  currentLevel: number;
  rankingPosition: number;
}

interface RecentActivity {
  id: string;
  type: 'question' | 'simulation' | 'game';
  title: string;
  score?: number;
  date: string;
  correct?: boolean;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0,
    totalXP: 0,
    currentLevel: 1,
    rankingPosition: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadDashboardData = async () => {
      try {
        // Aqui você faria as chamadas reais para a API
        // Por enquanto, vamos usar dados simulados
        setStats({
          questionsAnswered: 247,
          correctAnswers: 198,
          currentStreak: 12,
          totalXP: 3450,
          currentLevel: 8,
          rankingPosition: 156
        });

        setRecentActivities([
          {
            id: '1',
            type: 'question',
            title: 'Direito Constitucional - Princípios Fundamentais',
            correct: true,
            date: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            type: 'simulation',
            title: 'Simulado ENEM 2024',
            score: 85,
            date: '2024-01-15T09:15:00Z'
          },
          {
            id: '3',
            type: 'game',
            title: 'Quiz Rápido - Matemática',
            score: 92,
            date: '2024-01-14T16:45:00Z'
          }
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const accuracyPercentage = stats.questionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
    : 0;

  const progressToNextLevel = (stats.totalXP % 500) / 500 * 100;

  const quickActions = [
    {
      title: 'Resolver Questões',
      description: 'Questões personalizadas por IA',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      href: '/questoes'
    },
    {
      title: 'Fazer Simulado',
      description: 'Simulados completos e realistas',
      icon: Target,
      color: 'from-green-500 to-green-600',
      href: '/simulados'
    },
    {
      title: 'Jogar',
      description: 'Aprenda jogando',
      icon: Trophy,
      color: 'from-purple-500 to-purple-600',
      href: '/jogos'
    },
    {
      title: 'Ver Ranking',
      description: 'Compare seu desempenho',
      icon: Medal,
      color: 'from-yellow-500 to-yellow-600',
      href: '/ranking'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.name?.split(' ')[0] || 'Estudante'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Pronto para continuar seus estudos hoje?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Questões Respondidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.questionsAnswered}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Acerto</p>
                <p className="text-2xl font-bold text-gray-900">{accuracyPercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sequência Atual</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Fire className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posição no Ranking</p>
                <p className="text-2xl font-bold text-gray-900">#{stats.rankingPosition}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Seu Progresso</h2>
              
              <div className="space-y-6">
                {/* Level Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Nível {stats.currentLevel}</span>
                    <span className="text-sm text-gray-500">{stats.totalXP} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressToNextLevel}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {500 - (stats.totalXP % 500)} XP para o próximo nível
                  </p>
                </div>

                {/* Weekly Goal */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Meta Semanal</span>
                    <span className="text-sm text-gray-500">12/20 questões</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-3/5"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Faltam 8 questões para completar sua meta
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Atividade Recente</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const getActivityIcon = () => {
                    switch (activity.type) {
                      case 'question':
                        return <Brain className="w-4 h-4" />;
                      case 'simulation':
                        return <Target className="w-4 h-4" />;
                      case 'game':
                        return <Trophy className="w-4 h-4" />;
                      default:
                        return <BookOpen className="w-4 h-4" />;
                    }
                  };

                  const getActivityColor = () => {
                    switch (activity.type) {
                      case 'question':
                        return activity.correct ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
                      case 'simulation':
                        return 'text-blue-600 bg-blue-100';
                      case 'game':
                        return 'text-purple-600 bg-purple-100';
                      default:
                        return 'text-gray-600 bg-gray-100';
                    }
                  };

                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor()}`}>
                        {getActivityIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {activity.score && (
                            <span className="text-xs text-gray-500">
                              {activity.score}% de acerto
                            </span>
                          )}
                          {activity.correct !== undefined && (
                            <span className={`text-xs ${
                              activity.correct ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {activity.correct ? 'Correto' : 'Incorreto'}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(activity.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Conquistas Recentes</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sequência de Fogo</p>
                    <p className="text-xs text-gray-500">10 dias consecutivos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mestre das Questões</p>
                    <p className="text-xs text-gray-500">200+ questões respondidas</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Precisão Cirúrgica</p>
                    <p className="text-xs text-gray-500">80%+ de acerto</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <Fire className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-bold">Sequência Atual</h3>
                  <p className="text-orange-100">{stats.currentStreak} dias</p>
                </div>
              </div>
              <p className="text-sm text-orange-100">
                Continue estudando para manter sua sequência!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;