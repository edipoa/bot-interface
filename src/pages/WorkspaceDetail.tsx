import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BFCard } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFBadge } from '../components/BF-Badge';
import { BFIcons } from '../components/BF-Icons';
import { BFInput } from '../components/BF-Input';
import { BFSelect } from '../components/BF-Select';
import { BFTimeInput } from '../components/BF-TimeInput';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { workspacesAPI, chatsAPI } from '../lib/axios';
import type { Workspace, Chat } from '../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

interface WorkspaceDetailProps {
  workspaceId?: string;
  onBack?: () => void;
}

export const WorkspaceDetail: React.FC<WorkspaceDetailProps> = ({ workspaceId: propWorkspaceId, onBack }) => {
  const params = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  // Use prop workspaceId if provided, otherwise use params from router
  const workspaceId = propWorkspaceId || params.workspaceId;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit chat dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [chatName, setChatName] = useState('');
  const [chatStatus, setChatStatus] = useState('active');
  const [scheduleWeekday, setScheduleWeekday] = useState('2');
  const [scheduleTime, setScheduleTime] = useState('20:30');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [schedulePrice, setSchedulePrice] = useState('');
  const [schedulePix, setSchedulePix] = useState('');

  // Create chat dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChatId, setNewChatId] = useState('');
  const [newChatLabel, setNewChatLabel] = useState('');
  const [newChatType, setNewChatType] = useState<'group' | 'private'>('group');

  // Settings dialog state
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [organizzeEmail, setOrganizzeEmail] = useState('');
  const [organizzeApiKey, setOrganizzeApiKey] = useState('');
  const [organizzeAccountId, setOrganizzeAccountId] = useState('');
  const [categoryFieldPayment, setCategoryFieldPayment] = useState('');
  const [categoryPlayerPayment, setCategoryPlayerPayment] = useState('');
  const [categoryPlayerDebt, setCategoryPlayerDebt] = useState('');
  const [categoryGeneral, setCategoryGeneral] = useState('');
  const [confirmDisableDialogOpen, setConfirmDisableDialogOpen] = useState(false);

  const handleDisableOrganizze = async () => {
    if (!workspaceId) return;

    try {
      await workspacesAPI.deleteOrganizzeSettings(workspaceId);
      toast.success('Integração desativada com sucesso!');
      setConfirmDisableDialogOpen(false);
      setSettingsDialogOpen(false);
      await fetchWorkspaceData();
    } catch (error) {
      console.error('Error disabling Organizze:', error);
      toast.error('Erro ao desativar integração.');
    }
  };

  // Fetch data
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceData();
    }
  }, [workspaceId]);

  const fetchWorkspaceData = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      const [workspaceData, chatsData, statsData] = await Promise.all([
        workspacesAPI.getWorkspace(workspaceId),
        workspacesAPI.getWorkspaceChats(workspaceId),
        workspacesAPI.getWorkspaceStats(workspaceId),
      ]);

      setWorkspace(workspaceData);

      // Populate Organizze settings if available
      if (workspaceData.organizzeConfig) {
        setOrganizzeEmail(workspaceData.organizzeConfig.email || '');
        setOrganizzeAccountId(workspaceData.organizzeConfig.accountId?.toString() || '');
        setCategoryFieldPayment(workspaceData.organizzeConfig.categories?.fieldPayment?.toString() || '');
        setCategoryPlayerPayment(workspaceData.organizzeConfig.categories?.playerPayment?.toString() || '');
        setCategoryPlayerDebt(workspaceData.organizzeConfig.categories?.playerDebt?.toString() || '');
        setCategoryGeneral(workspaceData.organizzeConfig.categories?.general?.toString() || '');
      }

      // Map _id to id for chats
      const mappedChats = chatsData.map((chat: any) => ({
        ...chat,
        id: chat._id || chat.id,
      }));
      setChats(mappedChats);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter chats
  const filteredChats = chats.filter(chat =>
    (chat.name?.toLowerCase() || chat.label?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (chat.chatId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Open edit chat dialog
  const handleEditChat = (chat: Chat) => {
    setEditingChat(chat);
    setChatName(chat.name || chat.label || '');
    setChatStatus(chat.status);

    if (chat.schedule) {
      setScheduleWeekday(chat.schedule.weekday.toString());
      setScheduleTime(chat.schedule.time);
      setScheduleTitle(chat.schedule.title);
      setSchedulePrice((chat.schedule.priceCents / 100).toString());
      setSchedulePix(chat.schedule.pix);
    } else {
      setScheduleWeekday('2');
      setScheduleTime('20:30');
      setScheduleTitle('');
      setSchedulePrice('');
      setSchedulePix('');
    }

    setEditDialogOpen(true);
  };

  // Save chat changes
  const handleSaveChat = async () => {
    if (!editingChat) return;

    try {
      await chatsAPI.updateChat(editingChat.id, {
        name: chatName,
        label: chatName,
        status: chatStatus as 'active' | 'inactive' | 'archived',
        schedule: {
          weekday: parseInt(scheduleWeekday),
          time: scheduleTime,
          title: scheduleTitle,
          priceCents: Math.round(parseFloat(schedulePrice) * 100),
          pix: schedulePix,
        },
      });

      toast.success('Chat atualizado com sucesso!');
      setEditDialogOpen(false);
      await fetchWorkspaceData(); // Refresh data
    } catch (error) {
      console.error('Error saving chat:', error);
      toast.error('Erro ao atualizar chat. Tente novamente.');
    }
  };

  // Open settings dialog
  const handleOpenSettings = () => {
    if (workspace?.organizzeConfig) {
      setOrganizzeEmail(workspace.organizzeConfig.email || '');
      setOrganizzeAccountId(workspace.organizzeConfig.accountId?.toString() || '');
      setCategoryFieldPayment(workspace.organizzeConfig.categories?.fieldPayment?.toString() || '');
      setCategoryPlayerPayment(workspace.organizzeConfig.categories?.playerPayment?.toString() || '');
      setCategoryPlayerDebt(workspace.organizzeConfig.categories?.playerDebt?.toString() || '');
      setCategoryGeneral(workspace.organizzeConfig.categories?.general?.toString() || '');
    }
    setSettingsDialogOpen(true);
  };

  // Save Organizze settings
  const handleSaveOrganizzeSettings = async () => {
    if (!workspaceId) return;

    try {
      await workspacesAPI.updateOrganizzeSettings(workspaceId, {
        email: organizzeEmail,
        apiKey: organizzeApiKey,
        accountId: parseInt(organizzeAccountId),
        categories: {
          fieldPayment: parseInt(categoryFieldPayment),
          playerPayment: parseInt(categoryPlayerPayment),
          playerDebt: parseInt(categoryPlayerDebt),
          general: parseInt(categoryGeneral),
        },
      });

      toast.success('Configurações do Organizze atualizadas com sucesso!');
      setSettingsDialogOpen(false);
      await fetchWorkspaceData();
    } catch (error) {
      console.error('Error saving Organizze settings:', error);
      toast.error('Erro ao salvar configurações do Organizze. Tente novamente.');
    }
  };

  // Create new chat
  const handleCreateChat = async () => {
    if (!workspaceId || !newChatId) return;

    try {
      await chatsAPI.createChat({
        workspaceId,
        chatId: newChatId,
        name: newChatLabel,
        label: newChatLabel,
        type: newChatType,
        schedule: {
          weekday: parseInt(scheduleWeekday),
          time: scheduleTime,
          title: scheduleTitle,
          priceCents: Math.round(parseFloat(schedulePrice || '0') * 100),
          pix: schedulePix,
        },
      });

      // Reset form
      setNewChatId('');
      setNewChatLabel('');
      setNewChatType('group');
      setScheduleWeekday('2');
      setScheduleTime('20:30');
      setScheduleTitle('');
      setSchedulePrice('');
      setSchedulePix('');

      toast.success('Chat criado com sucesso!');
      setCreateDialogOpen(false);
      await fetchWorkspaceData();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Erro ao criar chat. Tente novamente.');
    }
  };

  const weekdayOptions = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'Sábado' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
    { value: 'archived', label: 'Arquivado' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2 text-[--muted-foreground]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-[--foreground]">Workspace não encontrado</h2>
          <div className="flex items-center gap-4 mb-6">
            <BFButton variant="outline" onClick={() => onBack ? onBack() : navigate('/admin/workspaces')}>
              Voltar para Workspaces
            </BFButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <BFButton
            variant="secondary"
            icon={<BFIcons.ArrowLeft size={20} />}
            onClick={() => onBack ? onBack() : navigate('/admin/workspaces')}
          >
            Voltar
          </BFButton>
          <div>
            <h1 className="text-[--foreground] mb-1">{workspace.name}</h1>
            <p className="text-[--muted-foreground] text-sm">
              {workspace.slug} • {workspace.platform}
            </p>
          </div>
        </div>
        <BFButton
          variant="primary"
          icon={<BFIcons.Settings size={20} />}
          onClick={handleOpenSettings}
        >
          Configurações
        </BFButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BFCard variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              <BFIcons.MessageSquare size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[--muted-foreground]">Total de Chats</p>
              <p className="text-xl text-[--foreground] font-semibold">{stats?.totalChats || 0}</p>
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <BFIcons.Trophy size={20} className="text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[--muted-foreground]">Jogos</p>
              <h3 className="text-xl font-semibold text-[--foreground]">{stats.totalGames || 0}</h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--warning)]/10">
              <BFIcons.Calendar size={20} className="text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[--muted-foreground]">Próximos Jogos</p>
              <h3 className="text-xl font-semibold text-[--foreground]">{stats.upcomingGames || 0}</h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--info)]/10">
              <BFIcons.Settings size={20} className="text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[--muted-foreground]">Status</p>
              <BFBadge variant={workspace.status === 'active' ? 'success' : 'neutral'}>
                {workspace.status === 'active' ? 'Ativo' : 'Inativo'}
              </BFBadge>
            </div>
          </div>
        </BFCard>
      </div>

      {/* Workspace Settings */}
      <BFCard variant="elevated" padding="lg">
        <h2 className="text-[--foreground] mb-4">Configurações do Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[--muted-foreground]">Jogadores Máximos</p>
            <p className="text-[--foreground]">{workspace.settings?.maxPlayers || 16}</p>
          </div>
          <div>
            <p className="text-sm text-[--muted-foreground]">Preço por Jogo</p>
            <p className="text-[--foreground]">
              R$ {((workspace.settings?.pricePerGameCents || 1400) / 100).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[--muted-foreground]">Chave PIX</p>
            <p className="text-[--foreground]">{workspace.settings?.pix || 'Não configurado'}</p>
          </div>
          <div>
            <p className="text-sm text-[--muted-foreground]">Timezone</p>
            <p className="text-[--foreground]">{workspace.timezone || 'America/Sao_Paulo'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-[--muted-foreground]">Comandos Habilitados</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {workspace.settings?.commandsEnabled?.map((cmd, idx) => (
                <BFBadge key={idx} variant="info">{cmd}</BFBadge>
              )) || <span className="text-[--muted-foreground]">Nenhum comando configurado</span>}
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-[--muted-foreground]">Integração Organizze</p>
            <p className="text-[--foreground]">
              {workspace.organizzeConfig?.hasApiKey ? (
                <span className="flex items-center gap-2">
                  <BFIcons.CheckCircle size={16} className="text-[var(--success)]" />
                  Configurado ({workspace.organizzeConfig.email})
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <BFIcons.XCircle size={16} className="text-[var(--destructive)]" />
                  Não configurado
                </span>
              )}
            </p>
          </div>
        </div>
      </BFCard>

      {/* Chats List */}
      <BFCard variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[--foreground]">Chats ({filteredChats.length})</h2>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <BFInput
                placeholder="Buscar chats..."
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                icon={<BFIcons.Search size={20} />}
                fullWidth
              />
            </div>
            <BFButton
              variant="primary"
              icon={<BFIcons.Plus size={20} />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Adicionar Chat
            </BFButton>
          </div>
        </div>

        <div className="space-y-3">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-[--muted-foreground]">
              <BFIcons.MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p>Nenhum chat encontrado</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <BFCard key={chat.id} variant="outlined" padding="md" hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[--foreground]">{chat.label || chat.name || 'Chat sem nome'}</h3>
                      <BFBadge variant={chat.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {chat.status === 'active' ? 'Ativo' : chat.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                      </BFBadge>
                      {chat.label && chat.name && chat.label !== chat.name && (
                        <BFBadge variant="info" size="sm">{chat.name}</BFBadge>
                      )}
                    </div>
                    <p className="text-sm text-[--muted-foreground] mb-2">ID: {chat.chatId}</p>
                    {chat.schedule && (
                      <div className="flex flex-wrap gap-3 text-xs text-[--muted-foreground]">
                        <span className="flex items-center gap-1">
                          <BFIcons.Calendar size={14} />
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][chat.schedule.weekday]}
                        </span>
                        <span className="flex items-center gap-1">
                          <BFIcons.Clock size={14} />
                          {chat.schedule.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <BFIcons.DollarSign size={14} />
                          R$ {(chat.schedule.priceCents / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <BFButton
                    variant="secondary"
                    size="sm"
                    icon={<BFIcons.Edit size={16} />}
                    onClick={() => handleEditChat(chat)}
                  >
                    Editar
                  </BFButton>
                </div>
              </BFCard>
            ))
          )}
        </div>
      </BFCard>

      {/* Edit Chat Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Editar Chat</DialogTitle>
            <DialogDescription>{editingChat?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <BFInput
                label="Nome do Chat"
                value={chatName}
                onChange={(value) => setChatName(value)}
                fullWidth
                inputSize="lg"
              />
            </div>

            <div className="border-t border-[--border] pt-4">
              <h4 className="text-sm font-medium text-[--foreground] mb-3">Schedule</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <BFSelect
                    label="Dia da Semana"
                    value={scheduleWeekday}
                    onChange={(value) => setScheduleWeekday(String(value))}
                    options={weekdayOptions}
                  />
                </div>

                <div>
                  <BFTimeInput
                    label="Horário"
                    value={scheduleTime}
                    onChange={(value) => setScheduleTime(value)}
                  />
                </div>

                <div className="col-span-2">
                  <BFInput
                    label="Título"
                    value={scheduleTitle}
                    onChange={(value) => setScheduleTitle(value)}
                    placeholder="⚽ CAMPO DO VIANA"
                    fullWidth
                    inputSize="lg"
                  />
                </div>

                <div>
                  <BFMoneyInput
                    label="Preço (por jogador)"
                    value={schedulePrice}
                    onChange={(value) => setSchedulePrice(value)}
                    placeholder="14.00"
                  />
                </div>

                <div>
                  <BFInput
                    label="Chave PIX"
                    value={schedulePix}
                    onChange={(value) => setSchedulePix(value)}
                    placeholder="email@example.com"
                    fullWidth
                    inputSize="lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <BFButton variant="ghost" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </BFButton>
            <BFButton variant="primary" onClick={handleSaveChat}>
              Salvar
            </BFButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Chat Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Chat</DialogTitle>
            <DialogDescription>Configure um novo chat para este workspace</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <BFInput
                  label="Chat ID"
                  value={newChatId}
                  onChange={(value) => setNewChatId(value)}
                  placeholder="120363374853351602@g.us"
                  fullWidth
                  inputSize="lg"
                  helperText="ID do grupo/chat do WhatsApp"
                />
              </div>

              <div>
                <BFInput
                  label="Nome/Label"
                  value={newChatLabel}
                  onChange={(value) => setNewChatLabel(value)}
                  placeholder="Futebol - Terça"
                  fullWidth
                  inputSize="lg"
                />
              </div>
            </div>

            <div className="border-t border-[--border] pt-4">
              <h4 className="text-sm font-medium text-[--foreground] mb-3">Schedule</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <BFSelect
                    label="Dia da Semana"
                    value={scheduleWeekday}
                    onChange={(value) => setScheduleWeekday(String(value))}
                    options={weekdayOptions}
                  />
                </div>

                <div>
                  <BFTimeInput
                    label="Horário"
                    value={scheduleTime}
                    onChange={(value) => setScheduleTime(value)}
                  />
                </div>

                <div className="col-span-2">
                  <BFInput
                    label="Título"
                    value={scheduleTitle}
                    onChange={(value) => setScheduleTitle(value)}
                    placeholder="⚽ CAMPO DO VIANA"
                    fullWidth
                    inputSize="lg"
                  />
                </div>

                <div>
                  <BFMoneyInput
                    label="Preço (por jogador)"
                    value={schedulePrice}
                    onChange={(value) => setSchedulePrice(value)}
                    placeholder="14.00"
                  />
                </div>

                <div>
                  <BFInput
                    label="Chave PIX"
                    value={schedulePix}
                    onChange={(value) => setSchedulePix(value)}
                    placeholder="email@example.com"
                    fullWidth
                    inputSize="lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <BFButton variant="ghost" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </BFButton>
            <BFButton variant="primary" onClick={handleCreateChat}>
              Criar Chat
            </BFButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog (Organizze) */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurações do Workspace</DialogTitle>
            <DialogDescription>{workspace.name}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="organizze" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="organizze">Integração Organizze</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="py-4">
                <p className="text-[--muted-foreground]">
                  Configurações gerais em breve...
                </p>
              </div>
            </TabsContent>

            <TabsContent value="organizze" className="space-y-4">
              <div className="space-y-4 py-4">
                <div>
                  <BFInput
                    label="Email do Organizze"
                    value={organizzeEmail}
                    onChange={(value) => setOrganizzeEmail(value)}
                    placeholder="seu-email@example.com"
                    fullWidth
                  />
                </div>

                <div>
                  <BFInput
                    label="API Key do Organizze"
                    type="password"
                    value={organizzeApiKey}
                    onChange={(value) => setOrganizzeApiKey(value)}
                    placeholder={workspace.organizzeConfig?.hasApiKey ? '••••••••••••' : 'Sua API key'}
                    fullWidth
                  />
                  {workspace.organizzeConfig?.hasApiKey && (
                    <p className="text-xs text-[--muted-foreground] mt-1">
                      API key já configurada. Deixe em branco para manter a atual.
                    </p>
                  )}
                </div>

                <div>
                  <BFInput
                    label="Account ID"
                    type="number"
                    value={organizzeAccountId}
                    onChange={(value) => setOrganizzeAccountId(value)}
                    placeholder="9099386"
                    fullWidth
                  />
                </div>

                <div className="border-t border-[--border] pt-4 mt-4">
                  <h4 className="text-sm font-medium text-[--foreground] mb-3">
                    Mapeamento de Categorias
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <BFInput
                        label="Field Payment"
                        type="number"
                        value={categoryFieldPayment}
                        onChange={(value) => setCategoryFieldPayment(value)}
                        placeholder="152977750"
                        fullWidth
                      />
                    </div>

                    <div>
                      <BFInput
                        label="Player Payment"
                        type="number"
                        value={categoryPlayerPayment}
                        onChange={(value) => setCategoryPlayerPayment(value)}
                        placeholder="152977751"
                        fullWidth
                      />
                    </div>

                    <div>
                      <BFInput
                        label="Player Debt"
                        type="number"
                        value={categoryPlayerDebt}
                        onChange={(value) => setCategoryPlayerDebt(value)}
                        placeholder="152977752"
                        fullWidth
                      />
                    </div>

                    <div>
                      <BFInput
                        label="General"
                        type="number"
                        value={categoryGeneral}
                        onChange={(value) => setCategoryGeneral(value)}
                        placeholder="152977753"
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                {workspace.organizzeConfig?.hasApiKey && (
                  <BFButton
                    variant="danger"
                    onClick={() => setConfirmDisableDialogOpen(true)}
                  >
                    Desativar Integração
                  </BFButton>
                )}
                <div className="flex gap-2">
                  <BFButton variant="secondary" onClick={() => setSettingsDialogOpen(false)}>
                    Cancelar
                  </BFButton>
                  <BFButton variant="primary" onClick={handleSaveOrganizzeSettings}>
                    Salvar Configurações
                  </BFButton>
                </div>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDisableDialogOpen} onOpenChange={setConfirmDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar Integração</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desativar a integração com o Organizze?
              Todas as configurações e mapeamentos de categorias serão removidos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <BFButton variant="secondary" onClick={() => setConfirmDisableDialogOpen(false)}>
              Cancelar
            </BFButton>
            <BFButton variant="danger" onClick={handleDisableOrganizze}>
              Sim, desativar
            </BFButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceDetail;
