// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Patient' | 'Doctor';
  dateOfBirth?: string;
  insurance?: string;
  specialization?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date | string; // Allow both Date and string for API responses
  patientDetails?: {
    name: string;
    dateOfBirth: string;
    insurance?: string;
    urgency: 'low' | 'medium' | 'high';
  };
  category?: string;
  read: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  doctorId: string;
}

export interface MessageThread {
  patientId: string;
  patientName: string;
  messages: Message[];
  lastMessage: Date;
  category: string;
  unreadCount: number;
}

// Add any additional types you might need for API responses
export interface AuthResponse {
  user: User;
  token?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'Patient' | 'Doctor';
  dateOfBirth?: string;
  insurance?: string;
  specialization?: string;
}