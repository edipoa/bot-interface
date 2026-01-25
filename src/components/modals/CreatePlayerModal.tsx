import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '../ui/dialog';
import { BFButton } from '../BF-Button';
import { BFInput } from '../BF-Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { playersAPI } from '../../lib/axios';

const playerSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato inválido: (99) 99999-9999'),
    position: z.enum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'STRIKER']).optional(),
    nick: z.string().optional(),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface CreatePlayerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    onSuccess?: () => void;
}

export const CreatePlayerModal: React.FC<CreatePlayerModalProps> = ({
    open,
    onOpenChange,
    workspaceId,
    onSuccess
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
        control
    } = useForm<PlayerFormData>({
        resolver: zodResolver(playerSchema),
        defaultValues: {}
    });

    const formatPhoneInput = (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 2) return digits;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    };

    const onSubmit = async (data: PlayerFormData) => {
        try {
            setIsSubmitting(true);

            // Remove formatting from phone
            const phoneDigits = data.phone.replace(/\D/g, '');

            await playersAPI.createPlayer({
                name: data.name,
                phoneE164: phoneDigits,
                position: data.position,
                type: 'AVULSO', // Default to AVULSO
                nick: data.nick,
                workspaceId
            });

            toast.success('Jogador criado com sucesso!');
            reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao criar jogador';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Jogador</DialogTitle>
                    <DialogDescription>
                        Cadastre um novo jogador no workspace
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

                    <DialogFooter>
                        <BFButton
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </BFButton>
                        <BFButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Criando...' : 'Criar Jogador'}
                        </BFButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
