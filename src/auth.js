// REPLACE the file contents with this
import { UserManager } from 'oidc-client-ts';

const poolId = process.env.VITE_COGNITO_POOL_ID;          // e.g., us-east-1_abc…
const region = poolId.split('_')[0];
const authority = `https://cognito-idp.${region}.amazonaws.com/${poolId}`;

const cognitoAuthConfig = {
  authority,
  client_id: process.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: process.env.VITE_COGNITO_REDIRECT_URI,
  response_type: 'code',
  scope: 'openid email phone',
  revokeTokenTypes: ['refresh_token'],
  automaticSilentRenew: false,
};

const userManager = new UserManager(cognitoAuthConfig);

export async function signIn() {
  await userManager.signinRedirect();
}

function formatUser(user) {
  return {
    username: user.profile['cognito:username'] || user.profile.username,
    email: user.profile.email,
    idToken: user.id_token,                // for API auth
    accessToken: user.access_token,        // (keep if you need it elsewhere)
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      Authorization: `Bearer ${user.id_token}`, // send ID token
    }),
  };
}

export async function getUser() {
  if (window.location.search.includes('code=')) {
    const user = await userManager.signinCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
    return formatUser(user);
  }
  const user = await userManager.getUser();
  return user ? formatUser(user) : null;
}
