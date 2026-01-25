import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFMoneyInput } from '../components/BF-MoneyInput';
import { BFBadge } from '../components/BF-Badge';
import { BFTable } from '../components/BF-Table';
import { BFIcons } from '../components/BF-Icons';
import { formatEventDate } from '../lib/dateUtils';
import type { BBQResponseDto, BBQParticipant } from '../lib/types';
import type { BFTableColumn } from '../components/BF-Table';
import { bbqAPI, playersAPI } from '../lib/axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { BFInput } from '../components/BF-Input';
import { Search } from 'lucide-react';

interface BBQDetailsProps {
    bbqId?: string;
    onBack?: () => void;
}

export const BBQDetails: React.FC<BBQDetailsProps> = ({ bbqId: propBbqId, onBack }) => {
    const { bbqId: paramBbqId } = useParams<{ bbqId: string }>();
    const navigate = useNavigate();

    // Resolve ID from props or params
    const bbqId = propBbqId || paramBbqId;

    const [bbq, setBbq] = useState<BBQResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Financial States
    const [meatCost, setMeatCost] = useState(0);
    const [cookCost, setCookCost] = useState(0);
    const [ticketPrice, setTicketPrice] = useState(0);

    // Financial Display States (Strings)
    const [meatCostStr, setMeatCostStr] = useState('');
    const [cookCostStr, setCookCostStr] = useState('');
    const [ticketPriceStr, setTicketPriceStr] = useState('');

    const [addParticipantDialogOpen, setAddParticipantDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingPlayers, setSearchingPlayers] = useState(false);
    const [addingParticipant, setAddingParticipant] = useState(false);
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [selectedInviter, setSelectedInviter] = useState<any>(null);
    const [guestName, setGuestName] = useState('');

    useEffect(() => {
        if (bbqId) {
            fetchBBQ();
        }
    }, [bbqId]);

    useEffect(() => {
        if (bbq) {
            // Initialize financials
            const financials = bbq.financials || { meatCost: 0, cookCost: 0, ticketPrice: bbq.valuePerPerson || 0 };

            setMeatCost(financials.meatCost);
            setCookCost(financials.cookCost);
            setTicketPrice(financials.ticketPrice);

            setMeatCostStr((financials.meatCost / 100).toFixed(2).replace('.', ','));
            setCookCostStr((financials.cookCost / 100).toFixed(2).replace('.', ','));
            setTicketPriceStr((financials.ticketPrice / 100).toFixed(2).replace('.', ','));
        }
    }, [bbq]);

    const fetchBBQ = async () => {
        if (!bbqId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await bbqAPI.getBBQById(bbqId);
            const bbqData = response.data || response;
            setBbq(bbqData);
        } catch (error: any) {
            console.error('Error fetching BBQ:', error);
            if (error.response?.status === 404) {
                toast.error('Churrasco não encontrado');
                if (onBack) onBack();
                else navigate('/admin/bbq');
            } else {
                toast.error(error.response?.data?.message || 'Erro ao carregar churrasco');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFinancials = async () => {
        if (!bbqId || !bbq || isReadOnly) return;

        setUpdating(true);
        try {
            // We use updateBBQ but we need to ensure the backend accepts 'financials' object
            // Use 'any' casting if updateBBQ signature isn't updated in axios yet, or assume it works
            await bbqAPI.updateBBQ(bbqId, {
                // @ts-ignore
                financials: {
                    meatCost,
                    cookCost,
                    ticketPrice,
                },
                valuePerPerson: ticketPrice // Sync legacy field
            });

            toast.success('Financeiro atualizado com sucesso!');
            await fetchBBQ();
        } catch (error: any) {
            console.error('Error updating financials:', error);
            toast.error(error.response?.data?.message || 'Erro ao atualizar financeiro');
        } finally {
            setUpdating(false);
        }
    };

    const handleCloseBBQ = async () => {
        if (!bbqId || !bbq) return;

        if (ticketPrice === 0) {
            toast.error('Defina o valor do convite antes de fechar!');
            return;
        }

        try {
            setUpdating(true);
            await bbqAPI.closeBBQ(bbqId);
            toast.success('Churrasco fechado! Cobranças geradas.');
            await fetchBBQ();
        } catch (error: any) {
            console.error('Error closing BBQ:', error);
            toast.error(error.response?.data?.message || 'Erro ao fechar churrasco');
        } finally {
            setUpdating(false);
        }
    };

    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

    const handleCancelBBQ = () => {
        setConfirmCancelOpen(true);
    };

    const executeCancelBBQ = async () => {
        if (!bbqId || !bbq) return;

        try {
            setUpdating(true);
            await bbqAPI.cancelBBQ(bbqId);
            toast.success('Churrasco cancelado com sucesso!');
            await fetchBBQ();
            setConfirmCancelOpen(false);
        } catch (error: any) {
            console.error('Error canceling BBQ:', error);
            toast.error(error.response?.data?.message || 'Erro ao cancelar churrasco');
        } finally {
            setUpdating(false);
        }
    };

    // ... search/add/remove participants logic (mostly same as before) ...
    // Copying the participant logic from previous file to ensure it works

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

    const handleAddParticipant = async (player?: any) => {
        if (!bbqId) return;

        try {
            setAddingParticipant(true);

            if (isGuestMode) {
                if (!selectedInviter || !guestName) {
                    toast.error('Selecione quem convida e o nome do convidado');
                    return;
                }
                await bbqAPI.addGuest(bbqId, selectedInviter.id || selectedInviter._id, guestName);
                toast.success(`✅ Convidado adicionado!`);
            } else {
                if (!player) return;
                await bbqAPI.addParticipant(bbqId, player.id || player._id, player.name);
                toast.success(`✅ ${player.name} adicionado!`);
            }

            await fetchBBQ();
            setAddParticipantDialogOpen(false);
            setSearchTerm('');
            setSearchResults([]);
            setIsGuestMode(false);
            setSelectedInviter(null);
            setGuestName('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao adicionar participante');
        } finally {
            setAddingParticipant(false);
        }
    };

    const handleRemoveParticipant = async (userId: string) => {
        if (!bbqId || isReadOnly) return;
        try {
            await bbqAPI.removeParticipant(bbqId, userId);
            toast.success('Participante removido!');
            await fetchBBQ();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao remover');
        }
    };

    const handleTogglePayment = async (userId: string, currentStatus: boolean) => {
        if (!bbqId) return;
        try {
            setUpdating(true);
            await bbqAPI.toggleParticipantPayment(bbqId, userId, !currentStatus);
            toast.success(`Pagamento atualizado!`);
            await fetchBBQ();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao atualizar pagamento');
        } finally {
            setUpdating(false);
        }
    };

    // Effect for search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) handleSearchPlayers(searchTerm);
            else setSearchResults([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const getStatusBadge = (status: BBQResponseDto['status']) => {
        const statusMap = {
            open: { variant: 'info' as const, label: 'Aberto' },
            closed: { variant: 'warning' as const, label: 'Fechado' },
            finished: { variant: 'success' as const, label: 'Finalizado' },
            cancelled: { variant: 'error' as const, label: 'Cancelado' },
        };
        const config = statusMap[status] || { variant: 'secondary', label: status };
        return <BFBadge variant={config.variant} size="lg">{config.label}</BFBadge>;
    };

    // Columns
    const participantColumns: BFTableColumn<BBQParticipant>[] = [
        {
            key: 'userName',
            label: 'Participante',
            render: (_: any, row: BBQParticipant) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                        {row.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-[--foreground] font-medium">{row.userName}</p>
                            {row.isFree && (
                                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200 uppercase font-bold tracking-wide">
                                    Grátis
                                </span>
                            )}
                        </div>
                        {row.invitedBy && row.invitedByName && (
                            <p className="text-[--muted-foreground] text-xs mt-0.5">
                                Convidado por {row.invitedByName}
                            </p>
                        )}
                    </div>
                </div>
            ),
        }
    ];

    if (loading) return <div>Loading...</div>; // Simplified loading
    if (!bbq) return <div>Not Found</div>;

    const isReadOnly = bbq.status === 'finished' || bbq.status === 'cancelled';
    const payingParticipants = bbq.participants.filter(p => !p.isFree).length;
    const freeParticipants = bbq.participants.filter(p => p.isFree).length;
    const projectedRevenue = payingParticipants * ticketPrice;
    const totalCost = meatCost + cookCost;
    const profit = projectedRevenue - totalCost;

    return (
        <div className="space-y-6 p-6">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <BFButton
                    variant="ghost"
                    icon={<BFIcons.ArrowLeft size={20} />}
                    onClick={() => onBack ? onBack() : navigate(-1)}
                >
                    Voltar
                </BFButton>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[--foreground] flex items-center gap-3">
                        Churrasco {formatEventDate(bbq.date)}
                        {getStatusBadge(bbq.status)}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: PARTICIPANTS */}
                <div className="space-y-6">
                    <BFCard variant="default" padding="none" className="overflow-hidden">
                        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">Lista de Presença</h3>
                                <p className="text-sm text-[--muted-foreground]">
                                    {bbq.participants.length} confirmados ({payingParticipants} pagantes, {freeParticipants} grátis)
                                </p>
                            </div>
                            {!isReadOnly && (bbq.status === 'open') && (
                                <BFButton
                                    size="sm"
                                    variant="primary"
                                    icon={<BFIcons.Plus size={16} />}
                                    onClick={() => setAddParticipantDialogOpen(true)}
                                >
                                    Adicionar
                                </BFButton>
                            )}
                        </div>

                        <div className="max-h-[600px] overflow-y-auto">
                            <BFTable
                                columns={participantColumns}
                                data={bbq.participants}
                                emptyMessage="Nenhum participante ainda."
                                actions={(row: BBQParticipant) => {
                                    if (bbq.status === 'open' && !isReadOnly) {
                                        return (
                                            <button
                                                onClick={() => handleRemoveParticipant(row.userId)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                title="Remover"
                                            >
                                                <BFIcons.Trash2 size={16} />
                                            </button>
                                        );
                                    }
                                    if (bbq.status === 'closed' && !row.isFree) {
                                        return (
                                            <button
                                                onClick={() => handleTogglePayment(row.userId, row.isPaid)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${row.isPaid
                                                    ? 'bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20'
                                                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {row.isPaid ? 'Pago ✅' : 'Pagar 💲'}
                                            </button>
                                        );
                                    }
                                    if (row.isFree) {
                                        return <span className="text-xs text-green-600 font-medium px-3">Isento</span>;
                                    }
                                    return null;
                                }}
                            />
                        </div>
                    </BFCard>
                </div>

                {/* RIGHT COLUMN: FINANCIALS */}
                <div className="space-y-6">
                    <BFCard variant="elevated" padding="lg">
                        <BFCardHeader title="Painel Financeiro" subtitle="Custos e Definição de Preço" />
                        <BFCardContent>
                            <div className="space-y-6">
                                {/* Costs Inputs */}
                                <div className="grid grid-cols-2 gap-4">
                                    <BFMoneyInput
                                        label="Custos (Carne/Bebida)"
                                        value={meatCostStr}
                                        onChange={(val, cents) => { setMeatCostStr(val); setMeatCost(cents); }}
                                        disabled={isReadOnly || updating}
                                    />
                                    <BFMoneyInput
                                        label="Assador"
                                        value={cookCostStr}
                                        onChange={(val, cents) => { setCookCostStr(val); setCookCost(cents); }}
                                        disabled={isReadOnly || updating}
                                    />
                                </div>

                                {/* Revenue Input */}
                                <div className="p-4 bg-[var(--muted)]/50 rounded-xl border border-[var(--border)]">
                                    <BFMoneyInput
                                        label="Valor do Convite (Por Pessoa)"
                                        value={ticketPriceStr}
                                        onChange={(val, cents) => { setTicketPriceStr(val); setTicketPrice(cents); }}
                                        disabled={isReadOnly || updating}
                                        className="text-lg font-bold"
                                    />
                                </div>

                                {/* Summary Box */}
                                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                    <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                        <p className="text-red-600 dark:text-red-400 font-medium">Custo Total</p>
                                        <p className="text-xl font-bold text-red-700 dark:text-red-300">
                                            R$ {(totalCost / 100).toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                        <p className="text-green-600 dark:text-green-400 font-medium">Receita Prevista</p>
                                        <p className="text-xl font-bold text-green-700 dark:text-green-300">
                                            R$ {(projectedRevenue / 100).toFixed(2).replace('.', ',')}
                                        </p>
                                        <p className="text-xs text-green-600/70 dark:text-green-400/70">
                                            {payingParticipants} pagantes x {ticketPriceStr}
                                        </p>
                                    </div>
                                </div>

                                {/* Profit/Loss Indicator */}
                                <div className={`p-3 rounded-lg flex justify-between items-center ${profit >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                    <span className="font-medium">Resultado (Caixa):</span>
                                    <span className="font-bold text-lg">
                                        {profit >= 0 ? '+' : ''} R$ {(profit / 100).toFixed(2).replace('.', ',')}
                                    </span>
                                </div>

                                <BFButton
                                    variant="secondary"
                                    fullWidth
                                    onClick={handleSaveFinancials}
                                    disabled={isReadOnly || updating}
                                >
                                    Salvar Alterações Financeiras
                                </BFButton>

                                <div className="h-px bg-[var(--border)] my-6" />

                                {/* Action Buttons */}
                                {bbq.status === 'open' && (
                                    <div className="flex flex-col gap-2">
                                        <BFButton
                                            variant="primary"
                                            fullWidth
                                            size="lg"
                                            onClick={handleCloseBBQ}
                                            disabled={updating || ticketPrice === 0}
                                            icon={<BFIcons.Lock size={20} />}
                                        >
                                            Encerrar e Gerar Cobranças
                                        </BFButton>
                                        <BFButton
                                            variant="danger"
                                            fullWidth
                                            size="lg"
                                            onClick={handleCancelBBQ}
                                            disabled={updating}
                                            icon={<BFIcons.Slash size={20} />}
                                        >
                                            Cancelar Churrasco
                                        </BFButton>
                                    </div>
                                )}

                                {bbq.status === 'closed' && (
                                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200">
                                        <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Evento Encerrado</p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                                            As cobranças já foram geradas no sistema financeiro.
                                        </p>
                                        {/* TODO: Add Reopen Logic if needed */}
                                    </div>
                                )}
                            </div>
                        </BFCardContent>
                    </BFCard>
                </div>
            </div>

            {/* Dialog reused from previous implementation */}
            <Dialog open={addParticipantDialogOpen} onOpenChange={(open) => {
                setAddParticipantDialogOpen(open);
                if (!open) {
                    setIsGuestMode(false);
                    setSearchTerm('');
                    setSearchResults([]);
                    setSelectedInviter(null);
                    setGuestName('');
                }
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Adicionar ao Churrasco</DialogTitle>
                        <DialogDescription>
                            {isGuestMode ? 'Adicione um convidado ao churrasco' : 'Busque o participante por nome ou telefone'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Toggle Participante / Convidado */}
                        <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                            <button
                                onClick={() => setIsGuestMode(false)}
                                className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${!isGuestMode
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-foreground hover:bg-accent'
                                    }`}
                            >
                                Participante Já Cadastrado
                            </button>
                            <button
                                onClick={() => setIsGuestMode(true)}
                                className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${isGuestMode
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-foreground hover:bg-accent'
                                    }`}
                            >
                                Convidado Externo
                            </button>
                        </div>

                        {/* Wrapper for content to allow proper scrolling/height */}
                        <div className="min-h-[200px]">
                            {isGuestMode ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Quem está convidando?</label>
                                        {!selectedInviter ? (
                                            <>
                                                <BFInput
                                                    placeholder="Buscar membro..."
                                                    value={searchTerm}
                                                    onChange={(v) => setSearchTerm(v)}
                                                    icon={<Search className="w-4 h-4" />}
                                                    fullWidth
                                                />
                                                {searchResults.length > 0 && (
                                                    <div className="bg-popover border rounded-md shadow-md max-h-[150px] overflow-auto mt-1">
                                                        {searchResults.map(p => (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => { setSelectedInviter(p); setSearchTerm(''); setSearchResults([]); }}
                                                                className="p-2 hover:bg-accent cursor-pointer text-sm"
                                                            >
                                                                {p.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-between p-2 border rounded bg-muted/20">
                                                <span className="font-medium">{selectedInviter.name}</span>
                                                <button onClick={() => setSelectedInviter(null)} className="text-xs text-primary underline">Alterar</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nome do Convidado</label>
                                        <BFInput
                                            placeholder="Ex: João da Silva"
                                            value={guestName}
                                            onChange={setGuestName}
                                            fullWidth
                                        />
                                    </div>
                                    <BFButton
                                        fullWidth
                                        variant="primary"
                                        disabled={!selectedInviter || !guestName || addingParticipant}
                                        onClick={() => handleAddParticipant()}
                                    >
                                        Adicionar Convidado
                                    </BFButton>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Buscar Jogador</label>
                                        <BFInput
                                            placeholder="Nome, Apelido ou Telefone..."
                                            value={searchTerm}
                                            onChange={(v) => setSearchTerm(v)}
                                            icon={<Search className="w-4 h-4" />}
                                            fullWidth
                                            className="h-10" // Force height
                                        />
                                    </div>

                                    <div className="border rounded-md min-h-[150px] max-h-[250px] overflow-y-auto bg-muted/10">
                                        {searchingPlayers && <div className="p-4 text-center text-xs text-muted-foreground">Buscando...</div>}
                                        {!searchingPlayers && searchResults.length === 0 && searchTerm.length > 2 && (
                                            <div className="p-4 text-center text-xs text-muted-foreground">Ninguém encontrado.</div>
                                        )}
                                        {searchResults.map(player => (
                                            <div
                                                key={player.id}
                                                onClick={() => handleAddParticipant(player)}
                                                className="p-3 border-b last:border-0 hover:bg-accent cursor-pointer flex justify-between items-center transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium text-sm">{player.name}</p>
                                                    <p className="text-xs text-muted-foreground">{player.phone}</p>
                                                </div>
                                                <BFIcons.Plus size={16} className="text-primary" opacity={0.7} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <BFIcons.AlertCircle size={24} />
                            Cancelar Churrasco
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja cancelar este churrasco?
                            <br /><br />
                            Isso marcará o evento como cancelado e não poderá ser desfeito.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <BFButton
                            variant="ghost"
                            onClick={() => setConfirmCancelOpen(false)}
                            disabled={updating}
                        >
                            Voltar
                        </BFButton>
                        <BFButton
                            variant="danger"
                            onClick={executeCancelBBQ}
                            disabled={updating}
                            loading={updating}
                        >
                            Sim, Cancelar
                        </BFButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
