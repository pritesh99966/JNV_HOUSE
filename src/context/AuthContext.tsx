import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';
import { getInitialData } from '../data/seedData';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hms_current_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (username: string, password: string) => {
    const data = getInitialData();
    if (username === 'admin' && password === 'admin123') {
      const adminUser: AuthUser = { id: 'admin', name: 'Super Admin', username: 'admin', role: 'admin' as UserRole, email: 'admin@school.com' };
      setUser(adminUser);
      localStorage.setItem('hms_current_user', JSON.stringify(adminUser));
      return { success: true, message: 'Login successful' };
    }
    const warden = data.wardens.find((w: { username: string; email: string; password: string }) => (w.username === username || w.email === username) && w.password === password);
    if (warden) {
      if (warden.status !== 'Active') return { success: false, message: 'Account is deactivated. Contact admin.' };
      const wardenUser: AuthUser = { id: warden.id, name: warden.name, username: warden.username, role: 'warden' as UserRole, assigned_house_id: warden.assigned_house_id, email: warden.email };
      setUser(wardenUser);
      localStorage.setItem('hms_current_user', JSON.stringify(wardenUser));
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => { setUser(null); localStorage.removeItem('hms_current_user'); };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
