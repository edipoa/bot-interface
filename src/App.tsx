import { useState } from 'react';
import { BFSidebar, BFSidebarItem } from './components/BF-Sidebar';
import { BFIcons } from './components/BF-Icons';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManageGames } from './pages/ManageGames';
import { GameDetail } from './pages/GameDetail';
import { ManagePlayers } from './pages/ManagePlayers';
import { ManageWorkspaces } from './pages/ManageWorkspaces';
import ManageMemberships from './pages/ManageMemberships';
import { WorkspaceDetail } from './pages/WorkspaceDetail';
import { UserDashboard } from './pages/UserDashboard';
import { WorkspaceSettings } from './pages/WorkspaceSettings';
import { Login } from './pages/Login';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import './styles/globals.css';
import { useAuth } from './hooks/useAuth';
import { authAPI } from './lib/axios';
import { ManageBBQ } from './pages/ManageBBQ';
import { BBQDetails } from './pages/BBQDetails';

type UserRole = 'admin' | 'user';

export default function App() {
  const [isAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [activeItem, setActiveItem] = useState('dashboard');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedBBQId, setSelectedBBQId] = useState<string | null>(null);
  const { user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  const adminItems: BFSidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'Home',
      path: '/admin/dashboard',
      roles: ['admin'],
    },
    {
      id: 'games',
      label: 'Jogos',
      icon: 'Trophy',
      path: '/admin/games',
      roles: ['admin'],
    },
    {
      id: 'bbq',
      label: 'Churrasco',
      icon: 'Flame',
      path: '/admin/bbq',
      roles: ['admin'],
    },
    {
      id: 'players',
      label: 'Jogadores',
      icon: 'Users',
      path: '/admin/players',
      roles: ['admin'],
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: 'Layers',
      path: '/admin/workspaces',
      roles: ['admin'],
    },
    {
      id: 'memberships',
      label: 'Mensalidades',
      icon: 'CreditCard',
      path: '/admin/memberships',
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'Settings',
      path: '/admin/settings',
      roles: ['admin'],
    },
  ];

  const userItems: BFSidebarItem[] = [
    {
      id: 'user-dashboard',
      label: 'Meu Painel',
      icon: 'Home',
      path: '/user/dashboard',
      roles: ['user'],
    },
    {
      id: 'user-profile',
      label: 'Meu Perfil',
      icon: 'User',
      path: '/user/profile',
      roles: ['user'],
    },
  ];

  const sidebarItems = user?.role === 'admin' ? adminItems : userItems;

  const handleWorkspaceSelect = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setActiveItem('workspaces');
  };

  const handleBackToWorkspaces = () => {
    setSelectedWorkspaceId(null);
    setActiveItem('workspaces');
  };

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    setActiveItem('games');
  };

  const handleBackToGames = () => {
    setSelectedGameId(null);
    setActiveItem('games');
  };

  const handleBBQSelect = (bbqId: string) => {
    setSelectedBBQId(bbqId);
    setActiveItem('bbq');
  };

  const handleBackToBBQ = () => {
    setSelectedBBQId(null);
    setActiveItem('bbq');
  };

  const renderContent = () => {
    if (selectedGameId) {
      return (
        <GameDetail
          gameId={selectedGameId}
          onBack={handleBackToGames}
        />
      );
    }

    if (selectedWorkspaceId) {
      return (
        <WorkspaceDetail
          workspaceId={selectedWorkspaceId}
          onBack={handleBackToWorkspaces}
        />
      );
    }

    if (selectedBBQId) {
      return (
        <BBQDetails
          bbqId={selectedBBQId}
          onBack={handleBackToBBQ}
        // @ts-ignore - BBQDetails will be updated shortly to accept props
        />
      );
    }

    if (user?.role === 'admin') {
      switch (activeItem) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'games':
          return <ManageGames onSelectGame={handleGameSelect} />;
        case 'bbq':
          return <ManageBBQ onSelectBBQ={handleBBQSelect} />;
        case 'players':
          return <ManagePlayers />;
        case 'workspaces':
          return <ManageWorkspaces onSelectWorkspace={handleWorkspaceSelect} />;
        case 'memberships':
          // @ts-ignore
          return <ManageMemberships />;
        case 'settings':
          return <WorkspaceSettings />;
        default:
          return <AdminDashboard />;
      }
    } else {
      switch (activeItem) {
        case 'user-dashboard':
          return <UserDashboard />;
        case 'user-profile':
          return (
            <div className="space-y-6">
              <div>
                <h1 className="text-[--foreground] mb-2">Meu Perfil</h1>
                <p className="text-[--muted-foreground]">
                  Gerencie suas informações pessoais
                </p>
              </div>
              <div className="bg-[var(--card)] p-8 rounded-lg text-center">
                <p className="text-[var(--muted-foreground)]">
                  Página de perfil em construção
                </p>
              </div>
            </div>
          );
        default:
          return <UserDashboard />;
      }
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <BFSidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={setActiveItem}
        userRole={(user?.role as 'admin' | 'user') || 'user'}
        userName={user?.name || 'Usuário'}
        userEmail={user?.phone || ''}
        onLogout={async () => {
          await authAPI.logout();
        }}
        data-test="main-sidebar"
      />

      <main className="flex-1 overflow-y-auto bg-[var(--background)]">
        {/* Top Bar - Hide when viewing workspace detail */}
        {!selectedWorkspaceId && (
          <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-[var(--foreground)]">Bot Fut</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setUserRole('admin');
                      setActiveItem('dashboard');
                    }}
                    className={`px-3 py-1.5 rounded-md transition-colors ${userRole === 'admin'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                      }`}
                    data-test="switch-to-admin"
                  >
                    Admin View
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('user');
                      setActiveItem('user-dashboard');
                    }}
                    className={`px-3 py-1.5 rounded-md transition-colors ${userRole === 'user'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--accent)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                      }`}
                    data-test="switch-to-user"
                  >
                    User View
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-[var(--accent)] rounded-md transition-colors relative">
                  <BFIcons.Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--destructive)] rounded-full" />
                </button>
                <button
                  className="p-2 hover:bg-[var(--accent)] rounded-md transition-colors"
                  onClick={() => setActiveItem('settings')}
                >
                  <BFIcons.Settings size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={selectedWorkspaceId ? '' : 'p-6'}>{renderContent()}</div>
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
