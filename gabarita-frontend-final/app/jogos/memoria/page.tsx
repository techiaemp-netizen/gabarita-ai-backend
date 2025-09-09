'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Puzzle, ArrowLeft, Trophy, Clock, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MemoryCard {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameState {
  cards: MemoryCard[];
  flippedCards: number[];
  matches: number;
  moves: number;
  gameStatus: 'playing' | 'won';
  timeElapsed: number;
  score: number;
}

const cardContents = [
  '⚖️', '📚', '🏛️', '👨‍⚖️', '📋', '🔨', '📜', '🏆',
  '⚖️', '📚', '🏛️', '👨‍⚖️', '📋', '🔨', '📜', '🏆'
];

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function MemoriaPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    flippedCards: [],
    matches: 0,
    moves: 0,
    gameStatus: 'playing',
    timeElapsed: 0,
    score: 0
  });

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    // Timer
    if (gameState.gameStatus === 'playing') {
      const timer = setInterval(() => {
        setGameState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.gameStatus]);

  useEffect(() => {
    // Check for matches when 2 cards are flipped
    if (gameState.flippedCards.length === 2) {
      const [firstId, secondId] = gameState.flippedCards;
      const firstCard = gameState.cards.find(card => card.id === firstId);
      const secondCard = gameState.cards.find(card => card.id === secondId);

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Match found
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            cards: prev.cards.map(card => 
              card.id === firstId || card.id === secondId 
                ? { ...card, isMatched: true }
                : card
            ),
            flippedCards: [],
            matches: prev.matches + 1,
            moves: prev.moves + 1
          }));
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            cards: prev.cards.map(card => 
              card.id === firstId || card.id === secondId 
                ? { ...card, isFlipped: false }
                : card
            ),
            flippedCards: [],
            moves: prev.moves + 1
          }));
        }, 1000);
      }
    }
  }, [gameState.flippedCards]);

  useEffect(() => {
    // Check for win condition
    if (gameState.matches === 8 && gameState.gameStatus === 'playing') {
      const finalScore = Math.max(1000 - (gameState.moves * 10) - Math.floor(gameState.timeElapsed / 2), 100);
      setGameState(prev => ({
        ...prev,
        gameStatus: 'won',
        score: finalScore
      }));
    }
  }, [gameState.matches]);

  const initializeGame = () => {
    const shuffledContents = shuffleArray(cardContents);
    const initialCards: MemoryCard[] = shuffledContents.map((content, index) => ({
      id: index,
      content,
      isFlipped: false,
      isMatched: false
    }));

    setGameState({
      cards: initialCards,
      flippedCards: [],
      matches: 0,
      moves: 0,
      gameStatus: 'playing',
      timeElapsed: 0,
      score: 0
    });
  };

  const handleCardClick = (cardId: number) => {
    const card = gameState.cards.find(c => c.id === cardId);
    
    if (!card || card.isFlipped || card.isMatched || gameState.flippedCards.length >= 2) {
      return;
    }

    setGameState(prev => ({
      ...prev,
      cards: prev.cards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      ),
      flippedCards: [...prev.flippedCards, cardId]
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="p-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl">
            <Puzzle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jogo da Memória</h1>
            <p className="text-gray-600">Encontre os pares!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={initializeGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-gray-500 mr-2" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(gameState.timeElapsed)}</div>
            <div className="text-sm text-gray-600">Tempo</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{gameState.moves}</div>
            <div className="text-sm text-gray-600">Movimentos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{gameState.matches}/8</div>
            <div className="text-sm text-gray-600">Pares</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{gameState.score}</div>
            <div className="text-sm text-gray-600">Pontos</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {gameState.cards.map((card) => (
              <div
                key={card.id}
                className={`
                  aspect-square rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${
                    card.isFlipped || card.isMatched
                      ? 'bg-white border-2 border-purple-200 shadow-lg'
                      : 'bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700'
                  }
                  ${
                    card.isMatched
                      ? 'ring-2 ring-green-400 bg-green-50'
                      : ''
                  }
                `}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  {card.isFlipped || card.isMatched ? (
                    card.content
                  ) : (
                    <div className="text-white text-2xl font-bold">?</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Win Modal */}
      {gameState.gameStatus === 'won' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-700 mb-2">Parabéns!</h2>
              <p className="text-green-600 mb-4">Você completou o jogo da memória!</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatTime(gameState.timeElapsed)}</div>
                <div className="text-sm text-gray-600">Tempo</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{gameState.moves}</div>
                <div className="text-sm text-gray-600">Movimentos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{gameState.score}</div>
                <div className="text-sm text-gray-600">Pontos</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={initializeGame}>
                Jogar Novamente
              </Button>
              <Button variant="outline" onClick={() => router.push('/jogos')}>
                Voltar aos Jogos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}