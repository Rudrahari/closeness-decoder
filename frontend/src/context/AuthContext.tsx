import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { signInWithGoogle, signUpWithGoogle, getCurrentUser, logout as apiLogout } from '../api/auth';
import type { UserDto } from '../api/auth';

interface AuthContextType {
    user: UserDto | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (credential: string) => Promise<void>;
    signUp: (credential: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Validate token and load user on app start
    const validateAndLoadUser = useCallback(async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // Validate token by calling /me endpoint
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            // Update stored user data with fresh data from server
            localStorage.setItem('user', JSON.stringify(currentUser));
        } catch {
            // Token is invalid or expired - clear auth state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        validateAndLoadUser();
    }, [validateAndLoadUser]);

    const signIn = async (credential: string) => {
        try {
            setIsLoading(true);
            const response = await signInWithGoogle(credential);

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (credential: string) => {
        try {
            setIsLoading(true);
            const response = await signUpWithGoogle(credential);

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } finally {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                signIn,
                signUp,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
