
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { BFButton } from '../BF-Button';
import { Membership } from '../../lib/types/membership';
import { membershipsAPI } from '../../lib/axios';
import { toast } from 'sonner';

interface ManageSubscriptionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    membership: Membership | null;
    onUpdate: () => void;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
    open,
    onOpenChange,
    membership,
    onUpdate
}) => {
    const [loading, setLoading] = React.useState(false);
    const [confirmCancel, setConfirmCancel] = React.useState(false);

    const handleCancelSubscription = async () => {
        if (!membership) return;

        try {
            setLoading(true);
            await membershipsAPI.cancelMembership(membership.id, false);
            toast.success('Cancelamento agendado com sucesso!');
            onOpenChange(false);
            onUpdate();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erro ao cancelar assinatura');
        } finally {
            setLoading(false);
        }
    };

    if (!membership) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Gerenciar Assinatura</DialogTitle>
                    <DialogDescription>
                        Detalhes do seu plano atual.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Plano Atual</span>
                        <span className="font-bold">R$ {(membership.planValueCents ? membership.planValueCents / 100 : 0).toFixed(2)} / mês</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Status</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${membership.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            membership.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            } `}>
                            {membership.status === 'ACTIVE' ? 'ATIVO' :
                                membership.status === 'PENDING' ? 'PENDENTE' : membership.status}
                        </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Próximo Vencimento</span>
                        <span className="text-sm">{new Date(membership.nextDueDate).toLocaleDateString()}</span>
                    </div>

                    {confirmCancel ? (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-3">
                            <h4 className="text-red-800 font-semibold text-sm">Tem certeza?</h4>
                            <p className="text-xs text-red-600">
                                O cancelamento será agendado para o final do ciclo atual (próximo vencimento).
                                Você continuará tendo acesso até lá.
                            </p>
                            <div className="flex gap-2 justify-end">
                                <BFButton variant="ghost" size="sm" onClick={() => setConfirmCancel(false)}>Voltar</BFButton>
                                <BFButton
                                    variant="danger"
                                    size="sm"
                                    onClick={handleCancelSubscription}
                                    loading={loading}
                                >
                                    Confirmar Cancelamento
                                </BFButton>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 border-t">
                            <BFButton
                                variant="outline"
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setConfirmCancel(true)}
                                disabled={membership.status === 'INACTIVE' || membership.status === 'CANCELED_SCHEDULED'} // Use string literal matching backend enum
                            >
                                {membership.status === 'CANCELED_SCHEDULED' ? 'Cancelamento Já Agendado' : 'Cancelar Assinatura'}
                            </BFButton>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
