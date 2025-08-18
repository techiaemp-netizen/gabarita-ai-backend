'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '@/types';
import { authService } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Verify token is still valid
          try {
            const response = await authService.getCurrentUser();
            if (response.success && response.data) {
              setUser(response.data);
              localStorage.setItem('user', JSON.stringify(response.data));
            }
          } catch (error) {
            // Token is invalid, clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(response.message || 'Erro ao fazer login');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        const { user: newUser, token } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      } else {
        throw new Error(response.message || 'Erro ao criar conta');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;