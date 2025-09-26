export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  dateOfBirth?: string;
  insurance?: string;
  specialization?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
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