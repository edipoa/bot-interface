import React, { useState, useEffect } from 'react';
import { BFInput } from '../components/BF-Input';
import { BFButton } from '../components/BF-Button';
import { BFSelect } from '../components/BF-Select';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFTextarea } from '../components/BF-Textarea';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { BFWhatsAppPreview } from '../components/BF-WhatsAppPreview';
import {
  ArrowLeft,
  Save,
  DollarSign,
  FileText,
  User,
  Search
} from 'lucide-react';
import { workspacesAPI, playersAPI } from '../lib/axios';

interface CreditForm {
  workspaceId: string;
  playerId: string;
  amount: string;
  amountCents: number;
  note: string;
  method: string;
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

interface AddCreditProps {
  onBack?: () => void;
}

const paymentMethods = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'other', label: 'Outro' },
];

export const AddCredit: React.FC<AddCreditProps> = ({ onBack }) => {
  // Estado do formulário
  const [formData, setFormData] = useState<CreditForm>({
    workspaceId: '',
    playerId: '',
    amount: '',
    amountCents: 0,
    note: '',
    method: 'pix',
  });

  // Estados de validação e dados
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);

  // Estados de busca de jogador
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [playerSearchResults, setPlayerSearchResults] = useState<any[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  // Carregar workspaces ao montar
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);
        const response = await workspacesAPI.getAllWorkspaces();

        // Handle both array and object response formats
        const workspacesData = Array.isArray(response) ? response : (response.workspaces || []);

        setWorkspaces(workspacesData.map((w: any) => ({
          id: w.id,
          name: w.name,
          slug: w.slug
        })));

        // Selecionar o primeiro se houver apenas um
        if (workspacesData.length === 1) {
          updateField('workspaceId', workspacesData[0].id);
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
  const updateField = (field: keyof CreditForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Busca Jogador
  useEffect(() => {
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
  }, [playerSearchTerm]);

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

    if (!formData.playerId) {
      newErrors.playerSearch = 'Selecione um jogador';
    }

    if (!formData.amount || formData.amountCents <= 0) {
      newErrors.amount = 'Valor inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      await playersAPI.addCredit(formData.playerId, {
        workspaceId: formData.workspaceId,
        amountCents: formData.amountCents,
        note: formData.note,
        method: formData.method,
        category: 'player-payment',
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
        method: 'pix',
      }));

      setPlayerInfo(null);
      updateField('playerId', '');
    } catch (error) {
      console.error('Erro ao adicionar crédito:', error);
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

  const getSelectedWorkspaceName = () => {
    return workspaces.find(w => w.id === formData.workspaceId)?.name || '';
  };

  return (
    <div className="h-full bg-background" data-test="add-credit-page">
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
              <h1 className="text-2xl text-foreground mb-1">Adicionar Crédito</h1>
              <p className="text-sm text-muted-foreground">
                Adicione saldo positivo para um jogador
              </p>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <BFAlertMessage
            variant="success"
            title="Crédito adicionado!"
            message={`Crédito de ${formatMoney(formData.amountCents)} adicionado com sucesso.`}
            onClose={() => setSuccess(false)}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA: Formulário */}
          <div className="space-y-6">

            {/* Card Jogador */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Informações do Jogador</h2>
              </div>

              {/* Workspace */}
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

              {/* Busca Jogador */}
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
            </div>

            {/* Card Valores */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Valores e Detalhes</h2>
              </div>

              <BFMoneyInput
                label="Valor do Crédito"
                value={formData.amount}
                onChange={handleAmountChange}
                error={errors.amount}
                disabled={loading}
                placeholder="150,00"
                showCentsPreview
              />

              <BFSelect
                label="Método de Pagamento"
                value={formData.method}
                onChange={(value) => updateField('method', value)}
                options={paymentMethods}
                disabled={loading}
              />

              <BFTextarea
                label="Nota / Descrição (Opcional)"
                value={formData.note}
                onChange={(value) => updateField('note', value)}
                rows={2}
                placeholder="Ex: Pagamento adiantado"
              />
            </div>

            <BFButton
              variant="primary"
              onClick={handleSave}
              disabled={loading || !formData.workspaceId || !playerInfo}
              loading={loading}
              icon={<Save className="w-4 h-4" />}
              className="w-full"
            >
              Adicionar Crédito
            </BFButton>
          </div>

          {/* COLUNA DIREITA: Preview */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-card rounded-xl border-2 border-border p-6">
              <h2 className="text-lg text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                Resumo
              </h2>

              {(!formData.workspaceId || !playerInfo) ? (
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

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Jogador</span>
                      <span className="text-sm font-medium">{playerInfo?.name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Método</span>
                      <span className="text-sm font-medium">
                        {paymentMethods.find(m => m.value === formData.method)?.label}
                      </span>
                    </div>

                    <div className="border-t border-border my-2 pt-2 flex justify-between items-center">
                      <span className="text-sm font-bold">Total</span>
                      <span className="text-xl font-bold text-[var(--bf-blue-primary)]">
                        {formatMoney(formData.amountCents)}
                      </span>
                    </div>
                  </div>

                  {formData.note && (
                    <div className="text-xs text-muted-foreground italic">
                      Nota: "{formData.note}"
                    </div>
                  )}

                  <BFWhatsAppPreview
                    title="Simulação (Bot)"
                    content={`✅ Crédito adicionado: ${formatMoney(formData.amountCents)}\n${formData.note || 'Crédito adicionado'}`}
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

export default AddCredit;
