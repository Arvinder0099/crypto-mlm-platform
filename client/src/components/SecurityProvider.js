import React, { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

const SecurityProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  // Encryption key (in production, this should be from environment variables)
  const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-change-in-production';

  // Session management
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    
    if (token && storedUserData) {
      try {
        // First attempt: decrypt then parse
        const maybeDecrypted = decryptData(storedUserData);
        const userData = JSON.parse(maybeDecrypted);
        setUser(userData);
        setIsAuthenticated(true);
        setTwoFactorEnabled(userData.twoFactorEnabled || false);
        const timeout = setTimeout(() => { logout(); }, 30 * 60 * 1000);
        setSessionTimeout(timeout);
      } catch (decryptErr) {
        try {
          // Fallback: data might already be plaintext JSON
          const userData = JSON.parse(storedUserData);
          setUser(userData);
          setIsAuthenticated(true);
          setTwoFactorEnabled(userData.twoFactorEnabled || false);
          const timeout = setTimeout(() => { logout(); }, 30 * 60 * 1000);
          setSessionTimeout(timeout);
        } catch (parseErr) {
          console.warn('Failed to read userData from storage, clearing to recover:', { decryptErr, parseErr });
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setUser(null);
          setIsAuthenticated(false);
          setTwoFactorEnabled(false);
        }
      }
    }

    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, []);

  // Encryption functions
  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  };

  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const utf8 = bytes.toString(CryptoJS.enc.Utf8);
      // If decryption failed, utf8 will be empty string; treat as error
      if (!utf8) throw new Error('Invalid UTF-8 or wrong key');
      return utf8;
    } catch (e) {
      // Return null to allow caller to try fallback
      return null;
    }
  };

  // Audit logging
  const logActivity = (action, details = {}) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      action,
      details,
      ipAddress: '127.0.0.1', // In production, get real IP
      userAgent: navigator.userAgent,
    };

    setAuditLogs(prev => [...prev, logEntry]);
    
    // In production, send to backend
    console.log('Audit Log:', logEntry);
  };

  // Authentication functions
  const login = async (credentials, twoFactorCode = null) => {
    try {
      logActivity('LOGIN_ATTEMPT', { email: credentials.email });

      // Simulate API call
      const response = await simulateLogin(credentials, twoFactorCode);
      
      if (response.success) {
        const userData = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          twoFactorEnabled: response.user.twoFactorEnabled,
          kycStatus: response.user.kycStatus,
          lastLogin: new Date().toISOString(),
        };

        // Encrypt and store user data
        const encryptedUserData = encryptData(JSON.stringify(userData));
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', encryptedUserData);

        setUser(userData);
        setIsAuthenticated(true);
        setTwoFactorEnabled(userData.twoFactorEnabled);

        logActivity('LOGIN_SUCCESS', { userId: userData.id });

        // Set session timeout
        const timeout = setTimeout(() => {
          logout();
        }, 30 * 60 * 1000);
        setSessionTimeout(timeout);

        return { success: true };
      } else {
        logActivity('LOGIN_FAILED', { email: credentials.email, reason: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      logActivity('LOGIN_ERROR', { error: error.message });
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    logActivity('LOGOUT', { userId: user?.id });
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setTwoFactorEnabled(false);
    
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  };

  // Two-Factor Authentication
  const enableTwoFactor = async () => {
    try {
      // Simulate API call to enable 2FA
      const response = await simulateEnable2FA();
      
      if (response.success) {
        setTwoFactorEnabled(true);
        logActivity('2FA_ENABLED', { userId: user.id });
        
        // Update stored user data
        const updatedUser = { ...user, twoFactorEnabled: true };
        const encryptedUserData = encryptData(JSON.stringify(updatedUser));
        localStorage.setItem('userData', encryptedUserData);
        setUser(updatedUser);
        
        return { success: true, qrCode: response.qrCode, backupCodes: response.backupCodes };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      logActivity('2FA_ENABLE_ERROR', { error: error.message });
      return { success: false, message: 'Failed to enable 2FA' };
    }
  };

  const disableTwoFactor = async (password) => {
    try {
      const response = await simulateDisable2FA(password);
      
      if (response.success) {
        setTwoFactorEnabled(false);
        logActivity('2FA_DISABLED', { userId: user.id });
        
        const updatedUser = { ...user, twoFactorEnabled: false };
        const encryptedUserData = encryptData(JSON.stringify(updatedUser));
        localStorage.setItem('userData', encryptedUserData);
        setUser(updatedUser);
        
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      logActivity('2FA_DISABLE_ERROR', { error: error.message });
      return { success: false, message: 'Failed to disable 2FA' };
    }
  };

  // Password security
  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    return {
      score,
      isValid: score >= 4,
      feedback: {
        length: password.length >= minLength,
        uppercase: hasUpperCase,
        lowercase: hasLowerCase,
        numbers: hasNumbers,
        special: hasSpecialChar,
      },
    };
  };

  // Simulate API calls (replace with real API calls in production)
  const simulateLogin = async (credentials, twoFactorCode) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'admin@example.com' && credentials.password === 'password123') {
      if (twoFactorCode && twoFactorCode !== '123456') {
        return { success: false, message: 'Invalid 2FA code' };
      }
      
      return {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: credentials.email,
          name: 'Admin User',
          role: 'admin',
          twoFactorEnabled: true,
          kycStatus: 'approved',
        },
      };
    }
    
    return { success: false, message: 'Invalid credentials' };
  };

  const simulateEnable2FA = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      qrCode: 'data:image/png;base64,mock-qr-code',
      backupCodes: ['123456', '789012', '345678', '901234', '567890'],
    };
  };

  const simulateDisable2FA = async (password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (password === 'password123') {
      return { success: true };
    }
    return { success: false, message: 'Invalid password' };
  };

  const value = {
    user,
    isAuthenticated,
    twoFactorEnabled,
    auditLogs,
    login,
    logout,
    enableTwoFactor,
    disableTwoFactor,
    validatePasswordStrength,
    encryptData,
    decryptData,
    logActivity,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;