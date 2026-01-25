import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFSelect } from '../components/BF-Select';
import { BFDateInput } from '../components/BF-DateInput';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFBadge } from '../components/BF-Badge';
import { BFIcons } from '../components/BF-Icons';
import { BFListView } from '../components/BFListView';
import type { BFListViewColumn, BFListViewStat } from '../components/BFListView';
import { gamesAPI, chatsAPI, workspacesAPI } from '../lib/axios';
import type { Game } from '../lib/types';
import { formatDateWithoutTimezone } from '../lib/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { toast } from 'sonner';

interface ManageGamesProps {
  onSelectGame?: (gameId: string) => void;
}

export const ManageGames: React.FC<ManageGamesProps> = ({ onSelectGame }) => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [deletingGame, setDeletingGame] = useState(false);
  const [gameToClose, setGameToClose] = useState<string | null>(null);
  const [closingGame, setClosingGame] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    finished: 0,
    cancelled: 0,
    upcoming: 0,
    activePlayers: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchGames();
    fetchStats();
  }, [pagination.page, filterStatus, debouncedSearchTerm]);

  const mapStatusToAPI = (frontendStatus: string): string | undefined => {
    if (frontendStatus === 'all') return undefined;
    const statusMap: Record<string, string> = {
      'scheduled': 'open',
      'completed': 'finished',
      'cancelled': 'cancelled',
      'closed': 'closed',
    };
    return statusMap[frontendStatus] || frontendStatus;
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const apiStatus = mapStatusToAPI(filterStatus);
      const response = await gamesAPI.getAllGames(
        pagination.page,
        pagination.limit,
        apiStatus,
        debouncedSearchTerm || undefined
      );

      const mappedGames = response.data.map((game: any) => ({
        id: game.id,
        workspaceId: game.workspaceId,
        name: game.name,
        type: 'futebol' as const,
        location: game.location ?? 'A definir',
        date: game.date,
        time: new Date(game.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
        maxPlayers: game.maxPlayers,
        currentPlayers: game.currentPlayers,
        pricePerPlayer: game.pricePerPlayer / 100,
        status: mapStatus(game.status),
        createdAt: game.createdAt,
      }));

      setGames(mappedGames);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await gamesAPI.getStats();
      console.log('Stats API Response:', response);
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const mapStatus = (apiStatus: string): Game['status'] => {
    const statusMap: Record<string, Game['status']> = {
      'open': 'scheduled',
      'finished': 'completed',
      'cancelled': 'cancelled',
      'closed': 'closed',
    };
    return statusMap[apiStatus] || 'scheduled';
  };

  const handleDeleteGame = async () => {
    if (!gameToDelete) return;

    const game = games.find(g => g.id === gameToDelete);
    if (!game) return;

    try {
      setDeletingGame(true);
      await gamesAPI.deleteGame(gameToDelete, game.workspaceId);
      toast.success('🚫 Jogo cancelado com sucesso!');
      setGameToDelete(null);
      fetchGames();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao cancelar jogo');
    } finally {
      setDeletingGame(false);
    }
  };

  const handleCloseGame = async () => {
    if (!gameToClose) return;

    const game = games.find(g => g.id === gameToClose);
    if (!game) return;

    try {
      setClosingGame(true);
      await gamesAPI.closeGame(gameToClose, game.workspaceId);
      toast.success('✅ Jogo fechado com sucesso!');
      setGameToClose(null);
      fetchGames();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fechar jogo');
    } finally {
      setClosingGame(false);
    }
  };

  const getStatusBadge = (status: Game['status']) => {
    const statusMap = {
      scheduled: { variant: 'info' as const, label: 'Agendado' },
      completed: { variant: 'success' as const, label: 'Concluído' },
      cancelled: { variant: 'error' as const, label: 'Cancelado' },
      closed: { variant: 'warning' as const, label: 'Aguardando Pagamentos' },
    };
    const config = statusMap[status];
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  const getTypeBadge = (type: Game['type']) => {
    const typeMap = {
      futebol: '⚽ Futebol',
      basquete: '🏀 Basquete',
      volei: '🏐 Vôlei',
      outros: '🎯 Outros',
    };
    return <BFBadge variant="neutral">{typeMap[type]}</BFBadge>;
  };

  // Configure statistics for BFListView
  const listStats: BFListViewStat[] = [
    {
      label: 'Agendados',
      value: stats.open || 0,
      icon: <BFIcons.Calendar size={20} color="var(--info)" />,
      iconBgColor: 'var(--info)/10',
      variant: 'elevated',
    },
    {
      label: 'Concluídos',
      value: stats.finished || 0,
      icon: <BFIcons.CheckCircle size={20} color="var(--success)" />,
      iconBgColor: 'var(--success)/10',
      variant: 'elevated',
    },
    {
      label: 'Cancelados',
      value: stats.cancelled || 0,
      icon: <BFIcons.XCircle size={20} color="var(--destructive)" />,
      iconBgColor: 'var(--destructive)/10',
      variant: 'elevated',
    },
    {
      label: 'Total Jogadores',
      value: stats.activePlayers || 0,
      icon: <BFIcons.Users size={20} color="var(--primary)" />,
      iconBgColor: 'var(--primary)/10',
      variant: 'elevated',
    },
  ];

  // Configure columns for BFListView
  const columns: BFListViewColumn<Game>[] = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (_: any, row: Game) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[--primary]/10 flex items-center justify-center">
            <BFIcons.Calendar size={20} color="var(--primary)" />
          </div>
          <div>
            <p className="text-[--foreground] font-medium">{row.name}</p>
            <p className="text-[--muted-foreground] text-sm">{row.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value: Game['type']) => getTypeBadge(value),
    },
    {
      key: 'date',
      label: 'Data/Hora',
      sortable: true,
      render: (_: any, row: Game) => (
        <div>
          <p className="text-[--foreground]">
            {formatDateWithoutTimezone(row.date)}
          </p>
          <p className="text-[--muted-foreground]">{row.time}</p>
        </div>
      ),
    },
    {
      key: 'currentPlayers',
      label: 'Jogadores',
      render: (_: any, row: Game) => (
        <div className="flex items-center gap-2">
          <span className="text-[--foreground]">
            {row.currentPlayers}/{row.maxPlayers}
          </span>
          {row.currentPlayers >= row.maxPlayers && (
            <BFBadge variant="success" size="sm">
              Completo
            </BFBadge>
          )}
        </div>
      ),
    },
    {
      key: 'pricePerPlayer',
      label: 'Valor',
      sortable: true,
      render: (value: number) => (
        <span className="text-[--foreground]">
          R$ {(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: Game['status']) => getStatusBadge(value),
    },
  ];

  return (
    <>
      <BFListView
        title="Gerenciar Jogos"
        description="Crie e gerencie jogos e eventos esportivos"
        createButton={{
          label: 'Novo Jogo',
          onClick: () => setIsCreateDialogOpen(true),
        }}
        stats={listStats}
        searchPlaceholder="Buscar por nome ou local..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={{
          value: filterStatus,
          onChange: setFilterStatus,
          options: [
            { value: 'all', label: 'Todos' },
            { value: 'scheduled', label: 'Agendado' },
            { value: 'closed', label: 'Aguardando Pagamentos' },
            { value: 'completed', label: 'Concluído' },
            { value: 'cancelled', label: 'Cancelado' },
          ],
        }}
        columns={columns}
        data={games}
        loading={loading}
        onRowClick={onSelectGame ? (row: Game) => onSelectGame(row.id) : undefined}
        rowActions={(row: Game) => (
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
              title="Ver Detalhes"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/games/${row.id}`);
              }}
              data-test={`view-game-${row.id}`}
            >
              <BFIcons.Eye size={18} color="var(--primary)" />
            </button>
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cancelar Jogo"
              onClick={(e) => {
                e.stopPropagation();
                setGameToDelete(row.id);
              }}
              disabled={row.status === 'cancelled' || row.status === 'completed' || row.status === 'closed'}
              data-test={`cancel-game-${row.id}`}
            >
              <BFIcons.XCircle size={18} color="var(--destructive)" />
            </button>
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Fechar Jogo"
              onClick={(e) => {
                e.stopPropagation();
                setGameToClose(row.id);
              }}
              disabled={row.status === 'cancelled' || row.status === 'completed' || row.status === 'closed'}
              data-test={`close-game-${row.id}`}
            >
              <BFIcons.CheckCircle size={18} color="var(--success)" />
            </button>
          </div>
        )}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
          onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
        }}
        dataTest="manage-games"
      />

      {/* Create Game Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Jogo</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para criar um novo jogo
            </DialogDescription>
          </DialogHeader>
          <CreateGameForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              fetchGames();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de cancelamento */}
      <AlertDialog open={!!gameToDelete} onOpenChange={(open) => !open && setGameToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Jogo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este jogo? Esta ação não pode ser desfeita e todos os jogadores serão notificados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingGame}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGame}
              disabled={deletingGame}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingGame ? 'Cancelando...' : 'Sim, cancelar jogo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de fechamento */}
      <AlertDialog open={!!gameToClose} onOpenChange={(open) => !open && setGameToClose(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fechar Jogo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja fechar este jogo? O jogo será marcado como concluído e os débitos serão registrados para os jogadores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closingGame}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseGame}
              disabled={closingGame}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {closingGame ? 'Fechando...' : 'Sim, fechar jogo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const CreateGameForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    type: '',
    date: '',
    time: '',
    location: '',
    maxPlayers: '',
    pricePerPlayer: '',
    priceInCents: 0,
    chatId: '',
    workspaceId: ''
  });
  const [chats, setChats] = React.useState<Array<{
    id: string;
    chatId: string;
    name: string;
    schedule?: {
      title: string;
      priceCents: number;
      time: string;
      weekday: number;
    }
  }>>([]);
  const [workspaces, setWorkspaces] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingChats, setLoadingChats] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const workspacesResponse = await workspacesAPI.getAllWorkspaces();
        setWorkspaces(workspacesResponse.workspaces || []);
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError('Erro ao carregar workspaces');
      }
    };
    fetchWorkspaces();
  }, []);

  React.useEffect(() => {
    const fetchChats = async () => {
      if (!formData.workspaceId) {
        setChats([]);
        return;
      }

      setLoadingChats(true);
      try {
        const chatsResponse = await chatsAPI.getChatsByWorkspace(formData.workspaceId);
        setChats(chatsResponse.chats || []);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Erro ao carregar chats');
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, [formData.workspaceId]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'workspaceId') {
        newData.chatId = '';
      }
      return newData;
    });
    setError(null);
  };

  const handleChatChange = (chatId: string) => {
    const selectedChat = chats.find(c => c.chatId === chatId);

    setFormData(prev => {
      const newData = { ...prev, chatId };

      if (selectedChat?.schedule) {
        if (selectedChat.schedule.title) {
          newData.name = selectedChat.schedule.title;
        }
        if (selectedChat.schedule.priceCents) {
          newData.priceInCents = selectedChat.schedule.priceCents;
          newData.pricePerPlayer = (selectedChat.schedule.priceCents / 100).toFixed(2).replace('.', ',');
        }
        if (selectedChat.schedule.time) {
          newData.time = selectedChat.schedule.time;
        }

        // Calculate next date based on weekday
        if (selectedChat.schedule.weekday !== undefined) {
          const today = new Date();
          const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
          const targetDay = selectedChat.schedule.weekday;

          let daysUntilTarget = targetDay - currentDay;
          if (daysUntilTarget <= 0) {
            daysUntilTarget += 7;
          }

          const nextDate = new Date(today);
          nextDate.setDate(today.getDate() + daysUntilTarget);

          // Format as YYYY-MM-DD
          const formattedDate = nextDate.toISOString().split('T')[0];
          newData.date = formattedDate;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await gamesAPI.createGame({
        name: formData.name,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        maxPlayers: parseInt(formData.maxPlayers),
        pricePerPlayer: formData.priceInCents,
        chatId: formData.chatId,
        workspaceId: formData.workspaceId
      });

      toast.success('🎉 Jogo agendado com sucesso!');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar jogo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <BFAlertMessage variant="error" message={error} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BFSelect
          label="Workspace"
          options={workspaces.map(ws => ({ value: ws.id, label: ws.name }))}
          value={formData.workspaceId}
          onChange={(val) => handleChange('workspaceId', String(val))}
          placeholder="Selecione o workspace"
        />
        <BFSelect
          label="Chat"
          options={chats.map(chat => ({ value: chat.chatId, label: chat.name }))}
          value={formData.chatId}
          onChange={(val) => handleChatChange(String(val))}
          placeholder={loadingChats ? 'Carregando chats...' : formData.workspaceId ? 'Selecione o chat' : 'Selecione o workspace primeiro'}
          disabled={!formData.workspaceId || loadingChats}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <BFInput
          label="Nome do Jogo"
          placeholder="Ex: Pelada Sábado"
          value={formData.name}
          onChange={(val) => handleChange('name', val)}
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BFSelect
          label="Tipo de Jogo"
          options={[
            { value: 'society', label: 'Society' },
            { value: 'campo', label: 'Campo' },
            { value: 'futsal', label: 'Futsal' }
          ]}
          value={formData.type}
          onChange={(val) => handleChange('type', String(val))}
          placeholder="Selecione o tipo"
        />
        <BFInput
          label="Local"
          placeholder="Ex: Campo do Parque Central"
          value={formData.location}
          onChange={(val) => handleChange('location', val)}
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BFDateInput
          label="Data"
          value={formData.date}
          onChange={(val) => handleChange('date', val)}
          fullWidth
          required
        />
        <BFInput
          label="Horário"
          type="time"
          value={formData.time}
          onChange={(val) => handleChange('time', val)}
          fullWidth
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BFMoneyInput
          label="Valor por Jogador"
          placeholder="15,00"
          value={formData.pricePerPlayer}
          onChange={(val, cents) => {
            setFormData(prev => ({ ...prev, pricePerPlayer: val, priceInCents: cents }));
            setError(null);
          }}
          showCentsPreview={false}
          helperText="Digite o valor em reais (ex: 15,00)"
        />
        <BFInput
          label="Máximo de Jogadores"
          type="number"
          placeholder="20"
          value={formData.maxPlayers}
          onChange={(val) => handleChange('maxPlayers', val)}
          fullWidth
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <BFButton variant="ghost" onClick={onClose} type="button" disabled={loading}>
          Cancelar
        </BFButton>
        <BFButton variant="primary" type="submit" disabled={loading} data-test="submit-create-game">
          {loading ? 'Criando...' : 'Criar Jogo'}
        </BFButton>
      </div>
    </form>
  );
};
