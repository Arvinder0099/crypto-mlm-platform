const API_BASE = process.env.REACT_APP_API_URL || '';

// Request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;

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

// Handle 401 responses globally — auto-logout on expired/invalid token
function handleUnauthorized() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  // Redirect to login if not already there
  if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
    window.location.href = '/login';
  }
}

export async function fetchJSON(url, options = {}) {
  // Extract headers from options to merge properly
  const { headers: optionHeaders, ...restOptions } = options;
  
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(optionHeaders || {}),
  };

  // Add timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const res = await fetch(resolveUrl(url), {
      ...restOptions,
      headers: mergedHeaders,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired. Please login again.');
    }
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      // Don't expose raw server errors to potential attackers
      let safeMessage = 'Request failed';
      try {
        const parsed = JSON.parse(text);
        safeMessage = parsed.message || safeMessage;
      } catch {
        if (res.status === 429) safeMessage = 'Too many requests. Please try again later.';
        else if (res.status === 403) safeMessage = 'Access denied.';
        else if (res.status === 404) safeMessage = 'Not found.';
        else if (res.status >= 500) safeMessage = 'Server error. Please try again.';
      }
      throw new Error(safeMessage);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
}

export function authHeaders() {
  try {
    // Align with AuthContext storage key
    const token = localStorage.getItem('authToken');
    if (!token) return {};
    // Basic token format validation
    if (token.split('.').length !== 3) {
      localStorage.removeItem('authToken');
      return {};
    }
    return { Authorization: `Bearer ${token}` };
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
