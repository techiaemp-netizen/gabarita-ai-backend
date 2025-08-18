'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { RankingEntry } from '@/types';
import { Trophy, Medal, Award, Crown, Star, TrendingUp } from 'lucide-react';

export default function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      const response = await apiService.getRanking();
      if (response.success && response.data) {
        setRanking(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-gray-300" />;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
      default:
        return 'bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado para ver o ranking.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ranking Geral</h1>
          <p className="text-gray-600">Veja como você se compara com outros estudantes</p>
        </div>

        {/* User Position */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sua Posição</h2>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">?</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">Nível {user.level} • {user.xp.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{user.accuracy}%</div>
              <div className="text-sm text-gray-600">Precisão</div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Top 3</h2>
          <div className="flex justify-center items-end space-x-4">
            {ranking.slice(0, 3).map((entry, index) => {
              const positions = [1, 0, 2]; // 2nd, 1st, 3rd
              const actualIndex = positions[index];
              const actualEntry = ranking[actualIndex];
              const heights = ['h-24', 'h-32', 'h-20'];
              
              return (
                <div key={actualEntry.userId} className="text-center">
                  <div className={`${getRankColor(actualEntry.position)} ${heights[index]} w-20 rounded-t-lg flex flex-col justify-end p-2 mb-2`}>
                    <div className="text-white font-bold text-lg">{actualEntry.position}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-lg">
                    <div className="mb-2">{getRankIcon(actualEntry.position)}</div>
                    <h3 className="font-medium text-sm text-gray-900 truncate">{actualEntry.userName}</h3>
                    <p className="text-xs text-gray-600">Nível {actualEntry.level}</p>
                    <p className="text-xs font-medium text-blue-600">{actualEntry.accuracy}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Ranking */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Ranking Completo</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {ranking.map((entry) => (
              <div 
                key={entry.userId} 
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  entry.userId === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      entry.position <= 3 ? getRankColor(entry.position) : 'bg-gray-100'
                    }`}>
                      {entry.position <= 3 ? (
                        <span className="text-white font-bold">{entry.position}</span>
                      ) : (
                        <span className="text-gray-600 font-bold">{entry.position}</span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {entry.userName}
                        {entry.userId === user.id && (
                          <span className="ml-2 text-sm text-blue-600 font-medium">(Você)</span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Nível {entry.level}</span>
                        <span>{entry.xp.toLocaleString()} XP</span>
                        <span>{entry.questionsAnswered} questões</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{entry.accuracy}%</div>
                    <div className="text-sm text-gray-600">Precisão</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Média Geral</h3>
            <p className="text-2xl font-bold text-green-600">
              {Math.round(ranking.reduce((acc, entry) => acc + entry.accuracy, 0) / ranking.length)}%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Melhor Precisão</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {Math.max(...ranking.map(entry => entry.accuracy))}%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Total de Estudantes</h3>
            <p className="text-2xl font-bold text-purple-600">{ranking.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

