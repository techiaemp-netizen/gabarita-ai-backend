'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Se requer autenticação mas usuário não está logado
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Se há roles específicas requeridas
      if (allowedRoles && user && !allowedRoles.includes(user.role || '')) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireAuth, allowedRoles, router, redirectTo]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se requer autenticação mas usuário não está logado
  if (requireAuth && !isAuthenticated) {
    return null; // Não renderiza nada, pois será redirecionado
  }

  // Se há roles específicas requeridas e usuário não tem permissão
  if (allowedRoles && user && !allowedRoles.includes(user.role || '')) {
    return null; // Não renderiza nada, pois será redirecionado
  }

  return <>{children}</>;
}

// Hook para verificar permissões
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: string) => {
    return isAuthenticated && user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return isAuthenticated && user?.role && roles.includes(user.role);
  };

  const canAccess = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return isAuthenticated;
    }
    return hasAnyRole(requiredRoles);
  };

  return {
    hasRole,
    hasAnyRole,
    canAccess,
    isAuthenticated,
    user
  };
}