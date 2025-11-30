import React, { useState, useEffect } from 'react';
import { BFInput } from '../components/BF-Input';
import { BFButton } from '../components/BF-Button';
import { BFSelect } from '../components/BF-Select';
import { BFDateInput } from '../components/BF-DateInput';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFTextarea } from '../components/BF-Textarea';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { BFWhatsAppPreview } from '../components/BF-WhatsAppPreview';
import {
  ArrowLeft,
  Save,
  DollarSign,
  FileText,
  X,
  User,
  Trophy,
  Search
} from 'lucide-react';
import { workspacesAPI, gamesAPI, debtsAPI, playersAPI } from '../lib/axios';

// Tipos
type DebitMode = 'game' | 'player';

interface DebitForm {
  mode: DebitMode;
  date: string;
  workspaceId: string;
  playerId: string;
  amount: string;
  amountCents: number;
  note: string;
  category: string;
  status: 'pendente' | 'confirmado';
}

interface GameInfo {
  id: string;
  name: string;
  time: string;
  date: string;
  found: boolean;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
}

interface PlayerInfo {
  id: string;
  name: string;
  phone: string;
}

interface AddDebitProps {
  onBack?: () => void;
}

const gameCategoryOptions = [
  { value: 'general', label: 'Geral (general)' },
  { value: 'field-payment', label: 'Pagamento Campo' },
  { value: 'equipment', label: 'Equipamentos' },
  { value: 'rental-goalkeeper', label: 'Goleiro de Aluguel' },
];

const playerCategoryOptions = [
  { value: 'player-debt', label: 'Dívida Jogador' },
];

export const AddDebit: React.FC<AddDebitProps> = ({ onBack }) => {
  // Estado do formulário
  const [formData, setFormData] = useState<DebitForm>({
    mode: 'game',
    date: '',
    workspaceId: '',
    playerId: '',
    amount: '',
    amountCents: 0,
    note: '',
    category: 'general',
    status: 'confirmado',
  });

  // Estados de validação e dados
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);

  // Estados de busca de jogador
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [playerSearchResults, setPlayerSearchResults] = useState<any[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingGame, setCheckingGame] = useState(false);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  // Carregar workspaces ao montar
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);
        const response = await workspacesAPI.getAllWorkspaces();

        setWorkspaces(response.workspaces.map((w: any) => ({
          id: w.id,
          name: w.name,
          slug: w.slug
        })));

        // Selecionar o primeiro se houver apenas um
        if (response.length === 1) {
          updateField('workspaceId', response[0].id);
        }
      } catch (error) {
        console.error('Erro ao buscar workspaces:', error);
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    fetchWorkspaces();
  }, []);

  // Atualiza campo
  const updateField = (field: keyof DebitForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Troca de modo (Jogo <-> Jogador)
  const handleModeChange = (mode: DebitMode) => {
    setFormData(prev => ({
      ...prev,
      mode,
      // Reseta campos específicos ao trocar de modo
      date: mode === 'game' ? prev.date : '',
      playerId: '',
      category: mode === 'game' ? 'general' : 'player-debt',
      status: mode === 'game' ? 'confirmado' : 'pendente'
    }));
    setErrors({});
    setGameInfo(null);
    setPlayerInfo(null);
    setPlayerSearchTerm('');
    setPlayerSearchResults([]);
  };


  // Busca Jogo (apenas modo 'game')
  useEffect(() => {
    // Executa busca se for modo game OU (modo player com data preenchida)
    if (!formData.workspaceId) return;

    // No modo player, só busca se tiver data
    if (formData.mode === 'player' && !formData.date) {
      setGameInfo(null);
      return;
    }

    // Valida formato yyyy-mm-dd
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(formData.date);

    if (isValidDate) {
      setCheckingGame(true);

      const checkGame = async () => {
        try {
          const response = await gamesAPI.getAllGames(1, 100);
          const games = response.data || [];

          const game = games.find((g: any) => {
            // Normaliza data do jogo para YYYY-MM-DD
            const gameDateStr = g.date.split('T')[0];

            // Verifica data (comparação de string direta)
            const matchDate = gameDateStr === formData.date;

            // Verifica workspace
            const gameWorkspaceId = g.workspaceId || g.workspace?.id;
            const matchWorkspace = gameWorkspaceId === formData.workspaceId;

            return matchDate && matchWorkspace;
          });

          if (game) {
            setGameInfo({
              id: game.id,
              name: game.name,
              time: game.time,
              date: formData.date,
              found: true,
            });
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.date;
              return newErrors;
            });
          } else {
            setGameInfo({
              id: '',
              name: '',
              time: '',
              date: formData.date,
              found: false,
            });
            setErrors((prev) => ({
              ...prev,
              date: `Jogo não encontrado em ${formData.date}.`,
            }));
          }
        } catch (error) {
          console.error('Erro ao buscar jogo:', error);
          setErrors((prev) => ({
            ...prev,
            date: 'Erro ao buscar jogo.',
          }));
        } finally {
          setCheckingGame(false);
        }
      };

      const timeoutId = setTimeout(checkGame, 800);
      return () => clearTimeout(timeoutId);
    } else {
      setGameInfo(null);
    }
  }, [formData.date, formData.workspaceId, formData.mode]);

  // Busca Jogador (apenas modo 'player')
  useEffect(() => {
    if (formData.mode !== 'player') return;

    const timer = setTimeout(async () => {
      if (playerSearchTerm.length >= 2) {
        setSearchingPlayers(true);
        try {
          const response = await playersAPI.searchPlayers(playerSearchTerm);
          setPlayerSearchResults(response.players || []);
        } catch (error) {
          console.error('Erro ao buscar jogadores:', error);
        } finally {
          setSearchingPlayers(false);
        }
      } else {
        setPlayerSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [playerSearchTerm, formData.mode]);

  const handlePlayerSelect = (player: any) => {
    setPlayerInfo({
      id: player.id,
      name: player.name,
      phone: player.phone
    });
    updateField('playerId', player.id);
    setPlayerSearchTerm('');
    setPlayerSearchResults([]);
  };

  const handleAmountChange = (value: string, cents: number) => {
    updateField('amount', value);
    updateField('amountCents', cents);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.workspaceId) {
      newErrors.workspaceId = 'Workspace é obrigatório';
    }

    if (formData.mode === 'game') {
      if (!formData.date) {
        newErrors.date = 'Data obrigatória';
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
        newErrors.date = 'Data inválida.';
      } else if (!gameInfo?.found) {
        newErrors.date = 'Jogo não encontrado para esta data';
      }
    } else { // mode === 'player'
      if (!formData.playerId) {
        newErrors.playerSearch = 'Selecione um jogador';
      }
      // Data é opcional, mas se fornecida, deve ser válida e ter jogo
      if (formData.date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
          newErrors.date = 'Data inválida.';
        } else if (!gameInfo?.found) {
          newErrors.date = 'Jogo não encontrado para esta data';
        }
      }
    }

    if (!formData.amount || formData.amountCents <= 0) {
      newErrors.amount = 'Valor inválido. Exemplos: 150,00 | 150.00 | R$150 | 15000c';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      await debtsAPI.createDebt({
        playerId: formData.mode === 'player' ? formData.playerId : '',
        workspaceId: formData.workspaceId,
        gameId: gameInfo?.found ? gameInfo.id : undefined,
        amount: formData.amountCents / 100,
        notes: getFinalNote(),
        category: formData.category as any,
        status: formData.status,
      });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);

      // Reset parcial
      setFormData(prev => ({
        ...prev,
        amount: '',
        amountCents: 0,
        note: '',
      }));

      if (formData.mode === 'player') {
        setPlayerInfo(null);
        updateField('playerId', '');
      }
    } catch (error) {
      console.error('Erro ao criar débito:', error);
      setLoading(false);
    }
  };

  const formatMoney = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  const formatPhone = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getFinalNote = (): string => {
    const baseNote = formData.note.trim() || (formData.mode === 'game' ? 'Pagamento ao campo' : 'Dívida avulsa');

    // Se tem jogo associado (seja modo game ou player)
    if (gameInfo?.found) {
      const gameName = gameInfo.name || 'Jogo';
      return `${baseNote} - Jogo ${formData.date} (${gameName})`;
    }
    return baseNote;
  };

  const getSelectedWorkspaceName = () => {
    return workspaces.find(w => w.id === formData.workspaceId)?.name || '';
  };

  // Componente de Seleção de Modo
  const ModeSelector = () => (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <button
        onClick={() => handleModeChange('game')}
        className={`
          flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all
          ${formData.mode === 'game'
            ? 'border-[var(--bf-blue-primary)] bg-blue-50/10 text-[var(--bf-blue-primary)]'
            : 'border-border hover:border-muted-foreground/50 text-muted-foreground'}
        `}
      >
        <Trophy className="w-8 h-8 mb-3" />
        <span className="font-medium">Débito de Jogo</span>
        <span className="text-xs mt-1 opacity-70">Associado a um jogo específico</span>
      </button>

      <button
        onClick={() => handleModeChange('player')}
        className={`
          flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all
          ${formData.mode === 'player'
            ? 'border-[var(--bf-blue-primary)] bg-blue-50/10 text-[var(--bf-blue-primary)]'
            : 'border-border hover:border-muted-foreground/50 text-muted-foreground'}
        `}
      >
        <User className="w-8 h-8 mb-3" />
        <span className="font-medium">Débito de Jogador</span>
        <span className="text-xs mt-1 opacity-70">Direto para um jogador</span>
      </button>
    </div>
  );

  return (
    <div className="h-full bg-background" data-test="add-debit-page">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-accent rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl text-foreground mb-1">Registrar Débito</h1>
              <p className="text-sm text-muted-foreground">
                Lance um débito financeiro para um jogo ou jogador
              </p>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <BFAlertMessage
            variant="success"
            title="Débito registrado!"
            message={`Débito de ${formatMoney(formData.amountCents)} registrado com sucesso.`}
            onClose={() => setSuccess(false)}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <ModeSelector />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA: Formulário */}
          <div className="space-y-6">

            {/* Card Principal (Jogo ou Jogador) */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {formData.mode === 'game' ? (
                  <Trophy className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                ) : (
                  <User className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                )}
                <h2 className="text-lg text-foreground">
                  {formData.mode === 'game' ? 'Informações do Jogo' : 'Informações do Jogador'}
                </h2>
              </div>

              {/* Workspace (Comum aos dois) */}
              <div>
                <BFSelect
                  label="Workspace"
                  value={formData.workspaceId}
                  onChange={(value) => updateField('workspaceId', value)}
                  options={workspaces.map(w => ({ value: w.id, label: w.name }))}
                  disabled={loading || loadingWorkspaces}
                  placeholder="Selecione o workspace"
                  error={errors.workspaceId}
                />
              </div>

              {/* Campos Específicos */}
              {formData.mode === 'game' ? (
                <>
                  <BFDateInput
                    label="Data do jogo"
                    value={formData.date}
                    onChange={(value) => updateField('date', value)}
                    error={errors.date}
                    disabled={loading || !formData.workspaceId}
                    placeholder="dd/mm"
                  />
                  {checkingGame && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-[var(--bf-blue-primary)] border-t-transparent rounded-full animate-spin" />
                      Buscando jogo...
                    </div>
                  )}
                  {gameInfo?.found && (
                    <div className="p-3 bg-green-50/50 border border-green-200 rounded-lg text-sm">
                      <p className="font-medium text-green-800">{gameInfo.name}</p>
                      <p className="text-green-600">{gameInfo.time}</p>
                    </div>
                  )}
                  {gameInfo && !gameInfo.found && (
                    <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-destructive" />
                        <p className="text-sm text-destructive">
                          Jogo não encontrado em {formData.date}.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {!playerInfo ? (
                    <div className="relative">
                      <BFInput
                        label="Buscar Jogador"
                        value={playerSearchTerm}
                        onChange={(value) => setPlayerSearchTerm(value)}
                        placeholder="Nome ou telefone..."
                        icon={<Search className="w-4 h-4" />}
                        error={errors.playerSearch}
                      />

                      {/* Resultados da busca */}
                      {(searchingPlayers || playerSearchResults.length > 0) && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {searchingPlayers ? (
                            <div className="p-4 text-center text-muted-foreground">
                              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mr-2" />
                              Buscando...
                            </div>
                          ) : (
                            playerSearchResults.map((player) => (
                              <button
                                key={player.id}
                                onClick={() => handlePlayerSelect(player)}
                                className="w-full p-3 text-left hover:bg-accent transition-colors border-b border-border last:border-0"
                              >
                                <p className="font-medium text-foreground">{player.name}</p>
                                {player.phone && (
                                  <p className="text-xs text-muted-foreground">{formatPhone(player.phone)}</p>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {playerSearchTerm.length >= 2 && !searchingPlayers && playerSearchResults.length === 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Nenhum jogador encontrado.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-accent/50 rounded-lg border border-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-foreground">{playerInfo.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPhone(playerInfo.phone)}</p>
                        </div>
                        <button
                          onClick={() => {
                            setPlayerInfo(null);
                            updateField('playerId', '');
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Campo de Data (opcional no modo player) */}
              {formData.mode === 'player' && playerInfo && (
                <>
                  <BFDateInput
                    label="Data do Jogo (Opcional)"
                    value={formData.date}
                    onChange={(value) => updateField('date', value)}
                    error={errors.date}
                    helperText="Associe este débito a um jogo específico (opcional)"
                  />

                  {/* Feedback de busca de jogo */}
                  {checkingGame && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-[var(--bf-blue-primary)] border-t-transparent rounded-full animate-spin" />
                      Buscando jogo...
                    </div>
                  )}
                  {gameInfo?.found && (
                    <div className="mt-2 p-3 bg-green-50/50 border border-green-200 rounded-lg text-sm">
                      <p className="font-medium text-green-800">{gameInfo.name}</p>
                      <p className="text-green-600">{gameInfo.time}</p>
                    </div>
                  )}
                  {gameInfo && !gameInfo.found && formData.date && (
                    <div className="mt-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-destructive" />
                        <p className="text-sm text-destructive">
                          Jogo não encontrado em {formData.date}.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Card Valores */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Valores e Detalhes</h2>
              </div>

              <BFMoneyInput
                label="Valor"
                value={formData.amount}
                onChange={handleAmountChange}
                error={errors.amount}
                disabled={loading}
                placeholder="150,00"
                helperText="Aceita: 150,00 | 150.00 | R$150 | 15000c"
                showCentsPreview
              />

              <BFTextarea
                label="Nota / Descrição"
                value={formData.note}
                onChange={(value) => updateField('note', value)}
                rows={2}
                placeholder={formData.mode === 'game' ? "Ex: Pagamento campo" : "Ex: Dívida de colete"}
                helperText={formData.mode === 'game' ? 'Se vazio, usará "Pagamento ao campo"' : 'Se vazio, usará "Dívida avulsa"'}
              />

              <BFSelect
                label="Categoria"
                value={formData.category}
                onChange={(value) => updateField('category', value)}
                options={formData.mode === 'game' ? gameCategoryOptions : playerCategoryOptions}
                disabled={loading || formData.mode === 'player'}
              />

              <BFSelect
                label="Status Inicial"
                value={formData.status}
                onChange={(value) => updateField('status', value)}
                options={[
                  { value: 'pendente', label: 'Pendente' },
                  { value: 'confirmado', label: 'Confirmado (Pago)' },
                ]}
                disabled={loading || formData.mode === 'game'}
              />
            </div>

            <BFButton
              variant="primary"
              onClick={handleSave}
              disabled={loading || !formData.workspaceId || (formData.mode === 'game' && !gameInfo?.found) || (formData.mode === 'player' && !playerInfo)}
              loading={loading}
              icon={<Save className="w-4 h-4" />}
              className="w-full"
            >
              Registrar Débito
            </BFButton>
          </div>

          {/* COLUNA DIREITA: Preview */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-card rounded-xl border-2 border-border p-6">
              <h2 className="text-lg text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                Resumo
              </h2>

              {(!formData.workspaceId || (formData.mode === 'game' && !gameInfo?.found) || (formData.mode === 'player' && !playerInfo)) ? (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>Preencha as informações principais para visualizar o resumo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Workspace</span>
                      <span className="text-sm font-medium">{getSelectedWorkspaceName()}</span>
                    </div>

                    {formData.mode === 'game' ? (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Jogo</span>
                        <span className="text-sm font-medium text-right">
                          {gameInfo?.name} - {formData.date}
                          <span className="text-xs opacity-70">{gameInfo?.date} - {gameInfo?.time}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Jogador</span>
                        <span className="text-sm font-medium">{playerInfo?.name}</span>
                      </div>
                    )}

                    <div className="border-t border-border my-2 pt-2 flex justify-between items-center">
                      <span className="text-sm font-bold">Total</span>
                      <span className="text-xl font-bold text-[var(--bf-blue-primary)]">
                        {formatMoney(formData.amountCents)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground italic">
                    Nota final: "{getFinalNote()}"
                  </div>

                  <BFWhatsAppPreview
                    title="Simulação (Bot)"
                    content={`✅ Débito registrado: ${formatMoney(formData.amountCents)}\n${getFinalNote()}`}
                    variant="success"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDebit;
