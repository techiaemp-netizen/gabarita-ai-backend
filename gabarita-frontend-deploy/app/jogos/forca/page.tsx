'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowLeft, Trophy, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameState {
  word: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  score: number;
}

const words = [
  'CONSTITUICAO',
  'DIREITO',
  'JUSTICA',
  'TRIBUNAL',
  'ADVOGADO',
  'PROCESSO',
  'SENTENCA',
  'RECURSO'
];

export default function ForcaPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    word: '',
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: 6,
    gameStatus: 'playing',
    score: 0
  });
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Inicializar jogo
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setGameState(prev => ({ ...prev, word: randomWord }));
  }, []);

  useEffect(() => {
    // Timer
    if (gameState.gameStatus === 'playing') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.gameStatus]);

  const handleLetterGuess = (letter: string) => {
    if (gameState.guessedLetters.includes(letter) || gameState.gameStatus !== 'playing') {
      return;
    }

    const newGuessedLetters = [...gameState.guessedLetters, letter];
    const isCorrect = gameState.word.includes(letter);
    const newWrongGuesses = isCorrect ? gameState.wrongGuesses : gameState.wrongGuesses + 1;
    
    // Verificar se ganhou
    const wordLetters = gameState.word.split('');
    const hasWon = wordLetters.every(l => newGuessedLetters.includes(l));
    
    // Verificar se perdeu
    const hasLost = newWrongGuesses >= gameState.maxWrongGuesses;
    
    let newStatus: 'playing' | 'won' | 'lost' = 'playing';
    let newScore = gameState.score;
    
    if (hasWon) {
      newStatus = 'won';
      newScore = Math.max(100 - (newWrongGuesses * 10) - Math.floor(timeElapsed / 10), 10);
    } else if (hasLost) {
      newStatus = 'lost';
    }

    setGameState({
      ...gameState,
      guessedLetters: newGuessedLetters,
      wrongGuesses: newWrongGuesses,
      gameStatus: newStatus,
      score: newScore
    });
  };

  const resetGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setGameState({
      word: randomWord,
      guessedLetters: [],
      wrongGuesses: 0,
      maxWrongGuesses: 6,
      gameStatus: 'playing',
      score: 0
    });
    setTimeElapsed(0);
  };

  const renderWord = () => {
    return gameState.word.split('').map((letter, index) => (
      <span key={index} className="mx-1 text-2xl font-bold">
        {gameState.guessedLetters.includes(letter) ? letter : '_'}
      </span>
    ));
  };

  const renderAlphabet = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return alphabet.map(letter => (
      <Button
        key={letter}
        variant={gameState.guessedLetters.includes(letter) ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => handleLetterGuess(letter)}
        disabled={gameState.guessedLetters.includes(letter) || gameState.gameStatus !== 'playing'}
        className="m-1"
      >
        {letter}
      </Button>
    ));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="p-3 bg-gradient-to-r from-green-400 to-green-600 rounded-xl">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jogo da Forca</h1>
            <p className="text-gray-600">Descubra a palavra jurídica!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formatTime(timeElapsed)}</span>
          </div>
          {gameState.score > 0 && (
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold">{gameState.score} pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Word Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Palavra</span>
              <Badge variant={gameState.gameStatus === 'won' ? 'default' : gameState.gameStatus === 'lost' ? 'destructive' : 'secondary'}>
                {gameState.gameStatus === 'playing' ? 'Jogando' : gameState.gameStatus === 'won' ? 'Ganhou!' : 'Perdeu!'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mb-6">
                {renderWord()}
              </div>
              <div className="text-sm text-gray-600">
                Erros: {gameState.wrongGuesses}/{gameState.maxWrongGuesses}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hangman Drawing */}
        <Card>
          <CardHeader>
            <CardTitle>Forca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-6xl font-mono">
                {gameState.wrongGuesses >= 1 && '😵'}
                {gameState.wrongGuesses >= 2 && '|'}
                {gameState.wrongGuesses >= 3 && '/'}
                {gameState.wrongGuesses >= 4 && '\\'}
                {gameState.wrongGuesses >= 5 && '/'}
                {gameState.wrongGuesses >= 6 && '\\'}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {gameState.maxWrongGuesses - gameState.wrongGuesses} tentativas restantes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alphabet */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Escolha uma letra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center">
            {renderAlphabet()}
          </div>
        </CardContent>
      </Card>

      {/* Game Over Actions */}
      {gameState.gameStatus !== 'playing' && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                {gameState.gameStatus === 'won' ? 'Parabéns! Você ganhou!' : 'Que pena! Você perdeu!'}
              </h3>
              <p className="text-gray-600 mb-4">
                A palavra era: <strong>{gameState.word}</strong>
              </p>
              {gameState.gameStatus === 'won' && (
                <p className="text-green-600 mb-4">
                  Você ganhou {gameState.score} pontos!
                </p>
              )}
              <div className="flex justify-center space-x-4">
                <Button onClick={resetGame}>
                  Jogar Novamente
                </Button>
                <Button variant="outline" onClick={() => router.push('/jogos')}>
                  Voltar aos Jogos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}