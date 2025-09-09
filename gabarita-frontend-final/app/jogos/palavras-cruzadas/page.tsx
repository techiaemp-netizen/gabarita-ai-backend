'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, ArrowLeft, Trophy, Clock, CheckCircle, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CrosswordClue {
  id: number;
  number: string;
  clue: string;
  answer: string;
  direction: 'horizontal' | 'vertical';
  startRow: number;
  startCol: number;
  solved: boolean;
}

interface GameState {
  clues: CrosswordClue[];
  grid: string[][];
  selectedClue: number | null;
  solvedCount: number;
  gameStatus: 'playing' | 'won';
  timeElapsed: number;
  score: number;
  hintsUsed: number;
}

const clues: CrosswordClue[] = [
  {
    id: 1,
    number: '1H',
    clue: 'Lei fundamental de um país',
    answer: 'CONSTITUICAO',
    direction: 'horizontal',
    startRow: 0,
    startCol: 0,
    solved: false
  },
  {
    id: 2,
    number: '2H',
    clue: 'Órgão máximo do Poder Judiciário',
    answer: 'STF',
    direction: 'horizontal',
    startRow: 2,
    startCol: 0,
    solved: false
  },
  {
    id: 3,
    number: '3H',
    clue: 'Profissional que defende em juízo',
    answer: 'ADVOGADO',
    direction: 'horizontal',
    startRow: 4,
    startCol: 2,
    solved: false
  },
  {
    id: 4,
    number: '1V',
    clue: 'Decisão judicial final',
    answer: 'SENTENCA',
    direction: 'vertical',
    startRow: 0,
    startCol: 0,
    solved: false
  },
  {
    id: 5,
    number: '2V',
    clue: 'Conjunto de normas jurídicas',
    answer: 'DIREITO',
    direction: 'vertical',
    startRow: 0,
    startCol: 5,
    solved: false
  }
];

const GRID_SIZE = 10;

export default function PalavrasCruzadasPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    clues: clues.map(clue => ({ ...clue })),
    grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')),
    selectedClue: null,
    solvedCount: 0,
    gameStatus: 'playing',
    timeElapsed: 0,
    score: 0,
    hintsUsed: 0
  });
  const [inputValue, setInputValue] = useState('');

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
    // Check win condition
    if (gameState.solvedCount === gameState.clues.length && gameState.gameStatus === 'playing') {
      const finalScore = Math.max(500 - (gameState.hintsUsed * 50) - Math.floor(gameState.timeElapsed / 10), 50);
      setGameState(prev => ({
        ...prev,
        gameStatus: 'won',
        score: finalScore
      }));
    }
  }, [gameState.solvedCount]);

  const handleClueSelect = (clueId: number) => {
    setGameState(prev => ({ ...prev, selectedClue: clueId }));
    setInputValue('');
  };

  const handleAnswerSubmit = () => {
    if (gameState.selectedClue === null || !inputValue.trim()) return;

    const selectedClue = gameState.clues.find(c => c.id === gameState.selectedClue);
    if (!selectedClue) return;

    const normalizedInput = inputValue.toUpperCase().replace(/\s/g, '');
    const normalizedAnswer = selectedClue.answer.toUpperCase().replace(/\s/g, '');

    if (normalizedInput === normalizedAnswer) {
      // Correct answer
      const newGrid = [...gameState.grid];
      const letters = selectedClue.answer.toUpperCase().split('');
      
      letters.forEach((letter, index) => {
        if (selectedClue.direction === 'horizontal') {
          newGrid[selectedClue.startRow][selectedClue.startCol + index] = letter;
        } else {
          newGrid[selectedClue.startRow + index][selectedClue.startCol] = letter;
        }
      });

      setGameState(prev => ({
        ...prev,
        clues: prev.clues.map(clue => 
          clue.id === selectedClue.id ? { ...clue, solved: true } : clue
        ),
        grid: newGrid,
        solvedCount: prev.solvedCount + 1,
        selectedClue: null
      }));
      setInputValue('');
    }
  };

  const handleHint = () => {
    if (gameState.selectedClue === null) return;

    const selectedClue = gameState.clues.find(c => c.id === gameState.selectedClue);
    if (!selectedClue || selectedClue.solved) return;

    const firstLetter = selectedClue.answer.charAt(0);
    setInputValue(firstLetter);
    setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
  };

  const resetGame = () => {
    setGameState({
      clues: clues.map(clue => ({ ...clue, solved: false })),
      grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')),
      selectedClue: null,
      solvedCount: 0,
      gameStatus: 'playing',
      timeElapsed: 0,
      score: 0,
      hintsUsed: 0
    });
    setInputValue('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCluePosition = (row: number, col: number) => {
    return gameState.clues.some(clue => clue.startRow === row && clue.startCol === col);
  };

  const getClueNumber = (row: number, col: number) => {
    const clue = gameState.clues.find(clue => clue.startRow === row && clue.startCol === col);
    return clue ? clue.number : '';
  };

  const isPartOfWord = (row: number, col: number) => {
    return gameState.clues.some(clue => {
      if (clue.direction === 'horizontal') {
        return row === clue.startRow && col >= clue.startCol && col < clue.startCol + clue.answer.length;
      } else {
        return col === clue.startCol && row >= clue.startRow && row < clue.startRow + clue.answer.length;
      }
    });
  };

  const selectedClue = gameState.clues.find(c => c.id === gameState.selectedClue);

  if (gameState.gameStatus === 'won') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-xl inline-block mb-6">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Palavras Cruzadas Concluídas!</h1>
          
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{gameState.score}</div>
                  <div className="text-sm text-gray-600">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{formatTime(gameState.timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Tempo</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{gameState.hintsUsed}</div>
                  <div className="text-sm text-gray-600">Dicas Usadas</div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={resetGame}>
                  Jogar Novamente
                </Button>
                <Button variant="outline" onClick={() => router.push('/jogos')}>
                  Voltar aos Jogos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="p-3 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-xl">
            <Grid3X3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Palavras Cruzadas</h1>
            <p className="text-gray-600">Complete o cruzadinha jurídico!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formatTime(gameState.timeElapsed)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold">{gameState.score} pts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Grade</span>
                <Badge variant="secondary">
                  {gameState.solvedCount}/{gameState.clues.length} resolvidas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-1 max-w-lg mx-auto">
                {gameState.grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isWordCell = isPartOfWord(rowIndex, colIndex);
                    const isClueStart = isCluePosition(rowIndex, colIndex);
                    const clueNumber = getClueNumber(rowIndex, colIndex);
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          aspect-square border relative text-center flex items-center justify-center text-sm font-bold
                          ${
                            isWordCell
                              ? 'bg-white border-gray-400 cursor-pointer hover:bg-gray-50'
                              : 'bg-gray-800 border-gray-800'
                          }
                        `}
                      >
                        {isClueStart && (
                          <div className="absolute top-0 left-0 text-xs bg-blue-500 text-white px-1 rounded-br">
                            {clueNumber}
                          </div>
                        )}
                        {isWordCell && cell && (
                          <span className="text-gray-900">{cell}</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clues and Input */}
        <div className="space-y-6">
          {/* Input Section */}
          {selectedClue && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedClue.number} - {selectedClue.direction === 'horizontal' ? 'Horizontal' : 'Vertical'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{selectedClue.clue}</p>
                <div className="space-y-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite sua resposta..."
                    maxLength={selectedClue.answer.length}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleAnswerSubmit} className="flex-1">
                      Confirmar
                    </Button>
                    <Button variant="outline" onClick={handleHint}>
                      <Lightbulb className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedClue.answer.length} letras
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clues List */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gameState.clues.map((clue) => (
                  <div
                    key={clue.id}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-colors
                      ${
                        clue.solved
                          ? 'bg-green-50 border border-green-200'
                          : gameState.selectedClue === clue.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }
                    `}
                    onClick={() => !clue.solved && handleClueSelect(clue.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {clue.number}
                        </Badge>
                        {clue.solved && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <span className="text-xs text-gray-500">
                        {clue.answer.length} letras
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{clue.clue}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}