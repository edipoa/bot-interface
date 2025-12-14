import React, { useEffect, useState } from 'react';
import { BFButton } from './BF-Button';
import { BFCard } from './BF-Card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
            <BFCard variant="elevated" padding="md">
                <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                        <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                            Instalar App
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Adicione o Faz o Simples à sua tela inicial para acesso rápido
                        </p>
                        <div className="flex gap-2">
                            <BFButton
                                variant="primary"
                                size="sm"
                                onClick={handleInstall}
                                className="flex-1"
                            >
                                Instalar
                            </BFButton>
                            <BFButton
                                variant="outline"
                                size="sm"
                                onClick={handleDismiss}
                                icon={<X className="w-4 h-4" />}
                            >
                                Agora não
                            </BFButton>
                        </div>
                    </div>
                </div>
            </BFCard>
        </div>
    );
};
