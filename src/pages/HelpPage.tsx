
import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Copy, Check, Info, Command } from 'lucide-react';
import { toast } from 'sonner';

interface BotCommand {
    name: string;
    description: string;
    category: string;
    usage: string;
}

const CATEGORIES = {
    Geral: { color: 'bg-blue-100 text-blue-800', icon: Info },
    Financeiro: { color: 'bg-green-100 text-green-800', icon: Command },
    Admin: { color: 'bg-purple-100 text-purple-800', icon: Command },
    Churras: { color: 'bg-orange-100 text-orange-800', icon: Command },
};

export const HelpPage = () => {
    const [commands, setCommands] = useState<BotCommand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

    const fetchCommands = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await api.get('/public/commands');
            setCommands(response.data);
        } catch (err) {
            console.error('Error fetching commands:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommands();
    }, []);

    const handleCopy = (text: string | null | undefined) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedCommand(text);
        toast.success('Comando copiado!');
        setTimeout(() => setCopiedCommand(null), 2000);
    };

    const filteredCommands = commands.filter((cmd) => {
        const name = cmd.name || '';
        const description = cmd.description || '';
        const usage = cmd.usage || '';
        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usage.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === 'all' || cmd.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        const category = cmd.category || 'Outros';
        if (!acc[category]) acc[category] = [];
        acc[category].push(cmd);
        return acc;
    }, {} as Record<string, BotCommand[]>);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar comandos</h1>
                <Button onClick={fetchCommands}>Tentar Novamente</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Comandos do Bot
                    </h1>
                    <p className="text-lg text-gray-600">
                        Encontre rapidamente o comando que você precisa.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sticky top-4 z-10 bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar comandos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-white">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {Object.keys(CATEGORIES).map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedCommands).map(([category, cmds]) => {
                            const CategoryIcon = CATEGORIES[category as keyof typeof CATEGORIES]?.icon || Command;
                            const categoryColor = CATEGORIES[category as keyof typeof CATEGORIES]?.color || 'bg-gray-100 text-gray-800';

                            return (
                                <div key={category} className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                                        <div className={`p-2 rounded-lg ${categoryColor}`}>
                                            <CategoryIcon className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {cmds.length}
                                        </span>
                                    </div>

                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {cmds.map((cmd) => (
                                            <Card
                                                key={cmd.name}
                                                className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white"
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <CardTitle className="text-lg font-mono text-primary break-all">
                                                            {cmd.name}
                                                        </CardTitle>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 -mt-1 -mr-2 text-gray-400 hover:text-primary transition-colors"
                                                            onClick={() => handleCopy(cmd.usage || cmd.name)}
                                                        >
                                                            {copiedCommand === (cmd.usage || cmd.name) ? (
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {cmd.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div
                                                        className="bg-slate-50 p-3 rounded-md font-mono text-xs text-slate-600 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors relative group/code"
                                                        onClick={() => handleCopy(cmd.usage)}
                                                    >
                                                        <span className="select-all">{cmd.usage}</span>
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/code:opacity-100 transition-opacity text-[10px] text-primary font-sans font-medium">Click to copy</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredCommands.length === 0 && (
                            <div className="text-center py-12">
                                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Nenhum comando encontrado</h3>
                                <p className="text-gray-500">Tente buscar por outro termo ou categoria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
