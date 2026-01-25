
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, tokenService } from '../lib/axios';

interface Workspace {
    id: string;
    name: string;
    role: string;
    settings?: any;
}

interface User {
    id: string;
    name: string;
    phone: string;
    role: string;
    status: string;
    workspaces?: Workspace[];
    isGoalkeeper?: boolean;
}

interface AuthContextData {
    user: User | null;
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    selectWorkspace: (workspaceId: string) => void;
    signIn: (phone: string, otp: string) => Promise<void>;
    signOut: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const storedUser = tokenService.getUser();
            // Try to load workspace from local storage
            const storedWorkspaceId = localStorage.getItem('workspaceId');

            if (storedUser) {
                // Initial optimistic load
                setUser(storedUser);
                if (storedUser.workspaces) {
                    setWorkspaces(storedUser.workspaces);
                    if (storedWorkspaceId) {
                        const found = storedUser.workspaces.find((w: Workspace) => w.id === storedWorkspaceId);
                        if (found) setCurrentWorkspace(found);
                    }
                }

                // Silent refresh to ensure data is fresh (and get workspaces if missing in storage)
                try {
                    const onlineUser = await authAPI.getMe();
                    setUser(onlineUser);
                    if (onlineUser.workspaces) {
                        setWorkspaces(onlineUser.workspaces);
                        if (storedWorkspaceId) {
                            const found = onlineUser.workspaces.find((w: Workspace) => w.id === storedWorkspaceId);
                            if (found) setCurrentWorkspace(found);
                        } else if (onlineUser.workspaces.length === 1) {
                            setCurrentWorkspace(onlineUser.workspaces[0]);
                        }
                    }
                } catch (e) {
                    console.warn('Background refresh failed, using stored data');
                }
            }
            setLoading(false);
        };

        init();
    }, []);

    const signIn = async (phone: string, otp: string) => {
        const response = await authAPI.verifyOTP(phone, otp);
        const userData = response.user || (response.data?.user);

        // Save user to state and localStorage (via tokenService inside verifyOTP probably handles token/user persistence, but we double ensure here)
        setUser(userData);
        if (userData.workspaces) {
            setWorkspaces(userData.workspaces);

            // Auto-select if only 1
            if (userData.workspaces.length === 1) {
                selectWorkspace(userData.workspaces[0].id);
                // Redirect will be handled by UI observing changes or explicitly here if passed navigate function
                // But usually better to let the Login page handle navigation based on state result
            } else if (userData.workspaces.length === 0) {
                // Logic for no workspace
                setCurrentWorkspace(null);
            } else {
                // Determine if we have a stored preference valid for this user
                const storedWorkspaceId = localStorage.getItem('workspaceId');
                const found = userData.workspaces.find((w: Workspace) => w.id === storedWorkspaceId);
                if (found) {
                    selectWorkspace(found.id);
                } else {
                    // No valid selection, clear current
                    setCurrentWorkspace(null);
                    localStorage.removeItem('workspaceId');
                }
            }
        } else {
            setWorkspaces([]);
            setCurrentWorkspace(null);
        }
    };

    const selectWorkspace = (workspaceId: string) => {
        const found = workspaces.find(w => w.id === workspaceId);
        if (found) {
            setCurrentWorkspace(found);
            localStorage.setItem('workspaceId', workspaceId);
        }
    };

    const refreshUser = async () => {
        try {
            setLoading(true);
            const userData = await authAPI.getMe();
            setUser(userData);
            if (userData.workspaces) {
                setWorkspaces(userData.workspaces);

                // Restore current workspace or default
                const storedId = localStorage.getItem('workspaceId');
                if (storedId) {
                    const found = userData.workspaces.find((w: Workspace) => w.id === storedId);
                    if (found) setCurrentWorkspace(found);
                } else if (!currentWorkspace && userData.workspaces.length > 0) {
                    // Auto select first if none selected
                    setCurrentWorkspace(userData.workspaces[0]);
                }
            }
            // Update local storage
            tokenService.setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        authAPI.logout();
        setUser(null);
        setCurrentWorkspace(null);
        setWorkspaces([]);
        localStorage.removeItem('workspaceId');
    };

    return (
        <AuthContext.Provider value={{
            user,
            workspaces,
            currentWorkspace,
            selectWorkspace,
            signIn,
            signOut,
            refreshUser,
            isAuthenticated: !!user,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
