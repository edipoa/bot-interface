import React, { useState } from 'react';
import { BFCard } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFBadge } from '../components/BF-Badge';
import { BFTable } from '../components/BF-Table';
import { BFIcons } from '../components/BF-Icons';
import { mockPlayers } from '../lib/mockData';
import type { Player } from '../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const ManagePlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || player.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Player['status']) => {
    const statusMap = {
      active: { variant: 'success' as const, label: 'Ativo' },
      inactive: { variant: 'neutral' as const, label: 'Inativo' },
      suspended: { variant: 'error' as const, label: 'Suspenso' },
    };
    const config = statusMap[status];
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  const columns = [
    {
      key: 'name',
      label: 'Jogador',
      sortable: true,
      render: (_: any, row: Player) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[--primary]/10 flex items-center justify-center">
            <span className="text-[--primary]">{row.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-[--foreground]">{row.name}</p>
            <p className="text-[--muted-foreground]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Contato',
      render: (value: string, row: Player) => (
        <div>
          <p className="text-[--foreground]">{value}</p>
          <p className="text-[--muted-foreground]">{row.cpf}</p>
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
    <div className="space-y-6" data-test="manage-players">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[--foreground] mb-2">Gerenciar Jogadores</h1>
          <p className="text-[--muted-foreground]">
            Adicione e gerencie jogadores do sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <BFButton
              variant="primary"
              icon={<BFIcons.Plus size={20} />}
              data-test="create-player-button"
            >
              Novo Jogador
            </BFButton>
          </DialogTrigger>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BFCard variant="stat" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BFIcons.Users size={20} color="white" />
            </div>
            <div>
              <p className="text-white/80">Total</p>
              <h3 className="text-white">{players.length}</h3>
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
              <h3 className="text-[--foreground]">
                {players.filter((p) => p.status === 'active').length}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--warning]/10 p-2 rounded-lg">
              <BFIcons.AlertCircle size={20} color="var(--warning)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Com Débitos</p>
              <h3 className="text-[--foreground]">
                {players.filter((p) => p.totalDebt > 0).length}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--destructive]/10 p-2 rounded-lg">
              <BFIcons.XCircle size={20} color="var(--destructive)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Suspensos</p>
              <h3 className="text-[--foreground]">
                {players.filter((p) => p.status === 'suspended').length}
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
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<BFIcons.Search size={20} />}
              fullWidth
              data-test="search-players"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-test="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="suspended">Suspensos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <BFButton
            variant="outline"
            icon={<BFIcons.Download size={20} />}
            data-test="export-players"
          >
            Exportar
          </BFButton>
        </div>
      </BFCard>

      {/* Table */}
      <BFCard variant="elevated" padding="none">
        <BFTable
          columns={columns}
          data={filteredPlayers}
          onRowClick={(player) => console.log('View player:', player)}
          actions={(row: Player) => (
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-[--accent] rounded-md transition-colors"
                title="Editar"
                data-test={`edit-player-${row.id}`}
              >
                <BFIcons.Edit size={18} color="var(--primary)" />
              </button>
              <button
                className="p-2 hover:bg-[--accent] rounded-md transition-colors"
                title="Ver Débitos"
                data-test={`view-debts-${row.id}`}
              >
                <BFIcons.DollarSign size={18} color="var(--warning)" />
              </button>
              <button
                className="p-2 hover:bg-[--accent] rounded-md transition-colors"
                title="Deletar"
                data-test={`delete-player-${row.id}`}
              >
                <BFIcons.Trash2 size={18} color="var(--destructive)" />
              </button>
            </div>
          )}
          data-test="players-table"
        />
      </BFCard>
    </div>
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
