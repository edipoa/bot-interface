import React, { useState, useMemo } from 'react';
import { BFHeaderBar } from '../components/BF-HeaderBar';
import { BFSearchInput } from '../components/BF-SearchInput';
import { BFWorkspaceCard } from '../components/BF-WorkspaceCard';
import { BFButton } from '../components/BF-Button';
import { BFBadge } from '../components/BF-Badge';
import { BFCard } from '../components/BF-Card';
import { BFIcons } from '../components/BF-Icons';
import { mockWorkspaces, mockChats } from '../lib/mockData';
import type { Chat } from '../lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

interface WorkspaceDetailProps {
  workspaceId?: string;
  onBack?: () => void;
}

export const WorkspaceDetail: React.FC<WorkspaceDetailProps> = ({
  workspaceId = '1',
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [selectedChatForDebts, setSelectedChatForDebts] = useState<Chat | null>(null);
  const [selectedChatToOpen, setSelectedChatToOpen] = useState<Chat | null>(null);

  const workspace = mockWorkspaces.find((w) => w.id === workspaceId);
  const allChats = mockChats.filter((c) => c.workspaceId === workspaceId);

  const filteredChats = useMemo(() => {
    return allChats.filter((chat) => {
      const matchesSearch =
        chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.chatId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chat.label && chat.label.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
      const matchesType = typeFilter === 'all' || chat.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allChats, searchTerm, statusFilter, typeFilter]);

  const stats = {
    total: allChats.length,
    active: allChats.filter((c) => c.status === 'active').length,
    inactive: allChats.filter((c) => c.status === 'inactive').length,
    archived: allChats.filter((c) => c.status === 'archived').length,
    totalMembers: allChats.reduce((sum, c) => sum + c.memberCount, 0),
  };

  const handleDeleteChat = (chatId: string) => {
    const chat = allChats.find((c) => c.id === chatId);
    if (chat) {
      setChatToDelete(chat);
    }
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      console.log('Deletando chat:', chatToDelete.id);
      setChatToDelete(null);
    }
  };

  const handleOpenChat = (chatId: string) => {
    const chat = allChats.find((c) => c.id === chatId);
    if (chat) {
      setSelectedChatToOpen(chat);
      console.log('Abrindo chat:', chat);
    }
  };

  const handleViewDebts = (chatId: string) => {
    const chat = allChats.find((c) => c.id === chatId);
    if (chat) {
      setSelectedChatForDebts(chat);
      console.log('Visualizando débitos do chat:', chat);
    }
  };

  const getPlatformIcon = () => {
    if (!workspace) return <BFIcons.MessageSquare size={24} color="white" />;
    const icons = {
      whatsapp: <BFIcons.MessageSquare size={24} color="white" />,
      telegram: <BFIcons.MessageSquare size={24} color="white" />,
      discord: <BFIcons.MessageSquare size={24} color="white" />,
    };
    return icons[workspace.platform];
  };

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-[--foreground] mb-2">Workspace não encontrado</h2>
          <BFButton variant="primary" onClick={onBack}>
            Voltar
          </BFButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--background]" data-test="workspace-detail">
      {/* Header Bar */}
      <BFHeaderBar
        title={workspace.name}
        subtitle={workspace.description}
        icon={getPlatformIcon()}
        badge={{
          text: workspace.status === 'active' ? 'Ativo' : workspace.status === 'maintenance' ? 'Manutenção' : 'Inativo',
          variant: workspace.status === 'active' ? 'success' : workspace.status === 'maintenance' ? 'warning' : 'neutral',
        }}
        onBack={onBack}
        actions={
          <>
            <BFButton
              variant="secondary"
              size="sm"
              icon={<BFIcons.RefreshCw size={16} />}
              data-test="sync-workspace"
            >
              Sincronizar
            </BFButton>
            <BFButton
              variant="ghost"
              size="sm"
              icon={<BFIcons.Settings size={16} />}
              data-test="workspace-settings"
            />
          </>
        }
        data-test="workspace-header"
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <BFCard variant="outlined" padding="md">
            <div className="flex items-center gap-3">
              <div className="bg-[--primary]/10 p-2 rounded-lg">
                <BFIcons.MessageSquare size={20} color="var(--primary)" />
              </div>
              <div>
                <p className="text-[--muted-foreground]">Total de Chats</p>
                <h3 className="text-[--foreground]">{stats.total}</h3>
              </div>
            </div>
          </BFCard>

          <BFCard variant="outlined" padding="md">
            <div className="flex items-center gap-3">
              <div className="bg-[--success]/10 p-2 rounded-lg">
                <BFIcons.CheckCircle size={20} color="var(--success)" />
              </div>
              <div>
                <p className="text-[--muted-foreground]">Ativos</p>
                <h3 className="text-[--foreground]">{stats.active}</h3>
              </div>
            </div>
          </BFCard>

          <BFCard variant="outlined" padding="md">
            <div className="flex items-center gap-3">
              <div className="bg-[--destructive]/10 p-2 rounded-lg">
                <BFIcons.Archive size={20} color="var(--destructive)" />
              </div>
              <div>
                <p className="text-[--muted-foreground]">Arquivados</p>
                <h3 className="text-[--foreground]">{stats.archived}</h3>
              </div>
            </div>
          </BFCard>

          <BFCard variant="outlined" padding="md">
            <div className="flex items-center gap-3">
              <div className="bg-[--info]/10 p-2 rounded-lg">
                <BFIcons.Users size={20} color="var(--info)" />
              </div>
              <div>
                <p className="text-[--muted-foreground]">Total Membros</p>
                <h3 className="text-[--foreground]">{stats.totalMembers}</h3>
              </div>
            </div>
          </BFCard>

          <BFCard variant="outlined" padding="md">
            <div className="flex items-center gap-3">
              <div className="bg-[--warning]/10 p-2 rounded-lg">
                <BFIcons.Clock size={20} color="var(--warning)" />
              </div>
              <div>
                <p className="text-[--muted-foreground]">Último Sync</p>
                <p className="text-[--foreground] text-sm">
                  {new Date(workspace.lastSync).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </BFCard>
        </div>

        {/* Search and Filters */}
        <BFCard variant="elevated" padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <BFSearchInput
                placeholder="Buscar por nome, ID ou label..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                data-test="search-chats"
              />
            </div>
            <div className="md:col-span-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-test="filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-test="filter-type">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="group">Grupo</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[--border]">
              <span className="text-sm text-[--muted-foreground]">Filtros ativos:</span>
              {searchTerm && (
                <BFBadge variant="neutral">
                  Busca: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <BFIcons.X size={12} />
                  </button>
                </BFBadge>
              )}
              {statusFilter !== 'all' && (
                <BFBadge variant="neutral">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <BFIcons.X size={12} />
                  </button>
                </BFBadge>
              )}
              {typeFilter !== 'all' && (
                <BFBadge variant="neutral">
                  Tipo: {typeFilter}
                  <button
                    onClick={() => setTypeFilter('all')}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  >
                    <BFIcons.X size={12} />
                  </button>
                </BFBadge>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="text-sm text-[--primary] hover:underline ml-auto"
              >
                Limpar todos
              </button>
            </div>
          )}
        </BFCard>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-[--muted-foreground]">
            Mostrando <span className="text-[--foreground]">{filteredChats.length}</span> de{' '}
            <span className="text-[--foreground]">{stats.total}</span> chats
          </p>
          <BFButton
            variant="primary"
            size="sm"
            icon={<BFIcons.Plus size={16} />}
            data-test="add-chat"
          >
            Adicionar Chat
          </BFButton>
        </div>

        {/* Chats Grid */}
        {filteredChats.length === 0 ? (
          <BFCard variant="elevated" padding="lg">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[--accent] rounded-full flex items-center justify-center mx-auto mb-4">
                <BFIcons.MessageSquare size={32} color="var(--muted-foreground)" />
              </div>
              <h3 className="text-[--foreground] mb-2">Nenhum chat encontrado</h3>
              <p className="text-[--muted-foreground] mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Adicione um novo chat para começar'}
              </p>
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <BFButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Limpar Filtros
                </BFButton>
              )}
            </div>
          </BFCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChats.map((chat) => (
              <BFWorkspaceCard
                key={chat.id}
                chat={chat}
                onOpenChat={handleOpenChat}
                onViewDebts={handleViewDebts}
                onDelete={handleDeleteChat}
                data-test={`chat-card-${chat.id}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!chatToDelete} onOpenChange={() => setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o chat <strong>{chatToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[--destructive] text-white hover:bg-[--destructive]/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Open Chat Dialog */}
      <Dialog open={!!selectedChatToOpen} onOpenChange={() => setSelectedChatToOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Chat</DialogTitle>
            <DialogDescription>
              Abrindo chat: {selectedChatToOpen?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-[--accent] p-4 rounded-lg">
              <p className="text-sm text-[--muted-foreground] mb-2">ID do Chat</p>
              <p className="text-[--foreground] font-mono">{selectedChatToOpen?.chatId}</p>
            </div>
            <div className="flex gap-2">
              <BFButton variant="primary" className="flex-1">
                Abrir no WhatsApp
              </BFButton>
              <BFButton variant="secondary" onClick={() => setSelectedChatToOpen(null)}>
                Fechar
              </BFButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Debts Dialog */}
      <Dialog open={!!selectedChatForDebts} onOpenChange={() => setSelectedChatForDebts(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Débitos do Chat</DialogTitle>
            <DialogDescription>
              Visualizando débitos de: {selectedChatForDebts?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <BFIcons.DollarSign size={48} color="var(--muted-foreground)" className="mx-auto mb-4" />
              <p className="text-[--muted-foreground]">
                Funcionalidade de débitos será implementada aqui
              </p>
            </div>
            <BFButton variant="secondary" onClick={() => setSelectedChatForDebts(null)} className="w-full">
              Fechar
            </BFButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
