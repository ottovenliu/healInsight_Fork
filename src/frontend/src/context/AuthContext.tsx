import React, { createContext, useContext, useState } from 'react';
import type { AuthUser, AuthContextType, OAuthProvider } from '../types/auth';
import { getStoredAuthUser, setStoredAuthUser, clearStoredAuthUser, DEMO_AUTH_USER } from '../utils/authStorage';
import { authApi } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());

  const login = async (provider: OAuthProvider, customInfo?: Partial<AuthUser>) => {
    try {
      const res = await authApi.login(provider, customInfo);
      if (res && res.data && res.data.user) {
        setUser(res.data.user);
        setStoredAuthUser(res.data.user);
        return;
      }
    } catch (err) {
      console.warn('API login failed, falling back to local session:', err);
    }

    // Fallback if backend is not reachable
    const fallbackUser: AuthUser = provider === 'demo'
      ? DEMO_AUTH_USER
      : {
          id: `usr_${provider}_${Date.now()}`,
          name: customInfo?.name || `${provider.toUpperCase()} 使用者`,
          email: customInfo?.email || `${provider}_user@healsight.health`,
          provider,
          avatar: customInfo?.avatar || '👤',
          token: `fallback-token-${provider}`
        };

    setUser(fallbackUser);
    setStoredAuthUser(fallbackUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('API logout error:', err);
    } finally {
      clearStoredAuthUser();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
