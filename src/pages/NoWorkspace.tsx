import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Ghost } from 'lucide-react';

const NoWorkspace: React.FC = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center space-y-8">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                        <Ghost className="h-12 w-12 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Você ainda não faz parte de nenhum grupo</h1>
                    <p className="text-muted-foreground">
                        Entre em contato com o administrador do seu grupo ou utilize o Bot no WhatsApp para se vincular.
                    </p>
                </div>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                        await signOut();
                        navigate('/login');
                    }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da conta
                </Button>
            </div>
        </div>
    );
};

export default NoWorkspace;
