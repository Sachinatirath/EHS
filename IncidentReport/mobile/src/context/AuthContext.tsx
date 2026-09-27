import React, { createContext, useContext, useState } from 'react';

import { setCurrentRole, getCurrentUser, updateCurrentUser } from '@/api/mockStore';
import type { Role, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  setRole: (role: Role) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * There is no login screen or backend in this build — the two sidebar
 * dropdowns (Agent UI / HOD Dashboard) just pick which fixed dummy person's
 * data is shown. Selecting a role is instant and can't fail.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const setRole = (role: Role) => {
    setCurrentRole(role);
    setUser(getCurrentUser());
  };

  const logout = () => {
    setCurrentRole(null);
    setUser(null);
  };

  const updateUser = (patch: User) => {
    setUser(updateCurrentUser(patch));
  };

  return (
    <AuthContext.Provider value={{ user, setRole, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
