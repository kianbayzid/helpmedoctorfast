// This file is not needed for @auth0/auth0-react setup
// Auth0 configuration is handled in Auth0Provider.tsx
export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
};
