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
import { ManageWorkspaces } from '../pages/ManageWorkspaces';
import { WorkspaceDetail } from '../pages/WorkspaceDetail';
import { ManageChats } from '../pages/ManageChats';
import ManageMemberships from '../pages/ManageMemberships';
import { WorkspaceSettings } from '../pages/WorkspaceSettings';
import { AdminFinance } from '../pages/AdminFinance';
import { ChatSettings } from '../pages/ChatSettings';

import { UserDashboard } from '../pages/UserDashboard';
import { UserProfile } from '../pages/UserProfile';
import { BBQDemo } from '@/pages/BBQDemo';
import { BBQDetails } from '@/pages/BBQDetails';
import { SelectWorkspace } from '../pages/SelectWorkspace';
import NoWorkspace from '../pages/NoWorkspace';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/select-workspace',
    element: (
      <ProtectedRoute>
        <SelectWorkspace />
      </ProtectedRoute>
    ),
  },

  {
    path: '/no-workspace',
    element: (
      <ProtectedRoute>
        <NoWorkspace />
      </ProtectedRoute>
    ),
  },

  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
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
        path: 'bbq',
        element: <BBQDemo />,
      },
      {
        path: 'bbq/:bbqId',
        element: <BBQDetails />,
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
        path: 'chats/:chatId',
        element: <ChatSettings />,
      },
      {
        path: 'memberships',
        element: <ManageMemberships />,
      },
      {
        path: 'my-dashboard',
        element: <UserDashboard />,
      },
      {
        path: 'my-profile',
        element: <UserProfile />,
      },
      {
        path: 'finance',
        element: <AdminFinance />,
      },
      {
        path: 'settings',
        element: <WorkspaceSettings />,
      },
    ],
  },

  {
    path: '/user',
    element: (
      <ProtectedRoute allowedRoles={['user', 'admin']}>
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
