import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    const context = useAuthContext();
    return {
        ...context,
        // Maintain compatibility if needed, or just expose full context
        refreshUser: async () => { /* TODO: Implement refresh in context if needed */ },
        updateUser: (_data: any) => { /* TODO: Implement update in context if needed */ }
    };
};
