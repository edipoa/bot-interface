
import { Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { authAPI, tokenService } from '../lib/axios';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authAPI.isAuthenticated()) {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return;
      }

      try {
        const userData = await authAPI.getMe();
        // Save user data to localStorage to persist role and other info
        tokenService.setUser(userData);
        setIsAuthenticated(true);
        setUserRole(userData.role);
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

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles) {
    let hasPermission = false;

    // 1. Check Global Role
    // Handle case sensitivity for role check
    if (userRole && allowedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())) {
      hasPermission = true;
    }

    // 2. Check Workspace Role (if not already allowed globally)
    if (!hasPermission) {
      const storedWorkspaceId = localStorage.getItem('workspaceId');
      const user = tokenService.getUser(); // Get full user object including workspaces

      // DEBUG LOGS
      console.log('🔒 ProtectedRoute Check:', {
        path: window.location.pathname,
        userRole,
        workspaceId: storedWorkspaceId,
        allowed: allowedRoles
      });

      if (storedWorkspaceId && user && user.workspaces) {
        const workspace = user.workspaces.find((w: any) => w.id === storedWorkspaceId);

        console.log('🔒 Found Workspace:', workspace);

        if (workspace && workspace.role) {
          const role = workspace.role.toLowerCase();
          const allowedLower = allowedRoles.map(r => r.toLowerCase());

          if (allowedLower.includes(role)) {
            console.log('✅ Access Granted via Workspace Role:', role);
            hasPermission = true;
          }

          // Explicitly allow OWNER if ADMIN is allowed (case insensitive)
          if (allowedLower.includes('admin') && role === 'owner') {
            console.log('✅ Access Granted via Owner->Admin');
            hasPermission = true;
          }
        }
      } else {
        console.log('❌ No Workspace/User match for ID:', storedWorkspaceId);
      }
    }

    if (!hasPermission) {
      console.log('⛔ Access Denied');
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
