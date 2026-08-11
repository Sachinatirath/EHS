import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authApi } from '@/api';
import { TOKEN_STORAGE_KEY } from '@/api/client';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (employeeId: string, password: string, expectedRole?: 'agent' | 'hod') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const ROLE_LABELS: Record<string, string> = {
  agent: 'Safety Agent',
  hod: 'HOD',
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        try {
          const me = await authApi.fetchMe();
          setUser(me);
        } catch {
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (employeeId: string, password: string, expectedRole?: 'agent' | 'hod') => {
    const res = await authApi.login(employeeId, password);
    if (expectedRole && res.user.role !== expectedRole) {
      const actualLabel = ROLE_LABELS[res.user.role] ?? res.user.role;
      if (res.user.role !== 'agent' && res.user.role !== 'hod') {
        throw new Error(`This account (${actualLabel}) isn't a Safety Agent or HOD account, so this app has nothing to show for it.`);
      }
      throw new Error(`This account is registered as ${actualLabel}. Select "${actualLabel}" above and sign in again.`);
    }
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
    setUser(res.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
