
import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  return <div>Loading...</div>;
};

export default Login;
