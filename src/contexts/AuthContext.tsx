import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import { useAuth0Integration } from '../hooks/useAuth0Integration';


interface AuthContextType {
  user: User | null;
  login: (role: 'patient' | 'doctor') => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'Patient' | 'Doctor';
  dateOfBirth?: string;
  insurance?: string;
  specialization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth0Integration();


  // Keep register functionality for backward compatibility
  // In a real app, you might want to handle registration through Auth0's Management API
  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // For now, redirect to Auth0 signup
    // You can customize this to use Auth0's Management API for user creation
    await login(userData.role);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};