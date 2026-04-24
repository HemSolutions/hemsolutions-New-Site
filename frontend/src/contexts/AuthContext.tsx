import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { auth as authApi } from '@/api/api';

export type UserRole = 'admin' | 'worker' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  city?: string;
  personnummer?: string;
  createdAt?: string;
  bankidVerified?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData, password?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  // Extended properties expected by components
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  unreadCount: number;
  sendMessage: (data: { userId: string; message: string }) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  loginWithBankID: (personnummer?: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  address: string;
  postcode?: string;
  personnummer?: string;
  role?: 'customer' | 'worker';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await authApi.login(email, password);

      if (data.success && data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          firstName: data.user.name?.split(' ')[0],
          lastName: data.user.name?.split(' ').slice(1).join(' '),
          role: data.user.role,
          phone: data.user.phone,
          address: data.user.address,
          postcode: data.user.postcode,
          city: data.user.city,
          personnummer: data.user.personnummer,
          bankidVerified: data.user.bankid_verified,
          createdAt: data.user.created_at,
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_token', data.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterData, password?: string): Promise<boolean> => {
    try {
      // Handle both calling conventions:
      // 1. register(dataObj) - where dataObj has password
      // 2. register(dataObj, password) - where password is separate
      const registerPayload = password 
        ? { 
            ...data, 
            password, 
            name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() 
          }
        : { ...data };
      
      const result = await authApi.register(registerPayload as any);
      return result.success;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const sendMessage = useCallback(async (data: { userId: string; message: string }): Promise<boolean> => {
    try {
      // This would connect to a messages API - placeholder for now
      console.log('Sending message to', data.userId, ':', data.message);
      return true;
    } catch (error) {
      console.error('Send message error:', error);
      return false;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.user) {
          setUser(prev => prev ? { ...prev, ...result.user } : null);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }, []);

  const loginWithBankID = useCallback(async (personnummer?: string): Promise<boolean> => {
    // BankID integration placeholder
    console.log('BankID login initiated', personnummer);
    return false;
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return response.ok;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        notifications,
        markNotificationRead,
        unreadCount,
        sendMessage,
        updateProfile,
        loginWithBankID,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
