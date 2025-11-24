/**
 * ManageChats Page
 * 
 * Tela de criação e edição de chats vinculados a workspaces
 * Baseada nos comandos /bind e /schedule do bot de WhatsApp
 * 
 * Layout em 2 colunas:
 * - Esquerda: Formulário completo
 * - Direita: Preview das mensagens do bot
 */

import React, { useState, useEffect } from 'react';
import { BFInput } from '../components/BF-Input';
import { BFButton } from '../components/BF-Button';
import { BFSelect } from '../components/BF-Select';
import { BFTimeInput } from '../components/BF-TimeInput';
import { BFWhatsAppPreview } from '../components/BF-WhatsAppPreview';
import { BFAlertMessage } from '../components/BF-AlertMessage';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  Calendar,
  Smartphone,
  Building2,
  MessageSquare
} from 'lucide-react';

// Tipos
interface ChatScheduleForm {
  // /bind fields
  workspaceSlug: string;
  chatId: string;
  chatName: string;
  weekday: number;
  time: string;
  
  // /schedule fields
  title: string;
  price: string;
  priceCents: number;
  pix: string;
  
  // settings
  useWorkspaceDefaults: boolean;
}

interface ManageChatsProps {
  mode?: 'create' | 'edit';
  chatId?: string;
  onBack?: () => void;
}

// Opções de dias da semana
const weekdayOptions = [
  { value: 0, label: '0 - Domingo' },
  { value: 1, label: '1 - Segunda-feira' },
  { value: 2, label: '2 - Terça-feira' },
  { value: 3, label: '3 - Quarta-feira' },
  { value: 4, label: '4 - Quinta-feira' },
  { value: 5, label: '5 - Sexta-feira' },
  { value: 6, label: '6 - Sábado' },
];

const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const ManageChats: React.FC<ManageChatsProps> = ({
  mode = 'create',
  chatId,
  onBack,
}) => {
  // Estados do formulário
  const [formData, setFormData] = useState<ChatScheduleForm>({
    workspaceSlug: '',
    chatId: '',
    chatName: '',
    weekday: 2,
    time: '20:30',
    title: '⚽ CAMPO VIANA',
    price: '14,00',
    priceCents: 1400,
    pix: 'seu@pix',
    useWorkspaceDefaults: false,
  });

  // Estados de UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Simula carregamento de dados em modo edição
  useEffect(() => {
    if (mode === 'edit' && chatId) {
      // Simula fetch de dados
      setFormData({
        workspaceSlug: 'campo-do-viana',
        chatId: '5511999999999@c.us',
        chatName: 'Grupo Futebol Terça',
        weekday: 2,
        time: '20:30',
        title: '⚽ CAMPO VIANA',
        price: '14,00',
        priceCents: 1400,
        pix: 'fcjogasimples@gmail.com',
        useWorkspaceDefaults: false,
      });
    }
  }, [mode, chatId]);

  // Atualiza campo
  const updateField = (field: keyof ChatScheduleForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa erro do campo
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Converte preço para centavos
  const parsePriceToCents = (priceStr: string): number => {
    // Remove tudo exceto números, vírgula e ponto
    const cleaned = priceStr.replace(/[^\d,.]|R\$|c/gi, '').trim();
    
    // Se termina com 'c', já está em centavos
    if (priceStr.toLowerCase().endsWith('c')) {
      return parseInt(cleaned) || 0;
    }
    
    // Converte vírgula para ponto e multiplica por 100
    const normalized = cleaned.replace(',', '.');
    const float = parseFloat(normalized) || 0;
    return Math.round(float * 100);
  };

  // Atualiza preço
  const handlePriceChange = (value: string) => {
    updateField('price', value);
    const cents = parsePriceToCents(value);
    updateField('priceCents', cents);
  };

  // Formata preço para exibição
  const formatPrice = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  // Validações
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.workspaceSlug) {
      newErrors.workspaceSlug = 'Slug do workspace é obrigatório';
    }

    if (!formData.time.match(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/)) {
      newErrors.time = 'Formato inválido. Use HH:mm';
    }

    if (formData.weekday < 0 || formData.weekday > 6) {
      newErrors.weekday = 'Dia da semana deve ser entre 0 e 6';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.priceCents <= 0) {
      newErrors.price = 'Preço inválido';
    }

    if (!formData.pix.trim()) {
      newErrors.pix = 'Chave PIX é obrigatória';
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

    // Esconde mensagem de sucesso após 3s
    setTimeout(() => setSuccess(false), 3000);
  };

  // Preview do /bind
  const renderBindPreview = () => {
    const content = `✅ Grupo vinculado!

Workspace: ${formData.workspaceSlug || 'não definido'}
Dia: ${weekdayNames[formData.weekday]} (${formData.weekday})
Horário: ${formData.time || '20:30'}
Pix: ${formData.pix || 'não definido'}
Valor: ${formatPrice(formData.priceCents)}`;

    return (
      <BFWhatsAppPreview
        title="Preview do comando /bind"
        content={content}
        variant="success"
        icon={<CheckCircle className="w-5 h-5" />}
      />
    );
  };

  // Preview do /schedule
  const renderSchedulePreview = () => {
    if (!formData.title && !formData.pix && formData.priceCents === 0) {
      return (
        <BFWhatsAppPreview
          title="Sem schedule configurado"
          content={`ℹ️ Use o formulário para configurar o schedule.

Exemplo:
weekday=2 time=20:30 price=14,00 pix=seu@pix title="⚽ CAMPO VIANA"`}
          variant="info"
        />
      );
    }

    const content = `📅 Schedule atual

Dia: ${weekdayNames[formData.weekday]} (${formData.weekday})
Hora: ${formData.time || '20:30'}
Título: ${formData.title || 'Sem título'}
Preço: ${formatPrice(formData.priceCents)}
Pix: ${formData.pix || 'não definido'}`;

    return (
      <BFWhatsAppPreview
        title="Preview do comando /schedule"
        content={content}
        variant="info"
        icon={<Calendar className="w-5 h-5" />}
      />
    );
  };

  return (
    <div className="h-full bg-background" data-test="manage-chats-page">
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
                {mode === 'create' ? 'Criar chat e schedule' : 'Editar chat e schedule'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Vincule o chat a um workspace e configure o schedule usado pelos comandos /bind e /schedule.
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
            title="Sucesso!"
            message={mode === 'create' 
              ? 'Chat vinculado e schedule configurado com sucesso!' 
              : 'Alterações salvas com sucesso!'
            }
            onClose={() => setSuccess(false)}
          />
        </div>
      )}

      {/* Layout em 2 colunas */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA: Formulário */}
          <div className="space-y-6">
            {/* Seção: Vínculo do chat (/bind) */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-[var(--bf-blue-primary)]" />
                <h2 className="text-lg text-foreground">Vínculo do chat</h2>
              </div>

              {/* Workspace Slug */}
              <BFInput
                label="Workspace (slug)"
                value={formData.workspaceSlug}
                onChange={(value) => updateField('workspaceSlug', value)}
                error={errors.workspaceSlug}
                disabled={loading}
                placeholder="campo-do-viana"
                helperText="Identificador do workspace usado no comando /bind"
                data-test="workspace-slug-input"
              />

              {/* Chat Info */}
              {mode === 'edit' && (
                <div>
                  <label className="block mb-2 text-sm text-foreground">
                    Chat
                  </label>
                  <div className="flex items-center gap-3 px-4 h-12 bg-muted border-2 border-border rounded-xl">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{formData.chatName}</p>
                      <p className="text-xs text-muted-foreground">{formData.chatId}</p>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'create' && (
                <BFInput
                  label="ID do Chat"
                  value={formData.chatId}
                  onChange={(value) => updateField('chatId', value)}
                  error={errors.chatId}
                  disabled={loading}
                  placeholder="5511999999999@c.us"
                  helperText="ID do chat do WhatsApp"
                  data-test="chat-id-input"
                />
              )}

              {/* Weekday */}
              <BFSelect
                label="Dia da semana"
                value={formData.weekday}
                onChange={(value) => updateField('weekday', value)}
                options={weekdayOptions}
                error={errors.weekday}
                disabled={loading}
                helperText="Dia padrão do jogo (usado no /bind e /schedule)"
                data-test="weekday-select"
              />

              {/* Time */}
              <BFTimeInput
                label="Horário do jogo"
                value={formData.time}
                onChange={(value) => updateField('time', value)}
                error={errors.time}
                disabled={loading}
                helperText="Horário padrão do jogo (usado no /bind e /schedule)"
                data-test="time-input"
              />
            </div>

            {/* Seção: Schedule do jogo (/schedule) */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[var(--bf-green-primary)]" />
                <h2 className="text-lg text-foreground">Schedule do jogo</h2>
              </div>

              {/* Title */}
              <BFInput
                label="Título do jogo"
                value={formData.title}
                onChange={(value) => updateField('title', value)}
                error={errors.title}
                disabled={loading}
                placeholder="⚽ CAMPO VIANA"
                helperText="Título que aparece nas mensagens do bot"
                data-test="title-input"
              />

              {/* Price */}
              <div>
                <BFInput
                  label="Preço"
                  value={formData.price}
                  onChange={handlePriceChange}
                  error={errors.price}
                  disabled={loading || formData.useWorkspaceDefaults}
                  placeholder="14,00"
                  helperText="Aceita: 14,00 | 14.00 | R$14 | 1400c"
                  data-test="price-input"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Convertido: {formatPrice(formData.priceCents)} ({formData.priceCents} centavos)
                </p>
              </div>

              {/* PIX */}
              <BFInput
                label="Chave PIX"
                value={formData.pix}
                onChange={(value) => updateField('pix', value)}
                error={errors.pix}
                disabled={loading || formData.useWorkspaceDefaults}
                placeholder="seu@pix ou telefone ou chave aleatória"
                helperText="Chave PIX para receber pagamentos"
                data-test="pix-input"
              />

              {/* Resumo */}
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Resumo do schedule:</p>
                <p className="text-sm text-foreground">
                  <strong>Dia:</strong> {weekdayNames[formData.weekday]} ({formData.weekday}) -{' '}
                  <strong>Hora:</strong> {formData.time} -{' '}
                  <strong>Preço:</strong> {formatPrice(formData.priceCents)} -{' '}
                  <strong>Pix:</strong> {formData.pix || 'não definido'}
                </p>
              </div>
            </div>

            {/* Seção: Ajustes avançados */}
            <div className="bg-card rounded-xl border-2 border-border p-6 space-y-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-sm text-foreground">Ajustes avançados</h3>
                <span className="text-sm text-[var(--bf-blue-primary)]">
                  {showAdvanced ? 'Ocultar' : 'Mostrar'}
                </span>
              </button>

              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t border-border">
                  {/* Toggle Workspace Defaults */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="use-defaults"
                      checked={formData.useWorkspaceDefaults}
                      onChange={(e) => updateField('useWorkspaceDefaults', e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="use-defaults" className="text-sm text-foreground cursor-pointer">
                        Usar valores padrão do workspace
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Quando ativo, os campos de preço e PIX usarão os valores definidos nas configurações
                        do workspace. Útil quando todos os chats compartilham os mesmos valores.
                      </p>
                    </div>
                  </div>

                  {formData.useWorkspaceDefaults && (
                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        ℹ️ Os valores de <strong>preço</strong> e <strong>PIX</strong> serão
                        obtidos automaticamente do workspace <strong>{formData.workspaceSlug}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3">
              <BFButton
                variant="primary"
                onClick={handleSave}
                disabled={loading}
                loading={loading}
                icon={<Save className="w-4 h-4" />}
                data-test="save-button"
              >
                {loading 
                  ? 'Salvando...' 
                  : mode === 'create' 
                    ? 'Salvar e vincular chat' 
                    : 'Salvar alterações'
                }
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
                <Smartphone className="w-5 h-5 text-[var(--bf-green-primary)]" />
                Preview das mensagens
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Veja como as mensagens do bot aparecerão no WhatsApp
              </p>

              <div className="space-y-4">
                {renderBindPreview()}
                {renderSchedulePreview()}
              </div>

              {/* Info adicional */}
              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <h4 className="text-sm text-foreground mb-2">💡 Dica</h4>
                <p className="text-xs text-muted-foreground">
                  Ao alterar qualquer campo no formulário, os previews são atualizados
                  automaticamente. Isso permite que você veja exatamente como o bot irá
                  responder aos comandos /bind e /schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageChats;
