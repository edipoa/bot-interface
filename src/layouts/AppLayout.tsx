/**
 * Layout Principal da Aplicação
 * 
 * Layout usado para páginas autenticadas com sidebar
 */

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BFSidebar, BFSidebarItem } from '../components/BF-Sidebar';
import { useAuth } from '../components/ProtectedRoute';

interface AppLayoutProps {
  role: 'admin' | 'user';
}

export default function AppLayout({ role }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

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
      id: 'players',
      label: 'Jogadores',
      icon: 'Users',
      path: '/admin/players',
      roles: ['admin'],
    },
    {
      id: 'debts',
      label: 'Débitos',
      icon: 'DollarSign',
      path: '/admin/debts',
      roles: ['admin'],
    },
    {
      id: 'workspaces',
      label: 'Workspaces',
      icon: 'Settings',
      path: '/admin/workspaces',
      roles: ['admin'],
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: 'MessageCircle',
      path: '/admin/chats',
      roles: ['admin'],
    },
  ];

  const userItems: BFSidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Meu Painel',
      icon: 'Home',
      path: '/user/dashboard',
      roles: ['user'],
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: 'User',
      path: '/user/profile',
      roles: ['user'],
    },
  ];

  const items = role === 'admin' ? adminItems : userItems;

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    const item = items.find(i => i.id === itemId);
    if (item?.path) {
      navigate(item.path);
    }
  };



  return (
    <div className="flex min-h-screen bg-gray-50">
      <BFSidebar
        items={items}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userRole={role}
        userName={user?.name || 'Usuário'}
        userEmail={user?.phone || ''}
        onLogout={async () => {
          const { authAPI } = await import('../lib/axios');
          await authAPI.logout();
        }}
      />
      
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
