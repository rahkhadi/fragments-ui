import { UserManager } from 'oidc-client-ts';

const cognitoAuthConfig = {
  authority: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_DuKU5EOar`,
  client_id: `1mbifsbohdbpf38vp7dbfdfqrt`,
  redirect_uri: `http://localhost:8081`,
  response_type: 'code',
  scope: 'phone openid email',
  revokeTokenTypes: ['refresh_token'],
  automaticSilentRenew: false,
};

const userManager = new UserManager({
  ...cognitoAuthConfig,
});

export async function signIn() {
  await userManager.signinRedirect();
}

function formatUser(user) {
  console.log('User Authenticated', { user });
  return {
    username: user.profile['cognito:username'],
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      Authorization: `Bearer ${user.id_token}`,
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
