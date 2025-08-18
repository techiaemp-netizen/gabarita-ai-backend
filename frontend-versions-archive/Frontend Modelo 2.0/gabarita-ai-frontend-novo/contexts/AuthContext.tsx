'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '@/types';
import { apiService } from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Usuário simulado para demonstração
  const mockUser: User = {
    id: 'demo-user-123',
    name: 'Usuário Demo',
    email: 'demo@gabarita.ai',
    plan: 'premium',
    createdAt: new Date().toISOString(),
    level: 15,
    xp: 2450,
    accuracy: 87
  };

  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulando usuário logado para demonstração
    setUser(mockUser);
    setLoading(false);
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token inválido, remover
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Erro ao fazer login');
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    try {
      const response = await apiService.signup(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Erro ao criar conta');
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.error || 'Erro ao atualizar perfil');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

