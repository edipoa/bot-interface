
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  CheckCircle
} from 'lucide-react';

import { BFButton } from '../components/BF-Button';
import { BFCard } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { BFInput } from '../components/BF-Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { chatsAPI } from '../lib/axios';
import type { Chat } from '../lib/types';

import { Switch } from '../components/ui/switch';

export const ManageChats: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);

  // Bind Modal State
  const [showBindModal, setShowBindModal] = useState(false);
  const [bindCode, setBindCode] = useState('');
  const [chatName, setChatName] = useState('');
  const [chatIdInput, setChatIdInput] = useState(''); // Fallback manual ID
  const [binding, setBinding] = useState(false);

  useEffect(() => {
    const wsId = localStorage.getItem('workspaceId');
    if (wsId) {
      setCurrentWorkspaceId(wsId);
      fetchChats(wsId);
    } else {
      setLoading(false);
      toast.error('Nenhum workspace selecionado');
    }
  }, []);

  const fetchChats = async (workspaceId: string) => {
    try {
      setLoading(true);
      const data = await chatsAPI.getChatsByWorkspace(workspaceId);
      // Ensure compatibility if API returns object with data property or array directly
      const list = Array.isArray(data) ? data : (data.chats || []);
      setChats(list);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar chats');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (chat: Chat) => {
    const newStatus = chat.status === 'active' ? 'inactive' : 'active';
    try {
      // Optimistic update
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, status: newStatus } : c));

      if (newStatus === 'active') {
        await chatsAPI.activateChat(chat.id);
        toast.success('Chat ativado com sucesso');
      } else {
        await chatsAPI.deactivateChat(chat.id);
        toast.success('Chat desativado com sucesso');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao alterar status do chat');
      // Revert optimistic update
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, status: chat.status } : c));
    }
  };

  const handleBindChat = async () => {
    if (!chatName) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }
    if (!bindCode && !chatIdInput) {
      toast.error('Código ou ID do chat é obrigatório');
      return;
    }

    try {
      setBinding(true);
      await chatsAPI.bindChat({
        workspaceId: currentWorkspaceId!,
        name: chatName,
        // If code is provided, backend handles !bind logic, else use manual chatId
        code: bindCode,
        chatId: chatIdInput || undefined
      });

      toast.success('Grupo vinculado com sucesso!');
      setShowBindModal(false);
      setBindCode('');
      setChatName('');
      setChatIdInput('');
      if (currentWorkspaceId) fetchChats(currentWorkspaceId);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao vincular grupo');
    } finally {
      setBinding(false);
    }
  };

  const handleConfigureChat = (chatId: string) => {
    navigate(`/admin/chats/${chatId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Chats</h1>
          <p className="text-muted-foreground">Grupos de WhatsApp vinculados a este workspace</p>
        </div>
        <BFButton
          onClick={() => setShowBindModal(true)}
          icon={<Plus size={16} />}
        >
          Vincular Novo Grupo
        </BFButton>
      </div>

      {chats.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhum grupo vinculado</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
            Para começar, use o comando <code>!bind</code> no grupo do WhatsApp ou adicione manualmente.
          </p>
          <BFButton variant="outline" onClick={() => setShowBindModal(true)}>
            Vincular Agora
          </BFButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.map((chat) => (
            <BFCard key={chat.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={chat.status === 'active'}
                      onCheckedChange={() => handleToggleStatus(chat)}
                    />
                    <BFBadge variant={chat.status === 'active' ? 'success' : 'neutral'}>
                      {chat.status === 'active' ? 'Ativo' : 'Inativo'}
                    </BFBadge>
                  </div>
                </div>

                <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1" title={chat.name || chat.label}>
                  {chat.name || chat.label || 'Chat sem nome'}
                </h3>
                <p className="text-xs text-muted-foreground font-mono mb-4 truncate" title={chat.chatId}>
                  {chat.chatId}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle size={14} className="mr-2 text-green-500" />
                    Bot Conectado
                  </div>
                  {/* Add more stats here if available */}
                </div>
              </div>

              <div className="p-4 bg-muted/30 border-t border-border mt-auto flex justify-end gap-2">
                <BFButton
                  size="sm"
                  variant="secondary"
                  icon={<Settings size={14} />}
                  onClick={() => handleConfigureChat(chat.id)}
                >
                  Configurar
                </BFButton>
              </div>
            </BFCard>
          ))}
        </div>
      )}

      {/* Bind Modal */}
      <Dialog open={showBindModal} onOpenChange={setShowBindModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Novo Grupo</DialogTitle>
            <DialogDescription>
              Use o comando <code>!bind</code> no WhatsApp para gerar um código ou insira o ID manualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <BFInput
              label="Nome do Grupo (Interno)"
              placeholder="Ex: Futebol de Terça"
              value={chatName}
              onChange={setChatName}
              fullWidth
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Opção 1: Código</span>
              </div>
            </div>

            <BFInput
              label="Código de Vinculação"
              placeholder="Ex: 123456"
              value={bindCode}
              onChange={setBindCode}
              fullWidth
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Opção 2: ID Manual</span>
              </div>
            </div>

            <BFInput
              label="ID do Chat (Manual)"
              placeholder="Ex: 5511999999999@g.us"
              value={chatIdInput}
              onChange={setChatIdInput}
              helperText="Apenas se não tiver o código"
              fullWidth
            />
          </div>

          <DialogFooter>
            <BFButton variant="ghost" onClick={() => setShowBindModal(false)}>Cancelar</BFButton>
            <BFButton
              onClick={handleBindChat}
              disabled={binding}
              loading={binding}
            >
              Vincular
            </BFButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageChats;
