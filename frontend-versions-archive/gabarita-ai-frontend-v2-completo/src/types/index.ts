// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  planId: string;
  questoesGratis: number;
  questoesRespondidas: number;
  acertos: number;
  sequencia: number;
  xp: number;
  nivel: number;
  createdAt: string;
  updatedAt: string;
}

// Question Types
export interface Question {
  id: string;
  pergunta: string;
  alternativas: string[];
  respostaCorreta: number;
  explicacao?: string;
  materia: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  pontos: number;
}

export interface QuestionResponse {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  explanation?: string;
  points: number;
}

// Plan Types
export interface Plan {
  id: string;
  nome: string;
  preco: number;
  periodo: string;
  descricao: string;
  recursos: string[];
  popular?: boolean;
}

// Game Types
export interface Game {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  planosPermitidos: string[];
  pontosPorAcerto: number;
  pontosPorErro: number;
  tempoLimite?: number;
}

// Statistics Types
export interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  currentLevel: number;
  questionsToday: number;
  averageTime: number;
}

// Ranking Types
export interface RankingUser {
  id: string;
  name: string;
  xp: number;
  nivel: number;
  position: number;
  avatar?: string;
}

// News Types
export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
}

// Simulation Types
export interface Simulation {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  timeLimit: number;
  totalQuestions: number;
  difficulty: 'facil' | 'medio' | 'dificil' | 'misto';
  subjects: string[];
}

export interface SimulationResult {
  id: string;
  simulationId: string;
  userId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  answers: QuestionResponse[];
}