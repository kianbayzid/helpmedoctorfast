import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'patient' | 'doctor') => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
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
  const [users, setUsers] = useState<User[]>(mockUsers);

  const login = async (email: string, password: string, role: 'patient' | 'doctor'): Promise<boolean> => {
    // Mock authentication - in real app, this would be an API call
    const foundUser = users.find(u => u.email === email && u.role === role);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Validate required fields
    if (!userData.name.trim() || !userData.email.trim() || !userData.password.trim()) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      ...(userData.dateOfBirth && { dateOfBirth: userData.dateOfBirth }),
      ...(userData.insurance && { insurance: userData.insurance }),
      ...(userData.specialization && { specialization: userData.specialization })
    };

    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};