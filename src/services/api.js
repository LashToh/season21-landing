// Production default: same-origin (/api) when VPS serves frontend + API together.
// Local dev default: http://localhost:3001. Override with VITE_API_URL if needed.
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (
  rawApiUrl !== undefined && rawApiUrl !== null
    ? String(rawApiUrl)
    : (import.meta.env.PROD ? '' : 'http://localhost:3001')
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export async function registerAccount({ username, password, confirmPassword, email }) {
  let response;

  try {
    response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, confirmPassword, email }),
    });
  } catch {
    throw new ApiError(
      'Unable to reach the registration server. Check that the API is running and VITE_API_URL is correct.',
      'NETWORK_ERROR',
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Registration failed. Please try again.',
      data.code || 'SERVER_ERROR',
    );
  }

  return data;
}

export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
