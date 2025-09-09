'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  Award, 
  Flame, 
  Zap, 
  ChevronUp, 
  ChevronDown, 
  Filter,
  Search
} from 'lucide-react';

interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  questionsAnswered: number;
  accuracy: number;
  streak: number;
  position: number;
  previousPosition?: number;
  level: string;
  city: string;
  state: string;
}

interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  prize: string;
  status: 'active' | 'upcoming' | 'finished';
  category: string;
}

const mockRankingData: RankingUser[] = [
  {
    id: '1',
    name: 'Ana Silva',
    score: 9850,
    questionsAnswered: 2340,
    accuracy: 89,
    streak: 45,
    position: 1,
    previousPosition: 2,
    level: 'Expert',
    city: 'São Paulo',
    state: 'SP'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    score: 9720,
    questionsAnswered: 2180,
    accuracy: 87,
    streak: 32,
    position: 2,
    previousPosition: 1,
    level: 'Expert',
    city: 'Rio de Janeiro',
    state: 'RJ'
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    score: 9650,
    questionsAnswered: 2050,
    accuracy: 91,
    streak: 28,
    position: 3,
    previousPosition: 4,
    level: 'Expert',
    city: 'Belo Horizonte',
    state: 'MG'
  },
  {
    id: '4',
    name: 'João Costa',
    score: 9480,
    questionsAnswered: 1980,
    accuracy: 85,
    streak: 22,
    position: 4,
    previousPosition: 3,
    level: 'Avançado',
    city: 'Porto Alegre',
    state: 'RS'
  },
  {
    id: '5',
    name: 'Você',
    score: 8950,
    questionsAnswered: 1750,
    accuracy: 82,
    streak: 15,
    position: 8,
    previousPosition: 10,
    level: 'Avançado',
    city: 'São Paulo',
    state: 'SP'
  }
];

const mockCompetitions: Competition[] = [
  {
    id: '1',
    title: 'Desafio Semanal - Matemática',
    description: 'Resolva 100 questões de matemática e ganhe pontos extras',
    startDate: '2024-01-15',
    endDate: '2024-01-21',
    participants: 1250,
    prize: 'Certificado + 500 pontos',
    status: 'active',
    category: 'Matemática'
  },
  {
    id: '2',
    title: 'Maratona de Português',
    description: 'Competição de interpretação de texto e gramática',
    startDate: '2024-01-20',
    endDate: '2024-01-27',
    participants: 890,
    prize: '1 mês Premium grátis',
    status: 'upcoming',
    category: 'Português'
  },
  {
    id: '3',
    title: 'Simulado Nacional',
    description: 'Simulado completo com todas as matérias do ENEM',
    startDate: '2024-01-10',
    endDate: '2024-01-14',
    participants: 2340,
    prize: 'R$ 500 + Mentoria',
    status: 'finished',
    category: 'Geral'
  }
];

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'competitions' | 'achievements'>('general');
  const [rankingPeriod, setRankingPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('monthly');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">{position}</span>;
    }
  };

  const getPositionChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = previous - current;
    if (change > 0) {
      return <ChevronUp className="w-4 h-4 text-green-600" />;
    } else if (change < 0) {
      return <ChevronDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getCompetitionStatusColor = (status: Competition['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'finished': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCompetitionStatusText = (status: Competition['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'upcoming': return 'Em breve';
      case 'finished': return 'Finalizado';
      default: return 'Desconhecido';
    }
  };

  const filteredRanking = mockRankingData.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompetitions = mockCompetitions.filter(comp => 
    selectedCategory === 'all' || comp.category === selectedCategory
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ranking e Competições</h1>
            <p className="text-gray-600">Veja sua posição e participe de competições</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Ranking Geral
            </button>
            <button
              onClick={() => setActiveTab('competitions')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'competitions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Competições
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Conquistas
            </button>
          </div>

          {/* General Ranking Tab */}
          {activeTab === 'general' && (
            <div>
              {/* User Stats Card */}
              <Card className="p-6 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">8º</div>
                    <div className="text-blue-100">Posição Atual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">8,950</div>
                    <div className="text-blue-100">Pontuação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">82%</div>
                    <div className="text-blue-100">Precisão</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-1">
                      <Flame className="w-8 h-8" />
                      15
                    </div>
                    <div className="text-blue-100">Sequência</div>
                  </div>
                </div>
              </Card>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={rankingPeriod}
                    onChange={(e) => setRankingPeriod(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Esta Semana</option>
                    <option value="monthly">Este Mês</option>
                    <option value="all-time">Todos os Tempos</option>
                  </select>
                </div>
              </div>

              {/* Ranking List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Estudantes</h3>
                
                <div className="space-y-4">
                  {filteredRanking.map((user) => (
                    <div 
                      key={user.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        user.name === 'Você' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getRankingIcon(user.position)}
                          {getPositionChange(user.position, user.previousPosition)}
                        </div>
                        
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-gray-700">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{user.name}</h4>
                            {user.name === 'Você' && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                Você
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.city}, {user.state}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{user.score.toLocaleString()}</div>
                          <div className="text-gray-600">Pontos</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{user.accuracy}%</div>
                          <div className="text-gray-600">Precisão</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-1 font-semibold text-gray-900">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {user.streak}
                          </div>
                          <div className="text-gray-600">Sequência</div>
                        </div>
                        
                        <div className="text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.level === 'Expert' ? 'bg-purple-100 text-purple-700' :
                            user.level === 'Avançado' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Competitions Tab */}
          {activeTab === 'competitions' && (
            <div>
              {/* Active Competition Alert */}
              <Card className="p-6 mb-6 bg-gradient-to-r from-green-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Desafio Semanal - Matemática</h3>
                    <p className="text-green-100 mb-4">Você está participando! Posição atual: 45º</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        1,250 participantes
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Termina em 3 dias
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-sm">Prêmio</div>
                    <div className="font-bold">Certificado + 500 pts</div>
                  </div>
                </div>
              </Card>

              {/* Competition Filters */}
              <div className="flex gap-4 mb-6">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Português">Português</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              {/* Competitions List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCompetitions.map((competition) => (
                  <Card key={competition.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{competition.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getCompetitionStatusColor(competition.status)
                        }`}>
                          {getCompetitionStatusText(competition.status)}
                        </span>
                      </div>
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{competition.description}</p>
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Participantes:</span>
                        <span className="font-medium">{competition.participants.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Prêmio:</span>
                        <span className="font-medium text-green-600">{competition.prize}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Período:</span>
                        <span className="font-medium">
                          {new Date(competition.startDate).toLocaleDateString('pt-BR')} - {new Date(competition.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      disabled={competition.status === 'finished'}
                      variant={competition.status === 'active' ? 'default' : 'outline'}
                    >
                      {competition.status === 'active' ? 'Participar' :
                       competition.status === 'upcoming' ? 'Em Breve' : 'Finalizado'}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              {/* Achievement Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
                  <div className="text-gray-600 text-sm">Troféus</div>
                </Card>
                
                <Card className="p-6 text-center">
                  <Medal className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">28</div>
                  <div className="text-gray-600 text-sm">Medalhas</div>
                </Card>
                
                <Card className="p-6 text-center">
                  <Star className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">45</div>
                  <div className="text-gray-600 text-sm">Conquistas</div>
                </Card>
                
                <Card className="p-6 text-center">
                  <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">89%</div>
                  <div className="text-gray-600 text-sm">Completude</div>
                </Card>
              </div>

              {/* Recent Achievements */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Conquistas Recentes</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Sequência de Ouro</h4>
                      <p className="text-gray-600 text-sm">Manteve uma sequência de 30 dias consecutivos</p>
                    </div>
                    <span className="text-xs text-gray-500">Há 2 dias</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Star className="w-8 h-8 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Mestre da Matemática</h4>
                      <p className="text-gray-600 text-sm">Acertou 100 questões de matemática consecutivas</p>
                    </div>
                    <span className="text-xs text-gray-500">Há 1 semana</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Award className="w-8 h-8 text-green-500" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Velocista</h4>
                      <p className="text-gray-600 text-sm">Respondeu 50 questões em menos de 30 minutos</p>
                    </div>
                    <span className="text-xs text-gray-500">Há 2 semanas</span>
                  </div>
                </div>
              </Card>

              {/* All Achievements */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Todas as Conquistas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Achievement badges would be mapped here */}
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">Primeiro Lugar</h4>
                    <p className="text-xs text-gray-600">Ficou em 1º lugar em uma competição</p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg text-center opacity-50">
                    <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">Maratonista</h4>
                    <p className="text-xs text-gray-600">Complete 1000 questões</p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg text-center">
                    <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">Em Chamas</h4>
                    <p className="text-xs text-gray-600">Sequência de 7 dias</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}