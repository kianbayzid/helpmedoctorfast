import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'patient' | 'doctor') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@medicalcenter.com',
    role: 'doctor',
    specialization: 'General Practice'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'patient',
    dateOfBirth: '1985-06-15',
    insurance: 'Blue Cross Blue Shield'
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    role: 'patient',
    dateOfBirth: '1992-03-22',
    insurance: 'Aetna'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: 'patient' | 'doctor'): Promise<boolean> => {
    // Mock authentication - in real app, this would be an API call
    const foundUser = mockUsers.find(u => u.email === email && u.role === role);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};