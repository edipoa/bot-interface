import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BFButton } from '../components/BF-Button';
import { BFBadge } from '../components/BF-Badge';
import { BFCard } from '../components/BF-Card';
import { BFTable } from '../components/BF-Table';
import { BFIcons } from '../components/BF-Icons';
import { playersAPI, tokenService } from '../lib/axios';
import type { Player } from '../lib/types'; // Updated type import
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import { BFInput } from '../components/BF-Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';


export const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const currentUser = tokenService.getUser();
  const isAdmin = currentUser?.role === 'admin';

  const [player, setPlayer] = useState<Player | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]); // Using any for now to match backend return
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    nick: '',
    email: '',
    phone: '',
    cpf: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    isGoalie: false,
    role: 'user' as 'admin' | 'user',
  });

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  const fetchPlayerData = async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      const [playerData, transactionsData] = await Promise.all([
        playersAPI.getPlayerById(playerId),
        playersAPI.getPlayerTransactions(playerId)
      ]);

      setPlayer(playerData);
      // Backend returns { ledgers: [], ... } or { transactions: [] }? Service returns { ledgers: ... }
      setTransactions(transactionsData.ledgers || transactionsData.transactions || []);

      setEditForm({
        name: playerData.name || '',
        nick: playerData.nick || '',
        email: playerData.email || '',
        phone: playerData.phone || '',
        cpf: playerData.cpf || '',
        status: playerData.status || 'active',
        isGoalie: playerData.isGoalie || false,
        role: playerData.role || 'user',
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados do jogador:', error);
      toast.error('Erro ao carregar dados do jogador');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlayer = async () => {
    if (!playerId) return;

    try {
      setIsSaving(true);
      await playersAPI.updatePlayer(playerId, {
        name: editForm.name,
        nick: editForm.nick,
        phoneE164: editForm.phone,
        status: editForm.status,
        isGoalie: editForm.isGoalie,
        role: editForm.role,
      });
      toast.success('Jogador atualizado com sucesso!');
      setIsEditModalOpen(false);
      fetchPlayerData();
    } catch (error: any) {
      console.error('Erro ao atualizar jogador:', error);
      toast.error('Erro ao atualizar jogador');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    const withoutCountry = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned;

    if (withoutCountry.length === 11) {
      return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 7)}-${withoutCountry.slice(7)}`;
    } else if (withoutCountry.length === 10) {
      return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 6)}-${withoutCountry.slice(6)}`;
    }
    return phone;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativo', variant: 'success' as const },
      inactive: { label: 'Inativo', variant: 'neutral' as const },
      suspended: { label: 'Suspenso', variant: 'error' as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'neutral' as const };
    return <BFBadge variant={statusInfo.variant}>{statusInfo.label}</BFBadge>;
  };

  const getTransactionStatusBadge = (status: string) => {
    return status === 'COMPLETED' ? (
      <BFBadge variant="success">Pago</BFBadge>
    ) : status === 'CANCELLED' ? (
      <BFBadge variant="neutral">Cancelado</BFBadge>
    ) : (
      <BFBadge variant="warning">Pendente</BFBadge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Jogador não encontrado</h2>
          <BFButton onClick={() => navigate('/admin/players')}>
            Voltar para lista
          </BFButton>
        </div>
      </div>
    );
  }

  const transactionColumns = [
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      render: (_: any, t: any) => formatDate(t.createdAt || t.dueDate),
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (_: any, t: any) => (
        <div className="font-medium">{t.description || 'Sem descrição'}</div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (_: any, t: any) => (
        <span className={t.type === 'INCOME' ? 'text-red-500' : 'text-green-500'}>
          {t.type === 'INCOME' ? 'Cobrança' : 'Crédito'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (_: any, t: any) => (
        <span className="font-semibold">{formatCurrency(t.amount / 100)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Situação',
      render: (_: any, t: any) => getTransactionStatusBadge(t.status),
    },
  ];

  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const completedCount = transactions.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BFButton
            variant="secondary"
            onClick={() => navigate('/admin/players')}
            icon={<BFIcons.ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">Voltar</span>
          </BFButton>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Detalhes do Jogador</h1>
        </div>

        {isAdmin && (
          <BFButton
            variant="primary"
            onClick={() => setIsEditModalOpen(true)}
            icon={<BFIcons.Edit className="w-4 h-4" />}
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Editar jogador
          </BFButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <BFCard className="lg:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4">
            {player.profilePicture ? (
              <img
                src={player.profilePicture}
                alt={player.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {player.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{player.name}</h2>
              {player.nick && (
                <p className="text-lg text-muted-foreground">"{player.nick}"</p>
              )}
              {getStatusBadge(player.status)}
              {player.isGoalie && (
                <BFBadge variant="info" className="ml-2">Goleiro</BFBadge>
              )}
            </div>
          </div>
        </BFCard>

        <BFCard className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Informações</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{formatPhone(player.phone)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Função</p>
              <p className="font-medium">
                {player.role === 'admin' ? 'Administrador' : 'Jogador'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Entrada</p>
              <p className="font-medium">{formatDate(player.joinDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atividade</p>
              <p className="font-medium">{formatDateTime(player.lastActivity)}</p>
            </div>
          </div>
        </BFCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <BFCard>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Saldo</p>
            <p className={`text-3xl font-bold ${player.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(player.balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (Simulado: R$ 0,00)
            </p>
          </div>
        </BFCard>

        <BFCard>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Total em Débitos</p>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(player.totalDebt)}
            </p>
          </div>
        </BFCard>

        <BFCard>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Pendências</p>
            <p className="text-3xl font-bold text-orange-600">
              {pendingCount}
            </p>
          </div>
        </BFCard>
      </div>

      <BFCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-xl font-semibold">Histórico de Transações</h3>
          <div className="text-sm text-muted-foreground">
            Total: {transactions.length} | Pendentes: {pendingCount} | Pagos: {completedCount}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação encontrada
          </div>
        ) : (
          <BFTable
            columns={transactionColumns}
            data={transactions}
          />
        )}
      </BFCard>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Jogador</DialogTitle>
            <DialogDescription>
              Atualize as informações do jogador
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <BFInput
                className="w-full"
                value={editForm.name}
                onChange={(value) => setEditForm({ ...editForm, name: value })}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Apelido</label>
              <BFInput
                className="w-full"
                value={editForm.nick}
                onChange={(value) => setEditForm({ ...editForm, nick: value })}
                placeholder="Apelido"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <BFInput
                className="w-full"
                type="email"
                value={editForm.email}
                onChange={(value) => setEditForm({ ...editForm, email: value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <BFInput
                className="w-full"
                value={editForm.phone}
                onChange={(value) => setEditForm({ ...editForm, phone: value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CPF</label>
              <BFInput
                className="w-full"
                value={editForm.cpf}
                onChange={(value) => setEditForm({ ...editForm, cpf: value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editForm.status}
                onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Função</label>
              <Select
                value={editForm.role}
                onValueChange={(value: any) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Jogador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 sm:col-span-2">
              <input
                type="checkbox"
                id="isGoalie"
                checked={editForm.isGoalie}
                onChange={(e) => setEditForm({ ...editForm, isGoalie: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isGoalie" className="text-sm font-medium cursor-pointer">
                É goleiro
              </label>
            </div>
          </div>

          <DialogFooter>
            <BFButton
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </BFButton>
            <BFButton
              onClick={handleSavePlayer}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </BFButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
