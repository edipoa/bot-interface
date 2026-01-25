import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, ArrowRight } from 'lucide-react';

export const SelectWorkspace: React.FC = () => {
    const { workspaces, selectWorkspace, user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSelect = (workspaceId: string) => {
        selectWorkspace(workspaceId);

        const selectedWs = workspaces.find(w => w.id === workspaceId);
        const wsRole = (selectedWs?.role || '').toLowerCase();
        const isAdmin = wsRole === 'admin' || wsRole === 'owner' || user?.role === 'admin';

        if (isAdmin) {
            navigate('/admin/dashboard');
        } else {
            navigate('/user/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Escolha seu grupo</h1>
                    <p className="text-muted-foreground">
                        Selecione um dos grupos abaixo para acessar o painel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workspaces.map((ws) => (
                        <Card
                            key={ws.id}
                            className="cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all group relative overflow-hidden"
                            onClick={() => handleSelect(ws.id)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{ws.name}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardTitle>
                                <CardDescription className="capitalize">
                                    {ws.role === 'admin' ? 'Administrador' : 'Jogador'}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center pt-8">
                    <Button variant="ghost" className="text-muted-foreground" onClick={async () => {
                        await signOut();
                        navigate('/login');
                    }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair da conta
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SelectWorkspace;
