/**
 * Protected Route Component
 * 
 * Componente para proteger rotas que requerem autenticação.
 * Redireciona automaticamente para /login se o usuário não estiver autenticado.
 */

import React, { useEffect, useState } from 'react';
import { authAPI, tokenService } from '../lib/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que envolve rotas protegidas
 * Verifica se o usuário está autenticado antes de renderizar o conteúdo
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authAPI.isAuthenticated()) {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return;
      }

      try {
        await authAPI.getMe();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication failed:', error);
        setIsAuthenticated(false);
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

/**
 * Hook para acessar informações do usuário autenticado
 */
export const useAuth = () => {
  const [user, setUser] = useState(tokenService.getUser());

  const logout = async () => {
    await authAPI.logout();
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getMe();
      tokenService.setUser(userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  };

  return {
    user,
    logout,
    refreshUser,
    isAuthenticated: authAPI.isAuthenticated(),
  };
};
