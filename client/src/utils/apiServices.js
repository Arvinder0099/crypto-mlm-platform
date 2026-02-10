/**
 * Authentication API Service
 * Handles all auth-related API calls
 */

import { fetchJSON, fetchWithAuth } from './api';

const API_BASE = process.env.REACT_APP_API_URL || '';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    return fetchJSON(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (email, password) => {
    return fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Verify token
  verify: async () => {
    return fetchWithAuth(`${API_BASE}/auth/verify`);
  },
};

// User API Service
export const userAPI = {
  // Get profile
  getProfile: async () => {
    return fetchWithAuth(`${API_BASE}/user/profile`);
  },

  // Update profile
  updateProfile: async (userData) => {
    return fetchWithAuth(`${API_BASE}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Change password
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    return fetchWithAuth(`${API_BASE}/user/change-password`, {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
    });
  },

  // Get dashboard data
  getDashboard: async () => {
    return fetchWithAuth(`${API_BASE}/user/dashboard`);
  },
};

// Plans API Service
export const plansAPI = {
  // Get all plans
  getAll: async () => {
    return fetchWithAuth(`${API_BASE}/plans`);
  },

  // Get single plan
  getById: async (id) => {
    return fetchWithAuth(`${API_BASE}/plans/${id}`);
  },

  // Create plan (Admin)
  create: async (planData) => {
    return fetchWithAuth(`${API_BASE}/plans`, {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  // Update plan (Admin)
  update: async (id, planData) => {
    return fetchWithAuth(`${API_BASE}/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  },

  // Delete plan (Admin)
  delete: async (id) => {
    return fetchWithAuth(`${API_BASE}/plans/${id}`, {
      method: 'DELETE',
    });
  },
};

// Investments API Service
export const investmentsAPI = {
  // Create investment (purchase plan)
  create: async (investmentData) => {
    return fetchWithAuth(`${API_BASE}/investments`, {
      method: 'POST',
      body: JSON.stringify(investmentData),
    });
  },

  // Get user investments
  getAll: async () => {
    return fetchWithAuth(`${API_BASE}/investments`);
  },

  // Get single investment
  getById: async (id) => {
    return fetchWithAuth(`${API_BASE}/investments/${id}`);
  },
};

// Wallet API Service
export const walletAPI = {
  // Get balance
  getBalance: async () => {
    return fetchWithAuth(`${API_BASE}/wallet/balance`);
  },

  // Deposit
  deposit: async (amount, description) => {
    return fetchWithAuth(`${API_BASE}/wallet/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  },
};

// Withdrawal API Service
export const withdrawalAPI = {
  // Create withdrawal request
  create: async (withdrawalData) => {
    return fetchWithAuth(`${API_BASE}/withdrawals`, {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    });
  },

  // Get withdrawal requests
  getAll: async () => {
    return fetchWithAuth(`${API_BASE}/withdrawals`);
  },

  // Approve withdrawal (Admin)
  approve: async (id, transactionHash) => {
    return fetchWithAuth(`${API_BASE}/withdrawals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ transactionHash }),
    });
  },

  // Reject withdrawal (Admin)
  reject: async (id, rejectionReason) => {
    return fetchWithAuth(`${API_BASE}/withdrawals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  },
};

// Transactions API Service
export const transactionsAPI = {
  // Get transactions
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString 
      ? `${API_BASE}/transactions?${queryString}`
      : `${API_BASE}/transactions`;
    return fetchWithAuth(url);
  },
};

// Reports API Service
export const reportsAPI = {
  // Daily income report
  getDailyIncome: async () => {
    return fetchWithAuth(`${API_BASE}/reports/daily-income`);
  },

  // Direct income report
  getDirectIncome: async () => {
    return fetchWithAuth(`${API_BASE}/reports/direct-income`);
  },

  // Downline report
  getDownline: async () => {
    return fetchWithAuth(`${API_BASE}/reports/downline`);
  },
};

// Admin API Service
export const adminAPI = {
  // Get all users
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString 
      ? `${API_BASE}/admin/users?${queryString}`
      : `${API_BASE}/admin/users`;
    return fetchWithAuth(url);
  },

  // Get pending withdrawals
  getWithdrawals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString 
      ? `${API_BASE}/admin/withdrawals?${queryString}`
      : `${API_BASE}/admin/withdrawals`;
    return fetchWithAuth(url);
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    return fetchWithAuth(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get settings
  getSettings: async () => {
    return fetchWithAuth(`${API_BASE}/admin/settings`);
  },

  // Update settings
  updateSettings: async (settings) => {
    return fetchWithAuth(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};
