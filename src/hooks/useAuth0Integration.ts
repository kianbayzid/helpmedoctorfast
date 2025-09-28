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
      const roleFromSession = sessionStorage.getItem('selectedRole');
      const pendingRoleData = localStorage.getItem('pendingUserRole');
      const roleFromAuth0 = auth0User['https://helpmedoctorfast.com/role'] as 'Patient' | 'Doctor';

      let selectedRole: 'Patient' | 'Doctor' = 'Patient';

      // Check for dual role first
      const dualRoleData = localStorage.getItem('dualRoleData');
      if (dualRoleData) {
        try {
          const parsedDualRole = JSON.parse(dualRoleData);
          if (Date.now() - parsedDualRole.timestamp < 10 * 60 * 1000) {
            // Use primary role for main dashboard routing, but store dual capability
            selectedRole = parsedDualRole.primaryRole;
            console.log('Using dual role - primary:', parsedDualRole.primaryRole, 'secondary:', parsedDualRole.secondaryRole);
          }
        } catch (e) {
          console.warn('Failed to parse dual role data:', e);
        }
      }

      // Try to get role from multiple sources if no dual role
      if (!dualRoleData && pendingRoleData) {
        try {
          const parsedRoleData = JSON.parse(pendingRoleData);
          // Check if this role data is for the current user (within last 10 minutes)
          const isRecent = Date.now() - parsedRoleData.timestamp < 10 * 60 * 1000;
          const isForCurrentUser = !parsedRoleData.userId || parsedRoleData.userId === 'pending' || parsedRoleData.userId === auth0User.sub;

          if (isRecent && isForCurrentUser) {
            selectedRole = parsedRoleData.role;
            console.log('Using stored pending role for new user:', selectedRole);
          }
        } catch (e) {
          console.warn('Failed to parse pending role data:', e);
        }
      } else if (!dualRoleData && roleFromAuth0) {
        selectedRole = roleFromAuth0;
      } else if (!dualRoleData && roleFromSession) {
        selectedRole = roleFromSession as 'Patient' | 'Doctor';
      }

      console.log('Role selection logic:', {
        roleFromAuth0,
        roleFromSession,
        hasPendingRoleData: !!pendingRoleData,
        finalRole: selectedRole
      });

      const fallbackUser: User = {
        id: auth0User.sub || '',
        name: auth0User.name || auth0User.email || '',
        email: auth0User.email || '',
        role: selectedRole,
        dateOfBirth: auth0User['https://helpmedoctorfast.com/dateOfBirth'],
        insurance: auth0User['https://helpmedoctorfast.com/insurance'],
        specialization: auth0User['https://helpmedoctorfast.com/specialization']
      };

      // Clear the stored role after successful use
      sessionStorage.removeItem('selectedRole');
      localStorage.removeItem('pendingUserRole');

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
    // Store the role selection with a timestamp for persistence
    const roleData = {
      role: role,
      timestamp: Date.now(),
      userId: auth0User?.sub || 'pending'
    };

    localStorage.setItem('pendingUserRole', JSON.stringify(roleData));
    sessionStorage.setItem('selectedRole', role);

    await loginWithRedirect({
      appState: {
        returnTo: window.location.origin,
        role: role
      },
      authorizationParams: {
        // Use 'select_account' to allow both login and signup
        prompt: 'select_account',
        state: JSON.stringify({ role }),
        // Add role as a login hint for new users
        login_hint: `role:${role}`,
        // Add custom parameter that can be accessed in Auth0 rules/actions
        ui_locales: `role_${role.toLowerCase()}`
      }
    });
  };

  // New function specifically for signup
  const signup = async (role: 'Patient' | 'Doctor') => {
    // Store the role selection with persistence
    const roleData = {
      role: role,
      timestamp: Date.now(),
      userId: auth0User?.sub || 'pending',
      isSignup: true
    };

    localStorage.setItem('pendingUserRole', JSON.stringify(roleData));
    sessionStorage.setItem('selectedRole', role);

    await loginWithRedirect({
      appState: {
        returnTo: window.location.origin,
        role: role,
        isSignup: true
      },
      authorizationParams: {
        // Force the signup screen
        prompt: 'signup',
        state: JSON.stringify({ role, isSignup: true }),
        login_hint: `role:${role}`,
        ui_locales: `role_${role.toLowerCase()}`,
        // Additional parameters for signup
        screen_hint: 'signup'
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

  // Helper function to check if user has specific role permission
  const hasRolePermission = useCallback((requiredRole: 'Patient' | 'Doctor'): boolean => {
    if (!user) return false;

    // Check primary role
    if (user.role === requiredRole) return true;

    // Check for dual role permissions
    const dualRoleData = localStorage.getItem('dualRoleData');
    if (dualRoleData) {
      try {
        const parsedDualRole = JSON.parse(dualRoleData);
        const isRecent = Date.now() - parsedDualRole.timestamp < 10 * 60 * 1000;

        if (isRecent) {
          return (
            parsedDualRole.primaryRole === requiredRole ||
            parsedDualRole.secondaryRole === requiredRole
          );
        }
      } catch (e) {
        console.warn('Failed to check dual role permissions:', e);
      }
    }

    return false;
  }, [user]);

  // Debug the authentication state
  console.log('useAuth0Integration - final state:', {
    auth0IsAuthenticated: isAuthenticated,
    auth0IsLoading: isLoading,
    userIsLoading: userLoading,
    hasUser: !!user,
    finalIsAuthenticated: isAuthenticated && !isLoading,
    finalIsLoading: isLoading || userLoading
  });

  return {
    user,
    isAuthenticated: isAuthenticated && !isLoading, // Remove user !== null requirement
    isLoading: isLoading || userLoading,
    error,
    login,
    signup,
    logout,
    getAccessTokenSilently,
    updateUserProfile,
    syncUserWithBackend,
    makeAuthenticatedRequest,
    refreshUserProfile: fetchUserProfile,
    hasRolePermission
  };
};