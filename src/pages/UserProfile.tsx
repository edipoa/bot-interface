import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BFCard } from '../components/BF-Card';
import { BFButton } from '../components/BF-Button';
import { BFInput } from '../components/BF-Input';
import { BFIcons } from '../components/BF-Icons';
import { playersAPI } from '../lib/axios';

export const UserProfile: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    isGoalkeeper: user?.isGoalkeeper || false,
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!user?.id) throw new Error('Usuário não identificado');

      const response = await playersAPI.updatePlayer(user.id, {
        name: formData.name,
        isGoalie: formData.isGoalkeeper
      });

      const updatedUserData = response.data || response;

      // Update local storage and context state immediately
      updateUser({
        ...user,
        name: updatedUserData.name || formData.name,
        isGoalkeeper: updatedUserData.isGoalkeeper ?? updatedUserData.isGoalie ?? formData.isGoalkeeper,
      });

      // Verify reliability by fetching fresh data from server
      await refreshUser();

      setSuccess('Perfil atualizado com sucesso!');

      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      isGoalkeeper: user?.isGoalkeeper || false,
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6" data-test="user-profile">
      {/* Header com saudação */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Olá, {user?.name || 'Usuário'}! 👋</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie suas informações pessoais
            </p>
          </div>

          {!isEditing && (
            <BFButton
              variant="primary"
              size="md"
              icon={<BFIcons.Edit size={16} />}
              onClick={() => setIsEditing(true)}
            >
              Editar Perfil
            </BFButton>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-1 mt-0.5">
              <BFIcons.CheckCircle size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-green-700 dark:text-green-400 font-semibold text-sm mb-1">Tudo certo!</h4>
              <p className="text-green-600 dark:text-green-300 text-sm">{success}</p>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <BFIcons.X size={16} />
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="bg-red-500 rounded-full p-1 mt-0.5">
              <BFIcons.AlertCircle size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-red-700 dark:text-red-400 font-semibold text-sm mb-1">Ops! Algo deu errado</h4>
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <BFIcons.X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <BFCard variant="elevated" padding="lg">
        <div className="space-y-8">
          {/* Seção: Informações Pessoais */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BFIcons.User size={20} className="text-[--primary]" />
              <h3 className="text-lg font-semibold text-[--foreground]">
                Informações Pessoais
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[--foreground] mb-2">
                  Nome Completo {isEditing && <span className="text-[--destructive]">*</span>}
                </label>
                {isEditing ? (
                  <div className="[&_input]:bg-white [&_input]:dark:bg-gray-800 [&_input]:text-gray-900 [&_input]:dark:text-white">
                    <BFInput
                      value={formData.name}
                      onChange={(value) => setFormData({ ...formData, name: value })}
                      placeholder="Digite seu nome completo"
                      disabled={loading}
                      fullWidth
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-[--accent]/50 rounded-lg border border-[--border]">
                    <p className="text-[--foreground] font-medium">{user?.name || 'Não informado'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[--foreground] mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <div className="px-4 py-3 bg-[--muted]/20 rounded-lg border border-[--border]/50 flex items-center gap-3">
                    <BFIcons.Phone size={16} className="text-[--muted-foreground]" />
                    <p className="text-[--foreground] flex-1">
                      {user?.phone
                        ? (() => {
                          const clean = user.phone.replace(/\D/g, '');
                          if (clean.length === 13) {
                            return clean.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4');
                          }
                          if (clean.length === 12) {
                            return clean.replace(/^(\d{2})(\d{2})(\d{4})(\d{4})$/, '+$1 ($2) $3-$4');
                          }
                          if (clean.length === 11) {
                            return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
                          }
                          if (clean.length === 10) {
                            return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
                          }
                          return user.phone;
                        })()
                        : 'Não informado'}
                    </p>
                    <BFIcons.Lock size={14} className="text-[--muted-foreground]" />
                  </div>
                </div>
                <p className="text-xs text-[--muted-foreground] mt-2 flex items-center gap-1.5">
                  <BFIcons.Info size={12} />
                  Telefone não pode ser alterado
                </p>
              </div>
            </div>
          </div>

          {/* Seção: Preferências de Jogo */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BFIcons.Target size={20} className="text-[--primary]" />
              <h3 className="text-lg font-semibold text-[--foreground]">
                Preferências de Jogo
              </h3>
            </div>

            <div className="space-y-4">
              <div className={`
                p-5 rounded-lg border transition-all duration-200
                ${isEditing
                  ? 'bg-[--accent]/30 border-[--border] hover:border-[--primary]/50 hover:shadow-sm'
                  : 'bg-[--muted]/10 border-[--border]/50'
                }
                ${!isEditing && 'opacity-75'}
              `}>
                <label className="flex items-start gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isGoalkeeper}
                    onChange={(e) => setFormData({ ...formData, isGoalkeeper: e.target.checked })}
                    disabled={!isEditing || loading}
                    className="w-5 h-5 mt-0.5 rounded border-[--border] text-[--primary] focus:ring-2 focus:ring-[--primary] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-medium text-[--foreground]">
                        Sou goleiro
                      </span>
                      <span className="text-xl">🧤</span>
                    </div>
                    <span className="text-sm text-[--muted-foreground]">
                      Marque esta opção se você prefere jogar como goleiro
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-[--border]">
              <BFButton
                variant="danger"
                size="md"
                onClick={handleCancel}
                disabled={loading}
                icon={<BFIcons.X size={16} />}
                className="sm:flex-1"
              >
                Cancelar
              </BFButton>
              <BFButton
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={loading || !formData.name.trim()}
                icon={loading ? undefined : <BFIcons.CheckCircle size={16} />}
                className="sm:flex-1"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </BFButton>
            </div>
          )}
        </div>
      </BFCard>
    </div>
  );
};

export default UserProfile;
