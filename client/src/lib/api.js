// Tiny fetch wrapper. Reads the JWT from localStorage and adds it to requests.

// In dev, Vite proxies /api to the local backend (see vite.config.js), so
// leaving this empty keeps relative paths working. In production the frontend
// and backend are separate Render services, so VITE_API_URL (set at build
// time in Render's Static Site env vars) points straight at the backend.
const API_BASE = import.meta.env.VITE_API_URL || '';

const TOKEN_KEY = 'pastelrush_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const message = data?.error || `Error ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}
