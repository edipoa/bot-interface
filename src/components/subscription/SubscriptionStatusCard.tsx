import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, Wallet, Copy } from 'lucide-react';
import { Membership } from '@/lib/types/membership';
import { toast } from 'sonner';

interface SubscriptionStatusCardProps {
    membership: Membership | null;
    isLoading?: boolean;
    onRegularize: () => void;
    onManage?: () => void;
    pixKey?: string;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
    membership,
    isLoading = false,
    onRegularize,
    onManage,
    pixKey
}) => {
    if (isLoading) {
        return (
            <Card className="animate-pulse">
                <CardContent className="h-24 flex items-center justify-center">
                    <div className="h-4 w-32 bg-muted rounded" />
                </CardContent>
            </Card>
        );
    }

    if (!membership) {
        return (
            <Card className="border shadow-sm border-l-4 border-l-gray-300 dark:border-l-gray-600 bg-muted/20">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500">
                            <Wallet className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">Sem Assinatura Ativa</h3>
                            <p className="text-sm text-muted-foreground">
                                Você não possui uma assinatura de mensalista neste grupo.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { status, planValue } = membership;

    // Add copy function
    const handleCopyPix = () => {
        if (pixKey) {
            navigator.clipboard.writeText(pixKey);
            toast.success('Chave Pix copiada!');
        } else {
            toast.error('Chave Pix não configurada neste grupo.');
        }
    };

    // Determine visuals based on status
    let variantStyles = '';
    let icon = null;
    let title = '';
    let description = '';
    let showAction = false;

    switch (status) {
        case 'ACTIVE':
            variantStyles = 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800';
            icon = <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />;
            title = 'Assinatura Ativa';
            description = membership.nextDueDate
                ? `Próximo vencimento: ${new Date(membership.nextDueDate).toLocaleDateString('pt-BR')}`
                : 'Membro regular';
            break;

        case 'PENDING':
            variantStyles = 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800';
            icon = <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />;
            title = 'Fatura em Aberto';
            description = 'Realize o pagamento para manter seus benefícios.';
            showAction = true;
            break;

        case 'SUSPENDED':
        case 'OVERDUE' as any: // Handling potential OVERDUE status mapped from backend
            variantStyles = 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800';
            icon = <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />;
            title = 'Assinatura Suspensa';
            description = 'Regularize sua situação para garantir vaga nos jogos.';
            showAction = true;
            break;

        case 'CANCELED_SCHEDULED':
            variantStyles = 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700';
            icon = <Wallet className="h-8 w-8 text-gray-500" />;
            title = 'Cancelamento Agendado';
            description = 'Sua assinatura será encerrada no final do ciclo.';
            break;

        default:
            variantStyles = 'bg-muted/50 border-border';
            icon = <Wallet className="h-8 w-8 text-muted-foreground" />;
            title = `Status: ${status}`;
            description = 'Verifique sua conta';
    }

    return (
        <Card className={`border shadow-sm border-l-4 ${status === 'ACTIVE' ? 'border-l-green-500' : status === 'PENDING' ? 'border-l-yellow-500' : status === 'SUSPENDED' ? 'border-l-red-500' : ''}`}>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-background shadow-sm ${variantStyles.includes('bg-') ? '' : 'bg-secondary'}`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                            {planValue > 0 && (
                                <p className="text-xs font-mono text-muted-foreground mt-1">
                                    Valor: R$ {planValue.toFixed(2)}/mês
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Pix Copy Button - ALWAYS VISIBLE if key exists */}
                        {pixKey && (pixKey.length > 5) && (
                            <Button
                                variant="secondary"
                                size="sm" // Changed from icon to sm for better visibility if needed, or keep icon but verify styling
                                onClick={handleCopyPix}
                                title="Copiar Chave Pix"
                                className="flex gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                <span className="sr-only sm:not-sr-only sm:inline-block">Copiar Pix</span>
                            </Button>
                        )}

                        {showAction && onRegularize && (
                            <Button onClick={onRegularize} className={status === 'SUSPENDED' || status === 'OVERDUE' as any ? 'bg-red-600 hover:bg-red-700 text-white' : ''}>
                                Pagar Agora
                            </Button>
                        )}

                        {/* Explicitly check for Manage capability for ACTIVE status */}
                        {status === 'ACTIVE' && onManage && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={onManage}
                                className="dark:border-white dark:text-white dark:hover:bg-white/10"
                            >
                                Gerenciar Assinatura
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
