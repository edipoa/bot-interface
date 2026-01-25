import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BFSidebar, BFSidebarItem } from '../components/BF-Sidebar';
import { BFIcons } from '../components/BF-Icons';
import { useAuth } from '../hooks/useAuth';

interface AppLayoutProps {
  role: 'admin' | 'user';
}

export default function AppLayout({ role }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // NEW: Workspace Protection
  const { currentWorkspace, workspaces, loading } = useAuth(); // Assuming useAuth exposes these
  useEffect(() => {
    if (!loading && !currentWorkspace) {
      // If loaded and no workspace selected, force selection
      if (workspaces && workspaces.length === 0) {
        navigate('/no-workspace');
      } else {
        navigate('/select-workspace');
      }
    }
  }, [currentWorkspace, loading, workspaces, navigate]);

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath.startsWith('/admin/games')) {
      setActiveItem('games');
    } else if (currentPath.startsWith('/admin/players')) {
      setActiveItem('players');
    } else if (currentPath.startsWith('/admin/debts')) {
      setActiveItem('debts');
    } else if (currentPath.startsWith('/admin/workspaces')) {
      setActiveItem('workspaces');
    } else if (currentPath.startsWith('/admin/bbq')) {
      setActiveItem('bbq');
    } else if (currentPath.startsWith('/admin/chats')) {
      setActiveItem('chats');
    } else if (currentPath.startsWith('/admin/memberships')) {
      setActiveItem('memberships');
    } else if (currentPath.startsWith('/admin/my-dashboard')) {
      setActiveItem('my-dashboard');
    } else if (currentPath.startsWith('/admin/my-profile')) {
      setActiveItem('my-profile');
    } else if (currentPath.startsWith('/admin/dashboard')) {
      setActiveItem('dashboard');
    } else if (currentPath.startsWith('/user/profile')) {
      setActiveItem('profile');
    } else if (currentPath.startsWith('/user/dashboard')) {
      setActiveItem('dashboard');
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

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
    // {
    //   id: 'workspaces',
    //   label: 'Workspaces',
    //   icon: 'Settings',
    //   path: '/admin/workspaces',
    //   roles: ['admin'],
    // },
    {
      id: 'bbq',
      label: 'Churrascos',
      icon: 'Flame',
      path: '/admin/bbq',
      roles: ['admin'],
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: 'MessageSquare',
      path: '/admin/chats',
      roles: ['admin'],
    },
    {
      id: 'memberships',
      label: 'Membros',
      icon: 'CreditCard',
      path: '/admin/memberships',
      roles: ['admin'],
    },
    {
      id: 'finance',
      label: 'Financeiro',
      icon: 'BarChart3',
      path: '/admin/finance',
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'Settings',
      path: '/admin/settings',
      roles: ['admin'],
    },
    {
      id: 'my-dashboard',
      label: 'Meu Painel',
      icon: 'Layers',
      path: '/admin/my-dashboard',
      roles: ['admin'],
      separator: true,
      sectionLabel: 'Como Jogador',
    },
    {
      id: 'my-profile',
      label: 'Meu Perfil',
      icon: 'User',
      path: '/admin/my-profile',
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



  const formatPhone = (phone: string): string => {
    if (!phone) return '';

    const numbers = phone.replace(/\D/g, '');

    const localNumber = numbers.startsWith('55') ? numbers.slice(2) : numbers;

    if (localNumber.length === 11) {
      return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`;
    } else if (localNumber.length === 10) {
      return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 6)}-${localNumber.slice(6)}`;
    }

    return phone;
  };

  return (
    <div className="flex min-h-screen bg-[--background]">
      {/* Sidebar */}
      <BFSidebar
        items={items}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userRole={role}
        userName={user?.name || 'Usuário'}
        userEmail={formatPhone(user?.phone || '')}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onLogout={async () => {
          const { authAPI } = await import('../lib/axios');
          await authAPI.logout();
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left Side - Mobile Menu + Title */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-3 rounded-lg hover:bg-[--accent] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir Menu"
              >
                <BFIcons.Menu size={20} className="text-[--foreground]" />
              </button>

              <div className="hidden sm:block">
                <h2 className="text-base font-semibold text-[--foreground]">Bot Fut</h2>
                <p className="text-xs text-[--muted-foreground] leading-none">
                  {role === 'admin' ? 'Painel Administrativo' : 'Painel do Jogador'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  aria-label="Configurações"
                >
                  <BFIcons.Settings size={20} className="text-[--muted-foreground] group-hover:text-[--foreground]" />
                </button>

                {/* Settings Dropdown Menu */}
                {showSettingsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSettingsMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-2 z-50">
                      {/* Theme Toggle */}
                      <div className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isDarkMode ? (
                              <BFIcons.Moon size={18} className="text-[--muted-foreground]" />
                            ) : (
                              <BFIcons.Sun size={18} className="text-[--muted-foreground]" />
                            )}
                            <span className="text-sm text-[--foreground]">
                              {isDarkMode ? 'Tema Escuro' : 'Tema Claro'}
                            </span>
                          </div>
                          <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[--primary] focus:ring-offset-2 ${isDarkMode ? 'bg-[--primary]' : 'bg-gray-200'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-800 my-1" />

                      {/* Other Settings Options */}
                      <button
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                          setShowSettingsMenu(false);
                          navigate('/user/profile');
                        }}
                      >
                        <BFIcons.User size={18} className="text-[--muted-foreground]" />
                        <span className="text-sm text-[--foreground]">Meu Perfil</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-[--background]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
