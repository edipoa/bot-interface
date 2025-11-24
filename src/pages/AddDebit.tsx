/**
 * AddDebit Page
 * 
 * Tela para registrar débito financeiro associado a um jogo
 * Baseada no comando /addDebit com vários formatos aceitos
 * 
 * Layout em 2 colunas:
 * - Esquerda: Formulário completo
 * - Direita: Preview da operação
 */

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
  CheckCircle, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  X
} from 'lucide-react';

// Tipos
interface DebitForm {
  date: string;
  workspaceSlug: string;
  amount: string;
  amountCents: number;
  note: string;
  category: string;
}

interface GameInfo {
  id: string;
  title: string;
  time: string;
  date: string;
  found: boolean;
}

interface WorkspaceInfo {
  name: string;
  slug: string;
  found: boolean;
}

interface AddDebitProps {
  onBack?: () => void;
}

// Opções de categoria
const categoryOptions = [
  { value: 'general', label: 'Geral (general)' },
  { value: 'aluguel', label: 'Aluguel campo' },
  { value: 'taxas', label: 'Taxas' },
  { value: 'outros', label: 'Outros' },
];

export const AddDebit: React.FC<AddDebitProps> = ({ onBack }) => {
  // Estados do formulário
  const [formData, setFormData] = useState<DebitForm>({
    date: '',
    workspaceSlug: '',
    amount: '',
    amountCents: 0,
    note: '',
    category: 'general',
  });

  // Estados de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | null>(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingGame, setCheckingGame] = useState(false);
  const [checkingWorkspace, setCheckingWorkspace] = useState(false);

  // Atualiza campo
  const updateField = (field: keyof DebitForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa erro do campo
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Busca workspace por slug (simulado)
  useEffect(() => {
    if (formData.workspaceSlug.length >= 3) {
      setCheckingWorkspace(true);
      
      // Simula busca de workspace
      setTimeout(() => {
        // Lista de workspaces fictícios
        const workspaces: Record<string, string> = {
          'arena': 'Arena Futsal',
          'campo-do-viana': 'Campo do Viana',
          'pelada-terça': 'Pelada de Terça',
        };

        const name = workspaces[formData.workspaceSlug.toLowerCase()];
        
        if (name) {
          setWorkspaceInfo({
            name,
            slug: formData.workspaceSlug,
            found: true,
          });
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.workspaceSlug;
            return newErrors;
          });
        } else {
          setWorkspaceInfo({
            name: '',
            slug: formData.workspaceSlug,
            found: false,
          });
          setErrors((prev) => ({
            ...prev,
            workspaceSlug: `Workspace "${formData.workspaceSlug}" não encontrado.`,
          }));
        }
        setCheckingWorkspace(false);
      }, 600);
    } else {
      setWorkspaceInfo(null);
      setGameInfo(null); // Reset game quando workspace muda
    }
  }, [formData.workspaceSlug]);

  // Busca jogo por data + workspace (simulado)
  useEffect(() => {
    const isValidDate = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])$/.test(formData.date);
    
    if (isValidDate && workspaceInfo?.found) {
      setCheckingGame(true);
      
      // Simula busca de jogo
      setTimeout(() => {
        // Simula: 80% de chance de encontrar jogo
        if (Math.random() > 0.2) {
          setGameInfo({
            id: '123',
            title: '⚽ CAMPO VIANA',
            time: '20:30',
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
            title: '',
            time: '',
            date: formData.date,
            found: false,
          });
          setErrors((prev) => ({
            ...prev,
            date: `Jogo não encontrado em ${formData.date} para ${workspaceInfo.name}.`,
          }));
        }
        setCheckingGame(false);
      }, 800);
    } else {
      setGameInfo(null);
    }
  }, [formData.date, workspaceInfo]);

  // Atualiza valor monetário
  const handleAmountChange = (value: string, cents: number) => {
    updateField('amount', value);
    updateField('amountCents', cents);
  };

  // Validações
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Data obrigatória. Use dd/mm. Ex.: 13/11';
    } else if (!/^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])$/.test(formData.date)) {
      newErrors.date = 'Data inválida. Use dd/mm. Ex.: 13/11';
    } else if (!gameInfo?.found) {
      newErrors.date = 'Jogo não encontrado para esta data';
    }

    if (!formData.workspaceSlug) {
      newErrors.workspaceSlug = 'Workspace é obrigatório';
    } else if (!workspaceInfo?.found) {
      newErrors.workspaceSlug = 'Workspace não encontrado';
    }

    if (!formData.amount || formData.amountCents <= 0) {
      newErrors.amount = 'Valor inválido. Exemplos: 150,00 | 150.00 | R$150 | 15000c';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    // Simula chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setSuccess(true);

    // Esconde mensagem de sucesso após 5s
    setTimeout(() => setSuccess(false), 5000);
  };

  // Formata valor para exibição
  const formatMoney = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  // Gera nota final
  const getFinalNote = (): string => {
    const baseNote = formData.note.trim() || 'Pagamento ao campo';
    return `${baseNote} do jogo ${formData.date} (${gameInfo?.title || 'Jogo'})`;
  };

  // Preview do resumo
  const renderSummaryPreview = () => {
    const hasAllData = gameInfo?.found && workspaceInfo?.found && formData.amountCents > 0;

    if (!hasAllData) {
      return (
        <div className="p-6 bg-muted rounded-xl border-2 border-border">
          <p className="text-sm text-muted-foreground text-center">
            Preencha data, workspace e valor para ver o preview
          </p>
        </div>
      );
    }

    return (
      <div className="p-6 bg-card rounded-xl border-2 border-[var(--bf-blue-primary)] shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[var(--bf-blue-primary)]" />
          <h3 className="text-lg text-foreground">Resumo do débito</h3>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Workspace</p>
            <p className="text-sm text-foreground">
              {workspaceInfo?.name} <span className="text-muted-foreground">({workspaceInfo?.slug})</span>
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Data do jogo</p>
            <p className="text-sm text-foreground">{formData.date}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Jogo selecionado</p>
            <p className="text-sm text-foreground">{gameInfo?.title}</p>
            <p className="text-xs text-muted-foreground">Horário: {gameInfo?.time}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="text-2xl text-[var(--bf-blue-primary)]">{formatMoney(formData.amountCents)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Nota final</p>
            <p className="text-sm text-foreground italic">"{getFinalNote()}"</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Categoria</p>
            <p className="text-sm text-foreground">
              {categoryOptions.find(opt => opt.value === formData.category)?.label}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Preview da mensagem do bot (sucesso)
  const renderBotSuccessPreview = () => {
    const hasAllData = gameInfo?.found && workspaceInfo?.found && formData.amountCents > 0;

    if (!hasAllData) {
      return null;
    }

    const content = `✅ Registrado débito de ${formatMoney(formData.amountCents)} (${formData.date}) – ${formData.note || 'Pagamento ao campo'}.`;

    return (
      <BFWhatsAppPreview
        title="Simulação de mensagem (sucesso)"
        content={content}
        variant="success"
        icon={<CheckCircle className="w-5 h-5" />}
      />
    );
  };

  // Preview de erros possíveis
  const renderBotErrorsPreview = () => {
    const errorMessages = [
      '❌ Data obrigatória. Use dd/mm. Ex.: 13/11',
      '❌ Valor inválido. Exemplos: 150,00 | 150.00 | R$150 | 15000c',
      `❌ Workspace ${formData.workspaceSlug || 'arena'} não encontrado.`,
      `❌ Jogo não encontrado em ${formData.date || '13/11'} para ${workspaceInfo?.name || 'Arena X'}.`,
    ];

    return (
      <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
        <h4 className="text-sm text-foreground mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          Possíveis mensagens de erro
        </h4>
        <div className="space-y-1">
          {errorMessages.map((msg, idx) => (
            <p key={idx} className="text-xs text-destructive font-mono">
              {msg}
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-background" data-test="add-debit-page">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                data-test="back-button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl text-foreground mb-1">
                Registrar débito do jogo
              </h1>
              <p className="text-sm text-muted-foreground">
                Lance um débito financeiro associado a um jogo específico em um workspace
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de sucesso */}
      {success && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <BFAlertMessage
            variant="success"
            title="Débito registrado!"
            message={`Registrado débito de ${formatMoney(formData.amountCents)} (${formData.date}) – ${formData.note || 'Pagamento ao campo'}.`}
            onClose={() => setSuccess(false)}
          />
        </div>
      )}

      {/* Layout em 2 colunas */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA: Formulário */}
          <div className="space-y-6">
            {/* Seção: Data e jogo */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Data e jogo</h2>
              </div>

              {/* Data */}
              <BFDateInput
                label="Data do jogo (dd/mm)"
                value={formData.date}
                onChange={(value) => updateField('date', value)}
                error={errors.date}
                disabled={loading}
                placeholder="13/11"
                helperText="Data do jogo para associar o débito"
                data-test="date-input"
              />

              {/* Workspace Slug */}
              <div>
                <BFInput
                  label="Workspace (slug)"
                  value={formData.workspaceSlug}
                  onChange={(value) => updateField('workspaceSlug', value)}
                  error={errors.workspaceSlug}
                  disabled={loading}
                  placeholder="arena, campo-do-viana, pelada-terça"
                  helperText="Digite o identificador do workspace"
                  data-test="workspace-slug-input"
                />

                {/* Status do workspace */}
                {checkingWorkspace && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-[var(--bf-blue-primary)] border-t-transparent rounded-full animate-spin" />
                    Buscando workspace...
                  </div>
                )}

                {workspaceInfo?.found && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-[var(--bf-blue-primary)]" />
                    <span className="text-sm text-foreground">{workspaceInfo.name}</span>
                  </div>
                )}
              </div>

              {/* Jogo encontrado */}
              {checkingGame && (
                <div className="flex items-center gap-2 p-3 bg-muted border-2 border-border rounded-lg">
                  <div className="w-4 h-4 border-2 border-[var(--bf-blue-primary)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Buscando jogo...</span>
                </div>
              )}

              {gameInfo?.found && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--bf-green-primary)] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground mb-1">Jogo encontrado</p>
                      <p className="text-sm text-foreground">{gameInfo.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Data: {gameInfo.date} • Horário: {gameInfo.time}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {gameInfo && !gameInfo.found && (
                <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-destructive">
                      Jogo não encontrado em {formData.date} para {workspaceInfo?.name || 'este workspace'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Seção: Valor do débito */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Valor do débito</h2>
              </div>

              {/* Amount */}
              <BFMoneyInput
                label="Valor"
                value={formData.amount}
                onChange={handleAmountChange}
                error={errors.amount}
                disabled={loading}
                placeholder="150,00"
                helperText="Aceita: 150,00 | 150.00 | R$150 | 15000c"
                showCentsPreview
                data-test="amount-input"
              />
            </div>

            {/* Seção: Descrição do débito */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Descrição do débito</h2>
              </div>

              {/* Note */}
              <BFTextarea
                label="Nota"
                value={formData.note}
                onChange={(value) => updateField('note', value)}
                error={errors.note}
                disabled={loading}
                placeholder="goleiro aluguel, aluguel campo, etc."
                rows={3}
                helperText='Se vazio, usará "Pagamento ao campo"'
                data-test="note-textarea"
              />

              {/* Preview da nota final */}
              {formData.date && gameInfo?.found && (
                <div className="p-3 bg-muted rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Nota final que será gravada:</p>
                  <p className="text-sm text-foreground italic">"{getFinalNote()}"</p>
                </div>
              )}

              {/* Category */}
              <BFSelect
                label="Categoria"
                value={formData.category}
                onChange={(value) => updateField('category', value)}
                options={categoryOptions}
                disabled={loading}
                helperText="Categoria para organização dos débitos"
                data-test="category-select"
              />
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
              <BFButton
                variant="primary"
                onClick={handleSave}
                disabled={loading || !gameInfo?.found || !workspaceInfo?.found}
                loading={loading}
                icon={<Save className="w-4 h-4" />}
                data-test="save-button"
              >
                {loading ? 'Registrando...' : 'Registrar débito'}
              </BFButton>

              {onBack && (
                <BFButton
                  variant="outline"
                  onClick={onBack}
                  disabled={loading}
                  data-test="cancel-button"
                >
                  Cancelar
                </BFButton>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: Preview */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-card rounded-xl border-2 border-border p-6">
              <h2 className="text-lg text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                Preview da operação
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Visualize os detalhes antes de confirmar
              </p>

              <div className="space-y-4">
                {renderSummaryPreview()}
                {renderBotSuccessPreview()}
                {renderBotErrorsPreview()}
              </div>

              {/* Info adicional */}
              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <h4 className="text-sm text-foreground mb-2">💡 Dica</h4>
                <p className="text-xs text-muted-foreground">
                  O débito será associado automaticamente ao jogo da data especificada.
                  Certifique-se de que a data e o workspace estão corretos antes de confirmar.
                  A nota será concatenada com a data e o título do jogo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDebit;
