import axios from 'axios';
import { User, Question, Plan, Game, UserStats, RankingUser, News, ApiResponse, LoginCredentials, RegisterData, QuestionResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  },

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar conta');
    }
  },

  async signup(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/api/signup', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar conta');
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuário');
    }
  },
};

// Questions Services
export const questionsService = {
  async generateQuestions(params: {
    materia?: string;
    dificuldade?: string;
    quantidade?: number;
  }): Promise<ApiResponse<Question[]>> {
    try {
      const response = await api.post('/api/questoes/gerar', params);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao gerar questões');
    }
  },

  async answerQuestion(data: {
    questionId: string;
    selectedAnswer: number;
    userId: string;
  }): Promise<ApiResponse<QuestionResponse>> {
    try {
      const response = await api.post('/api/questoes/responder', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao responder questão');
    }
  },

  async getStatistics(userId: string): Promise<ApiResponse<UserStats>> {
    try {
      const response = await api.get(`/api/questoes/estatisticas/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar estatísticas');
    }
  },

  async getExplanation(questionId: string): Promise<ApiResponse<{ explanation: string }>> {
    try {
      const response = await api.post('/api/perplexity/explicacao', { questionId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar explicação');
    }
  },
};

// Plans Services
export const plansService = {
  async getPlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await api.get('/api/planos');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar planos');
    }
  },

  async subscribeToPlan(planId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/payments/subscribe', { planId, userId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao assinar plano');
    }
  },

  async createPayment(data: {
    plano_id: string;
    user_id: string;
  }): Promise<ApiResponse<{ init_point: string; payment_id: string }>> {
    try {
      const response = await api.post('/api/payments/create', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar pagamento');
    }
  },

  async checkPaymentStatus(paymentId: string): Promise<ApiResponse<{
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    status_detail: string;
    transaction_amount: number;
    date_created: string;
    date_approved?: string;
    payment_method_id: string;
    payment_type_id: string;
  }>> {
    try {
      const response = await api.get(`/api/payments/status/${paymentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao verificar status do pagamento');
    }
  },

  async checkUserPaymentStatus(userId: string): Promise<ApiResponse<{
    hasPendingPayment: boolean;
    paymentStatus?: string;
    planId?: string;
  }>> {
    try {
      const response = await api.get(`/api/payments/user/${userId}/status`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao verificar status de pagamento do usuário');
    }
  },
};

// Games Services
export const gamesService = {
  async getAvailableGames(userId: string): Promise<ApiResponse<Game[]>> {
    try {
      const response = await api.get(`/api/jogos`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar jogos');
    }
  },

  async getGamesByUser(userId: string): Promise<ApiResponse<Game[]>> {
    try {
      const response = await api.get(`/api/jogos/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar jogos do usuário');
    }
  },

  async playGame(gameId: string, userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/games/play', { gameId, userId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao iniciar jogo');
    }
  },
};

// Ranking Services
export const rankingService = {
  async getGlobalRanking(limit: number = 100): Promise<ApiResponse<RankingUser[]>> {
    try {
      const response = await api.get(`/api/ranking/global?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar ranking');
    }
  },

  async getUserRanking(userId: string): Promise<ApiResponse<{ position: number; user: RankingUser }>> {
    try {
      const response = await api.get(`/api/ranking/user/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar posição no ranking');
    }
  },
};

// News Services
export const newsService = {
  async getNews(page: number = 1, limit: number = 10): Promise<ApiResponse<{ news: News[]; total: number }>> {
    try {
      const response = await api.get(`/api/news?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar notícias');
    }
  },

  async getNewsById(id: string): Promise<ApiResponse<News>> {
    try {
      const response = await api.get(`/api/news/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar notícia');
    }
  },
};

// Options Services
export const optionsService = {
  async getOptions(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/api/opcoes');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar opções');
    }
  },

  async getCargos(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get('/api/opcoes/cargos');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar cargos');
    }
  },

  async getBlocos(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get('/api/opcoes/blocos');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar blocos');
    }
  },
};

// Health Check
export const healthService = {
  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error: any) {
      throw new Error('Erro ao verificar status da API');
    }
  },
};

export default api;