import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Question, 
  SimulationResult, 
  Performance, 
  Plan, 
  RankingEntry, 
  News, 
  ApiResponse 
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://j6h5i7c0x703.manus.space',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Erro ao verificar status da API' };
    }
  }

  // Autenticação
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/api/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('authToken', token);
      return { success: true, data: { user, token } };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  }

  async signup(userData: Partial<User> & { password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/api/auth/signup', userData);
      const { user, token } = response.data;
      localStorage.setItem('authToken', token);
      return { success: true, data: { user, token } };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao criar conta' 
      };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
  }

  // Usuário
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/api/user/profile');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao buscar perfil' 
      };
    }
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put('/api/user/profile', userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao atualizar perfil' 
      };
    }
  }

  // Questões e Simulados
  async generateQuestions(params: {
    subject?: string;
    difficulty?: string;
    count?: number;
  }): Promise<ApiResponse<Question[]>> {
    try {
      const response = await this.api.post('/api/questoes/gerar', params);
      return { success: true, data: response.data };
    } catch (error: any) {
      // Mock para desenvolvimento
      const mockQuestions: Question[] = Array.from({ length: params.count || 10 }, (_, i) => ({
        id: `q${i + 1}`,
        subject: params.subject || 'Português',
        topic: 'Interpretação de Texto',
        difficulty: (params.difficulty as any) || 'medium',
        question: `Questão ${i + 1}: Qual é a interpretação correta do texto apresentado?`,
        options: [
          'Opção A - Primeira alternativa',
          'Opção B - Segunda alternativa',
          'Opção C - Terceira alternativa',
          'Opção D - Quarta alternativa',
          'Opção E - Quinta alternativa'
        ],
        correctAnswer: Math.floor(Math.random() * 5),
        explanation: `Explicação da questão ${i + 1}`,
        source: 'CNU 2025'
      }));
      
      return { success: true, data: mockQuestions };
    }
  }

  async submitSimulation(answers: number[], questionIds: string[]): Promise<ApiResponse<SimulationResult>> {
    try {
      const response = await this.api.post('/api/simulados/submit', { answers, questionIds });
      return { success: true, data: response.data };
    } catch (error: any) {
      // Mock para desenvolvimento
      const mockResult: SimulationResult = {
        id: 'sim_' + Date.now(),
        userId: 'user_1',
        questions: [],
        answers,
        score: Math.floor(Math.random() * 100),
        accuracy: Math.floor(Math.random() * 100),
        timeSpent: Math.floor(Math.random() * 3600),
        completedAt: new Date().toISOString()
      };
      
      return { success: true, data: mockResult };
    }
  }

  // Performance
  async getPerformance(): Promise<ApiResponse<Performance>> {
    try {
      const response = await this.api.get('/api/performance');
      return { success: true, data: response.data };
    } catch (error: any) {
      // Mock para desenvolvimento
      const mockPerformance: Performance = {
        userId: 'user_1',
        totalQuestions: 450,
        correctAnswers: 328,
        accuracy: 73,
        averageTime: 120,
        subjectPerformance: {
          'Português': { total: 150, correct: 110, accuracy: 73 },
          'Matemática': { total: 100, correct: 75, accuracy: 75 },
          'Direito': { total: 200, correct: 143, accuracy: 72 }
        },
        weeklyProgress: [
          { week: '2025-W01', questionsAnswered: 50, accuracy: 70 },
          { week: '2025-W02', questionsAnswered: 75, accuracy: 73 },
          { week: '2025-W03', questionsAnswered: 60, accuracy: 75 }
        ],
        monthlyProgress: [
          { month: '2025-01', questionsAnswered: 200, accuracy: 72 },
          { month: '2025-02', questionsAnswered: 250, accuracy: 74 }
        ]
      };
      
      return { success: true, data: mockPerformance };
    }
  }

  // Planos
  async getPlans(): Promise<ApiResponse<Plan[]>> {
    try {
      const response = await this.api.get('/api/plans');
      return { success: true, data: response.data };
    } catch (error: any) {
      // Mock para desenvolvimento
      const mockPlans: Plan[] = [
        {
          id: 'free',
          name: 'Gratuito',
          price: 0,
          features: ['10 questões por dia', 'Simulados básicos', 'Estatísticas simples'],
          maxSimulations: 1,
          maxQuestions: 10,
          hasAI: false,
          hasRanking: false,
          hasDetailedAnalysis: false
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 29.90,
          features: ['Questões ilimitadas', 'Simulados completos', 'IA personalizada', 'Ranking'],
          maxSimulations: -1,
          maxQuestions: -1,
          hasAI: true,
          hasRanking: true,
          hasDetailedAnalysis: true
        }
      ];
      
      return { success: true, data: mockPlans };
    }
  }

  // Ranking
  async getRanking(): Promise<ApiResponse<RankingEntry[]>> {
    try {
      const response = await this.api.get('/api/ranking');
      return { success: true, data: response.data };
    } catch (error: any) {
      // Mock para desenvolvimento
      const mockRanking: RankingEntry[] = Array.from({ length: 10 }, (_, i) => ({
        position: i + 1,
        userId: `user_${i + 1}`,
        userName: `Usuário ${i + 1}`,
        level: Math.floor(Math.random() * 20) + 1,
        xp: Math.floor(Math.random() * 10000),
        accuracy: Math.floor(Math.random() * 30) + 70,
        questionsAnswered: Math.floor(Math.random() * 1000) + 100
      }));
      
      return { success: true, data: mockRanking };
    }
  }

  // Notícias
  async getNews(): Promise<ApiResponse<News[]>> {
    try {
      const response = await this.api.get('/api/news');
      return { success: true, data: response.data };
    } catch (error: any) {
      // Mock para desenvolvimento
      const mockNews: News[] = [
        {
          id: 'news_1',
          title: 'CNU 2025: Novas datas divulgadas',
          summary: 'Confira as novas datas do Concurso Nacional Unificado',
          content: 'O CNU 2025 teve suas datas atualizadas...',
          source: 'Portal do Governo',
          publishedAt: new Date().toISOString(),
          category: 'Concursos'
        }
      ];
      
      return { success: true, data: mockNews };
    }
  }

  // Pagamentos
  async createPayment(planId: string): Promise<ApiResponse<{ paymentUrl: string }>> {
    try {
      const response = await this.api.post('/api/payments/create', { planId });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao criar pagamento' 
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;

