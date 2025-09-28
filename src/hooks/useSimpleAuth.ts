import { useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import simpleAuthService from '../services/simpleAuth';
import { doctorAPI } from '../services/api';

export const useSimpleAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      setIsLoading(true);
      const isAuth = simpleAuthService.isAuthenticated();
      const currentUser = simpleAuthService.getCurrentUser();

      setIsAuthenticated(isAuth);
      setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await simpleAuthService.login(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Login failed');
        throw new Error(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Role-based login (for backward compatibility)
  const loginWithRole = useCallback(async (role: 'Doctor'): Promise<void> => {
    const credentials = simpleAuthService.getDefaultCredentials();
    const creds = role === 'Doctor' ? credentials.doctor : credentials.patient;
    await login(creds.email, creds.password);
  }, [login]);

  // Signup function (for backward compatibility - just uses default credentials)
  const signup = useCallback(async (role: 'Patient' | 'Doctor'): Promise<void> => {
    await loginWithRole(role);
  }, [loginWithRole]);

  // Logout function
  const logout = useCallback(() => {
    simpleAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Helper function to check if user has specific role permission
  const hasRolePermission = useCallback((requiredRole: 'Patient' | 'Doctor'): boolean => {
    return user?.role === requiredRole;
  }, [user]);

  // Helper function to check if doctor profile exists
  const checkDoctorProfile = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      await doctorAPI.getDoctor(user.id);
      return true;
    } catch (error) {
      console.log('Doctor profile not found:', error);
      return false;
    }
  }, [user?.id]);

  // Mock functions for backward compatibility
  const getAccessTokenSilently = useCallback(async () => {
    return 'mock-token';
  }, []);

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
    return updatedUser;
  }, [user]);

  const syncUserWithBackend = useCallback(async () => {
    return user;
  }, [user]);

  const refreshUserProfile = useCallback(async () => {
    return user;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    loginWithRole,
    hasRolePermission,
    checkDoctorProfile,
    getAccessTokenSilently,
    makeAuthenticatedRequest,
    updateUserProfile,
    syncUserWithBackend,
    refreshUserProfile,
  };
};
