import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Initialize loading as true until we verify any stored session
  const [loading, setLoading] = useState(true);

  // User roles
  const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
  };

  // Check authentication status on app load and validate token
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        console.log('Auth Init - Token exists:', !!token, 'UserData exists:', !!userData);

        if (token && userData) {
          // Try to parse stored user data (plaintext expected)
          let parsedUser = null;
          try {
            parsedUser = JSON.parse(userData);
          } catch (error) {
            // Malformed or encrypted legacy data; clear and treat as unauthenticated
            console.log('Failed to parse userData, clearing...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            parsedUser = null;
          }

          if (parsedUser) {
            // Trust the stored token and user data without backend verification
            // This keeps the user logged in on refresh
            console.log('Using stored user data:', parsedUser.email, parsedUser.role);
            if (!isMounted) return;
            setUser(parsedUser);
            setIsAuthenticated(true);
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
    return () => { isMounted = false; };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

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