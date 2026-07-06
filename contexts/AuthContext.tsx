'use client';
import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { User, Role } from '@/types';
import { loginWithCredentials, register as registerApi } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone: string; role: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('foodgo_user');
    const storedToken = localStorage.getItem('foodgo_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem('foodgo_user');
        localStorage.removeItem('foodgo_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: newToken, user: loggedInUser } = await loginWithCredentials(email, password);
      setUser(loggedInUser);
      setToken(newToken);
      localStorage.setItem('foodgo_user', JSON.stringify(loggedInUser));
      localStorage.setItem('foodgo_token', newToken);
      toast.success(`Logged in as ${loggedInUser.name}`);
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone: string; role: string }) => {
    setIsLoading(true);
    try {
      const { token: newToken, user: newUser } = await registerApi(data);
      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('foodgo_user', JSON.stringify(newUser));
      localStorage.setItem('foodgo_token', newToken);
      toast.success(`Welcome to FoodGo, ${newUser.name}!`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('foodgo_user');
    localStorage.removeItem('foodgo_token');
    toast.info('Logged out successfully');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('foodgo_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
