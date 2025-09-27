// src/services/api.ts

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Authentication APIs
export const authAPI = {
  login: async (email: string, password: string, role: 'Patient' | 'Doctor') => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    
    // Store token if provided
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'Patient' | 'Doctor';
    dateOfBirth?: string;
    insurance?: string;
    specialization?: string;
  }) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token if provided
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    // Optionally call backend logout endpoint
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },
};

// Message APIs
export const messageAPI = {
  getMessages: async () => {
    return apiCall('/messages');
  },

  sendMessage: async (message: {
    receiverId: string;
    content: string;
    category?: string;
    patientDetails?: {
      name: string;
      dateOfBirth: string;
      insurance?: string;
      urgency: 'low' | 'medium' | 'high';
    };
  }) => {
    return apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },

  markAsRead: async (messageId: string) => {
    return apiCall(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },

  getThreads: async () => {
    return apiCall('/messages/threads');
  },
};

// Category APIs
export const categoryAPI = {
  getCategories: async () => {
    return apiCall('/categories');
  },

  addCategory: async (name: string, color: string) => {
    return apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },

  removeCategory: async (categoryId: string) => {
    return apiCall(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
};