import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Save, RefreshCw, CheckCircle } from 'lucide-react';

import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFCard } from '../components/BF-Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { workspacesAPI } from '../lib/axios';
import type { Workspace } from '../lib/types';

// Schema for General & Financial Settings
const workspaceSettingsSchema = z.object({
    name: z.string().min(1, 'Nome do grupo é obrigatório'),
    logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
    // Financial Defaults
    courtCostCents: z.number().min(0).optional(),
    refereeCostCents: z.number().min(0).optional(),
    monthlyFeeCents: z.number().min(0).optional(),
    pix: z.string().optional(),
});

type WorkspaceSettingsValues = z.infer<typeof workspaceSettingsSchema>;

// Schema for Organizze Integration
const organizzeSchema = z.object({
    enabled: z.boolean(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    apiKey: z.string().optional().or(z.literal('')),
    accountId: z.coerce.number().optional(),
    // Categories Mapping
    catFieldPayment: z.coerce.number().optional(),
    catPlayerPayment: z.coerce.number().optional(),
    catPlayerDebt: z.coerce.number().optional(),
    catGeneral: z.coerce.number().optional(),
});

type OrganizzeValues = z.infer<typeof organizzeSchema>;

export const WorkspaceSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [workspace, setWorkspace] = useState<Workspace | null>(null);

    // Form 1: General & Financial
    const {
        control: generalControl,
        handleSubmit: handleGeneralSubmit,
        reset: resetGeneral,
        formState: { errors: generalErrors }
    } = useForm<WorkspaceSettingsValues>({
        resolver: zodResolver(workspaceSettingsSchema)
    });

    // Form 2: Organizze
    const {
        control: organizzeControl,
        handleSubmit: handleOrganizzeSubmit,
        reset: resetOrganizze,
        watch: watchOrganizze,
    } = useForm<OrganizzeValues>({
        // @ts-ignore
        resolver: zodResolver(organizzeSchema),
        defaultValues: {
            enabled: false
        }
    });

    const isOrganizzeEnabled = watchOrganizze('enabled');

    // Fetch Workspace Data
    const fetchWorkspace = async () => {
        try {
            setLoading(true);
            const currentWorkspaceId = localStorage.getItem('workspaceId');

            if (!currentWorkspaceId) {
                toast.error('Nenhum workspace selecionado');
                return;
            }

            const data = await workspacesAPI.getWorkspace(currentWorkspaceId);
            setWorkspace(data);

            // Populate Forms
            resetGeneral({
                name: data.name,
                logoUrl: data.settings?.logoUrl || '',
                courtCostCents: data.settings?.courtCostCents || 0,
                refereeCostCents: data.settings?.refereeCostCents || 0,
                monthlyFeeCents: data.settings?.monthlyFeeCents || 0,
                pix: data.settings?.pix || '',
            });

            if (data.organizzeConfig) {
                resetOrganizze({
                    enabled: true,
                    email: data.organizzeConfig.email,
                    apiKey: '********', // Don't show real API Key if exists, or show it? Usually masked.
                    accountId: data.organizzeConfig.accountId,
                    catFieldPayment: data.organizzeConfig.categories.fieldPayment,
                    catPlayerPayment: data.organizzeConfig.categories.playerPayment,
                    catPlayerDebt: data.organizzeConfig.categories.playerDebt,
                    catGeneral: data.organizzeConfig.categories.general,
                });
            } else {
                resetOrganizze({ enabled: false });
            }

        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspace();
    }, []);

    // Save General/Financial Settings
    const onGeneralSubmit = async (data: WorkspaceSettingsValues) => {
        if (!workspace) return;
        try {
            setSaving(true);
            await workspacesAPI.updateWorkspace(workspace.id, {
                name: data.name,
                settings: {
                    ...workspace.settings, // Keep existing settings
                    logoUrl: data.logoUrl,
                    courtCostCents: data.courtCostCents,
                    refereeCostCents: data.refereeCostCents,
                    monthlyFeeCents: data.monthlyFeeCents,
                    pix: data.pix,
                }
            });
            toast.success('Configurações salvas com sucesso!');
            fetchWorkspace(); // Refresh
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    // Save Organizze Settings
    const onOrganizzeSubmit = async (data: OrganizzeValues) => {
        if (!workspace) return;
        try {
            setSaving(true);

            if (!data.enabled) {
                // If disabled, maybe delete config?
                await workspacesAPI.deleteOrganizzeSettings(workspace.id);
                toast.success('Integração desativada');
            } else {
                await workspacesAPI.updateOrganizzeSettings(workspace.id, {
                    email: data.email || '',
                    apiKey: data.apiKey === '********' ? (workspace.apiKey || '') : (data.apiKey || ''), // Handle masked key
                    accountId: data.accountId || 0,
                    categories: {
                        fieldPayment: data.catFieldPayment || 0,
                        playerPayment: data.catPlayerPayment || 0,
                        playerDebt: data.catPlayerDebt || 0,
                        general: data.catGeneral || 0,
                    }
                });
                toast.success('Integração Organizze salva!');
            }
            fetchWorkspace();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar integração Organizze');
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

    if (!workspace) {
        return <div className="p-6">Workspace não encontrado</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Configurações do Grupo</h1>
                    <p className="text-muted-foreground">Gerencie os dados e integrações do seu grupo</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="financial">Financeiro</TabsTrigger>
                    <TabsTrigger value="integrations">Integrações</TabsTrigger>
                </TabsList>

                {/* ABA GERAL */}
                <TabsContent value="general">
                    <BFCard>
                        <form onSubmit={handleGeneralSubmit(onGeneralSubmit)} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome do Grupo</Label>
                                    <Controller
                                        name="name"
                                        control={generalControl}
                                        render={({ field }) => (
                                            <BFInput {...field} error={generalErrors.name?.message} fullWidth />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Logo URL</Label>
                                    <Controller
                                        name="logoUrl"
                                        control={generalControl}
                                        render={({ field }) => (
                                            <BFInput {...field} placeholder="https://..." fullWidth />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>ID do Workspace (Somente Leitura)</Label>
                                    <BFInput value={workspace.id} disabled readOnly fullWidth className="bg-muted text-muted-foreground" />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <BFButton type="submit" disabled={saving} icon={<Save size={16} />}>
                                    Salvar Alterações
                                </BFButton>
                            </div>
                        </form>
                    </BFCard>
                </TabsContent>

                {/* ABA FINANCEIRO */}
                <TabsContent value="financial">
                    <BFCard>
                        <form onSubmit={handleGeneralSubmit(onGeneralSubmit)} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Custo Padrão da Quadra</Label>
                                    <Controller
                                        name="courtCostCents"
                                        control={generalControl}
                                        render={({ field }) => (
                                            <BFMoneyInput
                                                value={field.value ? (field.value / 100).toFixed(2).replace('.', ',') : ''}
                                                onChange={(_, cents) => field.onChange(cents)}
                                                placeholder="0,00"
                                            />
                                        )}
                                    />
                                    <p className="text-xs text-muted-foreground">Valor sugerido ao criar novo jogo</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Custo Padrão do Juiz</Label>
                                    <Controller
                                        name="refereeCostCents"
                                        control={generalControl}
                                        render={({ field }) => (
                                            <BFMoneyInput
                                                value={field.value ? (field.value / 100).toFixed(2).replace('.', ',') : ''}
                                                onChange={(_, cents) => field.onChange(cents)}
                                                placeholder="0,00"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Valor da Mensalidade</Label>
                                    <Controller
                                        name="monthlyFeeCents"
                                        control={generalControl}
                                        render={({ field }) => (
                                            <BFMoneyInput
                                                value={field.value ? (field.value / 100).toFixed(2).replace('.', ',') : ''}
                                                onChange={(_, cents) => field.onChange(cents)}
                                                placeholder="0,00"
                                            />
                                        )}
                                    />
                                    <p className="text-xs text-muted-foreground">Usado para gerar cobranças de mensalistas</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Chave Pix Padrão</Label>
                                    <Controller
                                        name="pix"
                                        control={generalControl}
                                        render={({ field }) => (
                                            <BFInput {...field} placeholder="CPF, Email ou Aleatória" fullWidth />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-border">
                                <BFButton type="submit" disabled={saving} icon={<Save size={16} />}>
                                    Salvar Configurações Financeiras
                                </BFButton>
                            </div>
                        </form>
                    </BFCard>
                </TabsContent>

                {/* ABA INTEGRAÇÕES (ORGANIZZE) */}
                <TabsContent value="integrations">
                    <BFCard>
                        <form onSubmit={handleOrganizzeSubmit(onOrganizzeSubmit as any)} className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Integração Organizze</h3>
                                        <p className="text-sm text-muted-foreground">Sincronize receitas e despesas automaticamente</p>
                                    </div>
                                </div>
                                <Controller
                                    name="enabled"
                                    control={organizzeControl}
                                    render={({ field }) => (
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>

                            {isOrganizzeEnabled && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Email da Conta Organizze</Label>
                                            <Controller
                                                name="email"
                                                control={organizzeControl}
                                                render={({ field }) => (
                                                    <BFInput {...field} fullWidth />
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>API Key (Token)</Label>
                                            <Controller
                                                name="apiKey"
                                                control={organizzeControl}
                                                render={({ field }) => (
                                                    <BFInput {...field} type="password" placeholder="••••••••" fullWidth />
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Account ID (ID da Conta/Grupo)</Label>
                                            <Controller
                                                name="accountId"
                                                control={organizzeControl}
                                                render={({ field }) => (
                                                    <BFInput {...field} type="number" fullWidth />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <h3 className="font-medium mb-4 flex items-center gap-2">
                                            <RefreshCw size={16} /> Mapeamento de Categorias (IDs)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Pagamento de Quadra</Label>
                                                <Controller
                                                    name="catFieldPayment"
                                                    control={organizzeControl}
                                                    render={({ field }) => <BFInput {...field} type="number" fullWidth />}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pagamento de Jogador</Label>
                                                <Controller
                                                    name="catPlayerPayment"
                                                    control={organizzeControl}
                                                    render={({ field }) => <BFInput {...field} type="number" fullWidth />}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Dívidas / Pendentes</Label>
                                                <Controller
                                                    name="catPlayerDebt"
                                                    control={organizzeControl}
                                                    render={({ field }) => <BFInput {...field} type="number" fullWidth />}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Geral / Outros</Label>
                                                <Controller
                                                    name="catGeneral"
                                                    control={organizzeControl}
                                                    render={({ field }) => <BFInput {...field} type="number" fullWidth />}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-border">
                                <BFButton type="submit" disabled={saving} icon={<Save size={16} />}>
                                    Salvar Integração
                                </BFButton>
                            </div>
                        </form>
                    </BFCard>
                </TabsContent>
            </Tabs>
        </div>
    );
};
