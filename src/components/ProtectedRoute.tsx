import React, { useEffect, useState } from 'react';
import { authAPI } from '../lib/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

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
