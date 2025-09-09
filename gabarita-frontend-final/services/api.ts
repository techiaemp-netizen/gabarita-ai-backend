import axios from 'axios';
import { User, ApiResponse } from '@/types';

class ApiService {
  private api: any;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config: any) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;
        
        // Se for erro 401 e não for uma tentativa de refresh
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
          originalRequest._retry = true;
          
          try {
            // Tentar refresh do token
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const refreshResponse = await this.api.post('/api/auth/refresh-token', {
                refreshToken
              });
              
              if (refreshResponse.data.success && refreshResponse.data.data) {
                const { token } = refreshResponse.data.data;
                localStorage.setItem('authToken', token);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError);
          }
          
          // Se chegou aqui, o refresh falhou - fazer logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirecionar para login apenas se não estiver já na página de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Autenticação
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/api/auth/login', { email, password });
      
      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          localStorage.setItem('user', JSON.stringify(user));
        }
        return { success: true, data: { user, token } };
      } else {
        return {
          success: false,
          error: response.data.error || 'Erro ao fazer login'
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  }

  async signup(userData: Partial<User> & { password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/api/auth/signup', userData);
      
      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          localStorage.setItem('user', JSON.stringify(user));
        }
        return { success: true, data: { user, token } };
      } else {
        return { success: false, error: response.data.error || 'Erro ao criar conta' };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao criar conta' 
      };
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

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

  // Simulado - Gerar questões
  async generateQuestions(params: {
    subject?: string;
    difficulty: string;
    count: number;
    bloco?: string;
    cargo?: string;
  }): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.post('/api/questoes/gerar', params);
      return { success: true, data: response.data.questoes || response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao gerar questões' 
      };
    }
  }

  // Simulado - Submeter respostas
  async submitSimulation(answers: number[], questionIds: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/api/simulados/submit', { 
        usuario_id: 'user-default',
        respostas: questionIds.map((id, index) => ({
          questao_id: id,
          resposta_usuario: String.fromCharCode(65 + answers[index]), // A, B, C, D
          gabarito: 'A', // Será calculado pelo backend
          tempo_resposta: 30 // Tempo padrão
        }))
      });
      return { success: true, data: response.data.resultado };
    } catch (error: any) {
      console.error('Erro ao submeter simulado:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao submeter simulado'
      };
    }
  }

  // Buscar matérias específicas por cargo e bloco
  async getSubjectsByCargoBloco(cargo: string, bloco: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get(`/api/questoes/materias/${cargo}/${bloco}`);
      return { success: true, data: response.data.materias || response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao buscar matérias' 
      };
    }
  }

  // Método para obter usuário atual
  getCurrentUser(): { uid: string; email: string; id: string; cargo?: string; bloco?: string } | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        return {
          uid: user.id || user.uid,
          id: user.id || user.uid,
          email: user.email,
          cargo: user.cargo,
          bloco: user.bloco
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  // Métodos para planos
  async getPlans(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get('/api/planos');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar planos'
      };
    }
  }

  // Métodos para pagamento
  async createPayment(planId: string, paymentData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/api/pagamentos/criar', {
        planId,
        ...paymentData
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar pagamento'
      };
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/api/pagamentos/status/${paymentId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao verificar status do pagamento'
      };
    }
  }

  // Métodos para conteúdos de edital
  async getConteudosEdital(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get('/api/conteudos-edital');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar conteúdos de edital'
      };
    }
  }

  async getGruposByCargo(cargoId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get(`/api/conteudos-edital/grupos/${cargoId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar grupos por cargo'
      };
    }
  }

  // Métodos para dashboard
  async getDashboardData(conteudoEditalId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/api/dashboard/${conteudoEditalId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar dados do dashboard'
      };
    }
  }

  // Métodos para ranking
  async getRanking(conteudoEditalId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get(`/api/ranking/${conteudoEditalId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar ranking'
      };
    }
  }

  // Métodos para notícias
  async getNews(conteudoEditalId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get(`/api/noticias/${conteudoEditalId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar notícias'
      };
    }
  }

  // Métodos para jogos
  async generateGameQuestions(gameType: string, conteudoEditalId: string, difficulty?: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.post('/api/jogos/gerar-questoes', {
        gameType,
        conteudoEditalId,
        difficulty
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao gerar questões do jogo'
      };
    }
  }

  async submitGameResult(gameId: string, result: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(`/api/jogos/${gameId}/resultado`, result);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao submeter resultado do jogo'
      };
    }
  }

}

export const apiService = new ApiService();