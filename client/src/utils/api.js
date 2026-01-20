const API_BASE = process.env.REACT_APP_API_URL || '';
const USE_PROXY = true;
function resolveUrl(url) {
  if (typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // When running the React dev server on known ports, prefer CRA proxy
  if (USE_PROXY) return url;
  return API_BASE ? `${API_BASE}${url}` : url;
}

export async function fetchJSON(url, options = {}) {
  const res = await fetch(resolveUrl(url), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

export function authHeaders() {
  try {
    // Align with AuthContext storage key
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (_) {
    return {};
  }
}

export async function fetchWithAuth(url, options = {}) {
  return fetchJSON(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...authHeaders(),
    },
  });
}
