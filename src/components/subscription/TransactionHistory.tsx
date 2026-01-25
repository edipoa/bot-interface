import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { ITransaction } from '@/lib/types/membership';

interface TransactionHistoryProps {
    transactions: ITransaction[];
    loading?: boolean;
    onPay: (transactionId: string) => void;
    hideTitle?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
    transactions,
    loading = false,
    onPay,
    hideTitle = false
}) => {
    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Carregando histórico...</div>;
    }

    if (transactions.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    Nenhuma transação encontrada.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            {!hideTitle && (
                <CardHeader className="bg-muted/30 px-6 py-4 border-b">
                    <CardTitle className="text-lg font-medium">Histórico Financeiro</CardTitle>
                </CardHeader>
            )}
            <div className="divide-y">
                {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 p-2 rounded-full ${tx.type === 'INCOME'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500'
                                }`}>
                                {tx.type === 'INCOME' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm sm:text-base">{tx.description}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(tx.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="text-xs text-muted-foreground px-1">•</span>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        {tx.category?.toLowerCase() || 'Geral'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <div className="text-right">
                                <span className={`block font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-foreground'
                                    }`}>
                                    {tx.type === 'EXPENSE' ? '- ' : '+ '}
                                    R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                                <Badge variant={
                                    tx.status === 'COMPLETED' ? 'outline' :
                                        tx.status === 'PENDING' ? 'secondary' :
                                            tx.status === 'OVERDUE' ? 'destructive' : 'outline'
                                } className="mt-1 text-[10px] h-5">
                                    {tx.status === 'COMPLETED' ? 'Pago' :
                                        tx.status === 'PENDING' ? 'Pendente' :
                                            tx.status === 'OVERDUE' ? 'Vencido' : tx.status}
                                </Badge>
                            </div>

                            {(tx.status === 'PENDING' || tx.status === 'OVERDUE') && (
                                <Button
                                    size="sm"
                                    onClick={() => onPay(tx.id)}
                                    variant="default"
                                    className="dark:border-white dark:text-white dark:hover:bg-white/10"
                                >
                                    Ver Pix
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
