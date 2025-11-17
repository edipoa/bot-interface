import React, { useState } from 'react';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFBadge } from '../components/BF-Badge';
import { BFTable } from '../components/BF-Table';
import { BFIcons } from '../components/BF-Icons';
import { mockGames } from '../lib/mockData';
import type { Game } from '../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface ManageGamesProps {
  onSelectGame?: (gameId: string) => void;
}

export const ManageGames: React.FC<ManageGamesProps> = ({ onSelectGame }) => {
  const [games, setGames] = useState<Game[]>(mockGames);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || game.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Game['status']) => {
    const statusMap = {
      scheduled: { variant: 'info' as const, label: 'Agendado' },
      'in-progress': { variant: 'primary' as const, label: 'Em Andamento' },
      completed: { variant: 'success' as const, label: 'Concluído' },
      cancelled: { variant: 'error' as const, label: 'Cancelado' },
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
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            <CreateGameForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--info]/10 p-2 rounded-lg">
              <BFIcons.Calendar size={20} color="var(--info)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Agendados</p>
              <h3 className="text-[--foreground]">
                {games.filter((g) => g.status === 'scheduled').length}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--success]/10 p-2 rounded-lg">
              <BFIcons.CheckCircle size={20} color="var(--success)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Concluídos</p>
              <h3 className="text-[--foreground]">
                {games.filter((g) => g.status === 'completed').length}
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
              <p className="text-[--muted-foreground]">Cancelados</p>
              <h3 className="text-[--foreground]">
                {games.filter((g) => g.status === 'cancelled').length}
              </h3>
            </div>
          </div>
        </BFCard>

        <BFCard variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="bg-[--primary]/10 p-2 rounded-lg">
              <BFIcons.Users size={20} color="var(--primary)" />
            </div>
            <div>
              <p className="text-[--muted-foreground]">Total Jogadores</p>
              <h3 className="text-[--foreground]">
                {games.reduce((sum, g) => sum + g.currentPlayers, 0)}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<BFIcons.Search size={20} />}
              fullWidth
              data-test="search-games"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger data-test="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </BFCard>

      {/* Table */}
      <BFCard variant="elevated" padding="none">
        <BFTable
          columns={columns}
          data={filteredGames}
          onRowClick={onSelectGame ? (row: Game) => onSelectGame(row.id) : undefined}
          actions={(row: Game) => (
            <div className="flex items-center gap-2">
              <BFButton
                variant="outline"
                size="sm"
                icon={<BFIcons.Eye size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectGame) onSelectGame(row.id);
                }}
                data-test={`view-game-${row.id}`}
              >
                Ver detalhes
              </BFButton>
              <BFButton
                variant="outline"
                size="sm"
                icon={<BFIcons.XCircle size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Cancelar jogo:', row.id);
                }}
                data-test={`cancel-game-${row.id}`}
              >
                Cancelar
              </BFButton>
              <BFButton
                variant="ghost"
                size="sm"
                icon={<BFIcons.CheckCircle size={16} />}
                onClick={() => console.log('Fechar jogo:', row.id)}
                data-test={`close-game-${row.id}`}
              >
                Fechar
              </BFButton>
            </div>
          )}
          data-test="games-table"
        />
      </BFCard>
    </div>
  );
};

const CreateGameForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BFInput label="Nome do Jogo" placeholder="Ex: Pelada Sábado" fullWidth required />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Esporte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="futebol">Futebol</SelectItem>
            <SelectItem value="basquete">Basquete</SelectItem>
            <SelectItem value="volei">Vôlei</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <BFInput label="Local" placeholder="Ex: Campo do Parque Central" fullWidth required />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BFInput label="Data" type="date" fullWidth required />
        <BFInput label="Horário" type="time" fullWidth required />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BFInput label="Valor por Jogador" type="number" placeholder="R$ 50.00" fullWidth required />
        <BFInput label="Máximo de Jogadores" type="number" placeholder="20" fullWidth required />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <BFButton variant="ghost" onClick={onClose} type="button">
          Cancelar
        </BFButton>
        <BFButton variant="primary" type="submit" data-test="submit-create-game">
          Criar Jogo
        </BFButton>
      </div>
    </form>
  );
};
