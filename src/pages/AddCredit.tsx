/**
 * AddCredit Page
 * 
 * Tela para adicionar crédito ao usuário dentro de um workspace
 * Baseada no comando /addCredit <slug> <amount>
 * 
 * Layout em 2 colunas:
 * - Esquerda: Formulário completo
 * - Direita: Preview da operação
 */

import React, { useState, useEffect } from 'react';
import { BFInput } from '../components/BF-Input';
import { BFPhoneInput } from '../components/BF-PhoneInput';
import { BFButton } from '../components/BF-Button';
import { BFSelect } from '../components/BF-Select';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFTextarea } from '../components/BF-Textarea';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { BFWhatsAppPreview } from '../components/BF-WhatsAppPreview';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  User,
  Building2,
  DollarSign,
  CreditCard,
  AlertCircle
} from 'lucide-react';

// Tipos
interface CreditForm {
  phone: string;
  workspaceSlug: string;
  amount: string;
  amountCents: number;
  paymentMethod: string;
  note: string;
}

interface UserInfo {
  name: string;
  phone: string;
  found: boolean;
}

interface WorkspaceInfo {
  name: string;
  slug: string;
  found: boolean;
}

interface AddCreditProps {
  onBack?: () => void;
}

// Opções de método de pagamento
const paymentMethodOptions = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao', label: 'Cartão' },
];

export const AddCredit: React.FC<AddCreditProps> = ({ onBack }) => {
  // Estados do formulário
  const [formData, setFormData] = useState<CreditForm>({
    phone: '',
    workspaceSlug: '',
    amount: '',
    amountCents: 0,
    paymentMethod: 'pix',
    note: 'Crédito adicionado via painel',
  });

  // Estados de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | null>(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [checkingWorkspace, setCheckingWorkspace] = useState(false);

  // Atualiza campo
  const updateField = (field: keyof CreditForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa erro do campo
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Busca usuário por telefone (simulado)
  useEffect(() => {
    if (formData.phone.length >= 10) {
      setCheckingUser(true);
      
      // Simula busca de usuário
      setTimeout(() => {
        // Simula: 90% de chance de encontrar usuário
        if (Math.random() > 0.1) {
          setUserInfo({
            name: 'João Silva',
            phone: formData.phone,
            found: true,
          });
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.phone;
            return newErrors;
          });
        } else {
          setUserInfo({
            name: '',
            phone: formData.phone,
            found: false,
          });
          setErrors((prev) => ({
            ...prev,
            phone: 'Seu número não está cadastrado. Peça a um admin para cadastrar.',
          }));
        }
        setCheckingUser(false);
      }, 800);
    } else {
      setUserInfo(null);
    }
  }, [formData.phone]);

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
    }
  }, [formData.workspaceSlug]);

  // Atualiza valor monetário
  const handleAmountChange = (value: string, cents: number) => {
    updateField('amount', value);
    updateField('amountCents', cents);
  };

  // Validações
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!userInfo?.found) {
      newErrors.phone = 'Usuário não encontrado';
    }

    if (!formData.workspaceSlug) {
      newErrors.workspaceSlug = 'Workspace é obrigatório';
    } else if (!workspaceInfo?.found) {
      newErrors.workspaceSlug = 'Workspace não encontrado';
    }

    if (!formData.amount || formData.amountCents <= 0) {
      newErrors.amount = 'Valor inválido';
    }

    if (!formData.note.trim()) {
      newErrors.note = 'Observação é obrigatória';
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

  // Preview do resumo
  const renderSummaryPreview = () => {
    const hasAllData = userInfo?.found && workspaceInfo?.found && formData.amountCents > 0;

    if (!hasAllData) {
      return (
        <div className="p-6 bg-muted rounded-xl border-2 border-border">
          <p className="text-sm text-muted-foreground text-center">
            Preencha usuário, workspace e valor para ver o preview
          </p>
        </div>
      );
    }

    return (
      <div className="p-6 bg-card rounded-xl border-2 border-[var(--bf-green-primary)] shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-[var(--bf-green-primary)]" />
          <h3 className="text-lg text-foreground">Resumo do crédito</h3>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Workspace</p>
            <p className="text-sm text-foreground">
              {workspaceInfo?.name} <span className="text-muted-foreground">({workspaceInfo?.slug})</span>
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Usuário</p>
            <p className="text-sm text-foreground">{userInfo?.name}</p>
            <p className="text-xs text-muted-foreground">{userInfo?.phone}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="text-2xl text-[var(--bf-green-primary)]">{formatMoney(formData.amountCents)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Método</p>
            <p className="text-sm text-foreground">{paymentMethodOptions.find(opt => opt.value === formData.paymentMethod)?.label}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Observação</p>
            <p className="text-sm text-foreground">{formData.note}</p>
          </div>
        </div>
      </div>
    );
  };

  // Preview da mensagem do bot
  const renderBotPreview = () => {
    const hasAllData = userInfo?.found && workspaceInfo?.found && formData.amountCents > 0;

    if (!hasAllData) {
      return null;
    }

    const content = `✅ Crédito adicionado com sucesso!

Usuário: ${userInfo?.name}
Valor: ${formatMoney(formData.amountCents)}
Método: ${paymentMethodOptions.find(opt => opt.value === formData.paymentMethod)?.label}`;

    return (
      <BFWhatsAppPreview
        title="Simulação de mensagem do bot"
        content={content}
        variant="success"
        icon={<CheckCircle className="w-5 h-5" />}
      />
    );
  };

  return (
    <div className="h-full bg-background" data-test="add-credit-page">
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
                Adicionar crédito ao usuário
              </h1>
              <p className="text-sm text-muted-foreground">
                Registre créditos no saldo do usuário dentro de um workspace
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
            title="Crédito adicionado!"
            message={`Crédito de ${formatMoney(formData.amountCents)} adicionado com sucesso para ${userInfo?.name}!`}
            onClose={() => setSuccess(false)}
          />
        </div>
      )}

      {/* Layout em 2 colunas */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA: Formulário */}
          <div className="space-y-6">
            {/* Seção: Selecionar usuário */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Selecionar usuário</h2>
              </div>

              {/* Telefone */}
              <div>
                <BFPhoneInput
                  value={formData.phone}
                  onChange={(value) => updateField('phone', value)}
                  disabled={loading}
                  data-test="phone-input"
                />

                {/* Status do usuário */}
                {checkingUser && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-[var(--bf-blue-primary)] border-t-transparent rounded-full animate-spin" />
                    Buscando usuário...
                  </div>
                )}

                {userInfo?.found && (
                  <div className="mt-2 flex items-center gap-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-[var(--bf-green-primary)]" />
                    <div>
                      <p className="text-sm text-foreground">Usuário encontrado</p>
                      <p className="text-xs text-muted-foreground">{userInfo.name}</p>
                    </div>
                  </div>
                )}

                {userInfo && !userInfo.found && (
                  <div className="mt-2 flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-destructive">Usuário não cadastrado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Workspace */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Workspace</h2>
              </div>

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
            </div>

            {/* Seção: Valor do crédito */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-[var(--bf-green-primary)]" />
                <h2 className="text-lg text-foreground">Valor do crédito</h2>
              </div>

              {/* Amount */}
              <BFMoneyInput
                label="Valor"
                value={formData.amount}
                onChange={handleAmountChange}
                error={errors.amount}
                disabled={loading}
                placeholder="10,00"
                helperText="Aceita: 10,00 | 10.00 | R$10 | 1000c"
                showCentsPreview
                data-test="amount-input"
              />

              {/* Payment Method */}
              <BFSelect
                label="Método de pagamento"
                value={formData.paymentMethod}
                onChange={(value) => updateField('paymentMethod', value)}
                options={paymentMethodOptions}
                disabled={loading}
                data-test="payment-method-select"
              />
            </div>

            {/* Seção: Detalhes */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Detalhes</h2>
              </div>

              {/* Note */}
              <BFTextarea
                label="Observação"
                value={formData.note}
                onChange={(value) => updateField('note', value)}
                error={errors.note}
                disabled={loading}
                placeholder="Crédito adicionado via painel"
                rows={3}
                helperText="Descrição do crédito (será visível para o usuário)"
                data-test="note-textarea"
              />
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
              <BFButton
                variant="primary"
                onClick={handleSave}
                disabled={loading || !userInfo?.found || !workspaceInfo?.found}
                loading={loading}
                icon={<Save className="w-4 h-4" />}
                data-test="save-button"
              >
                {loading ? 'Adicionando...' : 'Adicionar crédito'}
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
                <CheckCircle className="w-5 h-5 text-[var(--bf-green-primary)]" />
                Preview da operação
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Visualize os detalhes antes de confirmar
              </p>

              <div className="space-y-4">
                {renderSummaryPreview()}
                {renderBotPreview()}
              </div>

              {/* Info adicional */}
              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <h4 className="text-sm text-foreground mb-2">💡 Dica</h4>
                <p className="text-xs text-muted-foreground">
                  O crédito será adicionado imediatamente ao saldo do usuário no workspace
                  selecionado. Esta operação não pode ser desfeita, mas pode ser ajustada
                  posteriormente através do histórico financeiro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCredit;
