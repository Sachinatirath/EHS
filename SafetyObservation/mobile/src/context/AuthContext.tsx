import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEMO_USERS, USER_STORAGE_KEY } from '@/api/demoUsers';
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
      const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (employeeId: string, password: string, expectedRole?: 'agent' | 'hod') => {
    const match = DEMO_USERS.find((u) => u.employee_id === employeeId && u.password === password);
    if (!match) {
      throw new Error('Invalid employee ID or password.');
    }
    const { password: _password, ...record } = match;

    if (expectedRole && record.role !== expectedRole) {
      const actualLabel = ROLE_LABELS[record.role] ?? record.role;
      throw new Error(`This account is registered as ${actualLabel}. Select "${actualLabel}" above and sign in again.`);
    }

    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(record));
    setUser(record);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
