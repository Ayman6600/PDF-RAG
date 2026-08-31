import React, { createContext, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();

  // Register Axios request interceptor dynamically to inject the current Clerk token
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          console.error('Error fetching Clerk token:', err);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    name: clerkUser.fullName || clerkUser.username || 'Clerk User',
    role: 'ADMIN', // Defaulting to ADMIN for feature access in front-end
    organizationId: 'default-org',
  } : null;

  const login = () => {
    console.warn('login() is a no-op with Clerk. Use Clerk sign-in components instead.');
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Failed to sign out from Clerk:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!isSignedIn,
        isLoading: !isLoaded,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

