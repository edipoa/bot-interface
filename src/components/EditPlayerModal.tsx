import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BFInput } from './BF-Input';
import { BFButton } from './BF-Button';
import type { Player } from '../lib/types';

const editPlayerSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato inválido: (99) 9999-9999 ou (99) 99999-9999'),
    nick: z.string().optional(),
    position: z.enum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'STRIKER']).optional(),
    status: z.enum(['active', 'inactive', 'suspended']),
    role: z.enum(['admin', 'user']).optional(),
});

type EditPlayerFormData = z.infer<typeof editPlayerSchema>;

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
    const [isSaving, setIsSaving] = useState(false);

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
        control
    } = useForm<EditPlayerFormData>({
        resolver: zodResolver(editPlayerSchema),
        defaultValues: {
            name: '',
            phone: '',
            nick: '',
            status: 'active',
            role: 'user',
        }
    });

    useEffect(() => {
        if (player) {
            reset({
                name: player.name || '',
                phone: formatPhoneDisplay(player.phone || ''),
                nick: player.nick || '',
                position: player.position as any,
                status: player.status || 'active',
                role: ((player.role as string)?.toLowerCase() === 'admin' ? 'admin' : 'user'),
            });
        }
    }, [player, reset]);

    const formatPhoneInput = (value: string) => {
        let digits = value.replace(/\D/g, '');
        if (digits.length > 11) digits = digits.slice(0, 11);

        if (digits.length <= 2) return digits;

        // If we have more than 10 digits, use 5-4 format (mobile)
        if (digits.length > 10) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        }

        // Otherwise use 4-4 format (landline/legacy)
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    };

    const formatPhoneDisplay = (phone: string) => {
        if (!phone) return '';
        const numbers = phone.replace(/\D/g, '');
        const localNumber = numbers.startsWith('55') ? numbers.slice(2) : numbers;

        if (localNumber.length === 11) {
            return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`;
        } else if (localNumber.length === 10) {
            return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 6)}-${localNumber.slice(6)}`;
        }
        return phone;
    };

    const onSubmit = async (data: EditPlayerFormData) => {
        if (!player) return;

        try {
            setIsSaving(true);
            await onSave({
                name: data.name,
                phone: data.phone,
                nick: data.nick,
                status: data.status,
                role: data.role,
            });
            onClose();
        } catch (error) {
            console.error('Error saving player:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Jogador</DialogTitle>
                    <DialogDescription>
                        Atualize as informações do jogador
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome *</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <BFInput
                                    placeholder="Nome completo"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={errors.name?.message}
                                    fullWidth
                                />
                            )}
                        />
                    </div>

                    {/* Telefone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefone (WhatsApp) *</label>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <BFInput
                                    placeholder="(99) 99999-9999"
                                    value={field.value || ''}
                                    onChange={(value) => {
                                        const formatted = formatPhoneInput(value);
                                        field.onChange(formatted);
                                    }}
                                    error={errors.phone?.message}
                                    fullWidth
                                />
                            )}
                        />
                    </div>

                    {/* Apelido */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Apelido</label>
                        <Controller
                            name="nick"
                            control={control}
                            render={({ field }) => (
                                <BFInput
                                    placeholder="Apelido (opcional)"
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    fullWidth
                                />
                            )}
                        />
                    </div>

                    {/* Posição */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Posição</label>
                        <Select
                            value={watch('position')}
                            onValueChange={(value: any) => setValue('position', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a posição" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="GOALKEEPER">Goleiro</SelectItem>
                                <SelectItem value="DEFENDER">Zagueiro</SelectItem>
                                <SelectItem value="MIDFIELDER">Meio-campo</SelectItem>
                                <SelectItem value="STRIKER">Atacante</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status *</label>
                        <Select
                            value={watch('status')}
                            onValueChange={(value: any) => setValue('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="inactive">Inativo</SelectItem>
                                <SelectItem value="suspended">Suspenso</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Permissão *</label>
                        <Select
                            value={watch('role')}
                            onValueChange={(value: any) => setValue('role', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a permissão" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Jogador</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Administradores têm acesso total ao painel deste grupo.
                        </p>
                    </div>

                    <DialogFooter>
                        <BFButton
                            type="button"
                            variant="danger"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </BFButton>
                        <BFButton type="submit" disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Salvar alterações'}
                        </BFButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
