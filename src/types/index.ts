// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Doctor'; // Removed 'Patient' option
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
  role: 'Doctor'; // Removed 'Patient' option
  dateOfBirth?: string;
  insurance?: string;
  specialization?: string;
}

// src/types.ts

// ===== Doctor =====
export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty?: string;
  phone?: string;
  // add any other fields your backend returns
}

export interface CreateDoctorRequest {
  name: string;
  email: string;
  specialty?: string;
  phone?: string;
}

export interface UpdateDoctorRequest {
  name?: string;
  email?: string;
  specialty?: string;
  phone?: string;
}

// ===== Patient ===== (Commented out - Patient portal removed)
/*
export interface Patient {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // ISO date
  insurance?: string;
}

export interface CreatePatientRequest {
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  insurance?: string;
}

export interface UpdatePatientRequest {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  insurance?: string;
}
*/

// ===== Message =====
export type MessageStatus = 'unread' | 'read' | 'responded';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Message {
  idMessage: number;
  idDoctor: number;
  idPatient: number;
  content: string;
  createdAt: string;   // ISO timestamp
  updatedAt?: string;  // ISO timestamp
  status?: MessageStatus;
  priority?: MessagePriority;
  tldr?: string;
}

export interface CreateMessageRequest {
  idDoctor: number;
  idPatient: number;
  content: string;
  priority?: MessagePriority;
}

export interface UpdateMessageRequest {
  content?: string;
  status?: MessageStatus;
  priority?: MessagePriority;
  tldr?: string;
}

export interface MessageStats {
  total: number;
  unread: number;
  responded: number;
  urgent: number;
}
