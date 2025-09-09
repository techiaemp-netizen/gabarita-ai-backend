'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Heart, 
  Share2, 
  BookOpen, 
  TrendingUp, 
  Filter,
  Search,
  Tag,
  ExternalLink,
  ChevronRight,
  Star
} from 'lucide-react';
import { News } from '@/types';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl: string;
  views: number;
  likes: number;
  featured: boolean;
  readTime: number;
}

const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'ENEM 2024: Principais Mudanças e Como se Preparar',
    summary: 'Confira as principais alterações no ENEM 2024 e dicas essenciais para uma preparação eficiente.',
    content: 'O ENEM 2024 traz algumas mudanças importantes que todos os candidatos devem conhecer...',
    author: 'Prof. Maria Silva',
    publishedAt: '2024-01-15T10:00:00Z',
    category: 'ENEM',
    tags: ['ENEM', 'Preparação', 'Dicas'],
    imageUrl: '/api/placeholder/400/250',
    views: 1247,
    likes: 89,
    featured: true,
    readTime: 5
  },
  {
    id: '2',
    title: 'Técnicas de Memorização para Estudos',
    summary: 'Aprenda métodos científicos comprovados para melhorar sua capacidade de memorização.',
    content: 'A memorização é uma habilidade fundamental para o sucesso nos estudos...',
    author: 'Dr. João Santos',
    publishedAt: '2024-01-14T15:30:00Z',
    category: 'Métodos de Estudo',
    tags: ['Memorização', 'Técnicas', 'Neurociência'],
    imageUrl: '/api/placeholder/400/250',
    views: 892,
    likes: 67,
    featured: false,
    readTime: 7
  },
  {
    id: '3',
    title: 'Matemática no ENEM: Tópicos Mais Cobrados',
    summary: 'Análise estatística dos temas de matemática mais frequentes nas últimas edições do ENEM.',
    content: 'Com base na análise das últimas 10 edições do ENEM, identificamos os tópicos...',
    author: 'Prof. Carlos Oliveira',
    publishedAt: '2024-01-13T09:15:00Z',
    category: 'Matemática',
    tags: ['Matemática', 'ENEM', 'Estatísticas'],
    imageUrl: '/api/placeholder/400/250',
    views: 1456,
    likes: 123,
    featured: true,
    readTime: 8
  },
  {
    id: '4',
    title: 'Como Gerenciar a Ansiedade nos Estudos',
    summary: 'Estratégias psicológicas para controlar a ansiedade e manter o foco durante a preparação.',
    content: 'A ansiedade é um dos maiores obstáculos para um estudo eficiente...',
    author: 'Dra. Ana Costa',
    publishedAt: '2024-01-12T14:20:00Z',
    category: 'Bem-estar',
    tags: ['Ansiedade', 'Psicologia', 'Bem-estar'],
    imageUrl: '/api/placeholder/400/250',
    views: 734,
    likes: 56,
    featured: false,
    readTime: 6
  },
  {
    id: '5',
    title: 'Redação ENEM: Estrutura e Dicas Práticas',
    summary: 'Guia completo para escrever uma redação nota 1000 no ENEM com exemplos práticos.',
    content: 'A redação do ENEM é uma das partes mais importantes da prova...',
    author: 'Prof. Lucia Ferreira',
    publishedAt: '2024-01-11T11:45:00Z',
    category: 'Redação',
    tags: ['Redação', 'ENEM', 'Escrita'],
    imageUrl: '/api/placeholder/400/250',
    views: 2103,
    likes: 187,
    featured: true,
    readTime: 10
  },
  {
    id: '6',
    title: 'Cronograma de Estudos: Como Organizar seu Tempo',
    summary: 'Aprenda a criar um cronograma de estudos eficiente e realista para sua rotina.',
    content: 'Um bom cronograma de estudos é fundamental para o sucesso...',
    author: 'Prof. Roberto Lima',
    publishedAt: '2024-01-10T16:00:00Z',
    category: 'Organização',
    tags: ['Cronograma', 'Organização', 'Produtividade'],
    imageUrl: '/api/placeholder/400/250',
    views: 945,
    likes: 78,
    featured: false,
    readTime: 4
  }
];

const CATEGORIES = [
  'Todas',
  'ENEM',
  'Métodos de Estudo',
  'Matemática',
  'Português',
  'Redação',
  'Bem-estar',
  'Organização'
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais Recentes' },
  { value: 'popular', label: 'Mais Populares' },
  { value: 'liked', label: 'Mais Curtidas' },
  { value: 'views', label: 'Mais Visualizadas' }
];

export default function NoticiasPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>(MOCK_NEWS);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>(MOCK_NEWS);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    filterAndSortArticles();
  }, [selectedCategory, sortBy, searchTerm, articles]);

  const filterAndSortArticles = () => {
    let filtered = [...articles];

    // Filtrar por categoria
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.views + b.likes) - (a.views + a.likes));
        break;
      case 'liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    setFilteredArticles(filtered);
  };

  const handleLike = async (articleId: string) => {
    try {
      // Simular API call
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, likes: article.likes + 1 }
          : article
      ));
    } catch (error) {
      console.error('Erro ao curtir artigo:', error);
    }
  };

  const handleShare = async (article: NewsArticle) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href + '/' + article.id
        });
      } else {
        // Fallback para copiar link
        await navigator.clipboard.writeText(window.location.href + '/' + article.id);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'ENEM': 'bg-blue-100 text-blue-800',
      'Métodos de Estudo': 'bg-green-100 text-green-800',
      'Matemática': 'bg-purple-100 text-purple-800',
      'Português': 'bg-yellow-100 text-yellow-800',
      'Redação': 'bg-red-100 text-red-800',
      'Bem-estar': 'bg-pink-100 text-pink-800',
      'Organização': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const featuredArticles = filteredArticles.filter(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

  return (
    <ProtectedRoute feature="noticias">
      <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">📰 Notícias e Artigos</h1>
            <p className="text-xl opacity-90">
              Fique por dentro das últimas novidades e dicas para seus estudos
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filtros:</span>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artigos, tags ou palavras-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Artigos em Destaque */}
          {featuredArticles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                Em Destaque
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.slice(0, 3).map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {article.readTime} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {article.author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(article.publishedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {formatViews(article.views)}
                          </div>
                          <button 
                            onClick={() => handleLike(article.id)}
                            className="flex items-center hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            {article.likes}
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleShare(article)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setSelectedArticle(article)}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Ler mais
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todos os Artigos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Todos os Artigos
              <span className="ml-2 text-sm font-normal text-gray-500">({filteredArticles.length} artigos)</span>
            </h2>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum artigo encontrado</h3>
                <p className="text-gray-600">Tente ajustar os filtros ou termo de busca.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="relative">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-48 md:h-32 object-cover rounded-lg"
                          />
                          {article.featured && (
                            <div className="absolute top-2 left-2">
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="md:w-2/3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                              {article.category}
                            </span>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {article.readTime} min de leitura
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                            onClick={() => setSelectedArticle(article)}>
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {article.summary}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {article.author}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(article.publishedAt)}
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {formatViews(article.views)}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => handleLike(article.id)}
                              className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              {article.likes}
                            </button>
                            <button 
                              onClick={() => handleShare(article)}
                              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setSelectedArticle(article)}
                              className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                              Ler artigo
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                        </div>
                        
                        {article.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-wrap gap-2">
                              {article.tags.map((tag, index) => (
                                <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mt-12 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">📧 Receba as Últimas Notícias</h3>
            <p className="text-lg opacity-90 mb-6">
              Inscreva-se em nossa newsletter e receba artigos exclusivos e dicas de estudo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Artigo (simplificado) */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">{selectedArticle.summary}</p>
                <p className="text-gray-800">{selectedArticle.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}