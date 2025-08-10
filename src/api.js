// fragments-ui/src/api.js
// Small API helper layer used by app.js (authorized requests with ID token)

const apiUrl =
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL)
    ? process.env.VITE_API_URL
    : (window.VITE_API_URL || 'http://localhost:8080');

// --- utils -------------------------------------------------------------------
async function okOrThrow(res) {
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${txt ? `: ${txt}` : ''}`);
  }
  return res;
}

// --- list fragments ----------------------------------------------------------
export async function getUserFragments(user, expand = true) {
  const url = `${apiUrl}/v1/fragments${expand ? '?expand=1' : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${user.idToken}` },
  });
  return (await okOrThrow(res)).json();
}

// --- create text/json fragments ---------------------------------------------
export async function createTextFragment(user, body, contentType = 'text/plain') {
  const res = await fetch(`${apiUrl}/v1/fragments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${user.idToken}`,
      'Content-Type': contentType,
    },
    body,
  });
  const ok = await okOrThrow(res);
  return { location: ok.headers.get('Location'), json: await ok.json() };
}

// --- create image fragments --------------------------------------------------
export async function createImageFragment(user, file) {
  const res = await fetch(`${apiUrl}/v1/fragments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${user.idToken}`,
      'Content-Type': file.type, // e.g. image/png
    },
    body: file,
  });
  const ok = await okOrThrow(res);
  return { location: ok.headers.get('Location'), json: await ok.json() };
}

// --- delete fragment ---------------------------------------------------------
export async function deleteFragment(user, id) {
  const res = await fetch(`${apiUrl}/v1/fragments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${user.idToken}` },
  });
  await okOrThrow(res);
  return true;
}

// --- update fragment (PUT) ---------------------------------------------------
export async function updateTextFragment(user, id, body, type = 'text/plain') {
  const res = await fetch(`${apiUrl}/v1/fragments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${user.idToken}`,
      'Content-Type': type,
    },
    body,
  });
  return (await okOrThrow(res)).json();
}

// --- download/convert with Authorization ------------------------------------
// Fetches /v1/fragments/:id[.:ext] with the token and opens a Blob in a new tab
export async function openFragmentWithAuth(user, path) {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${user.idToken}` },
  });
  const ok = await okOrThrow(res);
  const blob = await ok.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
