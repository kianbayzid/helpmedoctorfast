
import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0ProviderWithHistoryProps {
  children: React.ReactNode;
}

const Auth0ProviderWithHistory: React.FC<Auth0ProviderWithHistoryProps> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || "dev-2guajhw0h3xdm6k6.us.auth0.com";
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "IcZGMrrxXVsuJXoU0pxSCIqKGF1wAVLa";
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        ...(audience && { audience })
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
