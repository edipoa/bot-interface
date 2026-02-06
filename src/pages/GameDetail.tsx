import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BFButton } from '../components/BF-Button';
import { BFBadge } from '../components/BF-Badge';
import { BFCard } from '../components/BF-Card';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { gamesAPI, playersAPI } from '../lib/axios';
import { formatEventDate } from '../lib/dateUtils';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { BFInput } from '../components/BF-Input';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { Search, UserPlus, Pencil, Check, X } from 'lucide-react';
import { Switch } from '../components/ui/switch';

interface Player {
  id: string;
  name: string;
  phone?: string;
  slot: number;
  isGoalkeeper: boolean;
  isPaid: boolean;
  guest?: boolean;
}''

interface WaitlistPlayer {
  id: string;
  name: string;
  phone?: string;
  position: number;
}

interface OutlistPlayer {
  id: string;
  name: string;
  phone?: string;
}

interface FinancialSummary {
  totalToReceive: number;
  totalPaid: number;
  totalPending: number;
  paidCount: number;
  unpaidCount: number;
}

interface GameInfo {
  id: string;
  name: string;
  workspaceId: string;
  date: string;
  time: string;
  location: string;
  pricePerPlayer: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'open' | 'closed' | 'finished' | 'cancelled';
  createdAt: string;
  players: Player[];
  waitlist: WaitlistPlayer[];
  outlist: OutlistPlayer[];
  financialSummary: FinancialSummary;
  allowCasualsEarly?: boolean;
}

interface GameDetailProps {
  gameId?: string;
  onBack?: () => void;
}

export const GameDetail: React.FC<GameDetailProps> = ({ gameId: propGameId, onBack }) => {
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const gameId = propGameId || paramGameId;

  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameToClose, setGameToClose] = useState<string | null>(null);
  const [closingGame, setClosingGame] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<{ id: string; name: string; slot: number; guest?: boolean } | null>(null);
  const [removingPlayer, setRemovingPlayer] = useState(false);
  const [gameToCancel, setGameToCancel] = useState<string | null>(null);
  const [cancelingGame, setCancelingGame] = useState(false);
  const [togglingPayment, setTogglingPayment] = useState<string | null>(null);
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [addAsGoalkeeper, setAddAsGoalkeeper] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [selectedInviter, setSelectedInviter] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId]);

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getGameById(gameId!);
      setGameInfo(response.data);
    } catch (error: any) {
      console.error('Error fetching game details:', error);
      toast.error('Erro ao carregar detalhes do jogo');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseGame = async () => {
    if (!gameToClose || !gameInfo) return;

    try {
      setClosingGame(true);
      await gamesAPI.closeGame(gameToClose, gameInfo.workspaceId);
      toast.success('✅ Jogo fechado com sucesso!');
      setGameToClose(null);
      fetchGameDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fechar jogo');
    } finally {
      setClosingGame(false);
    }
  };

  const handleRemovePlayer = async () => {
    if (!playerToRemove || !gameId) return;

    try {
      setRemovingPlayer(true);

      if (playerToRemove.guest) {
        await gamesAPI.removeGuest(gameId, playerToRemove.slot);
        toast.success(`🗑️ Convidado ${playerToRemove.name} removido!`);
      } else {
        await gamesAPI.removePlayer(gameId, playerToRemove.id);
        toast.success(`🗑️ ${playerToRemove.name} removido do jogo!`);
      }

      setPlayerToRemove(null);
      fetchGameDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao remover jogador');
    } finally {
      setRemovingPlayer(false);
    }
  };

  const handleCancelGame = async () => {
    if (!gameToCancel || !gameInfo) return;

    try {
      setCancelingGame(true);
      await gamesAPI.deleteGame(gameToCancel, gameInfo.workspaceId);
      toast.success('🚫 Jogo cancelado com sucesso!');
      setGameToCancel(null);
      navigate('/admin/games');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao cancelar jogo');
      setCancelingGame(false);
    }
  };

  const handleTogglePayment = async (slot: number, currentStatus: boolean, playerName: string) => {
    if (!gameId) return;

    try {
      setTogglingPayment(String(slot));
      await gamesAPI.togglePlayerPayment(gameId, slot, !currentStatus);
      toast.success(`💰 ${playerName} marcado como ${!currentStatus ? 'pago' : 'pendente'}!`);
      fetchGameDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar pagamento');
    } finally {
      setTogglingPayment(null);
    }
  };

  const handleSearchPlayers = async (search: string) => {
    if (!search || search.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchingPlayers(true);
      const response = await playersAPI.searchPlayers(search);
      setSearchResults(response.players || []);
    } catch (error: any) {
      console.error('Error searching players:', error);
      toast.error('Erro ao buscar jogadores');
    } finally {
      setSearchingPlayers(false);
    }
  };

  const handleAddPlayer = async (player?: any) => {
    if (!gameId) return;

    try {
      setAddingPlayer(true);

      if (isGuestMode) {
        if (!selectedInviter || !guestName) {
          toast.error('Selecione quem convida e o nome do convidado');
          return;
        }

        await gamesAPI.addPlayerToGame(
          gameId,
          selectedInviter.phone,
          selectedInviter.name,
          addAsGoalkeeper,
          guestName
        );
        toast.success(`✅ ${guestName} (convidado por ${selectedInviter.name}) adicionado ao jogo${addAsGoalkeeper ? ' como goleiro' : ''}!`);
      } else {
        if (!player) return;

        await gamesAPI.addPlayerToGame(gameId, player.phone, player.name, addAsGoalkeeper);
        toast.success(`✅ ${player.name} adicionado ao jogo${addAsGoalkeeper ? ' como goleiro' : ''}!`);
      }

      await fetchGameDetails();
      setAddPlayerDialogOpen(false);
      setSearchTerm('');
      setSearchResults([]);
      setAddAsGoalkeeper(false);
      setIsGuestMode(false);
      setSelectedInviter(null);
      setGuestName('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar jogador');
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!gameId || !newPrice) return;

    try {
      // Remove R$, spaces, and convert comma to dot
      const cleanedPrice = newPrice.replace(/[^\d,]/g, '').replace(',', '.');
      const price = parseFloat(cleanedPrice);

      if (isNaN(price)) {
        toast.error('Valor inválido');
        return;
      }

      await gamesAPI.updateGame(gameId, { pricePerPlayer: price });
      toast.success('Valor atualizado com sucesso!');
      setIsEditingPrice(false);
      fetchGameDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar valor');
    }
  };

  const handleToggleAllowCasuals = async (checked: boolean) => {
    if (!gameId || !gameInfo) return;

    // Optimistic update
    setGameInfo(prev => prev ? { ...prev, allowCasualsEarly: checked } : null);

    try {
      await gamesAPI.updateGame(gameId, { allowCasualsEarly: checked });
      toast.success(`Entrada de avulsos ${checked ? 'liberada' : 'bloqueada'} com sucesso!`);
    } catch (error: any) {
      // Revert on error
      setGameInfo(prev => prev ? { ...prev, allowCasualsEarly: !checked } : null);
      toast.error(error.response?.data?.message || 'Erro ao atualizar permissão');
      // fetchGameDetails(); // Optional: ensure sync
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdatePrice();
    } else if (e.key === 'Escape') {
      setIsEditingPrice(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearchPlayers(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin/games');
    }
  };

  const formatMoney = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  /* const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  }; */

  const formatPhone = (phone: string): string => {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('55')) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }

    return phone;
  };

  const getStatusBadge = () => {
    if (!gameInfo) return null;

    const apiToFrontendStatus: Record<string, 'scheduled' | 'completed' | 'cancelled' | 'closed'> = {
      'open': 'scheduled',
      'finished': 'completed',
      'cancelled': 'cancelled',
      'closed': 'closed',
    };

    const frontendStatus = apiToFrontendStatus[gameInfo.status] || 'scheduled';

    const statusMap = {
      scheduled: { variant: 'info' as const, label: 'Agendado' },
      completed: { variant: 'success' as const, label: 'Concluído' },
      cancelled: { variant: 'error' as const, label: 'Cancelado' },
      closed: { variant: 'warning' as const, label: 'Aguardando Pagamentos' },
    };

    const config = statusMap[frontendStatus];
    return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Carregando detalhes do jogo...</p>
        </div>
      </div>
    );
  }

  if (!gameInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Jogo não encontrado</p>
          <BFButton onClick={handleBack} variant="outline" className="mt-4">
            Voltar
          </BFButton>
        </div>
      </div>
    );
  }

  const confirmedPlayers = [...gameInfo.players].sort((a, b) => a.slot - b.slot);

  const renderPlayerRow = (player: Player) => (
    <tr
      key={`${player.id}-${player.slot}`}
      className="border-b border-border hover:bg-accent/50 transition-colors"
    >
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">#{player.slot}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{player.name}</span>
          {player.isGoalkeeper && (
            <BFBadge variant="info" size="sm">
              🧤 Goleiro
            </BFBadge>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{player.phone ? formatPhone(player.phone) : '-'}</span>
      </td>
      <td className="px-4 py-3">
        {player.isGoalkeeper ? (
          <BFBadge variant="neutral" size="sm">
            Isento
          </BFBadge>
        ) : player.isPaid ? (
          <BFBadge variant="success" size="sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </BFBadge>
        ) : (
          <BFBadge variant="warning" size="sm">
            Pendente
          </BFBadge>
        )}
      </td>
      {(gameInfo?.status === 'open' || gameInfo?.status === 'closed') && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {!player.isGoalkeeper && gameInfo?.status === 'closed' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <BFButton
                    variant={player.isPaid ? "success" : "success"}
                    size="sm"
                    onClick={() => handleTogglePayment(player.slot, player.isPaid, player.name)}
                    disabled={togglingPayment === String(player.slot)}
                    data-test={`toggle-payment-${player.slot}`}
                  >
                    {togglingPayment === String(player.slot) ? '...' : (player.isPaid ? '✓' : '$')}
                  </BFButton>
                </TooltipTrigger>
                <TooltipContent>
                  {player.isPaid ? 'Marcar como pendente' : 'Marcar como pago'}
                </TooltipContent>
              </Tooltip>
            )}
            {gameInfo?.status === 'open' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <BFButton
                    variant="danger"
                    size="sm"
                    onClick={() => setPlayerToRemove({
                      id: player.id,
                      name: player.name,
                      slot: player.slot,
                      guest: player.guest
                    })}
                    data-test={`remove-player-${player.id}`}
                  >
                    ×
                  </BFButton>
                </TooltipTrigger>
                <TooltipContent>
                  Remover jogador
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </td>
      )}
    </tr>
  );

  const renderWaitlistRow = (player: WaitlistPlayer) => (
    <tr
      key={`${player.id}-${player.position}`}
      className="border-b border-border hover:bg-accent/50 transition-colors"
    >
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">#{player.position}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-foreground">{player.name}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{player.phone ? formatPhone(player.phone) : '-'}</span>
      </td>
    </tr>
  );

  const renderOutlistRow = (player: OutlistPlayer, index: number) => (
    <tr
      key={`${player.id}-${index}`}
      className="border-b border-border hover:bg-accent/50 transition-colors"
    >
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">#{index + 1}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-foreground">{player.name}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{player.phone ? formatPhone(player.phone) : '-'}</span>
      </td>
    </tr>
  );

  return (
    <div className="h-full bg-background" data-test="game-detail-page">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg px-4 sm:px-6 py-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl text-foreground mb-2 truncate">{gameInfo.name}</h1>
            <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground flex-wrap text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatEventDate(gameInfo.date)}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{gameInfo.time}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{gameInfo.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {getStatusBadge()}
            <BFButton
              variant="primary"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBack}
              data-test="back-button"
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Voltar</span>
            </BFButton>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* COLUNA ESQUERDA: Info + Resumo Financeiro */}
        <div className="space-y-6">
          {/* Informações Gerais */}
          <BFCard>
            <div className="p-6">
              <h2 className="text-lg text-foreground mb-4">Informações do jogo</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge()}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor por jogador</span>
                  {isEditingPrice ? (
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <BFMoneyInput
                          value={newPrice}
                          onChange={(val) => setNewPrice(val)}
                          label=""
                          helperText=""
                          showCentsPreview={false}
                          placeholder="0,00"
                          className="h-8 px-2 rounded-md"
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                      <button
                        onClick={handleUpdatePrice}
                        className="p-1 hover:bg-success/10 text-success rounded transition-colors"
                        title="Salvar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsEditingPrice(false)}
                        className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">
                        {formatMoney(gameInfo.pricePerPlayer)}
                      </span>
                      {gameInfo.status === 'open' && (
                        <button
                          onClick={() => {
                            setNewPrice((gameInfo.pricePerPlayer / 100).toFixed(2).replace('.', ','));
                            setIsEditingPrice(true);
                          }}
                          className="p-1 hover:bg-accent text-muted-foreground hover:text-foreground rounded transition-colors"
                          title="Editar valor"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vagas</span>
                  <span className="text-sm text-foreground">
                    {gameInfo.currentPlayers} / {gameInfo.maxPlayers}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground font-medium">Liberar Avulsos Antecipado</span>
                    <span className="text-xs text-muted-foreground">Ignora validação de data futura</span>
                  </div>
                  <Switch
                    checked={gameInfo.allowCasualsEarly || false}
                    onCheckedChange={handleToggleAllowCasuals}
                  />
                </div>
              </div>
            </div>
          </BFCard>

          {/* Resumo Financeiro */}
          <BFCard>
            <div className="p-6">
              <h2 className="text-lg text-foreground mb-4">Resumo financeiro</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total a receber</span>
                  <span className="text-sm text-foreground">
                    {formatMoney(gameInfo.financialSummary.totalToReceive)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-success">Total pago</span>
                  <span className="text-sm text-success">
                    {formatMoney(gameInfo.financialSummary.totalPaid)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-warning">Total pendente</span>
                  <span className="text-sm text-warning">
                    {formatMoney(gameInfo.financialSummary.totalPending)}
                  </span>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pagamentos realizados</span>
                    <span className="text-sm text-foreground">
                      {gameInfo.financialSummary.paidCount}/{gameInfo.financialSummary.paidCount + gameInfo.financialSummary.unpaidCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${((gameInfo.financialSummary.paidCount / (gameInfo.financialSummary.paidCount + gameInfo.financialSummary.unpaidCount)) || 0) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </BFCard>

          {/* Ações Rápidas */}
          {gameInfo.status === 'open' && (
            <BFCard>
              <div className="p-6">
                <h2 className="text-lg text-foreground mb-4">Ações rápidas</h2>

                <div className="space-y-2">
                  <BFButton
                    variant="success"
                    fullWidth
                    onClick={() => setGameToClose(gameInfo.id)}
                    icon={<CheckCircle className="w-4 h-4" />}
                    data-test="close-game-action"
                  >
                    Fechar jogo
                  </BFButton>

                  <BFButton
                    variant="danger"
                    fullWidth
                    onClick={() => setGameToCancel(gameInfo.id)}
                    icon={<XCircle className="w-4 h-4" />}
                    data-test="cancel-game-action"
                  >
                    Cancelar jogo
                  </BFButton>
                </div>
              </div>
            </BFCard>
          )}
        </div>

        {/* COLUNA DIREITA: Listas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lista de Jogadores */}
          <BFCard>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg text-foreground">
                  Jogadores confirmados ({confirmedPlayers.length})
                </h2>
                {gameInfo.status === 'open' && gameInfo.currentPlayers < gameInfo.maxPlayers && (
                  <BFButton
                    variant="primary"
                    size="sm"
                    onClick={() => setAddPlayerDialogOpen(true)}
                    icon={<UserPlus className="w-4 h-4" />}
                    data-test="add-player-button"
                  >
                    Adicionar Jogador
                  </BFButton>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm text-muted-foreground">#</th>
                      <th className="px-4 py-3 text-left text-sm text-muted-foreground">Nome</th>
                      <th className="px-4 py-3 text-left text-sm text-muted-foreground">Telefone</th>
                      <th className="px-4 py-3 text-left text-sm text-muted-foreground">Status</th>
                      {(gameInfo.status === 'open' || gameInfo.status === 'closed') && (
                        <th className="px-4 py-3 text-left text-sm text-muted-foreground">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedPlayers.length > 0 ? (
                      confirmedPlayers.map((player) => renderPlayerRow(player))
                    ) : (
                      <tr>
                        <td colSpan={(gameInfo.status === 'open' || gameInfo.status === 'closed') ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhum jogador confirmado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {confirmedPlayers.length > 0 ? (
                  confirmedPlayers.map((player) => (
                    <div
                      key={`${player.id}-${player.slot}`}
                      className="p-4 bg-accent rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">#{player.slot}</span>
                          <span className="text-sm font-medium text-foreground">{player.name}</span>
                          {player.isGoalkeeper && (
                            <BFBadge variant="info" size="sm">
                              🧤
                            </BFBadge>
                          )}
                        </div>
                        {player.isGoalkeeper ? (
                          <BFBadge variant="neutral" size="sm">
                            Isento
                          </BFBadge>
                        ) : player.isPaid ? (
                          <BFBadge variant="success" size="sm">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Pago
                          </BFBadge>
                        ) : (
                          <BFBadge variant="warning" size="sm">
                            Pendente
                          </BFBadge>
                        )}
                      </div>
                      {player.phone && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {formatPhone(player.phone)}
                        </p>
                      )}
                      {(gameInfo?.status === 'open' || gameInfo?.status === 'closed') && (
                        <div className="flex items-center gap-2 pt-3 border-t border-border">
                          {!player.isGoalkeeper && gameInfo?.status === 'closed' && (
                            <BFButton
                              variant={player.isPaid ? "success" : "success"}
                              size="sm"
                              onClick={() => handleTogglePayment(player.slot, player.isPaid, player.name)}
                              disabled={togglingPayment === String(player.slot)}
                              data-test={`toggle-payment-${player.slot}`}
                              className="flex-1"
                            >
                              {togglingPayment === String(player.slot) ? '...' : (player.isPaid ? 'Marcar pendente' : 'Marcar pago')}
                            </BFButton>
                          )}
                          {gameInfo?.status === 'open' && (
                            <BFButton
                              variant="danger"
                              size="sm"
                              onClick={() => setPlayerToRemove({
                                id: player.id,
                                name: player.name,
                                slot: player.slot,
                                guest: player.guest
                              })}
                              data-test={`remove-player-${player.id}`}
                              className="flex-1"
                            >
                              Remover
                            </BFButton>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum jogador confirmado
                  </div>
                )}
              </div>
            </div>
          </BFCard>

          {/* Lista de Espera */}
          {gameInfo.waitlist.length > 0 && (
            <BFCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg text-foreground">
                    Lista de espera ({gameInfo.waitlist.length})
                  </h2>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm text-muted-foreground">#</th>
                        <th className="px-4 py-3 text-left text-sm text-muted-foreground">Nome</th>
                        <th className="px-4 py-3 text-left text-sm text-muted-foreground">Telefone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameInfo.waitlist.map((player) => renderWaitlistRow(player))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {gameInfo.waitlist.map((player) => (
                    <div
                      key={`${player.id}-${player.position}`}
                      className="p-4 bg-accent rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">#{player.position}</span>
                        <span className="text-sm font-medium text-foreground">{player.name}</span>
                      </div>
                      {player.phone && (
                        <p className="text-xs text-muted-foreground">
                          {formatPhone(player.phone)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </BFCard>
          )}

          {/* Lista de Saída */}
          {gameInfo.outlist.length > 0 && (
            <BFCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg text-foreground">
                    Fora do jogo ({gameInfo.outlist.length})
                  </h2>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm text-muted-foreground">#</th>
                        <th className="px-4 py-3 text-left text-sm text-muted-foreground">Nome</th>
                        <th className="px-4 py-3 text-left text-sm text-muted-foreground">Telefone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameInfo.outlist.map((player, index) => renderOutlistRow(player, index))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {gameInfo.outlist.map((player, index) => (
                    <div
                      key={`${player.id}-${index}`}
                      className="p-4 bg-accent rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm font-medium text-foreground">{player.name}</span>
                      </div>
                      {player.phone && (
                        <p className="text-xs text-muted-foreground">
                          {formatPhone(player.phone)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </BFCard>
          )}
        </div>
      </div>

      {/* Dialog de confirmação de fechamento */}
      {/* Modal de Fechamento Financeiro */}
      <Dialog open={!!gameToClose} onOpenChange={(open) => !open && setGameToClose(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechamento Financeiro</DialogTitle>
            <DialogDescription>
              Confira os valores antes de encerrar o jogo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Arrecadado (Pago)</span>
                <span className="text-base font-bold text-green-600">
                  {formatMoney(gameInfo?.financialSummary.totalPaid || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pendente</span>
                <span className="text-base font-bold text-yellow-600">
                  {formatMoney(gameInfo?.financialSummary.totalPending || 0)}
                </span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                <span className="font-medium">Total Previsto</span>
                <span className="font-bold">
                  {formatMoney(gameInfo?.financialSummary.totalToReceive || 0)}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Ao confirmar, o jogo será marcado como <strong>Concluído</strong>. Os pagamentos pendentes serão registrados como débitos na conta dos jogadores.
              </p>
            </div>
          </div>

          <DialogFooter>
            <BFButton
              variant="ghost"
              onClick={() => setGameToClose(null)}
              disabled={closingGame}
            >
              Cancelar
            </BFButton>
            <BFButton
              variant="success"
              onClick={handleCloseGame}
              disabled={closingGame}
              icon={closingGame ? undefined : <CheckCircle className="w-4 h-4" />}
            >
              {closingGame ? 'Fechando...' : 'Confirmar Fechamento'}
            </BFButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de remoção de jogador */}
      <AlertDialog open={!!playerToRemove} onOpenChange={(open) => !open && setPlayerToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Jogador</AlertDialogTitle>
            <AlertDialogDescription>
              {playerToRemove?.guest ? (
                <>Remover o convidado <strong>{playerToRemove.name}</strong> (Slot {playerToRemove.slot})?</>
              ) : (
                <>Tem certeza que deseja remover <strong>{playerToRemove?.name}</strong> deste jogo? Esta ação não pode ser desfeita.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingPlayer}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePlayer}
              disabled={removingPlayer}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {removingPlayer ? 'Removendo...' : 'Sim, remover jogador'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de cancelamento de jogo */}
      <AlertDialog open={!!gameToCancel} onOpenChange={(open) => !open && setGameToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Jogo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este jogo? Esta ação não pode ser desfeita e todos os jogadores serão notificados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelingGame}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelGame}
              disabled={cancelingGame}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelingGame ? 'Cancelando...' : 'Sim, cancelar jogo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de adicionar jogador */}
      <Dialog open={addPlayerDialogOpen} onOpenChange={(open) => {
        setAddPlayerDialogOpen(open);
        if (!open) {
          setIsGuestMode(false);
          setSearchTerm('');
          setSearchResults([]);
          setSelectedInviter(null);
          setGuestName('');
          setAddAsGoalkeeper(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar ao Jogo</DialogTitle>
            <DialogDescription>
              {isGuestMode ? 'Adicione um convidado ao jogo' : 'Busque o jogador por nome ou número de telefone'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Toggle Jogador / Convidado */}
            <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
              <button
                onClick={() => setIsGuestMode(false)}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${!isGuestMode
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-accent'
                  }`}
                data-test="player-mode-button"
              >
                Jogador Cadastrado
              </button>
              <button
                onClick={() => setIsGuestMode(true)}
                className={`flex-1 px-4 py-2 rounded-md transition-colors ${isGuestMode
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-accent'
                  }`}
                data-test="guest-mode-button"
              >
                Convidado
              </button>
            </div>

            {isGuestMode ? (
              /* Modo Convidado */
              <>
                <div className="space-y-3">
                  {/* Autocomplete para quem convida */}
                  {!selectedInviter ? (
                    <>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">
                          Quem está convidando? *
                        </label>
                        <BFInput
                          placeholder="Digite o nome ou telefone..."
                          value={searchTerm}
                          onChange={(value) => setSearchTerm(value)}
                          icon={<Search className="w-4 h-4" />}
                          fullWidth
                          data-test="search-inviter-input"
                        />
                      </div>

                      {/* Resultados da busca de quem convida */}
                      {searchTerm.length >= 2 && (
                        <div className="border border-border rounded-lg max-h-[200px] overflow-y-auto">
                          {searchingPlayers ? (
                            <div className="p-4 text-center text-muted-foreground">
                              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                              <p className="mt-2">Buscando jogadores...</p>
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="divide-y divide-border">
                              {searchResults.map((player) => (
                                <button
                                  key={player.id}
                                  onClick={() => {
                                    setSelectedInviter(player);
                                    setSearchTerm('');
                                    setSearchResults([]);
                                  }}
                                  className="w-full p-3 text-left hover:bg-accent transition-colors"
                                  data-test={`inviter-result-${player.id}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{player.name}</p>
                                      {player.phone && (
                                        <p className="text-xs text-muted-foreground">{formatPhone(player.phone)}</p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              <p>Nenhum jogador encontrado</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Mostrar quem foi selecionado */}
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">
                          Quem está convidando
                        </label>
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border">
                          <div>
                            <p className="text-sm font-medium text-foreground">{selectedInviter.name}</p>
                            {selectedInviter.phone && (
                              <p className="text-xs text-muted-foreground">{formatPhone(selectedInviter.phone)}</p>
                            )}
                          </div>
                          <BFButton
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInviter(null)}
                            data-test="change-inviter-button"
                          >
                            Alterar
                          </BFButton>
                        </div>
                      </div>

                      {/* Campo nome do convidado */}
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">
                          Nome do convidado *
                        </label>
                        <BFInput
                          placeholder="Pedro Costa"
                          value={guestName}
                          onChange={(value) => setGuestName(value)}
                          fullWidth
                          data-test="guest-name-input"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Checkbox Goleiro */}
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="add-as-goalkeeper"
                    checked={addAsGoalkeeper}
                    onChange={(e) => setAddAsGoalkeeper(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    data-test="goalkeeper-checkbox"
                  />
                  <label
                    htmlFor="add-as-goalkeeper"
                    className="text-sm text-foreground cursor-pointer select-none"
                  >
                    🧤 Adicionar como goleiro
                  </label>
                </div>

                {/* Botão adicionar convidado */}
                <BFButton
                  variant="primary"
                  fullWidth
                  onClick={() => handleAddPlayer()}
                  disabled={addingPlayer || !selectedInviter || !guestName}
                  data-test="add-guest-button"
                >
                  {addingPlayer ? 'Adicionando...' : 'Adicionar Convidado'}
                </BFButton>
              </>
            ) : (
              /* Modo Jogador Cadastrado */
              <>
                {/* Campo de busca */}
                <div className="relative">
                  <BFInput
                    placeholder="Digite o nome ou telefone..."
                    value={searchTerm}
                    onChange={(value) => setSearchTerm(value)}
                    icon={<Search className="w-4 h-4" />}
                    fullWidth
                    data-test="search-player-input"
                  />
                </div>

                {/* Checkbox Goleiro */}
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="add-as-goalkeeper"
                    checked={addAsGoalkeeper}
                    onChange={(e) => setAddAsGoalkeeper(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                    data-test="goalkeeper-checkbox"
                  />
                  <label
                    htmlFor="add-as-goalkeeper"
                    className="text-sm text-foreground cursor-pointer select-none"
                  >
                    🧤 Adicionar como goleiro
                  </label>
                </div>

                {/* Resultados da busca */}
                <div className="border border-border rounded-lg max-h-[300px] overflow-y-auto">
                  {searchingPlayers ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                      <p className="mt-2">Buscando jogadores...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-border">
                      {searchResults.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => handleAddPlayer(player)}
                          disabled={addingPlayer}
                          className="w-full p-4 text-left hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          data-test={`player-result-${player.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{player.name}</p>
                              {player.phone && (
                                <p className="text-xs text-muted-foreground">{formatPhone(player.phone)}</p>
                              )}
                            </div>
                            {player.isGoalie && (
                              <BFBadge variant="info" size="sm">
                                🧤 Goleiro
                              </BFBadge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchTerm.length >= 2 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <p>Nenhum jogador encontrado</p>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <p>Digite pelo menos 2 caracteres para buscar</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};