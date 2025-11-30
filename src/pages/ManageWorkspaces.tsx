import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BFListView, BFListViewColumn, BFListViewStat } from '../components/BFListView';
import { BFIcons } from '../components/BF-Icons';
import { BFBadge } from '../components/BF-Badge';
import { workspacesAPI } from '../lib/axios';
import type { Workspace } from '../lib/types';

interface WorkspacesResponse {
  workspaces: Workspace[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

interface ManageWorkspacesProps {
  onSelectWorkspace?: (workspaceId: string) => void;
}

export const ManageWorkspaces: React.FC<ManageWorkspacesProps> = ({ onSelectWorkspace }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  // Fetch workspaces
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response: WorkspacesResponse = await workspacesAPI.getAllWorkspaces();

      setData(response.workspaces || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setPage(response.page || 1);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [page, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = {
    total: total,
    active: data.filter(w => w.status === 'active').length,
    inactive: data.filter(w => w.status === 'inactive').length,
    totalChats: data.reduce((sum, w) => sum + (w.totalChats || 0), 0),
  };

  // Configure statistics cards
  const statsCards: BFListViewStat[] = [
    {
      label: 'Total',
      value: stats.total,
      icon: <BFIcons.Layers size={20} />,
      variant: 'elevated',
    },
    {
      label: 'Ativos',
      value: stats.active,
      icon: <BFIcons.CheckCircle size={20} />,
      variant: 'elevated',
    },
    {
      label: 'Inativos',
      value: stats.inactive,
      icon: <BFIcons.XCircle size={20} />,
      variant: 'elevated',
    },
    {
      label: 'Total de Chats',
      value: stats.totalChats,
      icon: <BFIcons.MessageSquare size={20} />,
      variant: 'elevated',
    },
  ];

  // Configure columns
  const columns: BFListViewColumn<Workspace>[] = [
    {
      key: 'name',
      label: 'Workspace',
      sortable: true,
      render: (_: any, row: Workspace) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <BFIcons.Layers size={20} color="white" />
          </div>
          <div>
            <p className="text-[--foreground] font-medium">{row.name}</p>
            <p className="text-[--muted-foreground] text-sm">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'platform',
      label: 'Plataforma',
      sortable: true,
      render: (value: string) => (
        <BFBadge variant="info">
          {value === 'whatsapp' ? 'WhatsApp' : value === 'telegram' ? 'Telegram' : 'Discord'}
        </BFBadge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <BFBadge variant={value === 'active' ? 'success' : value === 'maintenance' ? 'warning' : 'neutral'}>
          {value === 'active' ? 'Ativo' : value === 'maintenance' ? 'Manutenção' : 'Inativo'}
        </BFBadge>
      ),
    },
    {
      key: 'totalChats',
      label: 'Chats',
      sortable: true,
      render: (_: any, row: Workspace) => (
        <div className="text-center">
          <p className="text-[--foreground] font-medium">{row.totalChats}</p>
          <p className="text-[--muted-foreground] text-xs">{row.activeChats} ativos</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      sortable: true,
      render: (value: string) => (
        <span className="text-[--muted-foreground] text-sm">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
  ];

  return (
    <>
      <BFListView
        title="Workspaces"
        description="Gerencie os workspaces e suas configurações"
        createButton={{
          label: 'Criar Workspace',
          onClick: () => console.log('Create workspace'),
        }}
        stats={statsCards}
        searchPlaceholder="Buscar por nome ou slug..."
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
        statusFilter={{
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { value: 'all', label: 'Todos os Status' },
            { value: 'active', label: 'Ativo' },
            { value: 'inactive', label: 'Inativo' },
            { value: 'maintenance', label: 'Manutenção' },
          ],
        }}
        columns={columns}
        data={data}
        loading={loading}
        emptyState={{
          icon: <BFIcons.Layers size={48} className="text-[--muted-foreground]" />,
          message: 'Nenhum workspace encontrado',
          submessage: 'Crie um novo workspace para começar',
        }}
        onRowClick={(workspace) => {
          if (onSelectWorkspace) {
            onSelectWorkspace(workspace.id);
          } else {
            navigate(`/admin/workspaces/${workspace.id}`);
          }
        }}
        pagination={{
          page,
          totalPages,
          total,
          limit,
          onPageChange: setPage,
        }}
        dataTest="workspaces-list"
      />
    </>
  );
};

export default ManageWorkspaces;
