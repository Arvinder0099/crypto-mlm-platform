import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  balance: 0,
  transactions: [],
  loading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setBalance, 
  setTransactions, 
  addTransaction, 
  setError, 
  clearError 
} = walletSlice.actions;

export default walletSlice.reducer;