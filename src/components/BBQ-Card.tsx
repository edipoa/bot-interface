import React from 'react';
import { BFCard } from './BF-Card';
import { BFBadge } from './BF-Badge';
import { BFIcons } from './BF-Icons';
import { formatEventDate } from '../lib/dateUtils';
import type { BBQ } from '../lib/types';

export interface BBQCardProps {
    bbq: BBQ;
    onClick?: () => void;
    'data-test'?: string;
}

export const BBQCard: React.FC<BBQCardProps> = ({
    bbq,
    onClick,
    'data-test': dataTest = 'bbq-card',
}) => {
    const getStatusBadge = (status: BBQ['status']) => {
        const statusMap = {
            open: { variant: 'info' as const, label: 'Aberto' },
            closed: { variant: 'warning' as const, label: 'Fechado' },
            finished: { variant: 'success' as const, label: 'Finalizado' },
            cancelled: { variant: 'error' as const, label: 'Cancelado' },
        };
        const config = statusMap[status];
        return <BFBadge variant={config.variant}>{config.label}</BFBadge>;
    };

    const isOpen = bbq.status === 'open';
    const isCancelled = bbq.status === 'cancelled';

    return (
        <BFCard
            variant="default"
            padding="md"
            hover={!!onClick}
            onClick={onClick}
            className={`
        transition-all duration-200
        ${isOpen ? 'border-l-4 border-l-[var(--badge-info-text)]' : ''}
        ${isCancelled ? 'opacity-50 grayscale' : ''}
      `}
            data-test={dataTest}
        >
            <div className="flex items-start justify-between gap-4">
                {/* Left Section: Icon and Date */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--badge-info-bg)] flex items-center justify-center flex-shrink-0">
                        <BFIcons.Flame size={24} color="var(--badge-info-text)" />
                    </div>
                    <div>
                        <p className="text-[--foreground] font-semibold text-lg">
                            {formatEventDate(bbq.date)}
                        </p>
                        <p className="text-[--muted-foreground] text-sm mt-1">
                            Churrasco
                        </p>
                    </div>
                </div>

                {/* Right Section: Status and Participants */}
                <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(bbq.status)}
                    <div className="flex items-center gap-2 text-[--muted-foreground]">
                        <BFIcons.Users size={16} />
                        <span className="text-sm">
                            {bbq.participants.length} {bbq.participants.length === 1 ? 'participante' : 'participantes'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Value per person - shown if set */}
            {bbq.valuePerPerson > 0 && (
                <div className="mt-4 pt-4 border-t border-[--border] flex items-center justify-between">
                    <span className="text-[--muted-foreground] text-sm">Valor por pessoa:</span>
                    <span className="text-[--foreground] font-medium">
                        R$ {(bbq.valuePerPerson / 100).toFixed(2).replace('.', ',')}
                    </span>
                </div>
            )}
        </BFCard>
    );
};
