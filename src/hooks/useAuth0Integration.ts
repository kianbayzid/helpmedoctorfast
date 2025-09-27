import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      // Convert Auth0 user to our User type
      const convertedUser: User = {
        id: auth0User.sub || '',
        name: auth0User.name || auth0User.email || '',
        email: auth0User.email || '',
        role: (auth0User['https://helpmedoctorfast.com/role'] as 'patient' | 'doctor') || 'patient',
        dateOfBirth: auth0User['https://helpmedoctorfast.com/dateOfBirth'],
        insurance: auth0User['https://helpmedoctorfast.com/insurance'],
        specialization: auth0User['https://helpmedoctorfast.com/specialization']
      };
      setUser(convertedUser);
    } else {
      setUser(null);
    }
  }, [isAuthenticated, auth0User]);

  const login = async (role: 'patient' | 'doctor') => {
    await loginWithRedirect({
      appState: {
        returnTo: window.location.origin,
        role: role
      },
      authorizationParams: {
        prompt: 'login',
        // Store role in the state to handle after login
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
  };

  return {
    user,
    isAuthenticated: isAuthenticated && !isLoading,
    isLoading,
    login,
    logout,
    getAccessTokenSilently
  };
};