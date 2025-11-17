/**
 * ManageWorkspaces Page - Refactored
 * 
 * Página para gerenciar workspaces com foco em visualizar e editar
 * os schedules dos chats vinculados. Layout em acordeão expansível.
 */

import React, { useState } from 'react';
import { BFCard } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFBadge } from '../components/BF-Badge';
import { BFSelect } from '../components/BF-Select';
import { BFTimeInput } from '../components/BF-TimeInput';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFSearchInput } from '../components/BF-SearchInput';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { mockWorkspaces, mockChats } from '../lib/mockData';
import type { Workspace, Chat } from '../lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Plus,
  Edit,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  Settings,
  Layers,
} from 'lucide-react';

interface ManageWorkspacesProps {
  onSelectWorkspace?: (workspaceId: string) => void;
}

interface EditScheduleModalProps {
  chat: Chat;
  workspace: Workspace;
  isOpen: boolean;
  onClose: () => void;
  onSave: (chatId: string, schedule: Chat['schedule']) => void;
}

// Modal para editar schedule de um chat
const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  chat,
  workspace,
  isOpen,
  onClose,
  onSave,
}) => {
  const [weekday, setWeekday] = useState<string>(
    chat.schedule?.weekday?.toString() || '2'
  );
  const [time, setTime] = useState<string>(chat.schedule?.time || '20:30');
  const [title, setTitle] = useState<string>(chat.schedule?.title || '');
  const [price, setPrice] = useState<string>(
    chat.schedule?.priceCents ? (chat.schedule.priceCents / 100).toString() : ''
  );
  const [pix, setPix] = useState<string>(chat.schedule?.pix || '');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const weekdayOptions = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'Sábado' },
  ];

  const handleSave = () => {
    // Validações básicas
    if (!time.match(/^\d{2}:\d{2}$/)) {
      setErrorMessage('Horário inválido. Use o formato HH:mm');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Título é obrigatório');
      return;
    }

    const priceValue = parseFloat(price.replace(',', '.'));
    if (isNaN(priceValue) || priceValue <= 0) {
      setErrorMessage('Preço inválido');
      return;
    }

    if (!pix.trim()) {
      setErrorMessage('Chave PIX é obrigatória');
      return;
    }

    // Salvar
    const schedule: Chat['schedule'] = {
      weekday: parseInt(weekday),
      time,
      title,
      priceCents: Math.round(priceValue * 100),
      pix,
    };

    onSave(chat.id, schedule);
    setSuccessMessage('Schedule atualizado com sucesso!');
    setErrorMessage('');

    // Fechar modal após 1.5s
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1500);
  };

  const handleCancel = () => {
    setSuccessMessage('');
    setErrorMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar schedule do chat</DialogTitle>
          <DialogDescription>
            <span className="text-muted-foreground">Workspace: </span>
            <span className="text-foreground">{workspace.name}</span>
            <span className="text-muted-foreground"> • Chat: </span>
            <span className="text-foreground">{chat.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Weekday */}
          <div>
            <label className="block text-sm text-foreground mb-2">
              Dia da semana
            </label>
            <BFSelect
              value={weekday}
              onValueChange={setWeekday}
              options={weekdayOptions}
              placeholder="Selecione o dia"
              data-test="weekday-select"
            />
          </div>

          {/* Time */}
          <div>
            <BFTimeInput
              label="Horário"
              value={time}
              onChange={(value) => setTime(value)}
              data-test="time-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formato: HH:mm (ex: 20:30)
            </p>
          </div>

          {/* Title */}
          <div>
            <BFInput
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: ⚽ CAMPO VIANA"
              data-test="title-input"
              fullWidth
            />
          </div>

          {/* Price */}
          <div>
            <BFMoneyInput
              label="Preço (por jogador)"
              value={price}
              onChange={(value) => setPrice(value)}
              placeholder="14.00"
              data-test="price-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Será convertido para centavos automaticamente (ex: 14.00 = 1400 centavos)
            </p>
          </div>

          {/* Pix */}
          <div>
            <BFInput
              label="Chave PIX"
              value={pix}
              onChange={(e) => setPix(e.target.value)}
              placeholder="fcjogasimples@gmail.com"
              data-test="pix-input"
              fullWidth
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email, telefone ou chave aleatória
            </p>
          </div>

          {/* Messages */}
          {successMessage && (
            <BFAlertMessage variant="success" message={successMessage} />
          )}
          {errorMessage && (
            <BFAlertMessage variant="error" message={errorMessage} />
          )}
        </div>

        <DialogFooter>
          <BFButton variant="ghost" onClick={handleCancel} data-test="cancel-button">
            Cancelar
          </BFButton>
          <BFButton variant="primary" onClick={handleSave} data-test="save-button">
            Salvar schedule
          </BFButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal
export const ManageWorkspaces: React.FC<ManageWorkspacesProps> = ({
  onSelectWorkspace,
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChat, setEditingChat] = useState<{
    chat: Chat;
    workspace: Workspace;
  } | null>(null);

  // Filtra workspaces por busca
  const filteredWorkspaces = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pega chats de um workspace
  const getWorkspaceChats = (workspaceId: string) => {
    return chats.filter((chat) => chat.workspaceId === workspaceId);
  };

  // Formata preço
  const formatPrice = (priceCents?: number) => {
    if (!priceCents) return 'N/A';
    return `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
  };

  // Nome do dia da semana
  const getWeekdayName = (weekday?: number) => {
    if (weekday === undefined) return 'N/A';
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[weekday];
  };

  // Salvar schedule editado
  const handleSaveSchedule = (chatId: string, schedule: Chat['schedule']) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, schedule } : chat
      )
    );
  };

  // Contadores
  const totalChats = chats.length;
  const activeChats = chats.filter((c) => c.status === 'active').length;
  const chatsWithSchedule = chats.filter((c) => c.schedule).length;

  return (
    <div className="space-y-6" data-test="manage-workspaces">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-foreground mb-2">Workspaces</h1>
          <p className="text-muted-foreground">
            Gerencie os workspaces e os schedules dos chats vinculados
          </p>
        </div>
        <BFButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          data-test="create-workspace-button"
        >
          Criar workspace
        </BFButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <Layers className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Workspaces</p>
              <p className="text-xl text-foreground">{workspaces.length}</p>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <MessageSquare className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de chats</p>
              <p className="text-xl text-foreground">{totalChats}</p>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--success)]/10">
              <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chats ativos</p>
              <p className="text-xl text-foreground">{activeChats}</p>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <Calendar className="w-5 h-5 text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Com schedule</p>
              <p className="text-xl text-foreground">{chatsWithSchedule}</p>
            </div>
          </div>
        </BFCard>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <BFSearchInput
            placeholder="Buscar por workspace (nome ou slug)..."
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            data-test="search-workspace"
          />
        </div>
      </div>

      {/* Workspaces List - Accordion */}
      <div className="space-y-4">
        {filteredWorkspaces.length === 0 ? (
          <BFCard variant="outlined" padding="lg">
            <div className="text-center py-8">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Nenhum workspace encontrado'
                  : 'Nenhum workspace cadastrado'}
              </p>
            </div>
          </BFCard>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {filteredWorkspaces.map((workspace) => {
              const workspaceChats = getWorkspaceChats(workspace.id);
              const activeCount = workspaceChats.filter(
                (c) => c.status === 'active'
              ).length;

              return (
                <AccordionItem
                  key={workspace.id}
                  value={workspace.id}
                  className="border-none"
                >
                  <BFCard variant="elevated" padding="none">
                    {/* Workspace Header */}
                    <div className="p-6 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <AccordionTrigger
                            className="hover:no-underline p-0 [&[data-state=open]>svg]:rotate-180"
                            data-test={`workspace-toggle-${workspace.id}`}
                          >
                            <div className="flex items-start gap-4 text-left w-full">
                              <div className="p-3 rounded-lg bg-accent">
                                <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-foreground">
                                    {workspace.name}
                                  </h3>
                                  <BFBadge
                                    variant={
                                      workspace.status === 'active'
                                        ? 'success'
                                        : 'neutral'
                                    }
                                  >
                                    {workspace.status === 'active'
                                      ? 'Ativo'
                                      : 'Inativo'}
                                  </BFBadge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {workspace.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>
                                    {workspaceChats.length} chat
                                    {workspaceChats.length !== 1 ? 's' : ''}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {activeCount} ativo
                                    {activeCount !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                        </div>
                      </div>
                    </div>

                    {/* Workspace Expanded Content - Chats List */}
                    <AccordionContent className="pb-0">
                      <div className="p-6 bg-muted/30">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-foreground">
                            Chats e Schedules
                          </h4>
                          <BFButton
                            variant="outline"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            data-test={`add-chat-${workspace.id}`}
                          >
                            Adicionar chat
                          </BFButton>
                        </div>

                        {workspaceChats.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">
                              Nenhum chat configurado neste workspace
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {workspaceChats.map((chat) => (
                              <BFCard
                                key={chat.id}
                                variant="outlined"
                                padding="md"
                                hover
                                data-test={`chat-${chat.id}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  {/* Chat Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MessageSquare className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                                      <h5 className="text-sm text-foreground truncate">
                                        {chat.name}
                                      </h5>
                                      {chat.label && (
                                        <BFBadge variant="info" size="sm">
                                          {chat.label}
                                        </BFBadge>
                                      )}
                                      <BFBadge
                                        variant={
                                          chat.status === 'active'
                                            ? 'success'
                                            : 'neutral'
                                        }
                                        size="sm"
                                      >
                                        {chat.status === 'active'
                                          ? 'Ativo'
                                          : 'Inativo'}
                                      </BFBadge>
                                    </div>

                                    {/* Schedule Summary */}
                                    {chat.schedule ? (
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                          <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>
                                              {getWeekdayName(
                                                chat.schedule.weekday
                                              )}{' '}
                                              ({chat.schedule.weekday})
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{chat.schedule.time}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            <span>
                                              {formatPrice(
                                                chat.schedule.priceCents
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                          <CreditCard className="w-3.5 h-3.5" />
                                          <span className="truncate">
                                            PIX: {chat.schedule.pix}
                                          </span>
                                        </div>
                                        <p className="text-xs text-foreground mt-1">
                                          <span className="text-muted-foreground">
                                            Título:{' '}
                                          </span>
                                          {chat.schedule.title}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-xs">
                                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                                        <span className="text-muted-foreground">
                                          Sem schedule configurado
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <BFButton
                                      variant="outline"
                                      size="sm"
                                      icon={<Edit className="w-4 h-4" />}
                                      onClick={() =>
                                        setEditingChat({ chat, workspace })
                                      }
                                      data-test={`edit-schedule-${chat.id}`}
                                    >
                                      {chat.schedule
                                        ? 'Editar schedule'
                                        : 'Configurar schedule'}
                                    </BFButton>
                                  </div>
                                </div>
                              </BFCard>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </BFCard>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Edit Schedule Modal */}
      {editingChat && (
        <EditScheduleModal
          chat={editingChat.chat}
          workspace={editingChat.workspace}
          isOpen={!!editingChat}
          onClose={() => setEditingChat(null)}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
};

export default ManageWorkspaces;
