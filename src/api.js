const apiUrl = process.env.API_URL || 'http://localhost:8080';

export async function getUserFragments(user) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
  }
}

// ✅ New function to create a fragment
export async function createFragment(user, content) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: user.authorizationHeaders('text/plain'),
      body: content,
    });

    const location = res.headers.get('Location');
    const json = await res.json();

    return { location, json };
  } catch (err) {
    console.error('Unable to create fragment', { err });
    return null;
  }
}
