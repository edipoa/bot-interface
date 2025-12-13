import React, { useEffect, useState } from 'react';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { BFButton } from '../components/BF-Button';
import { BFIcons } from '../components/BF-Icons';
import { BFListView } from '../components/BFListView';

import { useAuth } from '../hooks/useAuth';
import { debtsAPI, gamesAPI, ledgersAPI } from '../lib/axios';
import { formatDateWithoutTimezone } from '../lib/dateUtils';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsPagination, setTransactionsPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  });
  const [copiedDebtId, setCopiedDebtId] = useState<string | null>(null);

  const handleCopyPixKey = async (debtId: string, pixKey: string) => {
    if (!pixKey) {
      console.error('Chave PIX não disponível');
      return;
    }

    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiedDebtId(debtId);
      setTimeout(() => setCopiedDebtId(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar chave PIX:', error);
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const debtsResponse = await debtsAPI.getMyDebts();
        const debtsData = debtsResponse.data || debtsResponse;
        const mappedDebts = Array.isArray(debtsData) ? debtsData.map((debt: any) => ({
          id: debt._id,
          amount: debt.amountCents / 100,
          status: debt.status === 'pendente' ? 'pending' : debt.status === 'confirmado' ? 'paid' : 'overdue',
          gameName: debt.note || 'Jogo',
          dueDate: debt.createdAt,
          ...debt
        })) : [];
        setDebts(mappedDebts);

        const gamesResponse = await gamesAPI.getMyOpenGames();
        const gamesData = gamesResponse.data || gamesResponse;
        const mappedGames = Array.isArray(gamesData) ? gamesData.map((game: any) => ({
          id: game.id,
          name: game.title,
          status: game.status === 'open' ? 'scheduled' : game.status,
          date: game.date,
          time: new Date(game.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          location: 'A definir',
          pricePerPlayer: game.priceCents / 100,
          currentPlayers: game.currentPlayers ?? 0,
          maxPlayers: game.maxPlayers ?? 0,
          paid: game.playerInfo?.paid || false,
          ...game
        })) : [];
        setGames(mappedGames);

        const ledgersResponse = await ledgersAPI.getMyLedgers(1, 5);
        const ledgersData = ledgersResponse.ledgers || [];
        const mappedLedgers = Array.isArray(ledgersData) ? ledgersData.map((ledger: any) => ({
          ...ledger,
          id: ledger._id,
          type: ledger.type === 'credit' ? 'payment' : 'debit',
          description: ledger.note,
          amount: ledger.type === 'credit' ? ledger.amountCents / 100 : -(ledger.amountCents / 100),
          date: ledger.createdAt,
          status: ledger.status
        })) : [];
        setTransactions(mappedLedgers);
        setTransactionsPagination({
          page: ledgersResponse.page || 1,
          totalPages: ledgersResponse.totalPages || 1,
          total: ledgersResponse.total || 0,
          limit: ledgersResponse.limit || 5
        });

      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Erro ao carregar dados');
        setDebts([]);
        setGames([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingDebts = debts.filter(f => f.type === 'debit');
  const totalDebt = pendingDebts.filter(f => f.status === 'pendente' && f.type === 'debit').reduce((sum, d) => sum + d.amount, 0);

  const upcomingGames = games;

  const loadTransactionsPage = async (page: number) => {
    try {
      const response = await ledgersAPI.getMyLedgers(page, 5);
      const ledgersData = response.ledgers || [];
      const mappedLedgers = ledgersData.map((ledger: any) => ({
        id: ledger._id,
        type: ledger.type === 'credit' ? 'payment' : 'debit',
        description: ledger.note,
        amount: ledger.type === 'credit' ? ledger.amountCents / 100 : -(ledger.amountCents / 100),
        date: ledger.createdAt,
        status: ledger.status,
      }));
      setTransactions(mappedLedgers);
      setTransactionsPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
        limit: response.limit
      });
    } catch (error) {
      console.error('Error loading transactions page:', error);
    }
  };

  const getDebtStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'warning' as const, label: 'Pendente' },
      pendente: { variant: 'warning' as const, label: 'Pendente' },
      paid: { variant: 'success' as const, label: 'Confirmado' },
      confirmado: { variant: 'success' as const, label: 'Confirmado' },
      overdue: { variant: 'error' as const, label: 'Atrasado' },
    };
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'warning' as const, label: 'Pendente' };
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" data-test="user-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl text-[--foreground] mb-2">Olá, {user?.name || 'Usuário'}! 👋</h1>
        <p className="text-sm sm:text-base text-[--muted-foreground]">
          Acompanhe seus débitos e próximos jogos
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <BFCard variant="stat" padding="md" data-test="user-debt">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm sm:text-base text-white/80 mb-1">Débito Total</p>
              <h2 className="text-xl sm:text-2xl text-white">
                R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-2">
                {pendingDebts.length} {pendingDebts.length === 1 ? 'pendência' : 'pendências'}
              </p>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
              <BFIcons.DollarSign size={20} color="white" className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="user-games">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm sm:text-base text-[--muted-foreground] mb-1">Próximos Jogos</p>
              <h2 className="text-xl sm:text-2xl text-[--foreground]">{upcomingGames.length}</h2>
              <p className="text-xs sm:text-sm text-[--muted-foreground] mt-2">
                Agendados
              </p>
            </div>
            <div className="bg-[--accent] p-2 sm:p-3 rounded-lg">
              <BFIcons.Trophy size={20} color="var(--primary)" className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="user-status">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm sm:text-base text-[--muted-foreground] mb-1">Status</p>
              <BFBadge variant={user.status === 'active' ? 'success' : 'error'} size="lg">{user.status === 'active' ? 'Ativo' : 'Inativo'}</BFBadge>
              <p className="text-xs sm:text-sm text-[--muted-foreground] mt-2">
                Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })}
              </p>
            </div>
            <div className="bg-[--success]/10 p-2 sm:p-3 rounded-lg">
              <BFIcons.CheckCircle size={20} color="var(--success)" className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </BFCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Pending Debts */}
        <BFCard variant="elevated" padding="lg" data-test="pending-debts">
          <BFCardHeader
            title="Débitos Pendentes"
            subtitle={`${pendingDebts.length} ${pendingDebts.length === 1 ? 'débito' : 'débitos'}`}
          />
          <BFCardContent>
            {pendingDebts.length === 0 ? (
              <div className="text-center py-8 text-[--muted-foreground]">
                <BFIcons.CheckCircle size={48} className="mx-auto mb-3 text-[--success]" />
                <p>Você não tem débitos pendentes!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="p-3 sm:p-4 bg-[--accent] rounded-lg border border-[--border]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-sm sm:text-base text-[--foreground] font-medium">{debt.gameName}</p>
                        <p className="text-xs sm:text-sm text-[--muted-foreground] mt-1">
                          Vencimento: {new Date(debt.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="self-start">
                        {getDebtStatusBadge(debt.status)}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-[--border]">
                      <h4 className="text-lg sm:text-xl text-[--foreground] font-semibold">
                        R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h4>
                      <BFButton
                        variant={copiedDebtId === debt.id ? 'success' : 'primary'}
                        size="sm"
                        icon={copiedDebtId === debt.id ? <BFIcons.CheckCircle size={16} /> : <BFIcons.Copy size={16} />}
                        onClick={() => handleCopyPixKey(debt.id, debt.pix)}
                        data-test={`pay-debt-${debt.id}`}
                        disabled={!debt.pix}
                        className="w-full sm:w-auto"
                      >
                        {copiedDebtId === debt.id ? 'Copiado!' : 'Copiar PIX'}
                      </BFButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BFCardContent>
        </BFCard>

        {/* Upcoming Games */}
        <BFCard variant="elevated" padding="lg" data-test="upcoming-games">
          <BFCardHeader
            title="Próximos Jogos"
            subtitle="Jogos agendados"
          />
          <BFCardContent>
            {upcomingGames.length === 0 ? (
              <div className="text-center py-8 text-[--muted-foreground]">
                <BFIcons.Trophy size={48} className="mx-auto mb-3" />
                <p>Nenhum jogo agendado no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 sm:p-4 bg-[--accent] rounded-lg border border-[--border]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-[--primary]/10 p-2 rounded-lg flex-shrink-0">
                        <BFIcons.Trophy size={20} color="var(--primary)" className="sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base text-[--foreground] font-medium truncate">{game.name}</h4>
                        <p className="text-xs sm:text-sm text-[--muted-foreground]">
                          {formatDateWithoutTimezone(game.date)} às {game.time}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div>
                        <p className="text-[--muted-foreground]">Valor</p>
                        <p className="text-[--foreground] font-medium">R$ {game.pricePerPlayer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-[--muted-foreground]">Jogadores</p>
                        <p className="text-[--foreground] font-medium">{game.currentPlayers}/{game.maxPlayers}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BFCardContent>
        </BFCard>
      </div>

      {/* Transaction History */}
      <BFListView
        title="Histórico de Transações"
        description={`${transactionsPagination.total} movimentações`}
        stats={[]}
        columns={[
          {
            key: 'description',
            label: 'Descrição',
            render: (value: string, row: any) => (
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${row.type === 'payment'
                    ? 'bg-[--success]/10'
                    : 'bg-[--destructive]/10'
                    }`}
                >
                  {row.type === 'payment' ? (
                    <BFIcons.TrendingUp size={18} color="var(--success)" className="sm:w-5 sm:h-5" />
                  ) : (
                    <BFIcons.TrendingDown size={18} color="var(--destructive)" className="sm:w-5 sm:h-5" />
                  )}
                </div>
                <span className="font-medium text-[--foreground]">{value}</span>
              </div>
            ),
          },
          {
            key: 'amount',
            label: 'Valor',
            render: (value: number, row: any) => (
              <span
                className={`font-semibold ${row.type === 'payment'
                  ? 'text-[--success]'
                  : 'text-[--destructive]'
                  }`}
              >
                {value > 0 ? '+' : ''}R$ {Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            ),
          },
          {
            key: 'date',
            label: 'Data',
            render: (value: string) => (
              <span className="text-[--muted-foreground]">
                {new Date(value).toLocaleDateString('pt-BR')} às {new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (value: string) => getDebtStatusBadge(value),
          },
        ]}
        data={transactions}
        loading={loading}
        pagination={{
          page: transactionsPagination.page,
          limit: transactionsPagination.limit,
          total: transactionsPagination.total,
          totalPages: transactionsPagination.totalPages,
          onPageChange: loadTransactionsPage,
        }}
        emptyState={{
          message: 'Nenhuma transação encontrada',
          icon: <BFIcons.Search size={48} className="text-[--muted-foreground] mb-3" />
        }}
      />
    </div>
  );
};
