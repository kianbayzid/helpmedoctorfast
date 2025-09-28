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
      console.log('Attempting to get access token...');
      const token = await getAccessTokenSilently({
        ignoreCache: false
      });
      console.log('Got access token:', token ? 'Token received' : 'No token');

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status);

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
      console.warn('Backend API not available, using Auth0 data directly:', error);

      // If backend is not available, use Auth0 data directly
      const roleFromState = sessionStorage.getItem('selectedRole');
      const roleFromAuth0 = auth0User['https://helpmedoctorfast.com/role'] as 'Patient' | 'Doctor';
      const selectedRole = roleFromAuth0 || roleFromState as 'Patient' | 'Doctor' || 'Patient';

      const fallbackUser: User = {
        id: auth0User.sub || '',
        name: auth0User.name || auth0User.email || '',
        email: auth0User.email || '',
        role: selectedRole,
        dateOfBirth: auth0User['https://helpmedoctorfast.com/dateOfBirth'],
        insurance: auth0User['https://helpmedoctorfast.com/insurance'],
        specialization: auth0User['https://helpmedoctorfast.com/specialization']
      };

      // Clear the stored role after use
      sessionStorage.removeItem('selectedRole');
      return fallbackUser;
    } finally {
      setUserLoading(false);
    }
  }, [isAuthenticated, auth0User, makeAuthenticatedRequest]);

  // Sync Auth0 user data with your backend
  const syncUserWithBackend = useCallback(async () => {
    if (!auth0User) return null;

    // Check for role from multiple sources
    const roleFromState = sessionStorage.getItem('selectedRole');
    const roleFromAuth0 = auth0User['https://helpmedoctorfast.com/role'] as 'Patient' | 'Doctor';
    const selectedRole = roleFromAuth0 || roleFromState as 'Patient' | 'Doctor' || 'Patient';

    const userPayload = {
      auth0Id: auth0User.sub,
      name: auth0User.name || auth0User.email || '',
      email: auth0User.email || '',
      role: selectedRole,
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
    console.log('useAuth0Integration - Auth state changed:', {
      isAuthenticated,
      isLoading,
      hasAuth0User: !!auth0User,
      userSub: auth0User?.sub
    });

    if (isAuthenticated && auth0User && !isLoading) {
      console.log('Auth0 user data:', auth0User);
      fetchUserProfile().then((userData) => {
        console.log('Fetched user profile:', userData);
        if (userData) {
          setUser(userData);
        } else {
          // Fallback to Auth0 data if backend fails
          // Check for role in app metadata, state, or default to Patient
          const roleFromState = sessionStorage.getItem('selectedRole');
          const roleFromAuth0 = auth0User['https://helpmedoctorfast.com/role'] as 'Patient' | 'Doctor';
          const fallbackRole = roleFromAuth0 || roleFromState as 'Patient' | 'Doctor' || 'Patient';

          console.log('Using fallback user with role:', fallbackRole);
          const fallbackUser: User = {
            id: auth0User.sub || '',
            name: auth0User.name || auth0User.email || '',
            email: auth0User.email || '',
            role: fallbackRole,
            dateOfBirth: auth0User['https://helpmedoctorfast.com/dateOfBirth'],
            insurance: auth0User['https://helpmedoctorfast.com/insurance'],
            specialization: auth0User['https://helpmedoctorfast.com/specialization']
          };
          setUser(fallbackUser);

          // Clear the stored role after use
          sessionStorage.removeItem('selectedRole');
        }
      }).catch((error) => {
        console.error('Error in fetchUserProfile:', error);
        setError('Failed to load user profile');
      });
    } else if (!isAuthenticated) {
      console.log('User not authenticated, clearing user state');
      setUser(null);
      setError(null);
    }
  }, [isAuthenticated, auth0User, isLoading, fetchUserProfile]);

  const login = async (role: 'Patient' | 'Doctor') => {
    // Store the role selection temporarily
    sessionStorage.setItem('selectedRole', role);

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
    isAuthenticated: isAuthenticated && !isLoading && user !== null,
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