import { useState } from 'react';
import { authAPI, tokenService } from '../lib/axios';

export const useAuth = () => {
    const [user, setUser] = useState(tokenService.getUser());

    const logout = async () => {
        await authAPI.logout();
    };

    const refreshUser = async () => {
        try {
            const userData = await authAPI.getMe();
            tokenService.setUser(userData);
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            return null;
        }
    };

    const updateUser = (newUserData: any) => {
        const updatedUser = { ...user, ...newUserData };
        tokenService.setUser(updatedUser);
        setUser(updatedUser);
    };

    return {
        user,
        logout,
        refreshUser,
        updateUser,
        isAuthenticated: authAPI.isAuthenticated(),
    };
};
