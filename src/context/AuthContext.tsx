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
    
    // Master Admin Login
    if (username === 'master' && password === 'master123') {
      const masterUser: AuthUser = { 
        id: 'master', 
        name: 'Master Admin', 
        username: 'master', 
        role: 'master', 
        email: 'master@system.com' 
      };
      setUser(masterUser);
      localStorage.setItem('hms_current_user', JSON.stringify(masterUser));
      return { success: true, message: 'Master login successful' };
    }
    
    // School Admin Login
    const school = data.schools.find((s: any) => 
      (s.admin_username === username || s.admin_email === username) && 
      s.admin_password === password && 
      s.status === 'Active'
    );
    
    if (school) {
      const schoolAdminUser: AuthUser = { 
        id: school.id, 
        name: school.admin_name, 
        username: school.admin_username, 
        role: 'admin', 
        email: school.admin_email,
        school_id: school.id,
        school_name: school.name
      };
      setUser(schoolAdminUser);
      localStorage.setItem('hms_current_user', JSON.stringify(schoolAdminUser));
      return { success: true, message: 'School admin login successful' };
    }
    
    // Warden Login (school-scoped)
    const currentSchoolId = localStorage.getItem('hms_current_school_id');
    if (currentSchoolId) {
      const schoolWardens = JSON.parse(localStorage.getItem(`hms_${currentSchoolId}_wardens`) || '[]');
      const warden = schoolWardens.find((w: any) => (w.username === username || w.email === username) && w.password === password);
      if (warden) {
        if (warden.status !== 'Active') return { success: false, message: 'Account is deactivated. Contact admin.' };
        const school = data.schools.find((s: any) => s.id === currentSchoolId);
        const wardenUser: AuthUser = { 
          id: warden.id, 
          name: warden.name, 
          username: warden.username, 
          role: 'warden', 
          assigned_house_id: warden.assigned_house_id, 
          email: warden.email,
          school_id: currentSchoolId,
          school_name: school?.name
        };
        setUser(wardenUser);
        localStorage.setItem('hms_current_user', JSON.stringify(wardenUser));
        return { success: true, message: 'Warden login successful' };
      }
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
