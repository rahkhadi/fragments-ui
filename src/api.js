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

// ✅ Create fragment with selected content type (plain or markdown)
export async function createFragment(user, content, type = 'text/plain') {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      headers: user.authorizationHeaders(type),
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
