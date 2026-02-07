const API_BASE = process.env.REACT_APP_API_URL || '';

function resolveUrl(url) {
  if (typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  // Use API_BASE if set, otherwise use relative path (for production with Nginx)
  if (API_BASE) {
    // Ensure no double slashes if API_BASE ends with / and url starts with /
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  }
  
  // If no API_BASE, ensure url starts with / for relative path
  if (!url.startsWith('/')) {
    return `/${url}`;
  }
  
  return url;
}

export async function fetchJSON(url, options = {}) {
  // Extract headers from options to merge properly
  const { headers: optionHeaders, ...restOptions } = options;
  
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(optionHeaders || {}),
  };
  
  const res = await fetch(resolveUrl(url), {
    ...restOptions,
    headers: mergedHeaders,
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
  const { headers: optionHeaders, ...restOptions } = options;
  
  return fetchJSON(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(optionHeaders || {}),
      ...authHeaders(),
    },
  });
}
