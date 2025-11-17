import React from 'react';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { BFIcons } from '../components/BF-Icons';
import { mockDashboardStats, mockDebts, mockGames } from '../lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const stats = mockDashboardStats;
  const recentDebts = mockDebts.filter(d => d.status !== 'paid').slice(0, 5);
  const upcomingGames = mockGames.filter(g => g.status === 'scheduled').slice(0, 3);

  const revenueData = [
    { month: 'Jun', value: 12500 },
    { month: 'Jul', value: 13800 },
    { month: 'Ago', value: 14200 },
    { month: 'Set', value: 13900 },
    { month: 'Out', value: 15100 },
    { month: 'Nov', value: 15680 },
  ];

  const debtData = [
    { name: 'Pago', value: stats.paidThisMonth, fill: 'var(--primary)' },
    { name: 'Pendente', value: stats.totalDebt, fill: 'var(--warning)' },
  ];

  return (
    <div className="space-y-6" data-test="admin-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-[--foreground] mb-2">Dashboard Administrativo</h1>
        <p className="text-[--muted-foreground]">
          Visão geral do sistema Bot Fut
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BFCard variant="stat" padding="md" data-test="stat-players">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 mb-1">Total de Jogadores</p>
              <h2 className="text-white">{stats.totalPlayers}</h2>
              <p className="text-white/70 mt-2">
                {stats.activePlayers} ativos
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <BFIcons.Users size={24} color="white" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="stat-games">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Jogos Agendados</p>
              <h2 className="text-[--foreground]">{stats.upcomingGames}</h2>
              <p className="text-[--muted-foreground] mt-2">
                {stats.totalGames} no total
              </p>
            </div>
            <div className="bg-[--accent] p-3 rounded-lg">
              <BFIcons.Trophy size={24} color="var(--primary)" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="stat-debt">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Débito Total</p>
              <h2 className="text-[--warning]">
                R$ {stats.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[--muted-foreground] mt-2">
                {recentDebts.length} pendentes
              </p>
            </div>
            <div className="bg-[--warning]/10 p-3 rounded-lg">
              <BFIcons.AlertCircle size={24} color="var(--warning)" />
            </div>
          </div>
        </BFCard>

        <BFCard variant="elevated" padding="md" data-test="stat-revenue">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Receita do Mês</p>
              <h2 className="text-[--foreground]">
                R$ {stats.paidThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1 mt-2 text-[--success]">
                <BFIcons.TrendingUp size={16} />
                <span>+{stats.revenueGrowth}%</span>
              </div>
            </div>
            <div className="bg-[--success]/10 p-3 rounded-lg">
              <BFIcons.DollarSign size={24} color="var(--success)" />
            </div>
          </div>
        </BFCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BFCard variant="elevated" padding="lg" data-test="revenue-chart">
          <BFCardHeader title="Receita Mensal" subtitle="Últimos 6 meses" />
          <BFCardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </BFCardContent>
        </BFCard>

        <BFCard variant="elevated" padding="lg" data-test="debt-chart">
          <BFCardHeader title="Status Financeiro" subtitle="Pagamentos vs Débitos" />
          <BFCardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={debtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </BFCardContent>
        </BFCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BFCard variant="elevated" padding="lg" data-test="upcoming-games">
          <BFCardHeader
            title="Próximos Jogos"
            subtitle={`${upcomingGames.length} agendados`}
          />
          <BFCardContent>
            <div className="space-y-3">
              {upcomingGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-[--accent] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[--primary] p-2 rounded-lg">
                      <BFIcons.Trophy size={20} color="white" />
                    </div>
                    <div>
                      <p className="text-[--foreground]">{game.name}</p>
                      <p className="text-[--muted-foreground]">
                        {new Date(game.date).toLocaleDateString('pt-BR')} às {game.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[--foreground]">
                      {game.currentPlayers}/{game.maxPlayers}
                    </p>
                    <p className="text-[--muted-foreground]">jogadores</p>
                  </div>
                </div>
              ))}
            </div>
          </BFCardContent>
        </BFCard>

        <BFCard variant="elevated" padding="lg" data-test="recent-debts">
          <BFCardHeader
            title="Débitos Recentes"
            subtitle={`${recentDebts.length} pendentes`}
          />
          <BFCardContent>
            <div className="space-y-3">
              {recentDebts.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-3 bg-[--accent] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[--muted] flex items-center justify-center">
                      <span className="text-[--foreground]">
                        {debt.playerName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[--foreground]">{debt.playerName}</p>
                      <p className="text-[--muted-foreground]">{debt.gameName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[--foreground]">
                      R$ {debt.amount.toFixed(2)}
                    </p>
                    <BFBadge
                      variant={debt.status === 'overdue' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {debt.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                    </BFBadge>
                  </div>
                </div>
              ))}
            </div>
          </BFCardContent>
        </BFCard>
      </div>
    </div>
  );
};
