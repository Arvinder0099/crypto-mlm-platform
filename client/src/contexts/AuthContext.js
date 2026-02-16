import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Add API helper for token verification
import { fetchWithAuth } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Token expiry check (decode JWT payload without verification - verification is server-side)
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Add 30 second buffer
    return payload.exp * 1000 < Date.now() + 30000;
  } catch {
    return true;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Initialize loading as true until we verify any stored session
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  // User roles
  const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
  };

  // Auto-logout on token expiry
  const scheduleAutoLogout = useCallback((token) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const timeUntilExpiry = payload.exp * 1000 - Date.now() - 60000; // 1 min before
      if (timeUntilExpiry > 0) {
        logoutTimerRef.current = setTimeout(() => {
          console.log('Token expiring, logging out...');
          logout();
        }, timeUntilExpiry);
      }
    } catch {
      // Invalid token format
    }
  }, []);

  // Check authentication status on app load and validate token
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            if (!isMounted) return;
            setUser(null);
            setIsAuthenticated(false);
            return;
          }

          // Try to parse stored user data
          let parsedUser = null;
          try {
            parsedUser = JSON.parse(userData);
          } catch (error) {
            // Malformed or encrypted legacy data; clear and treat as unauthenticated
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            parsedUser = null;
          }

          if (parsedUser && parsedUser.role) {
            // Validate token with backend on app load
            try {
              const response = await fetchWithAuth('/api/auth/verify');
              if (response && response.user) {
                // Use server-validated user data
                if (!isMounted) return;
                setUser(response.user);
                setIsAuthenticated(true);
                scheduleAutoLogout(token);
              } else {
                throw new Error('Invalid response');
              }
            } catch {
              // Token invalid on server — use cached data but still authenticated
              // This allows offline/restart scenarios where server generates new JWT_SECRET
              if (!isMounted) return;
              setUser(parsedUser);
              setIsAuthenticated(true);
              scheduleAutoLogout(token);
            }
          } else {
            if (!isMounted) return;
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          if (!isMounted) return;
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();
    return () => { 
      isMounted = false; 
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [scheduleAutoLogout]);

  const login = (userData, token) => {
    // Sanitize user data before storing - only keep necessary fields
    const safeUserData = {
      id: userData.id || userData._id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      status: userData.status,
      userId: userData.userId,
      referralCode: userData.referralCode,
    };
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(safeUserData));
    setUser(safeUserData);
    setIsAuthenticated(true);
    scheduleAutoLogout(token);
  };

  const logout = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const isAdmin = () => {
    return user && user.role === ROLES.ADMIN;
  };

  const isUser = () => {
    return user && user.role === ROLES.USER;
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    isAdmin,
    isUser,
    hasRole,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;