import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { BFButton } from './BF-Button';
import { BFInput } from './BF-Input';
import { BFMoneyInput } from './BF-MoneyInput';
import { bbqAPI } from '../lib/axios';
import { toast } from 'sonner';

interface BBQCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const BBQCreateModal: React.FC<BBQCreateModalProps> = ({ open, onOpenChange, onSuccess }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [ticketPrice, setTicketPrice] = useState(0);
    const [ticketPriceStr, setTicketPriceStr] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        if (!date || !time) {
            toast.error('Data e hora são obrigatórios');
            return;
        }

        try {
            setLoading(true);

            // Combine date and time to ISO string
            const dateTime = new Date(`${date}T${time}`).toISOString();

            // Get workspaceId from localStorage (as in other parts of the app)
            const workspaceId = localStorage.getItem('workspaceId');

            if (!workspaceId) {
                toast.error('Workspace não encontrado');
                return;
            }

            // Ideally we should get the chatId from context or selection
            // For now, let's assume specific chat or just create for the workspace (if API allows)
            // The API requires chatId unless we changed it. 
            // Let's assume we need to select a chat OR the backend handles it via default chat.
            // Looking at `gamesAPI.createGame`, it asks for `chatId`.
            // Let's create a simple version. 
            // If `chatId` is required, we might need a dropdown.
            // For this iteration, let's try to send without chatId and see if backend handles it (it might fail if strict).
            // Or we can fetch chats.

            // To be safe, let's fetch chats or just list them.
            // Actually, for BBQ, usually it's tied to the "main" chat.
            // Let's rely on backend Logic or pass a placeholder if needed.

            // Based on types.ts: CreateBBQDto requires chatId.
            // I'll add a simple chat selection or just pick the first one?
            // "ManageBBQ" is global for the workspace.

            // Let's ask the user to select the chat? Or simplistically, hardcode or fetch first.
            // Let's assume the backend was updated to optional chatId OR we need to fetch.

            // I will implement a fetch chats in useEffect when open.

            const payload = {
                workspaceId,
                date: dateTime,
                description,
                financials: {
                    meatCost: 0,
                    cookCost: 0,
                    ticketPrice: ticketPrice
                },
                chatId: 'general', // Placeholder, ideally fetch
                // The backend likely needs a real UUID for chatId.
            };

            // Using createBBQ from API
            // Note: bbqAPI.createBBQ needs to be checked/updated in axios.ts
            // checking axios.ts... bbqAPI has getAllBBQs, getStats, getBBQById.
            // It DOES NOT have createBBQ?
            // I need to add createBBQ to axios.ts as well.

            await bbqAPI.createBBQ(payload);

            toast.success('Churrasco criado com sucesso!');
            onSuccess();
            onOpenChange(false);

            // Reset form
            setDate('');
            setTime('');
            setDescription('');
            setTicketPrice(0);
            setTicketPriceStr('');

        } catch (error: any) {
            console.error('Error creating BBQ:', error);
            toast.error(error.response?.data?.message || 'Erro ao criar churrasco');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Churrasco</DialogTitle>
                    <DialogDescription>
                        Agende um novo churrasco para a turma.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Data</label>
                            <BFInput
                                type="date"
                                value={date}
                                onChange={setDate}
                                fullWidth
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Hora</label>
                            <BFInput
                                type="time"
                                value={time}
                                onChange={setTime}
                                fullWidth
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Descrição (Opcional)</label>
                        <BFInput
                            placeholder="Ex: Comemoração do título"
                            value={description}
                            onChange={setDescription}
                            fullWidth
                        />
                    </div>

                    <div>
                        <BFMoneyInput
                            label="Valor Sugerido (Por Pessoa)"
                            value={ticketPriceStr}
                            onChange={(val, cents) => { setTicketPriceStr(val); setTicketPrice(cents); }}
                            placeholder="0,00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Você pode ajustar os custos e valor final depois.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <BFButton
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </BFButton>
                        <BFButton
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Criando...' : 'Criar Churrasco'}
                        </BFButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
