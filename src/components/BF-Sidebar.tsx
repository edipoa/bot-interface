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
}

export interface BFSidebarProps {
  items: BFSidebarItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  userRole: 'admin' | 'user';
  userName: string;
  userEmail: string;
  onLogout: () => void;
  'data-test'?: string;
}

export const BFSidebar: React.FC<BFSidebarProps> = ({
  items,
  activeItem,
  onItemClick,
  userRole,
  userName,
  userEmail,
  onLogout,
  'data-test': dataTest,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = items.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-40 hidden" id="sidebar-overlay" />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full
          bg-[#0A1628] text-white
          transition-all duration-300 ease-in-out
          border-r border-[#1A2B42]
          z-50
          ${isCollapsed ? 'w-20' : 'w-64'}
          lg:relative lg:z-0
        `}
        data-test={dataTest}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1A2B42]">
          {!isCollapsed && <BFLogo size="sm" className="text-white" />}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-[#1A2B42] transition-colors text-white"
            data-test="sidebar-toggle"
          >
            <BFIcons.Menu size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredItems.map((item) => {
              const Icon = BFIcons[item.icon];
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onItemClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${
                        isActive
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
                  <p className="text-xs text-white/70 truncate">{userEmail}</p>
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

/*
Vue 3 Implementation Example:

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BFLogo } from './BFLogo.vue'
import { BFIcon } from './BFIcon.vue'
import type { BFIconName } from './BFIcons'

interface SidebarItem {
  id: string
  label: string
  icon: BFIconName
  path: string
  badge?: string | number
  roles?: ('admin' | 'user')[]
}

interface Props {
  items: SidebarItem[]
  activeItem: string
  userRole: 'admin' | 'user'
  userName: string
  userEmail: string
  dataTest?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  itemClick: [itemId: string]
  logout: []
}>()

const isCollapsed = ref(false)

const filteredItems = computed(() => 
  props.items.filter(item => !item.roles || item.roles.includes(props.userRole))
)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-full',
      'bg-[--sidebar] text-[--sidebar-foreground]',
      'transition-all duration-300 ease-in-out',
      'border-r border-[--sidebar-border]',
      'z-50 lg:relative lg:z-0',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
    :data-test="dataTest"
  >
    <!-- Logo Header -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-[--sidebar-border]">
      <BFLogo v-if="!isCollapsed" size="sm" class="text-white" />
      <button
        @click="toggleSidebar"
        class="p-2 rounded-md hover:bg-[--sidebar-accent] transition-colors"
        data-test="sidebar-toggle"
      >
        <BFIcon name="Menu" :size="20" />
      </button>
    </div>

    <!-- Navigation Items -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-1 px-3">
        <li v-for="item in filteredItems" :key="item.id">
          <button
            @click="emit('itemClick', item.id)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'transition-all duration-200',
              activeItem === item.id
                ? 'bg-[--sidebar-primary] text-[--sidebar-primary-foreground]'
                : 'text-[--sidebar-foreground] hover:bg-[--sidebar-accent]',
              isCollapsed ? 'justify-center' : ''
            ]"
            :data-test="`sidebar-item-${item.id}`"
            :title="isCollapsed ? item.label : undefined"
          >
            <BFIcon :name="item.icon" :size="20" class="flex-shrink-0" />
            <template v-if="!isCollapsed">
              <span class="flex-1 text-left">{{ item.label }}</span>
              <span v-if="item.badge" class="px-2 py-0.5 text-xs rounded-full bg-[--primary] text-white">
                {{ item.badge }}
              </span>
            </template>
          </button>
        </li>
      </ul>
    </nav>

    <!-- User Section -->
    <div class="border-t border-[--sidebar-border] p-4">
      <div v-if="!isCollapsed" class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[--primary] flex items-center justify-center text-white">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate">{{ userName }}</p>
            <p class="text-xs text-[--muted-foreground] truncate">{{ userEmail }}</p>
          </div>
        </div>
        <button
          @click="emit('logout')"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[--destructive] hover:bg-[--sidebar-accent] transition-colors"
          data-test="sidebar-logout"
        >
          <BFIcon name="LogOut" :size="20" />
          <span>Sair</span>
        </button>
      </div>
      <button
        v-else
        @click="emit('logout')"
        class="w-full flex items-center justify-center p-2 rounded-lg text-[--destructive] hover:bg-[--sidebar-accent] transition-colors"
        data-test="sidebar-logout"
        title="Sair"
      >
        <BFIcon name="LogOut" :size="20" />
      </button>
    </div>
  </aside>
</template>
*/
