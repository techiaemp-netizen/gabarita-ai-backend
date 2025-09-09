'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  Award, 
  BookOpen, 
  BarChart3, 
  PieChart, 
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { UserStats } from '@/types';

interface PerformanceData {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  streak: number;
  level: number;
  points: number;
  weeklyProgress: Array<{ day: string; questions: number; accuracy: number }>;
  subjectPerformance: Array<{ subject: string; accuracy: number; questions: number }>;
  monthlyStats: Array<{ month: string; questions: number; accuracy: number }>;
  recentActivity: Array<{ date: string; type: string; description: string; points: number }>;
}

const MOCK_PERFORMANCE_DATA: PerformanceData = {
  totalQuestions: 1247,
  correctAnswers: 1089,
  accuracy: 87.3,
  averageTime: 45, // segundos
  streak: 12,
  level: 8,
  points: 8950,
  weeklyProgress: [
    { day: 'Seg', questions: 15, accuracy: 86.7 },
    { day: 'Ter', questions: 22, accuracy: 90.9 },
    { day: 'Qua', questions: 18, accuracy: 83.3 },
    { day: 'Qui', questions: 25, accuracy: 88.0 },
    { day: 'Sex', questions: 20, accuracy: 85.0 },
    { day: 'Sáb', questions: 12, accuracy: 91.7 },
    { day: 'Dom', questions: 8, accuracy: 87.5 }
  ],
  subjectPerformance: [
    { subject: 'Matemática', accuracy: 92.1, questions: 245 },
    { subject: 'Português', accuracy: 88.5, questions: 198 },
    { subject: 'História', accuracy: 85.2, questions: 167 },
    { subject: 'Geografia', accuracy: 89.8, questions: 156 },
    { subject: 'Ciências', accuracy: 84.7, questions: 134 },
    { subject: 'Física', accuracy: 81.3, questions: 98 }
  ],
  monthlyStats: [
    { month: 'Jan', questions: 89, accuracy: 82.0 },
    { month: 'Fev', questions: 156, accuracy: 85.3 },
    { month: 'Mar', questions: 203, accuracy: 87.1 },
    { month: 'Abr', questions: 234, accuracy: 88.9 },
    { month: 'Mai', questions: 267, accuracy: 89.5 },
    { month: 'Jun', questions: 298, accuracy: 87.3 }
  ],
  recentActivity: [
    { date: '2024-01-15', type: 'simulado', description: 'Simulado de Matemática concluído', points: 150 },
    { date: '2024-01-14', type: 'streak', description: 'Streak de 10 dias alcançado', points: 100 },
    { date: '2024-01-13', type: 'level', description: 'Subiu para o nível 8', points: 200 },
    { date: '2024-01-12', type: 'achievement', description: 'Conquistou medalha de Precisão', points: 75 },
    { date: '2024-01-11', type: 'simulado', description: 'Simulado de Português concluído', points: 120 }
  ]
};

const SUBJECTS = [
  'Todas as Matérias',
  'Matemática',
  'Português', 
  'História',
  'Geografia',
  'Ciências',
  'Física'
];

const TIME_PERIODS = [
  { id: 'week', name: 'Esta Semana' },
  { id: 'month', name: 'Este Mês' },
  { id: 'quarter', name: 'Últimos 3 Meses' },
  { id: 'year', name: 'Este Ano' }
];

export default function DesempenhoPage() {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData>(MOCK_PERFORMANCE_DATA);
  const [selectedSubject, setSelectedSubject] = useState('Todas as Matérias');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPerformanceData();
    }
  }, [user, selectedSubject, selectedPeriod]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados
      // const data = await performanceService.getUserStats(user.id, { subject: selectedSubject, period: selectedPeriod });
      
      setTimeout(() => {
        setPerformanceData(MOCK_PERFORMANCE_DATA);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar dados de desempenho:', error);
      setIsLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-yellow-600';
    if (accuracy >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-100';
    if (accuracy >= 80) return 'bg-yellow-100';
    if (accuracy >= 70) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'simulado': return <BookOpen className="w-4 h-4" />;
      case 'streak': return <Zap className="w-4 h-4" />;
      case 'level': return <TrendingUp className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'simulado': return 'text-blue-600 bg-blue-100';
      case 'streak': return 'text-yellow-600 bg-yellow-100';
      case 'level': return 'text-green-600 bg-green-100';
      case 'achievement': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <ProtectedRoute feature="desempenho">
      <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">📊 Análise de Desempenho</h1>
            <p className="text-xl opacity-90">
              Acompanhe seu progresso e identifique áreas para melhoria
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filtros:</span>
              </div>
              
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TIME_PERIODS.map(period => (
                  <option key={period.id} value={period.id}>{period.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estatísticas Principais */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {performanceData.totalQuestions.toLocaleString()}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Questões Respondidas</h3>
              <p className="text-xs text-green-600 mt-1">+23 esta semana</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <span className={`text-2xl font-bold ${getAccuracyColor(performanceData.accuracy)}`}>
                  {performanceData.accuracy.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Precisão Geral</h3>
              <p className="text-xs text-green-600 mt-1">+2.1% este mês</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {performanceData.streak}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Sequência Atual</h3>
              <p className="text-xs text-yellow-600 mt-1">dias consecutivos</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {performanceData.points.toLocaleString()}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Pontos Totais</h3>
              <p className="text-xs text-purple-600 mt-1">Nível {performanceData.level}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Progresso Semanal */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Progresso Semanal
              </h3>
              <div className="space-y-4">
                {performanceData.weeklyProgress.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 text-sm font-medium text-gray-600">{day.day}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{day.questions} questões</span>
                          <span className={`text-sm font-medium ${getAccuracyColor(day.accuracy)}`}>
                            {day.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(day.questions / 30) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desempenho por Matéria */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Desempenho por Matéria
              </h3>
              <div className="space-y-4">
                {performanceData.subjectPerformance.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{subject.questions} questões</span>
                          <span className={`text-sm font-bold ${getAccuracyColor(subject.accuracy)}`}>
                            {subject.accuracy.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            subject.accuracy >= 90 ? 'bg-green-500' :
                            subject.accuracy >= 80 ? 'bg-yellow-500' :
                            subject.accuracy >= 70 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${subject.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progresso Mensal */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Evolução Mensal
            </h3>
            <div className="grid md:grid-cols-6 gap-4">
              {performanceData.monthlyStats.map((month, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">{month.month}</div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {month.questions}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">questões</div>
                    <div className={`text-sm font-bold ${getAccuracyColor(month.accuracy)}`}>
                      {month.accuracy.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Atividade Recente
            </h3>
            <div className="space-y-4">
              {performanceData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.description}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(activity.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+{activity.points}</div>
                    <div className="text-xs text-gray-600">pontos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metas e Recomendações */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Metas da Semana
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">Responder 50 questões</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-sm text-blue-700">34/50</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">Manter 85% de precisão</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-800">Estudar 5 dias consecutivos</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm text-blue-700">3/5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recomendações
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <span className="text-purple-800 text-sm">
                    Foque em <strong>Física</strong> - sua precisão está 6% abaixo da média
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <span className="text-purple-800 text-sm">
                    Tente responder questões pela manhã - seu desempenho é 12% melhor
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <span className="text-purple-800 text-sm">
                    Faça mais simulados completos para melhorar a resistência
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}