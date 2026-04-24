import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'customer';
  avatar_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, error: data.error || 'Inloggning misslyckades' };
    } catch {
      return { success: false, error: 'Nätverksfel' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';
  const isCustomer = user?.role === 'customer';

  return { user, isLoading, login, logout, isAdmin, isEmployee, isCustomer };
}

export function requireAuth(role?: 'admin' | 'employee' | 'customer') {
  const token = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('user');
  
  if (!token || !storedUser) {
    return { authenticated: false, redirect: '/login' };
  }
  
  if (role) {
    try {
      const user = JSON.parse(storedUser);
      if (user.role !== role && user.role !== 'admin') {
        return { authenticated: false, redirect: '/login' };
      }
    } catch {
      return { authenticated: false, redirect: '/login' };
    }
  }
  
  return { authenticated: true };
}
