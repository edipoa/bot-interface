import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { BFIcons } from '../components/BF-Icons';
import { BFSelect } from '../components/BF-Select';
import { api } from '../lib/axios';
import { formatEventDate, formatEventTime } from '../lib/dateUtils';
import { toast } from 'sonner';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netBalance: number;
  pendingRevenue: number;
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  totalGames: number;
  nextGameDate: string | null;
}

interface RecentGame {
  id: string;
  name: string;
  date: string;
  time: string;
  status: string;
  currentPlayers: number;
  maxPlayers: number;
}

interface RecentDebt {
  id: string;
  playerName: string;
  amount: number;
  status: string;
  createdAt: string;
  notes?: string;
  description?: string;
  category?: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentGames: RecentGame[];
  recentDebts: RecentDebt[];
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { workspaces, currentWorkspace } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');

  useEffect(() => {
    const abortController = new AbortController();

    const init = async () => {
      try {
        // Use workspaces from context
        const initialWorkspace = currentWorkspace?.slug || 'all';
        const workspaceId = currentWorkspace?.id || null;

        setSelectedWorkspace(initialWorkspace);

        const url = workspaceId ? `/dashboard/${workspaceId}` : '/dashboard';
        const response = await api.get(url, { signal: abortController.signal });
        setDashboardData(response.data);
      } catch (error: any) {
        if (error.code !== 'ERR_CANCELED' && error.name !== 'CanceledError') {
          console.error('Error loading dashboard:', error);
          toast.error('Erro ao carregar dashboard');
          setLoading(false);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      abortController.abort();
    };
  }, [currentWorkspace]);

  const fetchDashboardData = async (workspace: string) => {
    try {
      setLoading(true);

      let url = '/dashboard';
      if (workspace !== 'all') {
        const foundWorkspace = workspaces.find((ws: any) => ws.slug === workspace);
        if (foundWorkspace) {
          url = `/dashboard/${foundWorkspace.id}`;
        }
      }

      const response = await api.get(url);
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  /* const formatDate = (dateString: string): string => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return formatDateWithoutTimezone(dateString).split('/').slice(0, 2).join('/');
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }; */

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info', label: string }> = {
      'open': { variant: 'info', label: 'Aberto' },
      'closed': { variant: 'warning', label: 'Fechado' },
      'finished': { variant: 'success', label: 'Concluído' },
      'cancelled': { variant: 'error', label: 'Cancelado' },
      'pending': { variant: 'warning', label: 'Pendente' },
      'pendente': { variant: 'warning', label: 'Pendente' },
      'overdue': { variant: 'error', label: 'Vencido' },
      'paid': { variant: 'success', label: 'Pago' },
      'pago': { variant: 'success', label: 'Pago' },
      'confirmado': { variant: 'success', label: 'Pago' },
    };
    const config = statusMap[status] || { variant: 'warning' as const, label: status };
    return <BFBadge variant={config.variant} size="sm">{config.label}</BFBadge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Erro ao carregar dashboard</p>
        </div>
      </div>
    );
  }

  const { stats, recentGames, recentDebts } = dashboardData;

  return (
    <div className="space-y-6" data-test="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[--foreground] mb-2">Dashboard Administrativo</h1>
          <p className="text-[--muted-foreground]">
            Visão geral do sistema Faz o Simples
          </p>
        </div>
        <div className="w-full sm:w-64">
          <BFSelect
            label="Workspace"
            value={selectedWorkspace}
            onChange={(value) => {
              const newWorkspace = String(value);
              setSelectedWorkspace(newWorkspace);
              fetchDashboardData(newWorkspace);
            }}
            options={[
              { value: 'all', label: 'Todos os Workspaces' },
              ...(Array.isArray(workspaces) ? workspaces.map(ws => ({ value: ws.slug, label: ws.name })) : [])
            ]}
            placeholder="Selecione o workspace"
            data-test="workspace-select"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Caixa (Saldo Líquido) */}
        <BFCard variant="elevated" padding="md" data-test="stat-balance">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Caixa (Saldo)</p>
              <h2 className={stats.netBalance >= 0 ? "text-[--success]" : "text-[--destructive]"}>
                {formatMoney(stats.netBalance)}
              </h2>
              <p className="text-[--muted-foreground] mt-2 text-xs">
                Entradas: {formatMoney(stats.totalRevenue)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stats.netBalance >= 0 ? 'bg-[--success]/10' : 'bg-[--destructive]/10'}`}>
              <BFIcons.DollarSign size={24} color={stats.netBalance >= 0 ? 'var(--success)' : 'var(--destructive)'} />
            </div>
          </div>
        </BFCard>

        {/* Card: A Receber (Pending) */}
        <BFCard variant="elevated" padding="md" data-test="stat-pending">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">A Receber</p>
              <h2 className="text-[--warning]">{formatMoney(stats.pendingRevenue)}</h2>
              <p className="text-[--muted-foreground] mt-2 text-xs">
                Previsão de entrada
              </p>
            </div>
            <div className="bg-[--warning]/10 p-3 rounded-lg">
              <BFIcons.Clock size={24} color="var(--warning)" />
            </div>
          </div>
        </BFCard>

        {/* Card: Membros */}
        <BFCard variant="stat" padding="md" data-test="stat-members">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 mb-1">Membros</p>
              <h2 className="text-white">{stats.totalMembers}</h2>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> {stats.activeMembers}
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> {stats.suspendedMembers}
                </span>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <BFIcons.Users size={24} color="white" />
            </div>
          </div>
        </BFCard>

        {/* Card: Operacional (Jogos) */}
        <BFCard variant="elevated" padding="md" data-test="stat-games">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[--muted-foreground] mb-1">Jogos Realizados</p>
              <h2 className="text-[--foreground]">{stats.totalGames}</h2>
              <p className="text-[--muted-foreground] mt-2 text-xs">
                Próximo: {stats.nextGameDate ? formatEventDate(stats.nextGameDate) : 'Nenhum'}
              </p>
            </div>
            <div className="bg-[--accent] p-3 rounded-lg">
              <BFIcons.Trophy size={24} color="var(--primary)" />
            </div>
          </div>
        </BFCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BFCard variant="elevated" padding="lg" data-test="upcoming-games">
          <BFCardHeader
            title="Jogos Recentes"
            subtitle={`${recentGames.length} agendados`}
          />
          <BFCardContent>
            <div className="space-y-3">
              {recentGames.length > 0 ? recentGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-[--accent] rounded-lg cursor-pointer hover:bg-[--accent]/80 transition-colors"
                  onClick={() => navigate(`/admin/games/${game.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[--primary] p-2 rounded-lg">
                      <BFIcons.Trophy size={20} color="white" />
                    </div>
                    <div>
                      <p className="text-[--foreground]">{game.name}</p>
                      <p className="text-[--muted-foreground]">
                        {formatEventDate(game.date)} às {formatEventTime(game.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(game.status)}
                    <p className="text-[--muted-foreground] mt-1">
                      {game.currentPlayers}/{game.maxPlayers} jogadores
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">Nenhum jogo agendado</p>
              )}
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
              {recentDebts.length > 0 ? recentDebts.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-3 bg-[--accent] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {(debt.category === 'general' || debt.category === 'field-payment') ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--warning)] to-[var(--warning)]/70 flex items-center justify-center shadow-md">
                        <BFIcons.DollarSign size={20} color="white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-lg">
                          {debt.playerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className={`${(debt.category === 'general' || debt.category === 'field-payment')
                        ? 'text-[--warning] font-semibold'
                        : 'text-[--foreground]'
                        }`}>
                        {(debt.category === 'general' || debt.category === 'field-payment') ? 'Débito Geral' : debt.playerName}
                      </p>
                      {(debt.description || debt.notes) && (
                        <p className="text-[--muted-foreground] text-xs mt-0.5 italic">
                          {debt.description || debt.notes}
                        </p>
                      )}
                      <p className="text-[--muted-foreground] text-sm">{formatEventDate(debt.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[--foreground] font-semibold">
                      {formatMoney(debt.amount)}
                    </p>
                    {getStatusBadge(debt.status)}
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">Nenhum débito pendente</p>
              )}
            </div>
          </BFCardContent>
        </BFCard>
      </div>
    </div>
  );
};
