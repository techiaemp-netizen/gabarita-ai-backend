// Tipos e interfaces para o Gabarita AI

export interface User {
  id: string;
  nome: string;
  name?: string; // Alias para nome, usado em alguns componentes
  email: string;
  cpf?: string;
  telefone?: string;
  cargo?: string;
  bloco?: string;
  level?: number;
  xp?: number;
  accuracy?: number;
  plano: string;
  status?: string;
  created_at: string;
  updated_at: string;
  questionsAnswered?: number;
  conteudoEditalId?: string;
  cargoId?: string;
  grupoId?: string;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source: string;
}

export interface SimulationResult {
  id: string;
  userId: string;
  questions: Question[];
  answers: number[];
  score: number;
  accuracy: number;
  timeSpent: number;
  completedAt: string;
}

export interface Performance {
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  subjectPerformance: {
    [subject: string]: {
      total: number;
      correct: number;
      accuracy: number;
    };
  };
  weeklyProgress: {
    week: string;
    questionsAnswered: number;
    accuracy: number;
  }[];
  monthlyProgress: {
    month: string;
    questionsAnswered: number;
    accuracy: number;
  }[];
}

export interface Plan {
  id: string
  nome: string
  tipo: string
  preco: number
  periodo: string
  descricao: string
  recursos: string[]
  limitacoes?: string[]
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface RankingEntry {
  position: number;
  userId: string;
  userName: string;
  level: number;
  xp: number;
  accuracy: number;
  questionsAnswered: number;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  category: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isClient: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    nome: string;
    email: string;
    cpf: string;
    telefone?: string;
    password: string;
    conteudoEditalId: string;
    cargoId: string;
    grupoId: string;
    plano?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  simulateAuth: () => void;
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Interfaces para Conteúdos de Edital
export interface ConteudoEdital {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  cargos: Cargo[]
  created_at?: string
  updated_at?: string
}

export interface Cargo {
  id: string
  nome: string
  descricao: string
  grupos: Grupo[]
  conteudoEditalId?: string
  created_at?: string
  updated_at?: string
}

export interface Grupo {
  id: string
  nome: string
  descricao: string
  materias: string[]
  cargoId?: string
  created_at?: string
  updated_at?: string
}

// Interfaces para Pagamento
export interface PaymentData {
  planoId: string
  userId: string
  valor: number
  metodo: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  mercadoPagoId?: string
  preferenceId?: string
  paymentUrl?: string
}

// Interfaces para Dashboard
export interface DashboardData {
  totalQuestoes: number
  acertos: number
  erros: number
  percentualAcerto: number
  tempoMedioResposta: number
  ranking: number
  totalUsuarios: number
  performanceWeekly: PerformanceWeekly[]
  materiasEstudadas: string[]
  proximasProvas: any[]
}

export interface PerformanceWeekly {
  semana: string
  questoes: number
  acertos: number
  percentual: number
}