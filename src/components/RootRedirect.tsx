/**
 * Root Redirect Component
 * 
 * Componente que verifica a autenticação antes de redirecionar
 * - Se tiver token válido, redireciona para dashboard baseado no role
 * - Se não tiver token, redireciona para login
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI, tokenService } from '../lib/axios';

export const RootRedirect = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = authAPI.isAuthenticated();

      if (!hasToken) {
        setRedirectTo('/login');
        setIsChecking(false);
        return;
      }

      try {
        const user = await authAPI.getMe();

        // Wait, authAPI.getMe() may not return complete workspace list if not updated.
        // Assuming user.workspaces is available.
        // Also check if context has loaded... RootRedirect uses direct API, it's outside context usually or parallel.
        // But we want to rely on the logic we just discussed.

        // However, this component is mounted on '/' route.
        // It fetches user.

        const workspaces = user.workspaces || [];
        const hasWorkspaces = workspaces.length > 0;
        const storedWorkspaceId = localStorage.getItem('workspaceId');

        // Logic:
        // if 0 workspaces -> /no-workspace
        // if 1 workspace -> select it (if not already) and go to dashboard
        // if >1 workspaces -> check storage. if matches, dashboard. else /select-workspace

        if (!hasWorkspaces) {
          setRedirectTo('/no-workspace');
        } else if (workspaces.length === 1) {
          const ws = workspaces[0];
          localStorage.setItem('workspaceId', ws.id);
          setRedirectTo(ws.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
        } else {
          // Multiple workspaces
          if (storedWorkspaceId && workspaces.some((w: any) => w.id === storedWorkspaceId)) {
            // Has valid selection
            // Need to know role in THAT workspace... assume current user role field is global or we need to find it in workspace list
            const ws = workspaces.find((w: any) => w.id === storedWorkspaceId);
            const wsRole = (ws?.role || '').toLowerCase();
            const isAdmin = wsRole === 'admin' || wsRole === 'owner';
            setRedirectTo(isAdmin ? '/admin/dashboard' : '/user/dashboard');
          } else {
            setRedirectTo('/select-workspace');
          }
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        tokenService.clearTokens();
        setRedirectTo('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return redirectTo ? <Navigate to={redirectTo} replace /> : null;
};
