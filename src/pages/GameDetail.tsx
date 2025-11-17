/**
 * GameDetail Page
 * 
 * Tela de detalhe do jogo para o painel admin
 * Mostra todas as informações operacionais:
 * - Informações gerais (data, horário, local, valor)
 * - Listas de jogadores (Players, Waitlist, Outlist)
 * - Suplentes
 * - Resumo financeiro
 * - Ações rápidas
 */

import React, { useState } from 'react';
import { BFButton } from '../components/BF-Button';
import { BFBadge } from '../components/BF-Badge';
import { BFCard } from '../components/BF-Card';
import { 
  ArrowLeft, 
  Edit, 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Download,
  Lock,
  Unlock,
  MoreVertical,
  UserPlus,
  UserMinus,
  ArrowRight,
  Trash2
} from 'lucide-react';

// Tipos
interface Player {
  id: string;
  name: string;
  phone: string;
  isPaid: boolean;
  isSubstitute: boolean;
  joinedAt: string;
}

interface WaitlistPlayer {
  id: string;
  name: string;
  phone: string;
  position: number;
  joinedAt: string;
}

interface OutlistPlayer {
  id: string;
  name: string;
  phone: string;
  reason: string;
  leftAt: string;
}

interface GameInfo {
  id: string;
  title: string;
  dayOfWeek: string;
  date: string;
  time: string;
  location: string;
  pricePerPlayer: number;
  maxPlayers: number;
  status: 'open' | 'full' | 'closed' | 'cancelled';
  isPaid: boolean;
}

interface GameDetailProps {
  gameId?: string;
  onBack?: () => void;
}

export const GameDetail: React.FC<GameDetailProps> = ({ gameId = '1', onBack }) => {
  // Mock data - em produção virá da API
  const [gameInfo] = useState<GameInfo>({
    id: gameId,
    title: '⚽ CAMPO DO VIANA',
    dayOfWeek: 'Terça',
    date: '19/11/2025',
    time: '20:30',
    location: 'Campo do Viana',
    pricePerPlayer: 1400, // em centavos
    maxPlayers: 14,
    status: 'open',
    isPaid: false,
  });

  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'João Silva', phone: '11999999999', isPaid: true, isSubstitute: false, joinedAt: '18/11 14:30' },
    { id: '2', name: 'Pedro Santos', phone: '11988888888', isPaid: true, isSubstitute: false, joinedAt: '18/11 15:00' },
    { id: '3', name: 'Carlos Oliveira', phone: '11977777777', isPaid: false, isSubstitute: false, joinedAt: '18/11 16:20' },
    { id: '4', name: 'Rafael Costa', phone: '11966666666', isPaid: true, isSubstitute: false, joinedAt: '18/11 17:45' },
    { id: '5', name: 'Lucas Almeida', phone: '11955555555', isPaid: false, isSubstitute: false, joinedAt: '18/11 18:10' },
    { id: '6', name: 'Fernando Lima', phone: '11944444444', isPaid: true, isSubstitute: false, joinedAt: '18/11 19:00' },
    { id: '7', name: 'Gabriel Rocha', phone: '11933333333', isPaid: true, isSubstitute: false, joinedAt: '18/11 20:15' },
    { id: '8', name: 'Marcos Pereira', phone: '11922222222', isPaid: false, isSubstitute: false, joinedAt: '19/11 08:30' },
    { id: '9', name: 'André Martins', phone: '11911111111', isPaid: true, isSubstitute: false, joinedAt: '19/11 09:45' },
    { id: '10', name: 'Ricardo Souza', phone: '11900000000', isPaid: true, isSubstitute: false, joinedAt: '19/11 10:20' },
    { id: '11', name: 'Bruno Carvalho', phone: '11899999999', isPaid: false, isSubstitute: true, joinedAt: '19/11 11:00' },
    { id: '12', name: 'Thiago Barbosa', phone: '11888888888', isPaid: true, isSubstitute: true, joinedAt: '19/11 12:30' },
  ]);

  const [waitlist] = useState<WaitlistPlayer[]>([
    { id: '13', name: 'Rodrigo Dias', phone: '11877777777', position: 1, joinedAt: '19/11 13:00' },
    { id: '14', name: 'Felipe Nunes', phone: '11866666666', position: 2, joinedAt: '19/11 14:15' },
    { id: '15', name: 'Gustavo Campos', phone: '11855555555', position: 3, joinedAt: '19/11 15:30' },
  ]);

  const [outlist] = useState<OutlistPlayer[]>([
    { id: '16', name: 'Paulo Moreira', phone: '11844444444', reason: 'Cancelou', leftAt: '18/11 22:00' },
    { id: '17', name: 'Diego Fernandes', phone: '11833333333', reason: 'Removido pelo admin', leftAt: '19/11 08:00' },
  ]);

  // Cálculos financeiros
  const confirmedPlayers = players.filter(p => !p.isSubstitute);
  const substitutePlayers = players.filter(p => p.isSubstitute);
  const paidPlayers = players.filter(p => p.isPaid);
  const totalToReceive = confirmedPlayers.length * gameInfo.pricePerPlayer;
  const totalPaid = paidPlayers.length * gameInfo.pricePerPlayer;
  const totalPending = totalToReceive - totalPaid;

  // Formata valor monetário
  const formatMoney = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  // Status badge
  const getStatusBadge = () => {
    const statusMap = {
      open: { label: 'Aberto', variant: 'success' as const },
      full: { label: 'Lotado', variant: 'warning' as const },
      closed: { label: 'Fechado', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    const status = statusMap[gameInfo.status];
    return <BFBadge variant={status.variant}>{status.label}</BFBadge>;
  };

  // Renderiza linha de jogador
  const renderPlayerRow = (player: Player, index: number) => (
    <tr 
      key={player.id}
      className="border-b border-border hover:bg-accent/50 transition-colors"
    >
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">#{index + 1}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{player.name}</span>
          {player.isSubstitute && (
            <BFBadge variant="outline" size="sm">Suplente</BFBadge>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">{player.phone}</span>
      </td>
      <td className="px-4 py-3">
        {player.isPaid ? (
          <BFBadge variant="success" size="sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </BFBadge>
        ) : (
          <BFBadge variant="warning" size="sm">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendente
          </BFBadge>
        )}
      </td>
      <td className="px-4 py-3">
        <button className="p-1 hover:bg-accent rounded-md transition-colors">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="h-full bg-background" data-test="game-detail-page">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl text-foreground mb-2">Detalhe do jogo</h1>
              <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{gameInfo.dayOfWeek}, {gameInfo.date}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{gameInfo.time}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{gameInfo.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BFButton
                variant="outline"
                icon={<Edit className="w-4 h-4" />}
                data-test="edit-game-button"
              >
                Editar jogo
              </BFButton>
              {onBack && (
                <BFButton
                  variant="outline"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={onBack}
                  data-test="back-button"
                >
                  Voltar
                </BFButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUNA ESQUERDA: Info + Ações */}
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
                    <span className="text-sm text-foreground">
                      {formatMoney(gameInfo.pricePerPlayer)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Vagas</span>
                    <span className="text-sm text-foreground">
                      {confirmedPlayers.length} / {gameInfo.maxPlayers}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Suplentes</span>
                    <span className="text-sm text-foreground">
                      {substitutePlayers.length}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Marcado como pago?</span>
                      {gameInfo.isPaid ? (
                        <BFBadge variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Pago
                        </BFBadge>
                      ) : (
                        <BFBadge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Não pago
                        </BFBadge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </BFCard>

            {/* Resumo Financeiro */}
            <BFCard>
              <div className="p-6">
                <h2 className="text-lg text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[var(--bf-green-primary)]" />
                  Resumo financeiro
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total a receber</span>
                    <span className="text-sm text-foreground">
                      {formatMoney(totalToReceive)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Já recebido</span>
                    <span className="text-sm text-[var(--bf-green-primary)]">
                      {formatMoney(totalPaid)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm">Pendente</span>
                    <span className={`text-sm ${totalPending > 0 ? 'text-destructive' : 'text-[var(--bf-green-primary)]'}`}>
                      {formatMoney(totalPending)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 {paidPlayers.length} de {players.length} jogadores pagaram
                  </p>
                </div>
              </div>
            </BFCard>

            {/* Ações Rápidas */}
            <BFCard>
              <div className="p-6">
                <h2 className="text-lg text-foreground mb-4">Ações rápidas</h2>
                
                <div className="space-y-2">
                  <BFButton
                    variant="outline"
                    fullWidth
                    icon={<Send className="w-4 h-4" />}
                    data-test="send-reminder-button"
                  >
                    Enviar lembrete
                  </BFButton>

                  <BFButton
                    variant="outline"
                    fullWidth
                    icon={<Download className="w-4 h-4" />}
                    data-test="export-csv-button"
                  >
                    Exportar lista (CSV)
                  </BFButton>

                  <BFButton
                    variant="outline"
                    fullWidth
                    icon={gameInfo.status === 'closed' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    data-test="toggle-list-button"
                  >
                    {gameInfo.status === 'closed' ? 'Reabrir lista' : 'Fechar lista'}
                  </BFButton>
                </div>
              </div>
            </BFCard>
          </div>

          {/* COLUNA CENTRAL E DIREITA: Listas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Players (Jogadores Confirmados) */}
            <BFCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                      Jogadores (Players)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {confirmedPlayers.length} titulares + {substitutePlayers.length} suplentes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {confirmedPlayers.length} / {gameInfo.maxPlayers} vagas
                    </span>
                    <BFButton
                      variant="outline"
                      size="sm"
                      icon={<UserPlus className="w-4 h-4" />}
                      data-test="add-player-button"
                    >
                      Adicionar
                    </BFButton>
                  </div>
                </div>

                {players.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left text-xs text-muted-foreground">#</th>
                          <th className="px-4 py-3 text-left text-xs text-muted-foreground">Nome</th>
                          <th className="px-4 py-3 text-left text-xs text-muted-foreground">Telefone</th>
                          <th className="px-4 py-3 text-left text-xs text-muted-foreground">Pagamento</th>
                          <th className="px-4 py-3 text-left text-xs text-muted-foreground">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Titulares */}
                        {confirmedPlayers.map((player, index) => renderPlayerRow(player, index))}
                        
                        {/* Separador para suplentes */}
                        {substitutePlayers.length > 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground">Suplentes</span>
                                <div className="flex-1 h-px bg-border" />
                              </div>
                            </td>
                          </tr>
                        )}
                        
                        {/* Suplentes */}
                        {substitutePlayers.map((player, index) => renderPlayerRow(player, confirmedPlayers.length + index))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhum jogador confirmado ainda
                    </p>
                    <BFButton
                      variant="outline"
                      icon={<UserPlus className="w-4 h-4" />}
                      data-test="add-first-player-button"
                    >
                      Adicionar manualmente
                    </BFButton>
                  </div>
                )}
              </div>
            </BFCard>

            {/* Waitlist (Lista de Espera) */}
            <BFCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg text-foreground flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                      Lista de espera (Waitlist)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Jogadores aguardando vaga caso alguém desista
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {waitlist.length} aguardando
                  </span>
                </div>

                {waitlist.length > 0 ? (
                  <div className="space-y-2">
                    {waitlist.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bf-blue-primary)]/10 text-[var(--bf-blue-primary)]">
                            <span className="text-sm">{player.position}º</span>
                          </div>
                          <div>
                            <p className="text-sm text-foreground">{player.name}</p>
                            <p className="text-xs text-muted-foreground">{player.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 hover:bg-accent rounded-md transition-colors"
                            title="Promover para jogador"
                          >
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-accent rounded-md transition-colors">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      💡 Arraste para reordenar a prioridade
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Sem jogadores na lista de espera
                    </p>
                  </div>
                )}
              </div>
            </BFCard>

            {/* Outlist (Ausentes/Removidos) */}
            <BFCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg text-foreground flex items-center gap-2">
                      <UserMinus className="w-5 h-5 text-destructive" />
                      Outlist (Ausentes/Removidos)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Jogadores que estavam no jogo mas saíram ou foram removidos
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {outlist.length} saíram
                  </span>
                </div>

                {outlist.length > 0 ? (
                  <div className="space-y-2">
                    {outlist.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                      >
                        <div>
                          <p className="text-sm text-foreground">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-destructive">{player.reason}</p>
                          <p className="text-xs text-muted-foreground">{player.leftAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserMinus className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum jogador saiu ainda
                    </p>
                  </div>
                )}
              </div>
            </BFCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
