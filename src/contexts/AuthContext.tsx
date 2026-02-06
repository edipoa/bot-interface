
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, tokenService, playersAPI } from '../lib/axios';

interface Workspace {
    id: string;
    name: string;
    slug: string;
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
    updateUser: (data: User) => void;
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
            const storedWorkspaceId = localStorage.getItem('workspaceId');

            if (storedUser) {
                setUser(storedUser);
                if (storedUser.workspaces) {
                    setWorkspaces(storedUser.workspaces);
                    if (storedWorkspaceId) {
                        const found = storedUser.workspaces.find((w: Workspace) => w.id === storedWorkspaceId);
                        if (found) setCurrentWorkspace(found);
                    }
                }

                try {
                    const basicUser = await authAPI.getMe();

                    const userId = basicUser.id || basicUser._id;
                    let fullUser = basicUser;

                    if (userId) {
                        try {
                            const playerDetails = await playersAPI.getPlayerById(userId);
                            fullUser = { ...basicUser, ...playerDetails };
                        } catch (err) {
                            console.warn('Init: Failed to fetch full details', err);
                        }
                    }

                    const mappedUser = {
                        ...fullUser,
                        isGoalkeeper: fullUser.isGoalkeeper ?? fullUser.isGoalie
                    };

                    setUser(mappedUser);
                    if (mappedUser.workspaces) {
                        setWorkspaces(mappedUser.workspaces);
                        if (storedWorkspaceId) {
                            const found = mappedUser.workspaces.find((w: Workspace) => w.id === storedWorkspaceId);
                            if (found) setCurrentWorkspace(found);
                        } else if (mappedUser.workspaces.length === 1) {
                            setCurrentWorkspace(mappedUser.workspaces[0]);
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

        const mappedUser = {
            ...userData,
            isGoalkeeper: userData.isGoalkeeper ?? userData.isGoalie
        };

        setUser(mappedUser);
        if (mappedUser.workspaces) {
            setWorkspaces(mappedUser.workspaces);

            if (mappedUser.workspaces.length === 1) {
                selectWorkspace(mappedUser.workspaces[0].id);
            } else if (mappedUser.workspaces.length === 0) {
                setCurrentWorkspace(null);
            } else {
                const storedWorkspaceId = localStorage.getItem('workspaceId');
                const found = mappedUser.workspaces.find((w: Workspace) => w.id === storedWorkspaceId);
                if (found) {
                    selectWorkspace(found.id);
                } else {
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
            const basicUser = await authAPI.getMe();

            // Fetch full profile to ensure we have all fields (like isGoalie which might be missing in /me)
            // Use _id or id depending on what's available
            const userId = basicUser.id || basicUser._id;
            let fullUser = basicUser;

            if (userId) {
                try {
                    const playerDetails = await playersAPI.getPlayerById(userId);
                    fullUser = { ...basicUser, ...playerDetails };
                } catch (err) {
                    console.warn('Failed to fetch full player details, using basic info', err);
                }
            }

            const mappedUser = {
                ...fullUser,
                isGoalkeeper: fullUser.isGoalkeeper ?? fullUser.isGoalie
            };

            setUser(mappedUser);
            if (mappedUser.workspaces) {
                setWorkspaces(mappedUser.workspaces);

                // Restore current workspace or default
                const storedId = localStorage.getItem('workspaceId');
                if (storedId) {
                    const found = mappedUser.workspaces.find((w: Workspace) => w.id === storedId);
                    if (found) setCurrentWorkspace(found);
                } else if (!currentWorkspace && mappedUser.workspaces.length > 0) {
                    // Auto select first if none selected
                    setCurrentWorkspace(mappedUser.workspaces[0]);
                }
            }
            // Update local storage
            tokenService.setUser(mappedUser);
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
            updateUser: (data: User) => {
                setUser(data);
                tokenService.setUser(data);
            },
            isAuthenticated: !!user,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
