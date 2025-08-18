'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { News } from '@/types';
import { Newspaper, Calendar, ExternalLink, Clock } from 'lucide-react';

export default function NoticiasPage() {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await apiService.getNews();
      if (response.success && response.data) {
        setNews(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado para ver as notícias.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notícias do CNU 2025</h1>
          <p className="text-gray-600">Fique por dentro das últimas novidades sobre o concurso</p>
        </div>

        {/* News List */}
        <div className="space-y-6">
          {news.length > 0 ? (
            news.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{article.category}</span>
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span>{article.source}</span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                      <span>Ler mais</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>2 min de leitura</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-12">
              <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notícia disponível</h3>
              <p className="text-gray-600">As últimas notícias sobre o CNU 2025 aparecerão aqui.</p>
            </div>
          )}
        </div>

        {/* Mock News for Demo */}
        {news.length === 0 && (
          <div className="space-y-6">
            {[
              {
                id: '1',
                title: 'CNU 2025: Cronograma atualizado com novas datas',
                summary: 'O Ministério da Gestão divulgou o cronograma atualizado do Concurso Nacional Unificado 2025, com ajustes nas datas de inscrição e aplicação das provas.',
                category: 'Cronograma',
                source: 'Portal do Governo',
                publishedAt: new Date().toISOString()
              },
              {
                id: '2',
                title: 'Edital do CNU 2025 prevê mais de 6 mil vagas',
                summary: 'O novo edital do Concurso Nacional Unificado oferecerá mais de 6 mil vagas para diversos órgãos federais, representando um aumento de 20% em relação ao ano anterior.',
                category: 'Edital',
                source: 'Folha de S.Paulo',
                publishedAt: new Date(Date.now() - 86400000).toISOString()
              },
              {
                id: '3',
                title: 'Dicas de estudo para o CNU 2025',
                summary: 'Especialistas em concursos públicos compartilham estratégias eficazes para se preparar para o Concurso Nacional Unificado 2025.',
                category: 'Dicas',
                source: 'Gabarita.AI',
                publishedAt: new Date(Date.now() - 172800000).toISOString()
              }
            ].map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{article.category}</span>
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                    <span>•</span>
                    <span>{article.source}</span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                      <span>Ler mais</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>3 min de leitura</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

