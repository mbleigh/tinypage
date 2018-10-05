let authClient;

import { update } from './state';

function _updateUser(u) {
  console.log('user:', u);
  if (!u || !u.getBasicProfile()) {
    update({accessToken: null, user: null});
    return;
  }

  const p = u.getBasicProfile();
  update({
    accessToken: u.getAuthResponse().access_token,
    user: {
      name: p.getName(),
      email: p.getEmail(),
      imageUrl: p.getImageUrl(),
    }
  })
}

export async function initAuth() {
  await new Promise(resolve => {
    gapi.load('auth2', resolve);
  });

  authClient = await gapi.auth2.init({
    client_id: '176931316218-su3cik0260b5e2lphachg5u9u9dphmb1.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    fetch_basic_profile: true,
  });
  update({auth: authClient});

  authClient.isSignedIn.listen(u => { if (!u) { _updateUser(null); }});
  authClient.currentUser.listen(_updateUser);
  _updateUser(authClient.currentUser.get());

  return authClient;
}

export default authClient;
