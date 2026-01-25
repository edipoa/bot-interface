import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BFCard } from '../BF-Card';

interface ChartData {
    date: string;
    income: number;
    expense: number;
}

interface FinancialChartsProps {
    data: ChartData[];
    loading?: boolean;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ data, loading }) => {
    if (loading) {
        return (
            <BFCard variant="elevated" padding="lg" className="mb-6 h-[300px] flex items-center justify-center">
                <div className="text-gray-400">Carregando gráfico...</div>
            </BFCard>
        );
    }

    if (data.length === 0) {
        return null;
    }

    const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

    return (
        <BFCard variant="elevated" padding="lg" className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Fluxo de Caixa (Últimos 30 dias)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `R$ ${val}`}
                        />
                        <Tooltip
                            formatter={(value: number) => [formatCurrency(value), '']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="income"
                            name="Receitas"
                            stackId="1"
                            stroke="#16A34A"
                            fill="#16A34A"
                            fillOpacity={0.2}
                        />
                        <Area
                            type="monotone"
                            dataKey="expense"
                            name="Despesas"
                            stackId="2"
                            stroke="#DC2626"
                            fill="#DC2626"
                            fillOpacity={0.2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </BFCard>
    );
};
