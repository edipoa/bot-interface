import React, { useState } from 'react';
import { BFLogo } from './BF-Logo';
import { BFIcons } from './BF-Icons';

export interface BFSidebarItem {
  id: string;
  label: string;
  icon: keyof typeof BFIcons;
  path: string;
  badge?: string | number;
  roles?: ('admin' | 'user')[];
  separator?: boolean;
  sectionLabel?: string;
}

export interface BFSidebarProps {
  items: BFSidebarItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  userRole: 'admin' | 'user';
  userName: string;
  userEmail: string;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  'data-test'?: string;
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const BFSidebar: React.FC<BFSidebarProps> = ({
  items,
  activeItem,
  onItemClick,
  userRole,
  userName,
  userEmail,
  onLogout,
  isMobileOpen = false,
  onMobileToggle,
  'data-test': dataTest,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { workspaces, currentWorkspace } = useAuth();
  const navigate = useNavigate();

  const filteredItems = items.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen
          bg-[#0A1628] text-white
          transition-all duration-300 ease-in-out
          border-r border-[#1A2B42]
          z-50
          flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:z-0
        `}
        data-test={dataTest}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1A2B42]">
          {!isCollapsed && <BFLogo size="sm" className="text-white" />}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                onMobileToggle?.();
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="p-2 rounded-md hover:bg-[#1A2B42] transition-colors text-white cursor-pointer"
            data-test="sidebar-toggle"
          >
            <BFIcons.Menu size={20} />
          </button>
        </div>

        {/* Workspace Switcher (if applicable) */}
        {!isCollapsed && workspaces.length > 0 && (
          <div className="px-4 py-3 border-b border-[#1A2B42]">
            <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
              Grupo Atual
            </div>
            <div className="flex items-center justify-between group">
              <div className="font-medium text-sm truncate pr-2">
                {currentWorkspace?.name || 'Selecione...'}
              </div>

              {workspaces.length > 1 && (
                <button
                  onClick={() => navigate('/select-workspace')}
                  className="text-xs text-[#00D66F] hover:text-[#00D66F]/80 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Trocar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredItems.map((item) => {
              const Icon = BFIcons[item.icon];
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  {/* Separador de Seção */}
                  {item.separator && !isCollapsed && (
                    <div className="pt-4 pb-2">
                      <div className="border-t border-[#1A2B42] mb-2"></div>
                      {item.sectionLabel && (
                        <span className="text-xs text-white/50 uppercase tracking-wider px-3">
                          {item.sectionLabel}
                        </span>
                      )}
                    </div>
                  )}
                  {item.separator && isCollapsed && (
                    <div className="border-t border-[#1A2B42] my-2"></div>
                  )}

                  <button
                    onClick={() => {
                      onItemClick(item.id);
                      if (window.innerWidth < 1024 && isMobileOpen) {
                        onMobileToggle?.();
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 cursor-pointer
                      ${isActive
                        ? 'bg-[#00D66F] text-white'
                        : 'text-white hover:bg-[#1A2B42]'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    data-test={`sidebar-item-${item.id}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[--primary] text-white">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t border-[#1A2B42] p-4">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00D66F] flex items-center justify-center text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-white">{userName}</p>
                  <p className="text-xs text-white/70 truncate">{userEmail.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4')}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#EF4444] hover:bg-[#1A2B42] transition-colors"
                data-test="sidebar-logout"
              >
                <BFIcons.LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg text-[#EF4444] hover:bg-[#1A2B42] transition-colors"
              data-test="sidebar-logout"
              title="Sair"
            >
              <BFIcons.LogOut size={20} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};