import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BFInput } from './BF-Input';
import { BFButton } from './BF-Button';
import type { Player } from '../lib/types';

interface EditPlayerModalProps {
    player: Player | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedPlayer: Partial<Player>) => Promise<void>;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
    player,
    isOpen,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        nick: '',
        phone: '',
        status: 'active' as 'active' | 'inactive' | 'suspended',
        isGoalie: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (player) {
            setFormData({
                name: player.name || '',
                nick: player.nick || '',
                phone: player.phone || '',
                status: player.status || 'active',
                isGoalie: player.isGoalie || false,
            });
        }
    }, [player]);

    const handleSave = async () => {
        if (!player) return;

        try {
            setIsSaving(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving player:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar Jogador</DialogTitle>
                    <DialogDescription>
                        Atualize as informações do jogador
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <BFInput
                            className="w-full"
                            value={formData.name}
                            onChange={(value) => setFormData({ ...formData, name: value })}
                            placeholder="Nome completo"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Apelido</label>
                        <BFInput
                            className="w-full"
                            value={formData.nick}
                            onChange={(value) => setFormData({ ...formData, nick: value })}
                            placeholder="Apelido"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefone</label>
                        <BFInput
                            className="w-full"
                            value={formData.phone}
                            onChange={(value) => setFormData({ ...formData, phone: value })}
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="inactive">Inativo</SelectItem>
                                <SelectItem value="suspended">Suspenso</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.isGoalie}
                                onChange={(e) => setFormData({ ...formData, isGoalie: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-medium">É goleiro</span>
                                <p className="text-xs text-muted-foreground">Marque se o jogador atua como goleiro</p>
                            </div>
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <BFButton
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancelar
                    </BFButton>
                    <BFButton
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Salvando...' : 'Salvar alterações'}
                    </BFButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
