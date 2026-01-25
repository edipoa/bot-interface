import React, { useEffect, useState } from 'react';
import { BFCard } from '../components/BF-Card';
import { BFIcons } from '../components/BF-Icons';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { GameCard } from '../components/GameCard';

import { useAuth } from '../hooks/useAuth';
import { gamesAPI, transactionsAPI, membershipsAPI } from '../lib/axios';
import { formatDateWithoutTimezone } from '../lib/dateUtils';
import { Membership, IFinancialBalance } from '../lib/types/membership';
import { toast } from 'sonner';

// New Components
import { SubscriptionStatusCard } from '../components/subscription/SubscriptionStatusCard';
import { TransactionHistory } from '../components/subscription/TransactionHistory';
import { PaymentModal } from '../components/financial/PaymentModal';
import { ManageSubscriptionModal } from '../components/subscription/ManageSubscriptionModal';

export const UserDashboard: React.FC = () => {
  const { user, currentWorkspace, refreshUser, loading: authLoading } = useAuth();
  console.log('Current Workspace:', currentWorkspace);

  const [membership, setMembership] = useState<Membership | null>(null);
  const [balance, setBalance] = useState<IFinancialBalance>({ totalPending: 0, history: [] });
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const initUser = async () => {
      await refreshUser();
    };
    initUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      if (!user || !user.id || !currentWorkspace?.id) {
        console.log('UserDashboard: Missing dependencies, aborting fetch.');

        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        try {
          const membershipResponse = await membershipsAPI.getMyMembership(currentWorkspace.id);
          const membershipData = membershipResponse.data || membershipResponse.membership;

          if (membershipData) {
            setMembership({
              ...membershipData,
              id: membershipData.id || membershipData._id,
              planValue: membershipData.planValueCents ? membershipData.planValueCents / 100 : 0,
              planValueCents: membershipData.planValueCents || 0
            });
          } else {
            setMembership(null);
          }
        } catch (err) {
          console.log('No membership found', err);
        }

        try {
          const balanceData = await transactionsAPI.getMyBalance(currentWorkspace.id);
          setBalance(balanceData);
        } catch (err) {
          console.error('Error fetching balance', err);
        }

        // Fetch Games - usage of getAllGames with filter as requested
        // Note: getAllGames might need workspaceId filter if it supports it, 
        // to avoid seeing games from other workspaces if the API isn't scoped implicitly.
        // Assuming getAllGames is global or handles scope via session/interceptor?
        // Actually, let's verify if getAllGames takes workspaceId.
        // Looking at axios.ts, getAllGames takes (page, limit, status, search). 
        // It does NOT take workspaceId explicity. But interceptor adds x-workspace-id.
        const gamesResponse = await gamesAPI.getAllGames(1, 10, 'open');
        const gamesData = gamesResponse.data || gamesResponse;

        const mappedGames = Array.isArray(gamesData) ? gamesData.map((game: any) => ({
          ...game,
          id: game.id || game._id,
          name: game.title || game.name,
          status: game.status === 'open' ? 'scheduled' : game.status,
          rawDate: game.date,
          formattedDate: formatDateWithoutTimezone(game.date),
          time: new Date(game.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
          location: game.location || 'A definir',
          pricePerPlayer: game.pricePerPlayer || (game.priceCents ? game.priceCents / 100 : 0),
          currentPlayers: game.currentPlayers ?? 0,
          maxPlayers: game.maxPlayers ?? 0,
          players: game.players || [], // Store players to find self
          isJoined: game.players?.some((p: any) => p.phone === user.phone), // Calculated field
          paid: false
        })) : [];
        setGames(mappedGames);

      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, currentWorkspace, authLoading]);

  const handlePayTransaction = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    // Refresh balance and membership
    if (currentWorkspace?.id) {
      try {
        const balanceData = await transactionsAPI.getMyBalance(currentWorkspace.id);
        setBalance(balanceData);

        const mResponse = await membershipsAPI.getMyMembership(currentWorkspace.id);
        const mData = mResponse.data || mResponse.membership;
        if (mData) {
          setMembership({
            ...mData,
            id: mData.id || mData._id,
            planValue: mData.planValueCents ? mData.planValueCents / 100 : 0,
            planValueCents: mData.planValueCents || 0
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleQuickJoin = async (gameId: string) => {
    if (!user || !user.phone) {
      toast.error('Seu perfil está incompleto. Fale com o admin.');
      return;
    }

    try {
      const loadingToast = toast.loading('Entrando na lista...');

      // Call API to add player
      // We assume isGoalkeeper false for quick join, or could add a dialog later if needed
      await gamesAPI.addPlayerToGame(gameId, user.phone, user.name, false);

      toast.dismiss(loadingToast);
      toast.success('Presença Confirmada! ⚽');

      // Refresh games list to show updated status
      // We call the internal fetch logic again or a dedicated refresher
      // Ideally we extract fetch logic to a useCallback, but for now specific reload:
      const gamesResponse = await gamesAPI.getAllGames(1, 10, 'open');
      const gamesData = gamesResponse.data || gamesResponse;
      const mappedGames = Array.isArray(gamesData) ? gamesData.map((game: any) => ({
        ...game,
        id: game.id || game._id,
        name: game.title || game.name,
        status: game.status === 'open' ? 'scheduled' : game.status,
        rawDate: game.date,
        formattedDate: formatDateWithoutTimezone(game.date),
        time: game.time,
        location: game.location || 'A definir',
        pricePerPlayer: game.pricePerPlayer || (game.priceCents ? game.priceCents / 100 : 0),
        currentPlayers: game.currentPlayers ?? 0,
        maxPlayers: game.maxPlayers ?? 0,
        players: game.players || [],
        isJoined: game.players?.some((p: any) => p.phone === user.phone),
        paid: false
      })) : [];
      setGames(mappedGames);

    } catch (error: any) {
      console.error('Error joining game:', error);
      toast.dismiss();
      const msg = error.response?.data?.message || 'Erro ao entrar no jogo.';
      toast.error(msg);
    }
  };

  const handleQuickLeave = async (gameId: string) => {
    // Find the game to get the player ID
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    // Find self in players list
    const playerRecord = game.players?.find((p: any) => p.phone === user?.phone);
    if (!playerRecord) {
      toast.error('Você não está nesta lista.');
      return;
    }

    try {
      const loadingToast = toast.loading('Saindo da lista...');
      await gamesAPI.removePlayerFromGame(gameId, playerRecord.id);

      toast.dismiss(loadingToast);
      toast.success('Você saiu da lista.');

      // Refresh Logic (Same as Join - duplicated for now, could be refactored)
      const gamesResponse = await gamesAPI.getAllGames(1, 10, 'open');
      const gamesData = gamesResponse.data || gamesResponse;
      const mappedGames = Array.isArray(gamesData) ? gamesData.map((game: any) => ({
        ...game,
        id: game.id || game._id,
        name: game.title || game.name,
        status: game.status === 'open' ? 'scheduled' : game.status,
        rawDate: game.date,
        formattedDate: formatDateWithoutTimezone(game.date),
        time: game.time,
        location: game.location || 'A definir',
        pricePerPlayer: game.pricePerPlayer || (game.priceCents ? game.priceCents / 100 : 0),
        currentPlayers: game.currentPlayers ?? 0,
        maxPlayers: game.maxPlayers ?? 0,
        players: game.players || [],
        isJoined: game.players?.some((p: any) => p.phone === user?.phone),
        paid: false
      })) : [];
      setGames(mappedGames);

    } catch (error: any) {
      console.error('Error leaving game:', error);
      toast.dismiss();
      toast.error('Erro ao sair do jogo.');
    }
  };

  const handleRegularize = () => {
    // Try to find the oldest pending transaction
    const pendingTransactions = balance.history
      .filter(t => t.status === 'PENDING')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    if (pendingTransactions.length > 0) {
      // Open modal for the first one
      handlePayTransaction(pendingTransactions[0].id);
      return;
    }

    // Fallback: scroll to history
    const el = document.getElementById('financial-history');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    toast('Nenhuma fatura pendente encontrada. Verifique o histórico.');
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
          Visão geral da sua conta e jogos
        </p>
      </div>

      {error && (
        <BFAlertMessage variant="error" message={error} />
      )}

      {/* Membership Status Card */}
      <SubscriptionStatusCard
        membership={membership}
        onRegularize={handleRegularize}
        onManage={() => setManageModalOpen(true)}
        pixKey={(currentWorkspace as any)?.settings?.pix}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Pending */}
        <BFCard variant="stat" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm sm:text-base text-white/80 mb-1">Pendências</p>
              <h2 className="text-xl sm:text-2xl text-white">
                R$ {balance.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
              <BFIcons.DollarSign size={20} color="white" className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </BFCard>

        {/* Next Games Count */}
        <BFCard variant="elevated" padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm sm:text-base text-[--muted-foreground] mb-1">Próximos Jogos</p>
              <h2 className="text-xl sm:text-2xl text-[--foreground]">{games.length}</h2>
            </div>
            <div className="bg-[--accent] p-2 sm:p-3 rounded-lg">
              <BFIcons.Trophy size={20} color="var(--primary)" className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </BFCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Games List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[--foreground]">Próximos Jogos</h2>
          {games.length === 0 ? (
            <BFCard padding="lg">
              <div className="text-center py-8 text-[--muted-foreground]">
                <p>Nenhum jogo agendado.</p>
              </div>
            </BFCard>
          ) : (
            <div className="space-y-3">
              {games.map(game => (
                <GameCard
                  key={game.id}
                  {...game}
                  formattedDate={game.formattedDate}
                  date={game.rawDate} // Important for isFutureGame logic
                  membershipStatus={membership?.status || 'INACTIVE'}
                  onJoin={handleQuickJoin}
                  onLeave={handleQuickLeave}
                  isJoined={game.isJoined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Financial History */}
        <div id="financial-history" className="space-y-4">
          <h2 className="text-lg font-semibold text-[--foreground]">Histórico Financeiro</h2>
          <TransactionHistory
            transactions={balance.history}
            onPay={handlePayTransaction}
            hideTitle={true}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        transactionId={selectedTransactionId}
        onPaymentSuccess={handlePaymentSuccess}
        pixKey={(currentWorkspace as any)?.settings?.pix}
      />

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        open={manageModalOpen}
        onOpenChange={setManageModalOpen}
        membership={membership}
        onUpdate={handlePaymentSuccess} // Refresh data on update
      />

    </div>
  );
};
