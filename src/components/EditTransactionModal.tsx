import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { BFButton } from './BF-Button';
import { BFSelect } from './BF-Select';
import { BFTextarea } from './BF-Textarea';
import { Transaction } from './financial/TransactionsTable';
import { toast } from 'sonner';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: { status: string; description: string }) => Promise<void>;
    transaction: Transaction | null;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    transaction
}) => {
    const [status, setStatus] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Carrega os dados quando a transação muda
    useEffect(() => {
        if (transaction) {
            setStatus(transaction.status);
            setDescription(transaction.description || '');
        }
    }, [transaction]);

    const handleSave = async () => {
        if (!transaction) return;

        setIsLoading(true);
        try {
            await onSave(transaction.id, { status, description });
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar transação');
        } finally {
            setIsLoading(false);
        }
    };

    const statusOptions = [
        { value: 'PENDING', label: 'Pendente' },
        { value: 'COMPLETED', label: 'Concluído' },
        { value: 'OVERDUE', label: 'Vencido' },
        { value: 'CANCELLED', label: 'Cancelado' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Transação</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Status Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                        </label>
                        <BFSelect
                            value={status}
                            onChange={(val) => setStatus(val as string)}
                            options={statusOptions}
                            placeholder="Selecione o status"
                        />
                    </div>

                    {/* Description / Observação */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Descrição / Observação
                        </label>
                        <BFTextarea
                            value={description}
                            onChange={(val) => setDescription(val)}
                            placeholder="Digite uma observação ou corrija a descrição..."
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <BFButton
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </BFButton>
                    <BFButton
                        onClick={handleSave}
                        isLoading={isLoading}
                    >
                        Salvar Alterações
                    </BFButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};