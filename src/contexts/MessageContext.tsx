import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message, Category, MessageThread } from '../types';

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function toStringDate(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : d;
}

interface MessageContextType {
  messages: Message[];
  categories: Category[];
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (messageId: string) => void;
  addCategory: (name: string, color: string, doctorId: string) => void;
  removeCategory: (categoryId: string) => void;
  getThreadsForDoctor: (doctorId: string) => MessageThread[];
  getMessagesForPatient: (patientId: string) => Message[];
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

// Mock data
const initialMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    content: 'I\'ve been experiencing persistent headaches for the past week. They seem to be getting worse, especially in the morning.',
    timestamp: new Date('2024-01-15T10:30:00'),
    patientDetails: {
      name: 'John Smith',
      dateOfBirth: '1985-06-15',
      insurance: 'Blue Cross Blue Shield',
      urgency: 'medium'
    },
    category: 'general',
    read: false
  },
  {
    id: '2',
    senderId: '1',
    receiverId: '2',
    content: 'Thank you for reaching out. Headaches can have various causes. Have you been under any unusual stress lately? Are you staying hydrated?',
    timestamp: new Date('2024-01-15T14:20:00'),
    read: true
  },
  {
    id: '3',
    senderId: '3',
    receiverId: '1',
    content: 'I need a referral to see an orthodontist for my daughter. She\'s 12 years old and we think she needs braces.',
    timestamp: new Date('2024-01-16T09:15:00'),
    patientDetails: {
      name: 'Emily Davis',
      dateOfBirth: '1992-03-22',
      insurance: 'Aetna',
      urgency: 'low'
    },
    category: 'referrals',
    read: false
  }
];

const initialCategories: Category[] = [
  { id: '1', name: 'General', color: '#3B82F6', doctorId: '1' },
  { id: '2', name: 'Referrals', color: '#10B981', doctorId: '1' },
  { id: '3', name: 'Prescriptions', color: '#F59E0B', doctorId: '1' },
  { id: '4', name: 'Lab Results', color: '#EF4444', doctorId: '1' }
];

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const sendMessage = (messageData: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const addCategory = (name: string, color: string, doctorId: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
      doctorId
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const removeCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const getThreadsForDoctor = (doctorId: string): MessageThread[] => {
    const doctorMessages = messages.filter(msg => 
      msg.receiverId === doctorId || msg.senderId === doctorId
    );

    const threads: { [patientId: string]: MessageThread } = {};

    doctorMessages.forEach(msg => {
      const patientId = msg.senderId === doctorId ? msg.receiverId : msg.senderId;
      if (!threads[patientId]) {
        threads[patientId] = {
          patientId,
          patientName: msg.patientDetails?.name || 'Unknown Patient',
          messages: [],
          
          lastMessage: toDate(msg.timestamp),
          category: msg.category || 'general',
          unreadCount: 0
        };
      }
      
      threads[patientId].messages.push(msg);
      if (msg.timestamp > threads[patientId].lastMessage) {
        threads[patientId].lastMessage = toDate(msg.timestamp);
      }
      if (!msg.read && msg.senderId !== doctorId) {
        threads[patientId].unreadCount++;
      }
    });

    return Object.values(threads).sort((a, b) => 
      b.lastMessage.getTime() - a.lastMessage.getTime()
    );
  };

  const getMessagesForPatient = (patientId: string): Message[] => {
    return messages.filter(msg => 
      msg.senderId === patientId || msg.receiverId === patientId
    ).sort((a, b) => toDate(a.timestamp).getTime() - toDate(b.timestamp).getTime());
  };

  return (
    <MessageContext.Provider value={{
      messages,
      categories,
      sendMessage,
      markAsRead,
      addCategory,
      removeCategory,
      getThreadsForDoctor,
      getMessagesForPatient
    }}>
      {children}
    </MessageContext.Provider>
  );
};