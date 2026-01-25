import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Save, ArrowLeft, RefreshCw } from 'lucide-react';

import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { Switch } from '../components/ui/switch';
import { BFCard } from '../components/BF-Card';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFSelect } from '../components/BF-Select';
import { BFTimeInput } from '../components/BF-TimeInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { chatsAPI } from '../lib/axios';

const chatSettingsSchema = z.object({
    // Rules
    allowGuests: z.boolean(),
    autoCreateGame: z.boolean(),
    autoCreateDaysBefore: z.coerce.number().min(1).max(7),
    requirePaymentProof: z.boolean(),

    // Financials
    defaultPriceCents: z.number().min(0),
    pixKey: z.string().optional().or(z.literal('')),
    acceptsCash: z.boolean(),

    // Schedule
    weekday: z.coerce.number().min(0).max(6).optional(),
    time: z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, "Horário inválido").optional().or(z.literal('')),
    title: z.string().optional(),
});

type ChatSettingsValues = z.infer<typeof chatSettingsSchema>;

const weekdayOptions = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
];

export const ChatSettings: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [chatData, setChatData] = useState<any>(null);

    const { control, handleSubmit, reset } = useForm<ChatSettingsValues>({
        resolver: zodResolver(chatSettingsSchema) as any,
        defaultValues: {
            allowGuests: true,
            autoCreateGame: true,
            autoCreateDaysBefore: 2,
            requirePaymentProof: false,
            defaultPriceCents: 0,
            pixKey: '',
            acceptsCash: true,
            weekday: undefined,
            time: '20:00',
            title: 'Futebol'
        }
    });

    useEffect(() => {
        if (chatId) {
            fetchChatDetails(chatId);
        }
    }, [chatId]);

    const fetchChatDetails = async (id: string) => {
        try {
            setLoading(true);
            const data = await chatsAPI.getChatById(id);
            setChatData(data);

            // Map API response to Form
            reset({
                allowGuests: data.settings?.allowGuests ?? true,
                autoCreateGame: data.settings?.autoCreateGame ?? true,
                autoCreateDaysBefore: data.settings?.autoCreateDaysBefore ?? 2,
                requirePaymentProof: data.settings?.requirePaymentProof ?? false,

                defaultPriceCents: data.financials?.defaultPriceCents ?? 0,
                pixKey: data.financials?.pixKey ?? '',
                acceptsCash: data.financials?.acceptsCash ?? true,

                weekday: data.schedule?.weekday,
                time: data.schedule?.time ?? '20:00',
                title: data.schedule?.title ?? ''
            });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar detalhes do chat');
            navigate('/admin/chats'); // Redirect back on error
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: ChatSettingsValues) => {
        if (!chatId) return;
        try {
            setSaving(true);
            await chatsAPI.updateChat(chatId, {
                settings: {
                    allowGuests: data.allowGuests,
                    autoCreateGame: data.autoCreateGame,
                    autoCreateDaysBefore: data.autoCreateDaysBefore,
                    requirePaymentProof: data.requirePaymentProof,
                },
                financials: {
                    defaultPriceCents: data.defaultPriceCents,
                    pixKey: data.pixKey,
                    acceptsCash: data.acceptsCash,
                },
                schedule: {
                    weekday: data.weekday,
                    time: data.time,
                    title: data.title
                }
            });
            toast.success('Configurações salvas com sucesso!');
            // Reload data to ensure sync
            fetchChatDetails(chatId);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar alterações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <BFButton variant="ghost" onClick={() => navigate('/admin/chats')} icon={<ArrowLeft size={20} />} />
                <div>
                    <h1 className="text-2xl font-bold text-foreground line-clamp-1">
                        {chatData?.name || chatData?.label || 'Configurar Chat'}
                    </h1>
                    <p className="text-muted-foreground text-sm font-mono">{chatData?.chatId}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit as any)}>
                <Tabs defaultValue="rules" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="rules">Regras e Automação</TabsTrigger>
                        <TabsTrigger value="financial">Financeiro</TabsTrigger>
                        <TabsTrigger value="schedule">Agendamento</TabsTrigger>
                    </TabsList>

                    {/* RULES TAB */}
                    <TabsContent value="rules">
                        <BFCard className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Regras Gerais</h3>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Permitir Convidados</Label>
                                            <p className="text-sm text-muted-foreground">Jogadores podem adicionar convidados na lista?</p>
                                        </div>
                                        <Controller
                                            name="allowGuests"
                                            control={control}
                                            render={({ field }) => (
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Exigir Comprovante</Label>
                                            <p className="text-sm text-muted-foreground">Obriga o envio de imagem ao confirmar pagamento?</p>
                                        </div>
                                        <Controller
                                            name="requirePaymentProof"
                                            control={control}
                                            render={({ field }) => (
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Automação</h3>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Criar Jogo Automaticamente</Label>
                                            <p className="text-sm text-muted-foreground">O bot abrirá a lista sozinho toda semana?</p>
                                        </div>
                                        <Controller
                                            name="autoCreateGame"
                                            control={control}
                                            render={({ field }) => (
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Dias de Antecedência</Label>
                                        <Controller
                                            name="autoCreateDaysBefore"
                                            control={control}
                                            render={({ field }) => (
                                                <BFInput {...field} type="number" min={1} max={7} fullWidth />
                                            )}
                                        />
                                        <p className="text-xs text-muted-foreground">Quantos dias antes do jogo a lista deve abrir.</p>
                                    </div>
                                </div>
                            </div>
                        </BFCard>
                    </TabsContent>

                    {/* FINANCIAL TAB */}
                    <TabsContent value="financial">
                        <BFCard className="p-6 space-y-6">
                            <div className="p-4 bg-muted/50 rounded-lg border border-border mb-4">
                                <p className="text-sm text-muted-foreground">
                                    ℹ️ Se estes campos ficarem vazios ou zerados, o sistema usará as configurações padrão do Workspace.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Valor Padrão do Jogo (R$)</Label>
                                    <Controller
                                        name="defaultPriceCents"
                                        control={control}
                                        render={({ field }) => (
                                            <BFMoneyInput
                                                value={field.value ? (field.value / 100).toFixed(2).replace('.', ',') : ''}
                                                onChange={(_, cents) => field.onChange(cents)}
                                                placeholder="Usar do Workspace"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Chave Pix Específica</Label>
                                    <Controller
                                        name="pixKey"
                                        control={control}
                                        render={({ field }) => (
                                            <BFInput {...field} placeholder="Usar do Workspace" fullWidth />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between md:col-span-2">
                                    <div className="space-y-0.5">
                                        <Label>Aceitar Pagamento em Dinheiro/Outros</Label>
                                        <p className="text-sm text-muted-foreground">Permite marcar "Pago em Dinheiro" no comando.</p>
                                    </div>
                                    <Controller
                                        name="acceptsCash"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        )}
                                    />
                                </div>
                            </div>
                        </BFCard>
                    </TabsContent>

                    {/* SCHEDULE TAB */}
                    <TabsContent value="schedule">
                        <BFCard className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Dia da Semana Padrão</Label>
                                    <Controller
                                        name="weekday"
                                        control={control}
                                        render={({ field }) => (
                                            <BFSelect
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                options={weekdayOptions}
                                                placeholder="Selecione..."
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Horário Padrão</Label>
                                    <Controller
                                        name="time"
                                        control={control}
                                        render={({ field }) => (
                                            <BFTimeInput
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Título do Jogo</Label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <BFInput {...field} placeholder="Ex: ⚽ FUTEBOL DE QUARTA" fullWidth />
                                        )}
                                    />
                                </div>
                            </div>
                        </BFCard>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-6">
                    <BFButton
                        type="submit"
                        disabled={saving}
                        loading={saving}
                        icon={<Save size={16} />}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Salvar Configurações
                    </BFButton>
                </div>
            </form>
        </div>
    );
};
