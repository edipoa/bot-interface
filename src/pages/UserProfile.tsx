/**
 * User Profile Page
 * Página de perfil do usuário
 */

import React from 'react';
import { useAuth } from '../components/ProtectedRoute';
import { BFCard } from '../components/BF-Card';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6" data-test="user-profile">
      {/* Header */}
      <div>
        <h1 className="text-[--foreground] mb-2">Meu Perfil</h1>
        <p className="text-[--muted-foreground]">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Profile Info */}
      <BFCard variant="elevated" padding="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[--muted-foreground] mb-1">
              Nome
            </label>
            <p className="text-[--foreground]">{user?.name || 'Não informado'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[--muted-foreground] mb-1">
              Telefone
            </label>
            <p className="text-[--foreground]">{user?.phone || 'Não informado'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[--muted-foreground] mb-1">
              Role
            </label>
            <p className="text-[--foreground] capitalize">{user?.role || 'Não informado'}</p>
          </div>
        </div>
      </BFCard>

      {/* Em construção */}
      {/* <BFCard variant="elevated" padding="lg">
        <div className="text-center py-8">
          <p className="text-[var(--muted-foreground)]">
            Página de perfil em construção
          </p>
        </div>
      </BFCard> */}
    </div>
  );
};

export default UserProfile;
