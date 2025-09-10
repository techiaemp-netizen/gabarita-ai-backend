'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gamepad2, 
  Trophy, 
  Star, 
  Lock, 
  Play, 
  Users, 
  Clock,
  Target,
  Zap,
  Brain,
  Grid3X3,
  RotateCcw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  estimatedTime: string;
  maxPlayers: number;
  allowedPlans: string[];
  category: string;
  points: number;
  color: string;
}

interface UserStats {
  totalGames: number;
  totalPoints: number;
  favoriteGame: string;
  streak: number;
}

const games: Game[] = [
  {
    id: 'forca',
    name: 'Jogo da Forca',
    description: 'Descubra a palavra relacionada ao seu concurso antes que o boneco seja enforcado!',
    icon: Target,
    difficulty: 'Fácil',
    estimatedTime: '5-10 min',
    maxPlayers: 1,
    allowedPlans: ['premium', 'ate_final_concurso'],
    category: 'Vocabulário',
    points: 50,
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'quiz',
    name: 'Quiz Rápido',
    description: 'Responda questões de múltipla escolha no menor tempo possível!',
    icon: Zap,
    difficulty: 'Médio',
    estimatedTime: '3-5 min',
    maxPlayers: 1,
    allowedPlans: ['premium', 'ate_final_concurso'],
    category: 'Conhecimento',
    points: 75,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'memoria',
    name: 'Jogo da Memória',
    description: 'Encontre os pares de cartas com conceitos jurídicos relacionados!',
    icon: Brain,
    difficulty: 'Médio',
    estimatedTime: '8-12 min',
    maxPlayers: 1,
    allowedPlans: ['premium', 'ate_final_concurso'],
    category: 'Memória',
    points: 100,
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'palavras_cruzadas',
    name: 'Palavras Cruzadas',
    description: 'Complete as palavras cruzadas com termos jurídicos e conceitos importantes!',
    icon: Grid3X3,
    difficulty: 'Difícil',
    estimatedTime: '15-20 min',
    maxPlayers: 1,
    allowedPlans: ['premium', 'ate_final_concurso'],
    category: 'Raciocínio',
    points: 150,
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 'roleta',
    name: 'Roleta da Sorte',
    description: 'Gire a roleta e responda questões para ganhar pontos e prêmios especiais!',
    icon: RotateCcw,
    difficulty: 'Fácil',
    estimatedTime: '5-8 min',
    maxPlayers: 1,
    allowedPlans: ['trial', 'premium', 'ate_final_concurso'],
    category: 'Sorte',
    points: 25,
    color: 'from-pink-400 to-pink-600'
  }
];

export default function JogosPage() {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState('premium'); // Mock user plan
  const [userStats, setUserStats] = useState<UserStats>({
    totalGames: 42,
    totalPoints: 3250,
    favoriteGame: 'Quiz Rápido',
    streak: 7
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(games.map(game => game.category)))];
  
  const filteredGames = selectedCategory === 'Todos' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const canPlayGame = (game: Game) => {
    return game.allowedPlans.includes(userPlan);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePlayGame = (gameId: string) => {
    router.push(`/jogos/${gameId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jogos Educativos</h1>
            <p className="text-gray-600">Aprenda se divertindo com nossos jogos interativos</p>
          </div>
        </div>
        
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jogos Jogados</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.totalGames}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pontos Totais</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.totalPoints.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sequência</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.streak} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plano Atual</p>
                  <Badge variant="secondary" className="mt-1">
                    {userPlan === 'premium' ? 'Premium' : userPlan === 'trial' ? 'Trial' : 'Até Final'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => {
          const IconComponent = game.icon;
          const canPlay = canPlayGame(game);
          
          return (
            <Card key={game.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
              canPlay ? 'hover:scale-105 cursor-pointer' : 'opacity-75'
            }`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5`} />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 bg-gradient-to-br ${game.color} rounded-xl`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <Badge className={getDifficultyColor(game.difficulty)}>
                        {game.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  {!canPlay && (
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <CardDescription className="mt-3">
                  {game.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{game.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-4 h-4" />
                      <span>{game.points} pts</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {game.maxPlayers === 1 ? 'Individual' : `Até ${game.maxPlayers} jogadores`}
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handlePlayGame(game.id)}
                    disabled={!canPlay}
                  >
                    {canPlay ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Jogar Agora
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Upgrade Necessário
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Plan Upgrade CTA */}
      {userPlan === 'trial' && (
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Desbloqueie Todos os Jogos!
                </h3>
                <p className="text-gray-600">
                  Upgrade para Premium e tenha acesso completo a todos os jogos educativos.
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Fazer Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}