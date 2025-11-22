/**
 * Configuração das Rotas da Aplicação
 * 
 * Define todas as rotas públicas e privadas do sistema
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Layouts
import AppLayout from '../layouts/AppLayout';

// Páginas Públicas
import { Login } from '../pages/Login';

// Páginas Admin (Protegidas)
import { AdminDashboard } from '../pages/AdminDashboard';
import { ManageGames } from '../pages/ManageGames';
import { GameDetail } from '../pages/GameDetail';
import { ManagePlayers } from '../pages/ManagePlayers';
import { ManageDebts } from '../pages/ManageDebts';
import { ManageWorkspaces } from '../pages/ManageWorkspaces';
import { WorkspaceDetail } from '../pages/WorkspaceDetail';
import { ManageChats } from '../pages/ManageChats';
import { AddCredit } from '../pages/AddCredit';
import { AddDebit } from '../pages/AddDebit';

// Páginas User (Protegidas)
import { UserDashboard } from '../pages/UserDashboard';
import { UserProfile } from '../pages/UserProfile';

// Página de Dev
import { DevHandoff } from '../pages/DevHandoff';

export const router = createBrowserRouter([
  // Rotas Públicas
  {
    path: '/login',
    element: <Login />,
  },

  // Rotas Protegidas - Admin
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AppLayout role="admin" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'games',
        element: <ManageGames />,
      },
      {
        path: 'games/:gameId',
        element: <GameDetail />,
      },
      {
        path: 'players',
        element: <ManagePlayers />,
      },
      {
        path: 'debts',
        element: <ManageDebts />,
      },
      {
        path: 'workspaces',
        element: <ManageWorkspaces />,
      },
      {
        path: 'workspaces/:workspaceId',
        element: <WorkspaceDetail />,
      },
      {
        path: 'chats',
        element: <ManageChats />,
      },
      {
        path: 'credits/add',
        element: <AddCredit />,
      },
      {
        path: 'debits/add',
        element: <AddDebit />,
      },
    ],
  },

  // Rotas Protegidas - User
  {
    path: '/user',
    element: (
      <ProtectedRoute>
        <AppLayout role="user" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/user/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <UserDashboard />,
      },
      {
        path: 'profile',
        element: <UserProfile />,
      },
    ],
  },

  // Rota de Desenvolvimento
  {
    path: '/dev',
    element: <DevHandoff />,
  },

  // Rota padrão - redireciona baseado na autenticação
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // 404 - Página não encontrada
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground mb-4">Página não encontrada</p>
          <a href="/" className="text-primary hover:underline">
            Voltar para o início
          </a>
        </div>
      </div>
    ),
  },
]);
