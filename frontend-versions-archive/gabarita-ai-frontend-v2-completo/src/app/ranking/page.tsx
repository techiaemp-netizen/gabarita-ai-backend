'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Trophy, Medal, Award, TrendingUp, Users, Calendar, Filter, Search } from 'lucide-react';
import { rankingService } from '@/services/api';
import { RankingUser } from '@/types';

interface RankingFilters {
  period: 'weekly' | 'monthly' | 'all-time';
  category: 'general' | 'mathematics' | 'portuguese' | 'history' | 'geography' | 'sciences';
  plan: 'all' | 'free' | 'premium' | 'vip';
}

const MOCK_RANKING_DATA: RankingUser[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana@email.com',
    score: 9850,
    correctAnswers: 1247,
    totalQuestions: 1350,
    accuracy: 92.4,
    streak: 15,
    level: 12,
    planId: 'vip',
    avatar: null,
    position: 1
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos@email.com',
    score: 9420,
    correctAnswers: 1156,
    totalQuestions: 1280,
    accuracy: 90.3,
    streak: 12,
    level: 11,
    planId: 'premium',
    avatar: null,
    position: 2
  },
  {
    id: '3',
    name: 'Maria Costa',
    email: 'maria@email.com',
    score: 8950,
    correctAnswers: 1089,
    totalQuestions: 1200,
    accuracy: 90.8,
    streak: 8,
    level: 10,
    planId: 'premium',
    avatar: null,
    position: 3
  },
  {
    id: '4',
    name: 'João Oliveira',
    email: 'joao@email.com',
    score: 8650,
    correctAnswers: 987,
    totalQuestions: 1100,
    accuracy: 89.7,
    streak: 6,
    level: 9,
    planId: 'free',
    avatar: null,
    position: 4
  },
  {
    id: '5',
    name: 'Lucia Ferreira',
    email: 'lucia@email.com',
    score: 8320,
    correctAnswers: 945,
    totalQuestions: 1050,
    accuracy: 90.0,
    streak: 10,
    level: 9,
    planId: 'premium',
    avatar: null,
    position: 5
  }
];

const CATEGORIES = [
  { id: 'general', name: 'Geral', icon: Trophy },
  { id: 'mathematics', name: 'Matemática', icon: Award },
  { id: 'portuguese', name: 'Português', icon: Medal },
  { id: 'history', name: 'História', icon: TrendingUp },
  { id: 'geography', name: 'Geografia', icon: Users },
  { id: 'sciences', name: 'Ciências', icon: Calendar }
];

export default function RankingPage() {
  const { user } = useAuth();
  const [rankingData, setRankingData] = useState<RankingUser[]>([]);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<RankingFilters>({
    period: 'monthly',
    category: 'general',
    plan: 'all'
  });

  useEffect(() => {
    loadRankingData();
  }, [filters]);

  const loadRankingData = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados do ranking
      // const data = await rankingService.getRanking(filters);
      
      // Por enquanto, usar dados mock
      setTimeout(() => {
        let filteredData = [...MOCK_RANKING_DATA];
        
        // Aplicar filtros
        if (filters.plan !== 'all') {
          filteredData = filteredData.filter(user => user.planId === filters.plan);
        }
        
        // Aplicar busca
        if (searchTerm) {
          filteredData = filteredData.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Reordenar posições após filtros
        filteredData.forEach((user, index) => {
          user.position = index + 1;
        });
        
        setRankingData(filteredData);
        
        // Encontrar posição do usuário atual
        if (user) {
          const userInRanking = filteredData.find(u => u.id === user.id);
          setUserPosition(userInRanking?.position || null);
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      setIsLoading(false);
    }
  };

  const getPlanBadge = (planId: string) => {
    const badges = {
      free: { name: 'Gratuito', color: 'bg-gray-100 text-gray-800' },
      premium: { name: 'Premium', color: 'bg-blue-100 text-blue-800' },
      vip: { name: 'VIP', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[planId as keyof typeof badges] || badges.free;
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{position}</span>;
  };

  const getPositionBackground = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (position === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    if (position === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    return 'bg-white border-gray-200';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600">Faça login para ver o ranking.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🏆 Ranking Nacional</h1>
            <p className="text-xl opacity-90 mb-6">
              Veja como você está se saindo comparado a outros estudantes
            </p>
            {userPosition && (
              <div className="inline-flex items-center bg-white/20 rounded-lg px-4 py-2">
                <Trophy className="w-5 h-5 mr-2" />
                <span className="font-semibold">Sua posição: #{userPosition}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <select
                    value={filters.period}
                    onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="weekly">Esta Semana</option>
                    <option value="monthly">Este Mês</option>
                    <option value="all-time">Todos os Tempos</option>
                  </select>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Plano */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                  <select
                    value={filters.plan}
                    onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value as any }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Planos</option>
                    <option value="free">Gratuito</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              {/* Busca */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Estatísticas Gerais */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">12,547</div>
              <div className="text-sm text-gray-600">Usuários Ativos</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">89.2%</div>
              <div className="text-sm text-gray-600">Precisão Média</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">156,892</div>
              <div className="text-sm text-gray-600">Questões Respondidas</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">7.3</div>
              <div className="text-sm text-gray-600">Streak Médio</div>
            </div>
          </div>

          {/* Lista do Ranking */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                Ranking {CATEGORIES.find(c => c.id === filters.category)?.name} - {filters.period === 'weekly' ? 'Semanal' : filters.period === 'monthly' ? 'Mensal' : 'Geral'}
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando ranking...</p>
              </div>
            ) : rankingData.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Nenhum usuário encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {rankingData.map((rankingUser, index) => {
                  const isCurrentUser = user.id === rankingUser.id;
                  const planBadge = getPlanBadge(rankingUser.planId);
                  
                  return (
                    <div
                      key={rankingUser.id}
                      className={`p-6 transition-colors ${
                        isCurrentUser 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : getPositionBackground(rankingUser.position)
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getPositionIcon(rankingUser.position)}
                          </div>
                          
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {rankingUser.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {rankingUser.name}
                                {isCurrentUser && (
                                  <span className="ml-2 text-sm text-blue-600 font-medium">(Você)</span>
                                )}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${planBadge.color}`}>
                                {planBadge.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>Nível {rankingUser.level}</span>
                              <span>•</span>
                              <span>Streak: {rankingUser.streak} dias</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-right">
                          <div>
                            <div className="text-lg font-bold text-gray-900">
                              {rankingUser.score.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Pontos</div>
                          </div>
                          
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {rankingUser.accuracy.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Precisão</div>
                          </div>
                          
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {rankingUser.correctAnswers}
                            </div>
                            <div className="text-sm text-gray-600">Acertos</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call to Action */}
          {!userPosition && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mt-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Quer aparecer no ranking?</h3>
              <p className="text-lg mb-6 opacity-90">
                Responda mais questões e melhore sua precisão para subir no ranking!
              </p>
              <button
                onClick={() => window.location.href = '/simulado'}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Fazer Simulado
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}