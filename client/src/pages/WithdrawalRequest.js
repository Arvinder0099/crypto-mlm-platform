import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Snackbar, Alert,
  Card, CardContent, CircularProgress, FormControl, InputLabel, Select,
  MenuItem, Divider, Chip
} from '@mui/material';
import { AccountBalanceWallet, Send, Warning } from '@mui/icons-material';
import OtpDialog from '../components/OtpDialog';

const WithdrawalRequest = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [settings, setSettings] = useState({ minWithdrawal: 50, maxWithdrawal: 50000, withdrawalFeePercent: 0 });
  const [form, setForm] = useState({ amount: '', walletAddress: '', selectedAddress: '', otp: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('authToken');
    try {
      // Fetch user profile for balance
      const profileRes = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.user) {
        setUserBalance(profileData.user.balance || 0);
        // Set primary wallet address
        if (profileData.user.walletAddress) {
          setSavedAddresses([{
            address: profileData.user.walletAddress,
            type: profileData.user.walletType || 'usdt_trc20',
            isPrimary: true
          }]);
          setForm(prev => ({ 
            ...prev, 
            selectedAddress: profileData.user.walletAddress, 
            walletAddress: profileData.user.walletAddress 
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (name === 'selectedAddress' && value !== 'custom') {
      setForm(prev => ({ ...prev, walletAddress: value, selectedAddress: value }));
    }
  };

  const handleOtpVerified = (otpValue) => {
    setForm((prev) => ({ ...prev, otp: otpValue }));
    setSnack({ open: true, message: 'OTP verified successfully!', severity: 'success' });
  };

  const calculateCharges = () => {
    const amount = parseFloat(form.amount) || 0;
    return (amount * settings.withdrawalFeePercent) / 100;
  };

  const calculateNetAmount = () => {
    const amount = parseFloat(form.amount) || 0;
    return amount - calculateCharges();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const amount = parseFloat(form.amount);
    
    // Validations
    if (!amount || amount <= 0) {
      setSnack({ open: true, message: 'Please enter a valid amount', severity: 'error' });
      return;
    }
    if (amount < settings.minWithdrawal) {
      setSnack({ open: true, message: `Minimum withdrawal is $${settings.minWithdrawal}`, severity: 'error' });
      return;
    }
    if (amount > settings.maxWithdrawal) {
      setSnack({ open: true, message: `Maximum withdrawal is $${settings.maxWithdrawal}`, severity: 'error' });
      return;
    }
    if (amount > userBalance) {
      setSnack({ open: true, message: 'Insufficient balance', severity: 'error' });
      return;
    }
    if (!form.walletAddress) {
      setSnack({ open: true, message: 'Please enter or select a wallet address', severity: 'error' });
      return;
    }
    if (!form.otp) {
      setSnack({ open: true, message: 'Please verify OTP first', severity: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: form.amount,
          walletAddress: form.walletAddress
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSnack({ 
          open: true, 
          message: `Withdrawal request submitted! Request ID: ${data.requestId}`, 
          severity: 'success' 
        });
        setForm({ amount: '', walletAddress: form.walletAddress, selectedAddress: form.selectedAddress, otp: '' });
        setUserBalance(data.newBalance);
      } else {
        setSnack({ open: true, message: data.message || 'Failed to submit request', severity: 'error' });
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setSnack({ open: true, message: 'Error submitting withdrawal request', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, sm: 2 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        💸 Withdrawal Request
      </Typography>

      {/* Balance Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountBalanceWallet sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Available Balance</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>${userBalance.toFixed(2)} USDT</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Amount */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Withdrawal Amount ($)"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                required
                inputProps={{ min: settings.minWithdrawal, max: Math.min(settings.maxWithdrawal, userBalance) }}
                helperText={`Min: $${settings.minWithdrawal} | Max: $${Math.min(settings.maxWithdrawal, userBalance)}`}
              />
            </Grid>

            {/* Saved Addresses */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Wallet Address</InputLabel>
                <Select
                  name="selectedAddress"
                  value={form.selectedAddress}
                  onChange={handleChange}
                  label="Select Wallet Address"
                >
                  {savedAddresses.map((addr, idx) => (
                    <MenuItem key={idx} value={addr.address}>
                      {addr.type?.toUpperCase()} - {addr.address.slice(0, 10)}...{addr.address.slice(-8)}
                      {addr.isPrimary && <Chip size="small" label="Primary" sx={{ ml: 1 }} />}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Enter Custom Address</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Address Input */}
            {form.selectedAddress === 'custom' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  name="walletAddress"
                  value={form.walletAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter your USDT/BNB wallet address"
                />
              </Grid>
            )}

            {/* Charges Display */}
            {form.amount && parseFloat(form.amount) > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Amount</Typography>
                      <Typography variant="h6">${parseFloat(form.amount).toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Charges ({settings.withdrawalFeePercent}%)</Typography>
                      <Typography variant="h6" color="error.main">-${calculateCharges().toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">You'll Receive</Typography>
                      <Typography variant="h6" color="success.main">${calculateNetAmount().toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* OTP Verification */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <TextField
                  label="OTP Verification"
                  name="otp"
                  value={form.otp}
                  InputProps={{ readOnly: true }}
                  sx={{ flex: 1 }}
                  helperText={form.otp ? '✅ OTP Verified' : 'Click Send OTP to verify'}
                />
                <Button 
                  variant="outlined" 
                  onClick={() => setOtpDialogOpen(true)}
                  disabled={!!form.otp}
                >
                  {form.otp ? 'Verified' : 'Send OTP'}
                </Button>
              </Box>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting || !form.otp}
                startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                sx={{ py: 1.5 }}
              >
                {submitting ? 'Processing...' : 'Submit Withdrawal Request'}
              </Button>
            </Grid>

            {/* Warning */}
            <Grid item xs={12}>
              <Alert severity="info" icon={<Warning />}>
                <Typography variant="body2">
                  • Withdrawals are processed within 24-48 hours<br />
                  • Make sure your wallet address is correct - funds sent to wrong address cannot be recovered<br />
                  • Minimum withdrawal: ${settings.minWithdrawal} | Maximum: ${settings.maxWithdrawal}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>

      <OtpDialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        onVerified={(otp) => handleOtpVerified(otp)}
        title="Withdrawal OTP Verification"
      />
    </Box>
  );
};

export default WithdrawalRequest;