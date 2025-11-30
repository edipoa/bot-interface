import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFBadge } from '../components/BF-Badge';
import { BFIcons } from '../components/BF-Icons';
import { BFListView } from '../components/BFListView';
import type { BFListViewColumn, BFListViewStat } from '../components/BFListView';
import { EditPlayerModal } from '../components/EditPlayerModal';
import { playersAPI } from '../lib/axios';
import type { Player } from '../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export const ManagePlayers: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withDebts: 0,
    suspended: 0
  });
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchPlayers();
  }, [debouncedSearchTerm, filterStatus, pagination.page]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await playersAPI.getPlayers({
        search: debouncedSearchTerm || undefined,
        status: filterStatus as 'active' | 'inactive' | 'all',
        page: pagination.page,
        limit: pagination.limit,
      });

      setPlayers(response.players || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      });

      setStats({
        total: response.total || 0,
        active: response.activeCount || 0,
        withDebts: response.withDebtsCount || 0,
        suspended: response.inactiveCount || 0,
      });
    } catch (error: any) {
      console.error('Error fetching players:', error);
      toast.error(error.response?.data?.message || 'Erro ao carregar jogadores');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      setIsDeleting(true);
      await playersAPI.deletePlayer(playerToDelete.id);
      toast.success(`${playerToDelete.name} foi excluído com sucesso!`);
      setPlayerToDelete(null);
      fetchPlayers();
    } catch (error: any) {
      console.error('Error deleting player:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir jogador');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavePlayer = async (updatedData: Partial<Player>) => {
    if (!playerToEdit) return;

    await playersAPI.updatePlayer(playerToEdit.id, {
      name: updatedData.name,
      nick: updatedData.nick,
      phone: updatedData.phone,
      status: updatedData.status,
      isGoalie: updatedData.isGoalie,
    });
    toast.success('Jogador atualizado com sucesso!');
    setPlayerToEdit(null);
    fetchPlayers();
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

  const getStatusBadge = (status: Player['status']) => {
    const statusMap = {
      active: { variant: 'success' as const, label: 'Ativo' },
      inactive: { variant: 'neutral' as const, label: 'Inativo' },
      suspended: { variant: 'error' as const, label: 'Suspenso' },
    };
    const config = statusMap[status];
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  // Configure statistics for BFListView
  const listStats: BFListViewStat[] = [
    {
      label: 'Total',
      value: stats.total,
      icon: <BFIcons.Users size={20} color="white" />,
      iconBgColor: 'white/20',
      variant: 'stat',
      labelColor: 'white/80',
      valueColor: 'white',
    },
    {
      label: 'Ativos',
      value: stats.active,
      icon: <BFIcons.CheckCircle size={20} color="var(--success)" />,
      iconBgColor: 'var(--success)/10',
      variant: 'elevated'
    },
    {
      label: 'Com Débitos',
      value: stats.withDebts,
      icon: <BFIcons.AlertCircle size={20} color="var(--warning)" />,
      iconBgColor: 'var(--warning)/10',
      variant: 'elevated'
    },
    {
      label: 'Inativos',
      value: stats.suspended,
      icon: <BFIcons.XCircle size={20} color="var(--destructive)" />,
      iconBgColor: 'var(--destructive)/10',
      variant: 'elevated'
    },
  ];

  // Configure columns for BFListView
  const columns: BFListViewColumn<Player>[] = [
    {
      key: 'name',
      label: 'Jogador',
      sortable: true,
      render: (_: any, row: Player) => (
        <div className="flex items-center gap-3">
          {row.profilePicture ? (
            <img
              src={row.profilePicture}
              alt={row.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-white font-semibold">{row.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="text-[--foreground] font-medium">{row.name}</p>
            <p className="text-[--muted-foreground] text-sm">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Contato',
      render: (value: string, row: Player) => (
        <div>
          <p className="text-[--foreground]">{formatPhone(value)}</p>
          {row.cpf && <p className="text-[--muted-foreground] text-sm">{row.cpf}</p>}
        </div>
      ),
    },
    {
      key: 'totalDebt',
      label: 'Débito',
      sortable: true,
      render: (value: number) => (
        <span className={value > 0 ? 'text-[--destructive]' : 'text-[--success]'}>
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Última Atividade',
      sortable: true,
      render: (value: string) => (
        <span className="text-[--muted-foreground]">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: Player['status']) => getStatusBadge(value),
    },
  ];

  return (
    <>
      <BFListView
        title="Gerenciar Jogadores"
        description="Adicione e gerencie jogadores do sistema"
        createButton={{
          label: 'Novo Jogador',
          onClick: () => setIsCreateDialogOpen(true),
        }}
        stats={listStats}
        searchPlaceholder="Buscar por nome ou telefone..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={{
          value: filterStatus,
          onChange: setFilterStatus,
          options: [
            { value: 'all', label: 'Todos' },
            { value: 'active', label: 'Ativos' },
            { value: 'inactive', label: 'Inativos' },
          ],
        }}
        columns={columns}
        data={players}
        loading={loading}
        emptyState={{
          icon: <BFIcons.Users size={48} className="text-muted-foreground mb-3" />,
          message: 'Nenhum jogador encontrado',
          submessage: (debouncedSearchTerm || filterStatus !== 'all') ? 'Tente ajustar os filtros de busca' : undefined,
        }}
        onRowClick={(player) => navigate(`/admin/players/${player.id}`)}
        rowActions={(row: Player) => (
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
              title="Ver Detalhes"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/players/${row.id}`);
              }}
              data-test={`view-player-${row.id}`}
            >
              <BFIcons.Eye size={18} color="var(--primary)" />
            </button>
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
              title="Editar"
              onClick={(e) => {
                e.stopPropagation();
                setPlayerToEdit(row);
              }}
              data-test={`edit-player-${row.id}`}
            >
              <BFIcons.Edit size={18} color="var(--primary)" />
            </button>
            <button
              className="p-2 hover:bg-[--accent] rounded-md transition-colors cursor-pointer"
              title="Deletar"
              onClick={(e) => {
                e.stopPropagation();
                setPlayerToDelete(row);
              }}
              data-test={`delete-player-${row.id}`}
            >
              <BFIcons.Trash2 size={18} color="var(--destructive)" />
            </button>
          </div>
        )}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
          onPageChange: handlePageChange,
        }}
        dataTest="manage-players"
      />

      {/* Create Player Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Jogador</DialogTitle>
            <DialogDescription>
              Preencha as informações do jogador abaixo
            </DialogDescription>
          </DialogHeader>
          <CreatePlayerForm onClose={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!playerToDelete} onOpenChange={() => setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{playerToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlayer}
              disabled={isDeleting}
              className="bg-[--destructive] text-white hover:bg-[--destructive]/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditPlayerModal
        player={playerToEdit}
        isOpen={!!playerToEdit}
        onClose={() => setPlayerToEdit(null)}
        onSave={handleSavePlayer}
      />
    </>
  );
};

const CreatePlayerForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BFInput label="Nome Completo" placeholder="João Silva" fullWidth required data-test="player-name" />
        <BFInput label="Email" type="email" placeholder="joao@email.com" fullWidth required data-test="player-email" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BFInput label="Telefone" placeholder="(11) 98765-4321" fullWidth required data-test="player-phone" />
        <BFInput label="CPF" placeholder="123.456.789-00" fullWidth data-test="player-cpf" />
      </div>

      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Status Inicial" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="inactive">Inativo</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex justify-end gap-3 pt-4">
        <BFButton variant="ghost" onClick={onClose} type="button">
          Cancelar
        </BFButton>
        <BFButton variant="primary" type="submit" data-test="submit-create-player">
          Adicionar Jogador
        </BFButton>
      </div>
    </form>
  );
};
