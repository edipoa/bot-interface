import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
    transactionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPaymentSuccess?: () => void;
    pixKey?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    transactionId: _transactionId,
    open,
    onOpenChange,
    onPaymentSuccess: _onPaymentSuccess,
    pixKey
}) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) {
            setCopied(false);
        }
    }, [open]);

    const handleCopy = () => {
        if (pixKey) {
            navigator.clipboard.writeText(pixKey);
            setCopied(true);
            toast.success('Chave Pix copiada!');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error('Chave Pix não configurada.');
        }
    };



    const handleManualConfirm = async () => {
        // Show instruction to user
        toast('🧾 Por favor, envie o comprovante para o administrador para confirmar o pagamento.', {
            duration: 6000,
            action: {
                label: 'Entendi',
                onClick: () => onOpenChange(false)
            }
        });
        // We do NOT call onPaymentSuccess() anymore to avoid confusing the user
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pagamento via Pix</DialogTitle>
                    <DialogDescription>
                        Use o "Copia e Cola" abaixo para pagar no seu banco.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="space-y-6">
                        {/* Copy Paste Code */}
                        {pixKey ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Chave Pix (Copia e Cola)
                                </label>
                                <div className="relative">
                                    <div className="p-3 pr-10 bg-muted/50 rounded-md font-mono text-xs break-all border overflow-y-auto max-h-24">
                                        {pixKey}
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={handleCopy}
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center pt-1">
                                    Após pagar, envie o comprovante para o administrador.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-yellow-50 text-yellow-800 rounded-md">
                                <p>Chave Pix não configurada neste grupo.</p>
                                <p className="text-sm mt-1">Entre em contato com o admin.</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fechar
                    </Button>
                    <Button
                        onClick={handleManualConfirm}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                        disabled={!pixKey}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Já Paguei - Enviar Comprovante
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
