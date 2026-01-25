import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BFButton } from '../components/BF-Button';
import { BFIcons } from '../components/BF-Icons';
import { BFBadge } from '../components/BF-Badge';
import { bbqAPI } from '../lib/axios';
import { formatISODate } from '../lib/dateUtils';
import type { BBQResponseDto } from '../lib/types';
import { toast } from 'sonner';
import { BBQCreateModal } from '../components/BBQ-CreateModal';

interface ManageBBQProps {
    onSelectBBQ?: (id: string) => void;
}

export const ManageBBQ: React.FC<ManageBBQProps> = ({ onSelectBBQ }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bbqs, setBbqs] = useState<BBQResponseDto[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchBBQs();
    }, []);

    const fetchBBQs = async () => {
        try {
            setLoading(true);
            const response = await bbqAPI.getAllBBQs({ limit: 50 }); // Fetch more for the list
            setBbqs(response.bbqs || []);
        } catch (error: any) {
            console.error('Error fetching BBQs:', error);
            toast.error('Erro ao carregar lista de churrascos');
        } finally {
            setLoading(false);
        }
    };

    const handleBBQClick = (id: string) => {
        if (onSelectBBQ) {
            onSelectBBQ(id);
        } else {
            navigate(`/admin/bbq/${id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info', label: string }> = {
            'open': { variant: 'info', label: 'Aberto' },
            'closed': { variant: 'warning', label: 'Fechado' },
            'finished': { variant: 'success', label: 'Finalizado' },
            'cancelled': { variant: 'error', label: 'Cancelado' },
        };
        const config = statusMap[status] || { variant: 'info', label: status };
        return <BFBadge variant={config.variant} size="md">{config.label}</BFBadge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mb-4" />
                    <p className="text-[--muted-foreground]">Carregando churrascos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[--foreground]">Gerenciar Churrascos</h1>
                    <p className="text-[--muted-foreground]">Organize os eventos de churrasco da turma</p>
                </div>
                <BFButton
                    variant="primary"
                    icon={<BFIcons.Plus size={20} />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Novo Churrasco
                </BFButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bbqs.length > 0 ? (
                    bbqs.map((bbq) => (
                        <div
                            key={bbq.id}
                            onClick={() => handleBBQClick(bbq.id)}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-[var(--primary)]/10 p-3 rounded-lg text-[var(--primary)]">
                                        <BFIcons.Flame size={24} />
                                    </div>
                                    {getStatusBadge(bbq.status)}
                                </div>

                                <h3 className="text-lg font-bold text-[--foreground] mb-1">
                                    {formatISODate(bbq.date)}
                                </h3>

                                {bbq.description && (
                                    <p className="text-sm text-[--muted-foreground] line-clamp-2 mb-4">
                                        {bbq.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-[--muted-foreground] mt-4">
                                    <div className="flex items-center gap-1">
                                        <BFIcons.Users size={16} />
                                        <span>{bbq.participantCount} participantes</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--primary)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-[--muted-foreground]">
                        <BFIcons.AlertCircle size={48} className="mb-4 opacity-20" />
                        <p>Nenhum churrasco encontrado</p>
                    </div>
                )}
            </div>

            <BBQCreateModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={() => {
                    fetchBBQs();
                    setIsCreateModalOpen(false);
                }}
            />
        </div>
    );
};
