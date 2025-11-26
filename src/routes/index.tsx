import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RootRedirect } from '../components/RootRedirect';

import AppLayout from '../layouts/AppLayout';

import { Login } from '../pages/Login';

import { AdminDashboard } from '../pages/AdminDashboard';
import { ManageGames } from '../pages/ManageGames';
import { GameDetail } from '../pages/GameDetail';
import { ManagePlayers } from '../pages/ManagePlayers';
import { PlayerDetail } from '../pages/PlayerDetail';
import { ManageDebts } from '../pages/ManageDebts';
import { ManageWorkspaces } from '../pages/ManageWorkspaces';
import { WorkspaceDetail } from '../pages/WorkspaceDetail';
import { ManageChats } from '../pages/ManageChats';
import { AddCredit } from '../pages/AddCredit';
import { AddDebit } from '../pages/AddDebit';

import { UserDashboard } from '../pages/UserDashboard';
import { UserProfile } from '../pages/UserProfile';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },

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
        path: 'players/:playerId',
        element: <PlayerDetail />,
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
      {
        path: 'my-dashboard',
        element: <UserDashboard />,
      },
      {
        path: 'my-profile',
        element: <UserProfile />,
      },
    ],
  },

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

  {
    path: '/',
    element: <RootRedirect />,
  },

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
