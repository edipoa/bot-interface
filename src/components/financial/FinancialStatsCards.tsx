import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { BFCard } from '../BF-Card';

export interface FinancialStatsDto {
    revenue: number;
    expenses: number;
    balance: number;
    pending: number;
}

interface FinancialStatsCardsProps {
    stats: FinancialStatsDto;
    loading?: boolean;
}

export const FinancialStatsCards: React.FC<FinancialStatsCardsProps> = ({ stats, loading = false }) => {
    const cards = [
        {
            label: 'Saldo Total',
            value: stats.balance,
            icon: <Wallet size={24} className="text-blue-600" />,
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            textColor: stats.balance >= 0 ? 'text-green-600' : 'text-red-600',
            formatter: (v: number) => `R$ ${v.toFixed(2)}`
        },
        {
            label: 'Receitas',
            value: stats.revenue,
            icon: <TrendingUp size={24} className="text-green-600" />,
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            textColor: 'text-green-600',
            formatter: (v: number) => `+ R$ ${v.toFixed(2)}`
        },
        {
            label: 'Despesas',
            value: stats.expenses,
            icon: <TrendingDown size={24} className="text-red-600" />,
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            textColor: 'text-red-600',
            formatter: (v: number) => `- R$ ${v.toFixed(2)}`
        },
        {
            label: 'A Receber (Pendente)',
            value: stats.pending,
            icon: <Clock size={24} className="text-amber-600" />,
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            textColor: 'text-amber-600',
            formatter: (v: number) => `R$ ${v.toFixed(2)}`
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <BFCard key={i} padding="md" className="animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                        </div>
                    </BFCard>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
                <BFCard key={index} padding="md" variant="elevated">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {card.label}
                            </p>
                            <h3 className={`text-2xl font-bold ${card.textColor}`}>
                                {card.formatter(card.value)}
                            </h3>
                        </div>
                    </div>
                </BFCard>
            ))}
        </div>
    );
};
