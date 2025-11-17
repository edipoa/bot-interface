import React from 'react';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { BFButton } from '../components/BF-Button';
import { BFIcons } from '../components/BF-Icons';
import { mockDebts, mockGames, mockTransactions } from '../lib/mockData';

export const UserDashboard: React.FC = () => {
  const userId = '1';
  const userName = 'João Silva';

  const userDebts = mockDebts.filter((d) => d.playerId === userId);
  const pendingDebts = userDebts.filter((d) => d.status === 'pending' || d.status === 'overdue');
  const totalDebt = pendingDebts.reduce((sum, d) => sum + d.amount, 0);
  
  const userTransactions = mockTransactions.filter((t) => t.playerId === userId).slice(0, 5);
  const upcomingGames = mockGames.filter((g) => g.status === 'scheduled').slice(0, 3);

  const getDebtStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'warning' as const, label: 'Pendente' },
      paid: { variant: 'success' as const, label: 'Pago' },
      overdue: { variant: 'error' as const, label: 'Atrasado' },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  return (
    <div className="space-y-6" data-test="user-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-[--foreground] mb-2">Olá, {userName}! 👋</h1>
        <p className="text-[--muted-foreground]">
          Acompanhe seus débitos e próximos jogos
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BFCard variant="stat" padding="md" data-test="user-debt">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 mb-1">Débito Total</p>
              <h2 className="text-white">
                R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-white/70 mt-2">
                {pendingDebts.length} {pendingDebts.length === 1 ? 'pendência' : 'pendências'}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <BFIcons.DollarSign size={24} color="white" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="user-games">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Próximos Jogos</p>
              <h2 className="text-[--foreground]">{upcomingGames.length}</h2>
              <p className="text-[--muted-foreground] mt-2">
                Agendados
              </p>
            </div>
            <div className="bg-[--accent] p-3 rounded-lg">
              <BFIcons.Trophy size={24} color="var(--primary)" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="user-status">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Status</p>
              <BFBadge variant="success" size="lg">Ativo</BFBadge>
              <p className="text-[--muted-foreground] mt-2">
                Membro desde Jan/2024
              </p>
            </div>
            <div className="bg-[--success]/10 p-3 rounded-lg">
              <BFIcons.CheckCircle size={24} color="var(--success)" />
            </div>
          </div>
        </BFCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Debts */}
        <BFCard variant="elevated" padding="lg" data-test="pending-debts">
          <BFCardHeader
            title="Débitos Pendentes"
            subtitle={`${pendingDebts.length} ${pendingDebts.length === 1 ? 'débito' : 'débitos'}`}
            action={
              totalDebt > 0 && (
                <BFButton
                  variant="primary"
                  size="sm"
                  icon={<BFIcons.DollarSign size={16} />}
                  data-test="pay-all-button"
                >
                  Pagar Tudo
                </BFButton>
              )
            }
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
                    className="p-4 bg-[--accent] rounded-lg border border-[--border]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[--foreground]">{debt.gameName}</p>
                        <p className="text-[--muted-foreground]">
                          Vencimento: {new Date(debt.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {getDebtStatusBadge(debt.status)}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[--border]">
                      <h4 className="text-[--foreground]">
                        R$ {debt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </h4>
                      <BFButton
                        variant="primary"
                        size="sm"
                        icon={<BFIcons.CheckCircle size={16} />}
                        data-test={`pay-debt-${debt.id}`}
                      >
                        Pagar
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
                    className="p-4 bg-[--accent] rounded-lg border border-[--border]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-[--primary]/10 p-2 rounded-lg">
                        <BFIcons.Trophy size={20} color="var(--primary)" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[--foreground]">{game.name}</p>
                        <p className="text-[--muted-foreground]">{game.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[--muted-foreground]">
                          <BFIcons.Calendar size={16} className="inline mr-1" />
                          {new Date(game.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-[--muted-foreground]">
                          <BFIcons.Clock size={16} className="inline mr-1" />
                          {game.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[--foreground]">
                          R$ {game.pricePerPlayer.toFixed(2)}
                        </p>
                        <p className="text-[--muted-foreground]">
                          {game.currentPlayers}/{game.maxPlayers} jogadores
                        </p>
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
      <BFCard variant="elevated" padding="lg" data-test="transaction-history">
        <BFCardHeader
          title="Histórico de Transações"
          subtitle="Últimas movimentações"
        />
        <BFCardContent>
          <div className="space-y-3">
            {userTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border-b border-[--border] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === 'payment'
                        ? 'bg-[--success]/10'
                        : 'bg-[--warning]/10'
                    }`}
                  >
                    {transaction.type === 'payment' ? (
                      <BFIcons.TrendingUp size={20} color="var(--success)" />
                    ) : (
                      <BFIcons.TrendingDown size={20} color="var(--warning)" />
                    )}
                  </div>
                  <div>
                    <p className="text-[--foreground]">{transaction.description}</p>
                    <p className="text-[--muted-foreground]">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <p
                  className={
                    transaction.type === 'payment'
                      ? 'text-[--success]'
                      : 'text-[--destructive]'
                  }
                >
                  {transaction.type === 'payment' ? '+' : ''}R${' '}
                  {Math.abs(transaction.amount).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>
        </BFCardContent>
      </BFCard>
    </div>
  );
};
