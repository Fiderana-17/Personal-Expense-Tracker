import React, { useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { login as apiLogin, signup as apiSignup, getMe  } from '../api/auth';
import { AuthContext } from '@/hooks/useAuth';



interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Vérifie le token au démarrage
  useEffect(() => {
  const fetchUser = async () => {
    if (token) {
      try {
        const data = await getMe(token);
        if (data.id) {
          setUser(data);
        } else {
          setUser(null);
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (err) {
        console.error("Erreur fetchUser:", err);
        setUser(null);
        localStorage.removeItem("token");
        setToken(null);
      }
    }
    setIsLoading(false);
  };

  fetchUser();
}, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      if (res.token) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await apiSignup(name, email, password);
      if (!res.userId) {
        throw new Error(res.message || 'Signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, signup, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
