import React from 'react';
import { BFCard } from './BF-Card';
import { BFBadge } from './BF-Badge';
import { BFButton } from './BF-Button';
import { BFIcons } from './BF-Icons';
import type { Chat } from '../lib/types';

export interface BFWorkspaceCardProps {
  chat: Chat;
  onOpenChat?: (chatId: string) => void;
  onViewDebts?: (chatId: string) => void;
  onDelete?: (chatId: string) => void;
  'data-test'?: string;
}

export const BFWorkspaceCard: React.FC<BFWorkspaceCardProps> = ({
  chat,
  onOpenChat,
  onViewDebts,
  onDelete,
  'data-test': dataTest,
}) => {
  const getStatusBadge = () => {
    const statusMap = {
      active: { variant: 'success' as const, label: '● Ativo' },
      inactive: { variant: 'neutral' as const, label: 'Inativo' },
      archived: { variant: 'error' as const, label: 'Arquivado' },
    };
    const config = statusMap[chat.status];
    return <BFBadge variant={config.variant} size="sm">{config.label}</BFBadge>;
  };

  const getTimeSince = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getWeekdayName = (weekday: number) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[weekday];
  };

  return (
    <BFCard
      variant="elevated"
      padding="none"
      hover
      className="overflow-hidden h-full flex flex-col"
      data-test={dataTest}
    >
      {/* Header */}
      <div className="p-5 border-b border-[--border] bg-gradient-to-br from-[--card] to-[--accent]/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <BFIcons.MessageSquare size={18} color="var(--primary)" className="flex-shrink-0" />
              <h3 className="text-[--foreground] truncate" title={chat.name}>
                {chat.name}
              </h3>
            </div>
            {chat.label && (
              <BFBadge variant="info" size="sm" className="mb-2">
                {chat.label}
              </BFBadge>
            )}
          </div>
          <div className="ml-2">
            {getStatusBadge()}
          </div>
        </div>

        {chat.schedule && (
          <div className="flex items-center gap-2 text-sm text-[--muted-foreground] bg-[--background]/50 px-3 py-2 rounded-md">
            <BFIcons.Calendar size={14} />
            <span>
              {getWeekdayName(chat.schedule.weekday)} às {chat.schedule.time}
            </span>
            <span className="mx-1">•</span>
            <BFIcons.DollarSign size={14} />
            <span>R$ {(chat.schedule.priceCents / 100).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1">
        <div className="space-y-3">
          {/* Members */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[--primary]/10 rounded-lg flex items-center justify-center">
              <BFIcons.Users size={16} color="var(--primary)" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[--muted-foreground]">Membros</p>
              <p className="text-[--foreground]">{chat.memberCount}</p>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[--info]/10 rounded-lg flex items-center justify-center">
              <BFIcons.Hash size={16} color="var(--info)" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[--muted-foreground]">Tipo</p>
              <p className="text-[--foreground] capitalize">{chat.type === 'group' ? 'Grupo' : 'Privado'}</p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[--success]/10 rounded-lg flex items-center justify-center">
              <BFIcons.Clock size={16} color="var(--success)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[--muted-foreground]">Última atividade</p>
              <p className="text-[--foreground] truncate" title={chat.lastMessage}>
                {getTimeSince(chat.lastMessageAt)}
              </p>
            </div>
          </div>

          {/* Last Message */}
          {chat.lastMessage && (
            <div className="bg-[--accent]/50 rounded-lg p-3 border border-[--border]">
              <p className="text-xs text-[--muted-foreground] mb-1 flex items-center gap-1">
                <BFIcons.MessageCircle size={12} />
                Última mensagem
              </p>
              <p className="text-sm text-[--foreground] line-clamp-2">
                {chat.lastMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-[--accent]/30 border-t border-[--border] flex gap-2">
        <BFButton
          variant="primary"
          size="sm"
          icon={<BFIcons.MessageSquare size={16} />}
          onClick={() => onOpenChat?.(chat.id)}
          className="flex-1"
          data-test={`${dataTest}-open`}
        >
          Abrir
        </BFButton>
        <BFButton
          variant="secondary"
          size="sm"
          icon={<BFIcons.DollarSign size={16} />}
          onClick={() => onViewDebts?.(chat.id)}
          data-test={`${dataTest}-debts`}
        >
          Débitos
        </BFButton>
        <BFButton
          variant="ghost"
          size="sm"
          icon={<BFIcons.Trash2 size={16} />}
          onClick={() => onDelete?.(chat.id)}
          className="text-[--destructive] hover:bg-[--destructive]/10"
          data-test={`${dataTest}-delete`}
        />
      </div>
    </BFCard>
  );
};

/*
Vue 3 Implementation Example:

<script setup lang="ts">
import { computed } from 'vue'
import type { Chat } from '../lib/types'

interface Props {
  chat: Chat
  dataTest?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  openChat: [chatId: string]
  viewDebts: [chatId: string]
  delete: [chatId: string]
}>()

const statusBadge = computed(() => {
  const statusMap = {
    active: { variant: 'success', label: '● Ativo' },
    inactive: { variant: 'neutral', label: 'Inativo' },
    archived: { variant: 'error', label: 'Arquivado' },
  }
  return statusMap[props.chat.status]
})

const getTimeSince = (dateString?: string) => {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins}m atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return date.toLocaleDateString('pt-BR')
}

const getWeekdayName = (weekday: number) => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return days[weekday]
}
</script>

<template>
  <BFCard
    variant="elevated"
    padding="none"
    :hover="true"
    class="overflow-hidden h-full flex flex-col"
    :data-test="dataTest"
  >
    <!-- Header -->
    <div class="p-5 border-b border-[--border] bg-gradient-to-br from-[--card] to-[--accent]/30">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <BFIcon name="MessageSquare" :size="18" color="var(--primary)" class="flex-shrink-0" />
            <h3 class="text-[--foreground] truncate" :title="chat.name">
              {{ chat.name }}
            </h3>
          </div>
          <BFBadge v-if="chat.label" variant="info" size="sm" class="mb-2">
            {{ chat.label }}
          </BFBadge>
        </div>
        <div class="ml-2">
          <BFBadge :variant="statusBadge.variant" size="sm">
            {{ statusBadge.label }}
          </BFBadge>
        </div>
      </div>

      <div v-if="chat.schedule" class="flex items-center gap-2 text-sm text-[--muted-foreground] bg-[--background]/50 px-3 py-2 rounded-md">
        <BFIcon name="Calendar" :size="14" />
        <span>
          {{ getWeekdayName(chat.schedule.weekday) }} às {{ chat.schedule.time }}
        </span>
        <span class="mx-1">•</span>
        <BFIcon name="DollarSign" :size="14" />
        <span>R$ {{ (chat.schedule.priceCents / 100).toFixed(2) }}</span>
      </div>
    </div>

    <!-- Content and Actions -->
    <!-- ... similar structure -->
  </BFCard>
</template>
*/
