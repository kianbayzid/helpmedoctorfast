// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { doctorService } from "../services/doctorService";

interface Doctor {
  idDoctor: number;
  name: string;
  email: string;
  phone: string;
  specialization?: string;
}

interface AuthContextType {
  user: Doctor | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Doctor | null>(null);

  // cargar desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("doctor");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const doctor = await doctorService.login({ email, password });

    if (!doctor) return false;

    setUser(doctor);
    localStorage.setItem("doctor", JSON.stringify(doctor));
    return true;
  } catch (err) {
    console.error("Login failed:", err);
    return false;
  }
};

  const register = async (data: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const doctor = await doctorService.create(data);
      setUser(doctor);
      localStorage.setItem("doctor", JSON.stringify(doctor));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("doctor");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};