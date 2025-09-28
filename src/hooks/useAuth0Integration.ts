import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState, useCallback } from 'react';
import { User } from '../types';

export const useAuth0Integration = () => {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API call helper with auth token
  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }, [getAccessTokenSilently]);

  // Fetch user profile from your backend
  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated || !auth0User?.sub) return null;

    setUserLoading(true);
    setError(null);

    try {
      // Try to get user from your backend first
      const userData = await makeAuthenticatedRequest('/api/user/profile');
      return userData;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      
      // If backend doesn't have the user, create/sync from Auth0 data
      try {
        const syncedUser = await syncUserWithBackend();
        return syncedUser;
      } catch (syncError) {
        console.error('Failed to sync user:', syncError);
        setError('Failed to load user profile');
        return null;
      }
    } finally {
      setUserLoading(false);
    }
  }, [isAuthenticated, auth0User?.sub, makeAuthenticatedRequest]);

  // Sync Auth0 user data with your backend
  const syncUserWithBackend = useCallback(async () => {
    if (!auth0User) return null;

    const userPayload = {
      auth0Id: auth0User.sub,
      name: auth0User.name || auth0User.email || '',
      email: auth0User.email || '',
      role: (auth0User['https://helpmedoctorfast.com/role'] as 'Patient' | 'Doctor') || 'Patient',
      dateOfBirth: auth0User['https://helpmedoctorfast.com/dateOfBirth'],
      insurance: auth0User['https://helpmedoctorfast.com/insurance'],
      specialization: auth0User['https://helpmedoctorfast.com/specialization']
    };

    try {
      const userData = await makeAuthenticatedRequest('/api/user/sync', {
        method: 'POST',
        body: JSON.stringify(userPayload),
      });

      return userData;
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
      throw error;
    }
  }, [auth0User, makeAuthenticatedRequest]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    setUserLoading(true);
    setError(null);

    try {
      const updatedUser = await makeAuthenticatedRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      setError('Failed to update profile');
      throw error;
    } finally {
      setUserLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && auth0User && !isLoading) {
      fetchUserProfile().then((userData) => {
        if (userData) {
          setUser(userData);
        } else {
          // Fallback to Auth0 data if backend fails
          const fallbackUser: User = {
            id: auth0User.sub || '',
            name: auth0User.name || auth0User.email || '',
            email: auth0User.email || '',
            role: (auth0User['https://helpmedoctorfast.com/role'] as 'Patient' | 'Doctor') || 'Patient',
            dateOfBirth: auth0User['https://helpmedoctorfast.com/dateOfBirth'],
            insurance: auth0User['https://helpmedoctorfast.com/insurance'],
            specialization: auth0User['https://helpmedoctorfast.com/specialization']
          };
          setUser(fallbackUser);
        }
      });
    } else if (!isAuthenticated) {
      setUser(null);
      setError(null);
    }
  }, [isAuthenticated, auth0User, isLoading, fetchUserProfile]);

  const login = async (role: 'Patient' | 'Doctor') => {
    await loginWithRedirect({
      appState: {
        returnTo: window.location.origin,
        role: role
      },
      authorizationParams: {
        prompt: 'login',
        state: JSON.stringify({ role })
      }
    });
  };

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    setUser(null);
    setError(null);
  };

  return {
    user,
    isAuthenticated: isAuthenticated && !isLoading,
    isLoading: isLoading || userLoading,
    error,
    login,
    logout,
    getAccessTokenSilently,
    updateUserProfile,
    syncUserWithBackend,
    makeAuthenticatedRequest,
    refreshUserProfile: fetchUserProfile
  };
};