import { User } from '../types';

// Default credentials
const DEFAULT_CREDENTIALS = {
  doctor: {
    email: 'doctor@test.com',
    password: 'doctor123',
    user: {
      id: 'doctor-1',
      name: 'Dr. John Smith',
      email: 'doctor@test.com',
      role: 'Doctor' as const,
    }
  },
  patient: {
    email: 'patient@test.com',
    password: 'patient123',
    user: {
      id: 'patient-1',
      name: 'Patient User',
      email: 'patient@test.com',
      role: 'Patient' as const,
    }
  }
};

// Simple in-memory auth state
let currentUser: User | null = null;
let isLoggedIn = false;

// Auth service
export const simpleAuthService = {
  // Login function
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check credentials
    for (const [role, creds] of Object.entries(DEFAULT_CREDENTIALS)) {
      if (creds.email === email && creds.password === password) {
        currentUser = creds.user;
        isLoggedIn = true;

        // Store in localStorage for persistence
        localStorage.setItem('authUser', JSON.stringify(creds.user));
        localStorage.setItem('isAuthenticated', 'true');

        return { success: true, user: creds.user };
      }
    }

    return { success: false, error: 'Invalid email or password' };
  },

  // Logout function
  logout: () => {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('authUser');
    localStorage.removeItem('isAuthenticated');
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (currentUser) return currentUser;

    // Try to restore from localStorage
    const storedUser = localStorage.getItem('authUser');
    const isAuth = localStorage.getItem('isAuthenticated');

    if (storedUser && isAuth === 'true') {
      try {
        currentUser = JSON.parse(storedUser);
        isLoggedIn = true;
        return currentUser;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('isAuthenticated');
      }
    }

    return null;
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    if (isLoggedIn) return true;

    const isAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('authUser');

    if (isAuth === 'true' && storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        isLoggedIn = true;
        return true;
      } catch (error) {
        localStorage.removeItem('authUser');
        localStorage.removeItem('isAuthenticated');
      }
    }

    return false;
  },

  // Get default credentials for demo purposes
  getDefaultCredentials: () => DEFAULT_CREDENTIALS,
};

export default simpleAuthService;