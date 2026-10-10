import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';
import { getInitialData } from '../data/seedData';
import { generateSessionToken, getSessionExpiry, isSessionValid, loginRateLimiter, logSecurityEvent } from '../utils/security';
import { createAuditLog, AUDIT_ACTIONS, RESOURCE_TYPES } from '../utils/audit';

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
    
    // Rate limiting check
    const clientKey = username; // In production, use IP + username
    if (loginRateLimiter.isBlocked(clientKey)) {
      logSecurityEvent('LOGIN_RATE_LIMITED', { username, reason: 'Too many attempts' });
      return { 
        success: false, 
        message: 'Too many login attempts. Please try again after 15 minutes.' 
      };
    }
    
    // Master Admin Login
    if (username === 'master' && password === 'master123') {
      const sessionToken = generateSessionToken();
      const sessionExpiry = getSessionExpiry();
      
      const masterUser: AuthUser = { 
        id: 'master', 
        name: 'Master Admin', 
        username: 'master', 
        role: 'master', 
        email: 'master@system.com',
        session_token: sessionToken,
        session_expiry: sessionExpiry
      };
      setUser(masterUser);
      localStorage.setItem('hms_current_user', JSON.stringify(masterUser));
      
      // Audit log
      createAuditLog(
        AUDIT_ACTIONS.LOGIN_SUCCESS,
        RESOURCE_TYPES.USER,
        'master',
        'Master admin login successful'
      );
      
      loginRateLimiter.reset(clientKey);
      return { success: true, message: 'Master login successful' };
    }
    
    // School Admin Login
    const school = data.schools.find((s: any) => 
      (s.admin_username === username || s.admin_email === username) && 
      s.admin_password === password && 
      s.status === 'Active'
    );
    
    if (school) {
      const sessionToken = generateSessionToken();
      const sessionExpiry = getSessionExpiry();
      
      const schoolAdminUser: AuthUser = { 
        id: school.id, 
        name: school.admin_name, 
        username: school.admin_username, 
        role: 'admin', 
        email: school.admin_email,
        school_id: school.id,
        school_name: school.name,
        session_token: sessionToken,
        session_expiry: sessionExpiry
      };
      setUser(schoolAdminUser);
      localStorage.setItem('hms_current_user', JSON.stringify(schoolAdminUser));
      
      // Audit log
      createAuditLog(
        AUDIT_ACTIONS.LOGIN_SUCCESS,
        RESOURCE_TYPES.USER,
        school.id,
        `School admin login successful for ${school.name}`
      );
      
      loginRateLimiter.reset(clientKey);
      return { success: true, message: 'School admin login successful' };
    }
    
    // Warden Login - Search across all schools
    for (const school of data.schools) {
      const schoolWardens = JSON.parse(localStorage.getItem(`hms_${school.id}_wardens`) || '[]');
      const warden = schoolWardens.find((w: any) => 
        (w.username === username || w.email === username) && 
        w.password === password
      );
      
      if (warden) {
        if (warden.status !== 'Active') {
          logSecurityEvent('LOGIN_DISABLED_ACCOUNT', { username, school_id: school.id });
          return { success: false, message: 'Account is deactivated. Contact admin.' };
        }
        
        const sessionToken = generateSessionToken();
        const sessionExpiry = getSessionExpiry();
        
        const wardenUser: AuthUser = { 
          id: warden.id, 
          name: warden.name, 
          username: warden.username, 
          role: 'warden', 
          assigned_house_id: warden.assigned_house_id, 
          email: warden.email,
          school_id: school.id,
          school_name: school.name,
          session_token: sessionToken,
          session_expiry: sessionExpiry
        };
        setUser(wardenUser);
        localStorage.setItem('hms_current_user', JSON.stringify(wardenUser));
        
        // Audit log
        createAuditLog(
          AUDIT_ACTIONS.LOGIN_SUCCESS,
          RESOURCE_TYPES.USER,
          warden.id,
          `Warden login successful for ${warden.name} (${school.name})`
        );
        
        loginRateLimiter.reset(clientKey);
        return { success: true, message: 'Warden login successful' };
      }
    }
    
    // Login failed
    loginRateLimiter.recordAttempt(clientKey);
    logSecurityEvent('LOGIN_FAILED', { 
      username, 
      remaining_attempts: loginRateLimiter.getRemainingAttempts(clientKey) 
    });
    
    createAuditLog(
      AUDIT_ACTIONS.LOGIN_FAILED,
      RESOURCE_TYPES.USER,
      undefined,
      `Login failed for username: ${username}`
    );
    
    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => { 
    // Audit log before clearing user
    if (user) {
      createAuditLog(
        AUDIT_ACTIONS.LOGOUT,
        RESOURCE_TYPES.USER,
        user.id,
        `User ${user.name} logged out`
      );
    }
    
    setUser(null); 
    localStorage.removeItem('hms_current_user'); 
  };

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
