import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BBQCard } from '../components/BBQ-Card';
import { BBQCreateModal } from '../components/BBQ-CreateModal';
import { BFButton } from '../components/BF-Button';
import { BFIcons } from '../components/BF-Icons';

import { bbqAPI } from '../lib/axios';
import { toast } from 'sonner';

export const BBQDemo: React.FC = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [bbqs, setBbqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        open: 0,
        closed: 0,
        finished: 0,
        cancelled: 0,
    });

    useEffect(() => {
        fetchBBQs();
        fetchStats();
    }, []);

    const fetchBBQs = async () => {
        try {
            setLoading(true);
            const response = await bbqAPI.getAllBBQs({ page: 1, limit: 100 });

            // The API returns: { success: true, data: { bbqs: [...], total, page, totalPages, limit } }
            let bbqData: any[] = [];

            if (response.data?.bbqs) {
                // Paginated response format
                bbqData = response.data.bbqs;
            } else if (Array.isArray(response.data)) {
                // Direct array in data
                bbqData = response.data;
            } else if (Array.isArray(response)) {
                // Direct array response
                bbqData = response;
            }

            setBbqs(bbqData);
        } catch (error: any) {
            console.error('Error fetching BBQs:', error);
            toast.error(error.response?.data?.message || 'Erro ao carregar churrascos');
            setBbqs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await bbqAPI.getStats();
            setStats(response);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[--foreground]">
                        Gerenciar Churrascos
                    </h1>
                    <p className="text-[--muted-foreground] mt-2">
                        Crie e gerencie eventos de churrasco
                    </p>
                </div>
                <BFButton
                    variant="primary"
                    icon={<BFIcons.Plus size={20} />}
                    onClick={() => setIsCreateModalOpen(true)}
                    data-test="create-bbq-button"
                >
                    Novo Churrasco
                </BFButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[var(--badge-info-bg)] border border-[var(--badge-info-border)] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <BFIcons.Calendar size={24} color="var(--badge-info-text)" />
                        <div>
                            <p className="text-[var(--badge-info-text)] text-2xl font-bold">
                                {stats.open || 0}
                            </p>
                            <p className="text-[var(--badge-info-text)] text-sm">Abertos</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--badge-warning-bg)] border border-[var(--badge-warning-border)] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <BFIcons.Clock size={24} color="var(--badge-warning-text)" />
                        <div>
                            <p className="text-[var(--badge-warning-text)] text-2xl font-bold">
                                {stats.closed || 0}
                            </p>
                            <p className="text-[var(--badge-warning-text)] text-sm">Fechados</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--badge-success-bg)] border border-[var(--badge-success-border)] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <BFIcons.CheckCircle size={24} color="var(--badge-success-text)" />
                        <div>
                            <p className="text-[var(--badge-success-text)] text-2xl font-bold">
                                {stats.finished || 0}
                            </p>
                            <p className="text-[var(--badge-success-text)] text-sm">Finalizados</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--badge-error-bg)] border border-[var(--badge-error-border)] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <BFIcons.XCircle size={24} color="var(--badge-error-text)" />
                        <div>
                            <p className="text-[var(--badge-error-text)] text-2xl font-bold">
                                {stats.cancelled || 0}
                            </p>
                            <p className="text-[var(--badge-error-text)] text-sm">Cancelados</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BBQ List */}
            {bbqs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bbqs.map(bbq => (
                        <BBQCard
                            key={bbq.id || bbq._id}
                            bbq={bbq}
                            onClick={() => navigate(`/admin/bbq/${bbq.id || bbq._id}`)}
                            data-test={`bbq-card-${bbq.id || bbq._id}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                    <BFIcons.UtensilsCrossed size={64} className="mx-auto text-[--muted-foreground] mb-4" />
                    <p className="text-[--muted-foreground] text-lg mb-2">
                        Nenhum churrasco cadastrado ainda
                    </p>
                    <p className="text-[--muted-foreground] text-sm mb-4">
                        Crie seu primeiro evento de churrasco
                    </p>
                    <BFButton
                        variant="primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Criar Primeiro Churrasco
                    </BFButton>
                </div>
            )}

            {/* Create Modal */}
            <BBQCreateModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={() => {
                    fetchBBQs();
                    fetchStats();
                    setIsCreateModalOpen(false);
                }}
            />
        </div>
    );
};
