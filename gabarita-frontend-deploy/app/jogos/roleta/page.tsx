'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  RotateCcw, 
  Home,
  Zap,
  Clock,
  Target,
  Gift,
  Coins,
  Play,
  Pause
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RouletteSegment {
  id: number;
  label: string;
  points: number;
  color: string;
  textColor: string;
  type: 'points' | 'bonus' | 'question' | 'penalty';
  description: string;
}

interface GameState {
  segments: RouletteSegment[];
  currentSegment: number;
  isSpinning: boolean;
  spinsLeft: number;
  totalScore: number;
  spinHistory: RouletteSegment[];
  gameStatus: 'playing' | 'finished';
  timeElapsed: number;
  lastWin: RouletteSegment | null;
}

const rouletteSegments: RouletteSegment[] = [
  {
    id: 1,
    label: '100 PTS',
    points: 100,
    color: '#10B981',
    textColor: '#FFFFFF',
    type: 'points',
    description: 'Ganhou 100 pontos!'
  },
  {
    id: 2,
    label: 'QUESTÃO',
    points: 0,
    color: '#3B82F6',
    textColor: '#FFFFFF',
    type: 'question',
    description: 'Responda uma questão para ganhar pontos extras!'
  },
  {
    id: 3,
    label: '50 PTS',
    points: 50,
    color: '#8B5CF6',
    textColor: '#FFFFFF',
    type: 'points',
    description: 'Ganhou 50 pontos!'
  },
  {
    id: 4,
    label: 'BÔNUS 2X',
    points: 0,
    color: '#F59E0B',
    textColor: '#FFFFFF',
    type: 'bonus',
    description: 'Próxima rodada vale o dobro!'
  },
  {
    id: 5,
    label: '200 PTS',
    points: 200,
    color: '#EF4444',
    textColor: '#FFFFFF',
    type: 'points',
    description: 'Ganhou 200 pontos!'
  },
  {
    id: 6,
    label: 'TENTE NOVAMENTE',
    points: 0,
    color: '#6B7280',
    textColor: '#FFFFFF',
    type: 'bonus',
    description: 'Ganha uma rodada extra!'
  },
  {
    id: 7,
    label: '75 PTS',
    points: 75,
    color: '#14B8A6',
    textColor: '#FFFFFF',
    type: 'points',
    description: 'Ganhou 75 pontos!'
  },
  {
    id: 8,
    label: 'PERDEU TUDO',
    points: 0,
    color: '#1F2937',
    textColor: '#FFFFFF',
    type: 'penalty',
    description: 'Perdeu todos os pontos desta sessão!'
  },
  {
    id: 9,
    label: '150 PTS',
    points: 150,
    color: '#EC4899',
    textColor: '#FFFFFF',
    type: 'points',
    description: 'Ganhou 150 pontos!'
  },
  {
    id: 10,
    label: 'MEGA BÔNUS',
    points: 500,
    color: '#7C3AED',
    textColor: '#FFFFFF',
    type: 'bonus',
    description: 'JACKPOT! Ganhou 500 pontos!'
  }
];

const INITIAL_SPINS = 5;
const SEGMENT_ANGLE = 360 / rouletteSegments.length;

export default function RoletaPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    segments: rouletteSegments,
    currentSegment: 0,
    isSpinning: false,
    spinsLeft: INITIAL_SPINS,
    totalScore: 0,
    spinHistory: [],
    gameStatus: 'playing',
    timeElapsed: 0,
    lastWin: null
  });
  const [rotation, setRotation] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const rouletteRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && gameState.gameStatus === 'playing') {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameState.gameStatus]);

  const spinRoulette = () => {
    if (gameState.isSpinning || gameState.spinsLeft <= 0) return;

    setGameState(prev => ({ ...prev, isSpinning: true }));
    setShowResult(false);

    // Random spin between 3-8 full rotations plus random segment
    const minSpins = 3;
    const maxSpins = 8;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    const randomSegment = Math.floor(Math.random() * rouletteSegments.length);
    const finalAngle = spins * 360 + (randomSegment * SEGMENT_ANGLE);
    
    const newRotation = rotation + finalAngle;
    setRotation(newRotation);

    // Calculate which segment we landed on
    const normalizedAngle = (360 - (newRotation % 360)) % 360;
    const segmentIndex = Math.floor(normalizedAngle / SEGMENT_ANGLE);
    const landedSegment = rouletteSegments[segmentIndex];

    // Animation duration
    setTimeout(() => {
      handleSpinResult(landedSegment);
    }, 3000);
  };

  const handleSpinResult = (segment: RouletteSegment) => {
    let newScore = gameState.totalScore;
    let newSpinsLeft = gameState.spinsLeft - 1;
    let newMultiplier = bonusMultiplier;

    switch (segment.type) {
      case 'points':
        newScore += segment.points * bonusMultiplier;
        newMultiplier = 1; // Reset multiplier after use
        break;
      case 'bonus':
        if (segment.label === 'BÔNUS 2X') {
          newMultiplier = 2;
        } else if (segment.label === 'TENTE NOVAMENTE') {
          newSpinsLeft += 1; // Give back the spin plus one extra
        } else if (segment.label === 'MEGA BÔNUS') {
          newScore += segment.points;
        }
        break;
      case 'penalty':
        if (segment.label === 'PERDEU TUDO') {
          newScore = 0;
        }
        newMultiplier = 1;
        break;
      case 'question':
        // For now, just give some points. In a real implementation, 
        // this would trigger a question modal
        newScore += 100 * bonusMultiplier;
        newMultiplier = 1;
        break;
    }

    const newHistory = [...gameState.spinHistory, segment];
    
    setGameState(prev => ({
      ...prev,
      isSpinning: false,
      spinsLeft: newSpinsLeft,
      totalScore: newScore,
      spinHistory: newHistory,
      gameStatus: newSpinsLeft <= 0 ? 'finished' : 'playing',
      lastWin: segment
    }));

    setBonusMultiplier(newMultiplier);
    setShowResult(true);

    if (newSpinsLeft <= 0) {
      setIsRunning(false);
    }
  };

  const resetGame = () => {
    setGameState({
      segments: rouletteSegments,
      currentSegment: 0,
      isSpinning: false,
      spinsLeft: INITIAL_SPINS,
      totalScore: 0,
      spinHistory: [],
      gameStatus: 'playing',
      timeElapsed: 0,
      lastWin: null
    });
    setRotation(0);
    setBonusMultiplier(1);
    setShowResult(false);
    setIsRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSegmentPath = (index: number) => {
    const startAngle = index * SEGMENT_ANGLE;
    const endAngle = (index + 1) * SEGMENT_ANGLE;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const radius = 150;
    const x1 = 150 + radius * Math.cos(startAngleRad);
    const y1 = 150 + radius * Math.sin(startAngleRad);
    const x2 = 150 + radius * Math.cos(endAngleRad);
    const y2 = 150 + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = SEGMENT_ANGLE > 180 ? 1 : 0;
    
    return `M 150 150 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number) => {
    const angle = (index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2) * Math.PI / 180;
    const radius = 100;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    return { x, y, angle: angle * 180 / Math.PI };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/jogos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Roleta da Sorte</h1>
              <p className="text-gray-600">Gire e teste sua sorte!</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {bonusMultiplier > 1 && (
            <Badge className="bg-orange-100 text-orange-800 animate-pulse">
              Bônus {bonusMultiplier}x Ativo!
            </Badge>
          )}
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-lg">{gameState.totalScore} pts</span>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Rodadas</span>
            </div>
            <p className="text-xl font-bold text-blue-800">
              {gameState.spinsLeft}/{INITIAL_SPINS}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Tempo</span>
            </div>
            <p className="text-xl font-bold text-green-800">
              {formatTime(gameState.timeElapsed)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Gift className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Prêmios</span>
            </div>
            <p className="text-xl font-bold text-purple-800">{gameState.spinHistory.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Multiplicador</span>
            </div>
            <p className="text-xl font-bold text-yellow-800">{bonusMultiplier}x</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progresso do Jogo</span>
          <span className="text-sm text-gray-600">
            {Math.round(((INITIAL_SPINS - gameState.spinsLeft) / INITIAL_SPINS) * 100)}%
          </span>
        </div>
        <Progress value={((INITIAL_SPINS - gameState.spinsLeft) / INITIAL_SPINS) * 100} className="h-2" />
      </div>

      {gameState.gameStatus === 'playing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Roulette */}
          <div className="flex flex-col items-center space-y-6">
            <Card className="p-6">
              <div className="relative">
                {/* Roulette Wheel */}
                <div 
                  ref={rouletteRef}
                  className="relative w-80 h-80 mx-auto"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: gameState.isSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
                  }}
                >
                  <svg width="300" height="300" className="absolute inset-0">
                    {gameState.segments.map((segment, index) => {
                      const textPos = getTextPosition(index);
                      return (
                        <g key={segment.id}>
                          <path
                            d={getSegmentPath(index)}
                            fill={segment.color}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                          <text
                            x={textPos.x}
                            y={textPos.y}
                            fill={segment.textColor}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${textPos.angle}, ${textPos.x}, ${textPos.y})`}
                          >
                            {segment.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
                </div>
              </div>
            </Card>
            
            {/* Spin Button */}
            <Button
              onClick={spinRoulette}
              disabled={gameState.isSpinning || gameState.spinsLeft <= 0}
              size="lg"
              className="w-32 h-32 rounded-full text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50"
            >
              {gameState.isSpinning ? (
                <div className="flex flex-col items-center">
                  <Pause className="w-8 h-8 mb-2" />
                  <span className="text-sm">Girando...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Play className="w-8 h-8 mb-2" />
                  <span className="text-sm">GIRAR</span>
                </div>
              )}
            </Button>
          </div>

          {/* Results and History */}
          <div className="space-y-6">
            {/* Last Result */}
            {showResult && gameState.lastWin && (
              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-center text-yellow-800">
                    Resultado da Rodada
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                       style={{ backgroundColor: gameState.lastWin.color }}>
                    <span className="text-white font-bold text-lg">
                      {gameState.lastWin.label.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {gameState.lastWin.label}
                  </h3>
                  <p className="text-gray-600 mb-4">{gameState.lastWin.description}</p>
                  {gameState.lastWin.points > 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      +{gameState.lastWin.points * (bonusMultiplier > 1 ? bonusMultiplier : 1)} pontos
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Spin History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Histórico de Rodadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameState.spinHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma rodada realizada ainda
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {gameState.spinHistory.map((spin, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: spin.color }}></div>
                          <span className="font-medium">{spin.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {spin.points > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              +{spin.points}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Final Results */
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl text-yellow-800 mb-2">
                Jogo Finalizado!
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Pontuação Final</span>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{gameState.totalScore}</p>
                <p className="text-sm text-gray-600">pontos totais</p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Prêmios</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{gameState.spinHistory.length}</p>
                <p className="text-sm text-gray-600">rodadas jogadas</p>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Tempo</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {formatTime(gameState.timeElapsed)}
                </p>
                <p className="text-sm text-gray-600">tempo total</p>
              </div>
            </div>
            
            <div className="flex space-x-4 justify-center">
              <Button onClick={resetGame} className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4" />
                <span>Jogar Novamente</span>
              </Button>
              <Button variant="outline" onClick={() => router.push('/jogos')}>
                <Home className="w-4 h-4 mr-2" />
                Menu Jogos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}