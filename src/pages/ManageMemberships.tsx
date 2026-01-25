import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, DollarSign, AlertTriangle, MoreVertical, Edit, Check, Ban, X, Loader2, Search as SearchIcon, WalletCards, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { membershipsAPI, workspacesAPI, playersAPI } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface AdminMembershipListItem {
    id: string;
    user: {
        id: string;
        name: string;
        phoneE164: string;
    };
    status: string;
    planValue: number;
    billingDay: number;
    nextDueDate: string;
    lastPaymentDate?: string;
    startDate: string;
}



const ManageMemberships = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [memberships, setMemberships] = useState<AdminMembershipListItem[]>([]);
    const [summary, setSummary] = useState({ totalActive: 0, totalSuspended: 0, totalPending: 0, mrr: 0 });
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, _setPage] = useState(1);

    // Modal states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedMembership, setSelectedMembership] = useState<AdminMembershipListItem | null>(null);

    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        description: string;
        variant: 'destructive' | 'default';
        action?: () => Promise<void>;
    }>({
        open: false,
        title: '',
        description: '',
        variant: 'default'
    });
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Form states
    const [editForm, setEditForm] = useState({ planValue: 0, billingDay: 10 });
    const [paymentForm, setPaymentForm] = useState({ amount: 0, method: 'pix', description: '' });
    const [createForm, setCreateForm] = useState({ userId: '', planValue: 100, billingDay: 10 });
    const [actionLoading, setActionLoading] = useState(false);

    // Player Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [playerResults, setPlayerResults] = useState<any[]>([]);
    const [searchingPlayers, setSearchingPlayers] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

    const [activeWorkspaceId, setActiveWorkspaceId] = useState((user as any)?.activeWorkspaceId || '');
    const [workspaces, setWorkspaces] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            try {
                const response = await workspacesAPI.getAllWorkspaces();
                const workspacesList = response.workspaces || [];
                setWorkspaces(workspacesList);

                if (!activeWorkspaceId && workspacesList.length > 0) {
                    const lastWorkspace = workspacesList[workspacesList.length - 1];
                    setActiveWorkspaceId(lastWorkspace.id);
                } else if (!activeWorkspaceId) {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Failed to load workspaces', error);
                setLoading(false);
            }
        };
        init();
    }, [user, activeWorkspaceId]);

    // Debounce main search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeWorkspaceId) loadMemberships();
        }, 500);
        return () => clearTimeout(timer);
    }, [activeWorkspaceId, filter, page, search]);

    // Debounce player search for autocomplete
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm && searchTerm.length >= 2) {
                handleSearchPlayers(searchTerm);
            } else {
                setPlayerResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearchPlayers = async (query: string) => {
        try {
            setSearchingPlayers(true);
            const response = await playersAPI.searchPlayers(query);
            // API returns { success: true, players: [] } or just [] depending on implementation
            // axios.ts says: return response.data
            // Let's assume response.players based on standard
            const players = response.players || response.data || response || [];
            // Ensure players is an array
            setPlayerResults(Array.isArray(players) ? players : []);
        } catch (error) {
            console.error("Failed to search players", error);
            setPlayerResults([]);
        } finally {
            setSearchingPlayers(false);
        }
    };

    const loadMemberships = async () => {
        if (!activeWorkspaceId) return;

        try {
            setLoading(true);
            const response = await membershipsAPI.getAdminList({
                workspaceId: activeWorkspaceId,
                page,
                limit: 20,
                filter,
                search
            });
            setMemberships(response.memberships);
            setSummary(response.summary);
        } catch (error: any) {
            toast.error('Erro ao carregar memberships: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleManualPayment = (membership: AdminMembershipListItem) => {
        setSelectedMembership(membership);
        const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
        const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
        setPaymentForm({
            amount: membership.planValue || 0,
            method: 'pix',
            description: `Pagamento Mensalidade ${capitalizedMonth} - ${membership.user.name}`
        });
        setPaymentDialogOpen(true);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedMembership) return;

        try {
            setActionLoading(true);
            await membershipsAPI.registerManualPayment(selectedMembership.id, {
                ...paymentForm,
                workspaceId: activeWorkspaceId
            });
            toast.success('✅ Pagamento registrado! Membership reativado.');
            setPaymentDialogOpen(false);
            loadMemberships();
        } catch (error: any) {
            toast.error('Erro ao registrar pagamento: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const executeConfirmation = async () => {
        if (!confirmState.action) return;

        try {
            setConfirmLoading(true);
            await confirmState.action();
            setConfirmState({ ...confirmState, open: false });
        } catch (error) {
            console.error(error);
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleSuspend = (membership: AdminMembershipListItem) => {
        setConfirmState({
            open: true,
            title: `Suspender ${membership.user.name}?`,
            description: 'O usuário perderá acesso imediato aos jogos futuros até que a assinatura seja reativada.',
            variant: 'destructive',
            action: async () => {
                try {
                    await membershipsAPI.suspendMembershipAdmin(membership.id, 'Suspenso manualmente pelo admin', activeWorkspaceId);
                    toast.success(`Assinatura de ${membership.user.name} foi suspensa.`);
                    loadMemberships();
                } catch (error: any) {
                    toast.error('Erro ao suspender: ' + (error.response?.data?.message || error.message));
                }
            }
        });
    };

    const handleCancel = (membership: AdminMembershipListItem) => {
        setConfirmState({
            open: true,
            title: `Cancelar assinatura de ${membership.user.name}?`,
            description: 'Isso irá cancelar a recorrência. O usuário continuará ativo apenas até o fim do ciclo atual se não for cancelamento imediato.',
            variant: 'destructive',
            action: async () => {
                try {
                    await membershipsAPI.cancelMembershipAdmin(membership.id, true, activeWorkspaceId);
                    toast.error(`Assinatura de ${membership.user.name} cancelada.`);
                    loadMemberships();
                } catch (error: any) {
                    toast.error('Erro ao cancelar: ' + (error.response?.data?.message || error.message));
                }
            }
        });
    };

    const handleOpenCreateDialog = () => {
        const workspace = workspaces.find(w => w.id === activeWorkspaceId);
        const defaultFee = workspace?.settings?.monthlyFeeCents
            ? workspace.settings.monthlyFeeCents / 100
            : 100;

        setCreateForm(prev => ({ ...prev, planValue: defaultFee }));
        setCreateDialogOpen(true);
    };

    const handleCreateSubmit = async () => {
        if (!createForm.userId) {
            toast.error('Selecione um usuário');
            return;
        }

        try {
            setActionLoading(true);
            await membershipsAPI.createMembership({
                workspaceId: activeWorkspaceId,
                userId: createForm.userId,
                planValue: createForm.planValue,
            });
            toast.success('✅ Mensalista adicionado com sucesso!');
            setCreateDialogOpen(false);
            setCreateForm({ userId: '', planValue: 100, billingDay: 10 });
            setSelectedPlayer(null); // Fix: Clear selected player
            setSearchTerm(''); // Fix: Clear search term
            setPlayerResults([]); // Fix: Clear results
            loadMemberships();
        } catch (error: any) {
            toast.error('Erro ao criar: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (membership: AdminMembershipListItem) => {
        setSelectedMembership(membership);
        setEditForm({
            planValue: membership.planValue || 0,
            billingDay: membership.billingDay
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!selectedMembership) return;

        try {
            setActionLoading(true);
            await membershipsAPI.updateMembership(selectedMembership.id, {
                ...editForm,
                workspaceId: activeWorkspaceId
            });
            toast.success('✅ Membership atualizado com sucesso!');
            setEditDialogOpen(false);
            loadMemberships();
        } catch (error: any) {
            toast.error('Erro ao atualizar: ' + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const variants: Record<string, { label: string; className: string }> = {
            ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-800 border-green-200' },
            SUSPENDED: { label: 'Suspenso', className: 'bg-red-100 text-red-800 border-red-200' },
            PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            INACTIVE: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800 border-gray-200' },
        };

        const variant = variants[status] || variants.PENDING;

        return (
            <Badge variant="outline" className={variant.className}>
                {variant.label}
            </Badge>
        );
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Mensalidades</h1>
                    <p className="text-muted-foreground mt-1">
                        CRM de Assinantes: Gerencie pagamentos e status
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select
                        value={activeWorkspaceId}
                        onValueChange={setActiveWorkspaceId}
                    >
                        <SelectTrigger className="w-full sm:w-[240px]">
                            <SelectValue placeholder="Selecione o Workspace" />
                        </SelectTrigger>
                        <SelectContent>
                            {workspaces.map((ws) => (
                                <SelectItem key={ws.id} value={ws.id}>
                                    {ws.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button onClick={handleOpenCreateDialog} className="whitespace-nowrap">
                        <Users className="mr-2 h-4 w-4" />
                        Novo Mensalista
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ativos (Em dia)</CardTitle>
                        <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{summary.totalActive}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Usuários regulares
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-yellow-200 bg-yellow-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">{summary.totalPending}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Aguardando pagamento
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-red-200 bg-red-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suspensos (Inadimplentes)</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{summary.totalSuspended}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ação necessária
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow bg-blue-50/10 border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Prevista (MRR)</CardTitle>
                        <WalletCards className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">
                            R$ {(summary.mrr / 100).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Mensal recorrente
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">Todos</TabsTrigger>
                                <TabsTrigger value="active">Em Dia</TabsTrigger>
                                <TabsTrigger value="overdue" className="text-yellow-600 data-[state=active]:bg-yellow-100">Devedores</TabsTrigger>
                                <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative w-full md:w-72">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou telefone..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : memberships.length === 0 ? (
                        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                            <h3 className="text-lg font-medium">Nenhum assinante encontrado</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {search ? 'Tente buscar com outros termos' : 'Comece adicionando um novo mensalista'}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Membro</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Último Pag.</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {memberships.map((membership) => (
                                        <TableRow
                                            key={membership.id}
                                            className={
                                                membership.status === 'SUSPENDED' ? 'bg-red-50 hover:bg-red-100/50' :
                                                    membership.status === 'PENDING' ? 'bg-yellow-50/30 hover:bg-yellow-100/30' : ''
                                            }
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                            {membership.user.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-foreground">{membership.user.name}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">
                                                            {membership.user.phoneE164}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={membership.status} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Dia {membership.billingDay}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Próx: {new Date(membership.nextDueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                R$ {(membership.planValue || 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {membership.lastPaymentDate ? (
                                                    <span className="text-sm text-green-600 flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        {new Date(membership.lastPaymentDate).toLocaleDateString('pt-BR')}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Nunca</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleManualPayment(membership)}>
                                                            <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                                            Registrar Pagamento
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleEdit(membership)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar Contrato
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSuspend(membership)} className="text-yellow-600">
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Suspender
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleCancel(membership)} className="text-red-600">
                                                            <X className="mr-2 h-4 w-4" />
                                                            Cancelar Assinatura
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Membership Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Assinatura</DialogTitle>
                        <DialogDescription>
                            Atualize o valor do plano ou dia de vencimento
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="planValue">Valor do Plano (R$)</Label>
                            <Input
                                id="planValue"
                                type="number"
                                step="0.01"
                                value={editForm.planValue}
                                onChange={(e) => setEditForm({ ...editForm, planValue: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="billingDay">Dia de Vencimento</Label>
                            <Input
                                id="billingDay"
                                type="number"
                                min="1"
                                max="28"
                                value={editForm.billingDay}
                                onChange={(e) => setEditForm({ ...editForm, billingDay: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={actionLoading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleEditSubmit} disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manual Payment Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Lançar Pagamento Manual</DialogTitle>
                        <DialogDescription>
                            Registre pagamentos recebidos fora do sistema (Dinheiro, PIX direto)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center justify-center mb-2 border border-dashed">
                        <span className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Valor Devido</span>
                        <span className="text-3xl font-bold text-green-600 mt-1">
                            R$ {(paymentForm.amount || 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor Recebido (R$)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="method">Forma de Pagamento</Label>
                                <Select
                                    value={paymentForm.method}
                                    onValueChange={(v) => setPaymentForm({ ...paymentForm, method: v })}
                                >
                                    <SelectTrigger id="method">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="transf">Transferência</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    id="description"
                                    value={paymentForm.description}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={actionLoading}>
                            Cancelar
                        </Button>
                        <Button onClick={handlePaymentSubmit} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 text-white">
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            Confirmar Recebimento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Membership Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Contrato de Mensalista</DialogTitle>
                        <DialogDescription>Associe um jogador a um plano mensal</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Jogador</Label>

                            {!selectedPlayer ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar jogador por nome..."
                                            className="pl-9"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchingPlayers && (
                                            <div className="absolute right-3 top-3">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {searchTerm.length >= 2 && !selectedPlayer && (
                                        <div className="border rounded-md max-h-48 overflow-y-auto">
                                            {playerResults.length === 0 && !searchingPlayers ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    Nenhum jogador encontrado
                                                </div>
                                            ) : (
                                                <div className="divide-y">
                                                    {playerResults.map((player: any) => (
                                                        <div
                                                            key={player.id}
                                                            className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                setSelectedPlayer(player);
                                                                setCreateForm({ ...createForm, userId: player.id });
                                                                setSearchTerm('');
                                                                setPlayerResults([]);
                                                            }}
                                                        >
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-medium">{player.name}</p>
                                                                <p className="text-xs text-muted-foreground">{player.phoneE164}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {selectedPlayer.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{selectedPlayer.name}</p>
                                            <p className="text-xs text-muted-foreground">{selectedPlayer.phoneE164}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPlayer(null);
                                            setCreateForm({ ...createForm, userId: '' });
                                        }}
                                    >
                                        Trocar
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="createPlanValue">Mensalidade (R$)</Label>
                                <Input
                                    id="createPlanValue"
                                    type="number"
                                    step="0.01"
                                    value={createForm.planValue}
                                    onChange={(e) => setCreateForm({ ...createForm, planValue: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="createBillingDay">Dia Vencimento</Label>
                                <Input
                                    id="createBillingDay"
                                    type="number"
                                    min="1"
                                    max="28"
                                    value={createForm.billingDay}
                                    onChange={(e) => setCreateForm({ ...createForm, billingDay: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setCreateDialogOpen(false);
                            setSelectedPlayer(null);
                            setCreateForm({ userId: '', planValue: 100, billingDay: 10 });
                            setSearchTerm('');
                        }} disabled={actionLoading}>Cancelar</Button>
                        <Button onClick={handleCreateSubmit} disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Criar Assinatura
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Alert Dialog */}
            <AlertDialog open={confirmState.open} onOpenChange={(open) => {
                if (!open && !confirmLoading) setConfirmState({ ...confirmState, open: false });
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmState.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={confirmLoading}>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                executeConfirmation();
                            }}
                            className={confirmState.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
                            disabled={confirmLoading}
                        >
                            {confirmLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ManageMemberships;
