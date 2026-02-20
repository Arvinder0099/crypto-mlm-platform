/**
 * API Base URL Interceptor
 * 
 * This module patches the global `fetch` and `axios` to automatically
 * prepend the production API base URL to relative paths like `/api/...`.
 * 
 * This is CRITICAL for Capacitor mobile apps where the web view runs
 * from `https://localhost` and relative URLs would otherwise fail.
 * 
 * Must be imported BEFORE any other code runs (first import in index.js).
 */

const API_BASE = process.env.REACT_APP_API_URL || '';

if (API_BASE) {
  // ── Patch global fetch ──────────────────────────────────────────
  const originalFetch = window.fetch.bind(window);
  
  window.fetch = function patchedFetch(input, init) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      input = `${API_BASE}${input}`;
    } else if (input instanceof Request && input.url) {
      // Handle Request objects with relative URLs
      const url = input.url;
      // Check if it's a localhost URL with /api/ path (Capacitor rewrites)
      if (url.includes('/api/') && !url.includes('hexanova.net')) {
        const apiPath = url.substring(url.indexOf('/api/'));
        input = new Request(`${API_BASE}${apiPath}`, input);
      }
    }
    return originalFetch(input, init);
  };

  // ── Patch axios defaults (if loaded) ────────────────────────────
  try {
    const axios = require('axios');
    if (axios && axios.defaults) {
      // Set the base URL for all axios requests
      if (!axios.defaults.baseURL) {
        axios.defaults.baseURL = API_BASE;
      }
      
      // Also add a request interceptor for safety
      axios.interceptors.request.use((config) => {
        if (config.url && config.url.startsWith('/api/') && !config.baseURL) {
          config.baseURL = API_BASE;
        }
        return config;
      });
    }
  } catch (e) {
    // axios not available, that's fine
  }

  console.log('[Hexanova] API Base URL configured:', API_BASE);
}
