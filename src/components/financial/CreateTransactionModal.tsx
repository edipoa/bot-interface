import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BFInput } from '../BF-Input';
import { BFButton } from '../BF-Button';
import { BFMoneyInput } from '../BF-MoneyInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { transactionsAPI, playersAPI } from '@/lib/axios';
import { Search, User, X } from 'lucide-react';

const transactionSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1, 'Categoria é obrigatória'),
    description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
    amount: z.string().min(1, 'Valor é obrigatório'),
    date: z.string(),
    status: z.enum(['COMPLETED', 'PENDING']),
    userId: z.string().optional()
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface CreateTransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    workspaceId: string;
}

export const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
    open,
    onOpenChange,
    onSuccess,
    workspaceId
}) => {
    const [submitting, setSubmitting] = useState(false);

    // User Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchingPlayers, setSearchingPlayers] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; phone?: string } | null>(null);

    const { handleSubmit, setValue, watch, reset, control, formState: { errors } } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'EXPENSE',
            category: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            status: 'COMPLETED'
        }
    });

    const type = watch('type');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm && searchTerm.length >= 2) {
                handleSearchPlayers(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearchPlayers = async (search: string) => {
        try {
            setSearchingPlayers(true);
            const response = await playersAPI.searchPlayers(search);
            setSearchResults(response.players || []);
        } catch (error) {
            console.error(error);
        } finally {
            setSearchingPlayers(false);
        }
    };

    const handleFormSubmit = async (data: TransactionFormValues) => {
        try {
            setSubmitting(true);

            // Parse amount string "1.000,00" -> cents
            // Remove R$, spaces, convert comma to dot
            const cleanAmount = data.amount.replace(/[^\d,]/g, '').replace(',', '.');
            const amountCents = Math.round(parseFloat(cleanAmount) * 100);

            if (isNaN(amountCents) || amountCents <= 0) {
                toast.error('Valor inválido');
                return;
            }

            await transactionsAPI.create({
                workspaceId,
                userId: selectedUser?.id, // Use selected user ID
                type: data.type,
                category: data.category,
                amount: amountCents, // Send as CENTS
                description: data.description,
                dueDate: new Date(data.date).toISOString(),
                status: data.status
            });

            toast.success('Transação registrada com sucesso');
            reset();
            setSelectedUser(null);
            setSearchTerm('');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao registrar transação');
        } finally {
            setSubmitting(false);
        }
    };

    const categories = type === 'INCOME'
        ? [
            { value: 'GAME_FEE', label: 'Pagamento de Jogo' },
            { value: 'MEMBERSHIP', label: 'Mensalidade' },
            { value: 'OTHER', label: 'Outros' }
        ]
        : [
            { value: 'FIELD_RENTAL', label: 'Aluguel Quadra' },
            { value: 'EQUIPMENT', label: 'Equipamento' },
            { value: 'OTHER', label: 'Outros' }
        ];

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) {
                reset();
                setSelectedUser(null);
                setSearchTerm('');
            }
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                    <DialogDescription>
                        Registre uma entrada ou saída financeira.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <RadioGroup
                            defaultValue="EXPENSE"
                            value={type}
                            onValueChange={(val: 'INCOME' | 'EXPENSE') => setValue('type', val)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="INCOME" id="income" className="text-green-600 border-green-600" />
                                <Label htmlFor="income" className="text-green-600 font-bold">Receita (Entrada)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="EXPENSE" id="expense" className="text-red-600 border-red-600" />
                                <Label htmlFor="expense" className="text-red-600 font-bold">Despesa (Saída)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select onValueChange={(val) => setValue('category', val)} defaultValue={watch('category')}>
                                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select onValueChange={(val: 'COMPLETED' | 'PENDING') => setValue('status', val)} defaultValue={watch('status')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPLETED">Concluído (Pago)</SelectItem>
                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* User Selection */}
                    <div className="space-y-2 relative">
                        <Label>Vincular Usuário (Opcional)</Label>
                        {!selectedUser ? (
                            <div className="relative">
                                <BFInput
                                    placeholder="Buscar por nome..."
                                    value={searchTerm}
                                    onChange={(val) => setSearchTerm(val)}
                                    icon={<Search className="w-4 h-4" />}
                                    fullWidth
                                />
                                {searchTerm.length >= 2 && !selectedUser && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {searchingPlayers ? (
                                            <div className="p-3 text-center text-sm text-gray-500">Buscando...</div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map(player => (
                                                <button
                                                    key={player.id}
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                                                    onClick={() => {
                                                        setSelectedUser({ id: player.id, name: player.name, phone: player.phone });
                                                        setSearchTerm('');
                                                        setValue('userId', player.id);
                                                    }}
                                                >
                                                    <span>{player.name}</span>
                                                    {player.phone && <span className="text-xs text-gray-500">{player.phone}</span>}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-3 text-center text-sm text-gray-500">Nenhum usuário encontrado</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                                        <p className="text-xs text-gray-500">{selectedUser.phone}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setValue('userId', undefined);
                                    }}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                                >
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <BFInput
                                    {...field}
                                    error={errors.description?.message}
                                    fullWidth
                                    placeholder={type === 'INCOME' ? 'Ex: Mensalidade João' : 'Ex: Compra de coletes'}
                                />
                            )}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Controller
                                name="amount"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <BFMoneyInput
                                        value={value || ''}
                                        onChange={(val) => onChange(val)}
                                        error={errors.amount?.message}
                                        placeholder="0,00"
                                    />
                                )}
                            />
                            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Data de Vencimento/Pagamento</Label>
                            <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                    <BFInput
                                        type="date"
                                        {...field}
                                        error={errors.date?.message}
                                        fullWidth
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <BFButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </BFButton>
                        <BFButton
                            type="submit"
                            disabled={submitting}
                            className={type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {submitting ? 'Salvando...' : (type === 'INCOME' ? 'Registrar Receita' : 'Registrar Despesa')}
                        </BFButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
