import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BFCard } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFSelect } from '../components/BF-Select';
import { BFDateInput } from '../components/BF-DateInput';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFBadge } from '../components/BF-Badge';
import { BFTable } from '../components/BF-Table';
import { BFIcons } from '../components/BF-Icons';
import { gamesAPI, chatsAPI, workspacesAPI } from '../lib/axios';
import type { Game } from '../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
        name: game.name,
        type: 'futebol' as const,
        location: game.location ?? 'A definir',
        date: game.date,
        time: game.time,
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

    try {
      setDeletingGame(true);
      await gamesAPI.deleteGame(gameToDelete);
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

    try {
      setClosingGame(true);
      await gamesAPI.closeGame(gameToClose);
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

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (_: any, row: Game) => (
        <div>
          <p className="text-[--foreground]">{row.name}</p>
          <p className="text-[--muted-foreground]">{row.location}</p>
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
            {new Date(row.date).toLocaleDateString('pt-BR')}
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
    <div className="space-y-6" data-test="manage-games">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[--foreground] mb-2">Gerenciar Jogos</h1>
          <p className="text-[--muted-foreground]">
            Crie e gerencie jogos e eventos esportivos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <BFButton
              variant="primary"
              icon={<BFIcons.Plus size={20} />}
              data-test="create-game-button"
            >
              Novo Jogo
            </BFButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BFCard variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--info]/10 p-2 rounded-lg">
              <BFIcons.Calendar size={20} color="var(--info)" />
            </div>
            <div>
              <p className="text-sm text-[--muted-foreground]">Agendados</p>
              <h3 className="text-xl font-semibold text-[--foreground]">
                {stats.open || 0}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--success]/10 p-2 rounded-lg">
              <BFIcons.CheckCircle size={20} color="var(--success)" />
            </div>
            <div>
              <p className="text-sm text-[--muted-foreground]">Concluídos</p>
              <h3 className="text-xl font-semibold text-[--foreground]">
                {stats.finished || 0}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--destructive]/10 p-2 rounded-lg">
              <BFIcons.XCircle size={20} color="var(--destructive)" />
            </div>
            <div>
              <p className="text-sm text-[--muted-foreground]">Cancelados</p>
              <h3 className="text-xl font-semibold text-[--foreground]">
                {stats.cancelled || 0}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--primary]/10 p-2 rounded-lg">
              <BFIcons.Users size={20} color="var(--primary)" />
            </div>
            <div>
              <p className="text-sm text-[--muted-foreground]">Total Jogadores</p>
              <h3 className="text-xl font-semibold text-[--foreground]">
                {stats.activePlayers || 0}
              </h3>
            </div>
          </div>
        </BFCard>
      </div>

      {/* Filters */}
      <BFCard variant="elevated" padding="lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <BFInput
              placeholder="Buscar por nome ou local..."
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              icon={<BFIcons.Search size={20} />}
              fullWidth
              data-test="search-games"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-test="filter-status" className="h-10 border border-[--border] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="closed">Aguardando Pagamentos</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </BFCard>

      {/* Table */}
      <BFCard variant="elevated" padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-[--muted-foreground]">Carregando jogos...</p>
            </div>
          </div>
        ) : (
          <>
            <BFTable
              columns={columns}
              data={games}
              onRowClick={onSelectGame ? (row: Game) => onSelectGame(row.id) : undefined}
              actions={(row: Game) => (
                <div className="flex items-center gap-2">
                  <BFButton
                    variant="secondary"
                    size="sm"
                    icon={<BFIcons.Eye size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/games/${row.id}`);
                    }}
                    data-test={`view-game-${row.id}`}
                  >
                    Ver detalhes
                  </BFButton>
                  <BFButton
                    variant="danger"
                    size="sm"
                    icon={<BFIcons.XCircle size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGameToDelete(row.id);
                    }}
                    disabled={row.status === 'cancelled' || row.status === 'completed' || row.status === 'closed'}
                    data-test={`cancel-game-${row.id}`}
                  >
                    Cancelar
                  </BFButton>
                  <BFButton
                    variant="success"
                    size="sm"
                    icon={<BFIcons.CheckCircle size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGameToClose(row.id);
                    }}
                    disabled={row.status === 'cancelled' || row.status === 'completed' || row.status === 'closed'}
                    data-test={`close-game-${row.id}`}
                  >
                    Fechar
                  </BFButton>
                </div>
              )}
              data-test="games-table"
            />
            
            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[--border]">
                <p className="text-sm text-[--muted-foreground]">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} jogos
                </p>
                <div className="flex items-center gap-2">
                  <BFButton
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </BFButton>
                  <span className="text-sm text-[--foreground] px-3">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <BFButton
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Próxima
                  </BFButton>
                </div>
              </div>
            )}
          </>
        )}
      </BFCard>

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
    </div>
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
  const [chats, setChats] = React.useState<Array<{ id: string; chatId: string; name: string }>>([]);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          onChange={(val) => handleChange('chatId', String(val))}
          placeholder={loadingChats ? 'Carregando chats...' : formData.workspaceId ? 'Selecione o chat' : 'Selecione o workspace primeiro'}
          disabled={!formData.workspaceId || loadingChats}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
