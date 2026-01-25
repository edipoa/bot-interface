import React from 'react';
import { BFIcons } from './BF-Icons';
import { BFButton } from './BF-Button';
import { MembershipStatus } from '../lib/types/membership';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { parseISO, isAfter, startOfDay } from 'date-fns';

interface GameProps {
    id: string;
    name: string;
    date: string; // Should be YYYY-MM-DD or ISO string for comparison
    formattedDate: string;
    time: string;
    pricePerPlayer: number;
    currentPlayers: number;
    maxPlayers: number;
    membershipStatus: MembershipStatus;
    isJoined?: boolean;
    onJoin?: (gameId: string) => void;
    onLeave?: (gameId: string) => void;
    isLoading?: boolean;
}

export const GameCard: React.FC<GameProps> = ({
    id,
    name,
    date,
    formattedDate,
    time,
    pricePerPlayer,
    currentPlayers,
    maxPlayers,
    membershipStatus,
    onJoin,
    onLeave,
    isJoined = false,
    isLoading
}) => {
    const isMember = membershipStatus === 'ACTIVE';

    // Date Logic: Compare only dates (ignoring time)
    // Assuming 'date' is YYYY-MM-DD. 
    const gameDate = parseISO(date.split('T')[0]); // Ensure we get the date part
    const today = startOfDay(new Date());

    // Future game means date > today
    // If date is today, everyone can join.
    const isFutureGame = isAfter(gameDate, today);

    const isLocked = isFutureGame && !isMember;

    // Formatting Price
    const priceDisplay = isMember
        ? "Mensalista: Grátis"
        : `Avulso: R$ ${(pricePerPlayer / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="p-3 sm:p-4 bg-card text-card-foreground rounded-lg border border-input shadow-sm" data-test={`game-card-${id}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-[--primary]/10 p-2 rounded-lg flex-shrink-0">
                    <BFIcons.Trophy size={20} color="var(--primary)" className="sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base text-[--foreground] font-medium truncate">{name}</h4>
                    <p className="text-xs sm:text-sm text-[--muted-foreground]">
                        {formattedDate} às {time}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
                <div>
                    <p className="text-[--muted-foreground]">Valor</p>
                    <p className="text-[--foreground] font-medium">{priceDisplay}</p>
                </div>
                <div>
                    <p className="text-[--muted-foreground]">Jogadores</p>
                    <p className="text-[--foreground] font-medium">{currentPlayers}/{maxPlayers}</p>
                </div>
            </div>

            <div className="mt-2">
                {isJoined ? (
                    <BFButton
                        onClick={() => onLeave && onLeave(id)}
                        variant="danger"
                        className="w-full cursor-pointer"
                        disabled={isLoading}
                    >
                        Sair da Lista
                    </BFButton>
                ) : isLocked ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="w-full block">
                                <BFButton
                                    disabled={true}
                                    variant="secondary"
                                    className="w-full opacity-50 cursor-not-allowed"
                                    icon={<BFIcons.Lock size={16} />}
                                >
                                    Entrar na Lista
                                </BFButton>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Exclusivo para Mensalistas. Lista aberta para todos no dia do jogo.</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <BFButton
                        onClick={() => onJoin && onJoin(id)}
                        variant="primary"
                        className="w-full cursor-pointer"
                        disabled={isLoading}
                    >
                        Entrar na Lista
                    </BFButton>
                )}
            </div>
        </div>
    );
};
