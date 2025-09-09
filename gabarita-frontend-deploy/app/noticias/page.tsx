'use client';

import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Heart, 
  Share2, 
  Bookmark, 
  Search, 
  Filter, 
  TrendingUp, 
  MessageCircle, 
  Tag,
  ChevronRight,
  Bell,
  Star,
  BookOpen,
  Award,
  Zap
} from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  category: string;
  tags: string[];
  featured: boolean;
  imageUrl?: string;
}

interface NewsCategory {
  id: string;
  name: string;
  count: number;
  color: string;
}

const mockCategories: NewsCategory[] = [
  { id: 'all', name: 'Todas', count: 45, color: 'bg-gray-100 text-gray-700' },
  { id: 'updates', name: 'Atualizações', count: 12, color: 'bg-blue-100 text-blue-700' },
  { id: 'tips', name: 'Dicas de Estudo', count: 18, color: 'bg-green-100 text-green-700' },
  { id: 'enem', name: 'ENEM', count: 8, color: 'bg-purple-100 text-purple-700' },
  { id: 'vestibular', name: 'Vestibular', count: 7, color: 'bg-orange-100 text-orange-700' }
];

const mockArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Nova Funcionalidade: Simulados Adaptativos com IA',
    excerpt: 'Agora você pode fazer simulados que se adaptam ao seu nível de conhecimento em tempo real, oferecendo uma experiência personalizada de estudo.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author: 'Equipe Gabarita.AI',
    publishDate: '2024-01-15',
    readTime: 5,
    views: 1250,
    likes: 89,
    comments: 23,
    category: 'updates',
    tags: ['IA', 'Simulados', 'Novidades'],
    featured: true,
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20AI%20technology%20interface%20with%20adaptive%20learning%20dashboard%20blue%20purple%20gradient&image_size=landscape_16_9'
  },
  {
    id: '2',
    title: '10 Técnicas Comprovadas para Melhorar sua Concentração nos Estudos',
    excerpt: 'Descubra métodos científicos que podem aumentar sua produtividade e foco durante as sessões de estudo.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author: 'Dr. Ana Silva',
    publishDate: '2024-01-12',
    readTime: 8,
    views: 2340,
    likes: 156,
    comments: 45,
    category: 'tips',
    tags: ['Concentração', 'Produtividade', 'Técnicas'],
    featured: true,
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20studying%20with%20focus%20concentration%20books%20laptop%20clean%20workspace%20natural%20light&image_size=landscape_16_9'
  },
  {
    id: '3',
    title: 'ENEM 2024: Principais Mudanças e Como se Preparar',
    excerpt: 'Confira as alterações no formato da prova e estratégias atualizadas para garantir uma boa pontuação.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author: 'Prof. Carlos Santos',
    publishDate: '2024-01-10',
    readTime: 12,
    views: 3450,
    likes: 234,
    comments: 67,
    category: 'enem',
    tags: ['ENEM', 'Preparação', '2024'],
    featured: false
  },
  {
    id: '4',
    title: 'Matemática no Vestibular: Tópicos Mais Cobrados',
    excerpt: 'Análise estatística dos últimos 5 anos mostra quais assuntos de matemática aparecem com mais frequência.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author: 'Prof. Maria Oliveira',
    publishDate: '2024-01-08',
    readTime: 6,
    views: 1890,
    likes: 98,
    comments: 34,
    category: 'vestibular',
    tags: ['Matemática', 'Estatística', 'Vestibular'],
    featured: false
  },
  {
    id: '5',
    title: 'Atualização v2.1: Melhorias na Interface e Novos Recursos',
    excerpt: 'Confira todas as melhorias implementadas na nova versão da plataforma, incluindo modo escuro e relatórios avançados.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    author: 'Equipe Gabarita.AI',
    publishDate: '2024-01-05',
    readTime: 4,
    views: 980,
    likes: 67,
    comments: 12,
    category: 'updates',
    tags: ['Atualização', 'Interface', 'Recursos'],
    featured: false
  }
];

export default function NoticiasPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const [likedArticles, setLikedArticles] = useState<string[]>([]);

  const filteredArticles = mockArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const toggleLike = (articleId: string) => {
    setLikedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return mockCategories.find(cat => cat.id === categoryId) || mockCategories[0];
  };

  if (selectedArticle) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="outline" 
              onClick={() => setSelectedArticle(null)}
              className="mb-6"
            >
              ← Voltar para Notícias
            </Button>

            {/* Article Header */}
            <Card className="p-8 mb-6">
              {selectedArticle.imageUrl && (
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  getCategoryInfo(selectedArticle.category).color
                }`}>
                  {getCategoryInfo(selectedArticle.category).name}
                </span>
                {selectedArticle.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {selectedArticle.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedArticle.publishDate)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {selectedArticle.readTime} min de leitura
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {selectedArticle.views.toLocaleString()} visualizações
                </div>
              </div>
              
              {/* Article Actions */}
              <div className="flex items-center gap-4 pb-6 border-b">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleLike(selectedArticle.id)}
                  className={likedArticles.includes(selectedArticle.id) ? 'text-red-600 border-red-200' : ''}
                >
                  <Heart className={`w-4 h-4 mr-2 ${likedArticles.includes(selectedArticle.id) ? 'fill-current' : ''}`} />
                  {selectedArticle.likes + (likedArticles.includes(selectedArticle.id) ? 1 : 0)}
                </Button>
                
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {selectedArticle.comments}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleBookmark(selectedArticle.id)}
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${bookmarkedArticles.includes(selectedArticle.id) ? 'fill-current' : ''}`} />
                  Salvar
                </Button>
                
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </Card>

            {/* Article Content */}
            <Card className="p-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {selectedArticle.excerpt}
                </p>
                
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Principais Benefícios</h3>
                  
                  <ul className="list-disc list-inside space-y-2">
                    <li>Melhoria significativa na retenção de informações</li>
                    <li>Aumento da motivação e engajamento</li>
                    <li>Personalização completa da experiência de aprendizado</li>
                    <li>Feedback em tempo real sobre o progresso</li>
                  </ul>
                  
                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notícias e Atualizações</h1>
            <p className="text-gray-600">Fique por dentro das novidades e dicas de estudo</p>
          </div>

          {/* Newsletter Subscription */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">📧 Newsletter Gabarita.AI</h3>
                <p className="text-blue-100">Receba as melhores dicas de estudo e novidades direto no seu email</p>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Seu email" 
                  className="bg-white text-gray-900 border-0"
                />
                <Button variant="secondary">
                  <Bell className="w-4 h-4 mr-2" />
                  Inscrever
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Search */}
              <Card className="p-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar artigos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </Card>

              {/* Categories */}
              <Card className="p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categorias</h3>
                <div className="space-y-2">
                  {mockCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${category.color}`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Popular Tags */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Tags Populares</h3>
                <div className="flex flex-wrap gap-2">
                  {['ENEM', 'Dicas', 'Matemática', 'Português', 'IA', 'Simulados', 'Vestibular'].map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Articles */}
              {featuredArticles.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">✨ Artigos em Destaque</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredArticles.map(article => (
                      <Card key={article.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                        {article.imageUrl && (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getCategoryInfo(article.category).color
                            }`}>
                              {getCategoryInfo(article.category).name}
                            </span>
                            <Star className="w-4 h-4 text-yellow-500" />
                          </div>
                          
                          <h3 
                            className="font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors"
                            onClick={() => setSelectedArticle(article)}
                          >
                            {article.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>{formatDate(article.publishDate)}</span>
                              <span>{article.readTime} min</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {article.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Articles */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">📰 Todas as Notícias</h2>
                <div className="space-y-6">
                  {regularArticles.map(article => (
                    <Card key={article.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="flex gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getCategoryInfo(article.category).color
                            }`}>
                              {getCategoryInfo(article.category).name}
                            </span>
                            
                            <div className="flex gap-1">
                              {article.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <h3 
                            className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors"
                            onClick={() => setSelectedArticle(article)}
                          >
                            {article.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {article.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(article.publishDate)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {article.readTime} min
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {article.views.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  {article.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {article.comments}
                                </span>
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleBookmark(article.id)}
                              >
                                <Bookmark className={`w-4 h-4 ${bookmarkedArticles.includes(article.id) ? 'fill-current' : ''}`} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {article.imageUrl && (
                          <div className="w-32 h-24 flex-shrink-0">
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}