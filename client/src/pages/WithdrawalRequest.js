import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Snackbar, Alert,
  Card, CardContent, CircularProgress, FormControl, InputLabel, Select,
  MenuItem, Divider, Chip
} from '@mui/material';
import { AccountBalanceWallet, Send, Warning, CheckCircle } from '@mui/icons-material';
import notificationService from '../services/notificationService';

const WithdrawalRequest = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [myWallet, setMyWallet] = useState(0);
  const [fundWallet, setFundWallet] = useState(0);
  const [utilityWallet, setUtilityWallet] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [settings, setSettings] = useState({ minWithdrawal: 50, maxWithdrawal: 50000, withdrawalFeePercent: 0 });
  const [form, setForm] = useState({ amount: '', walletAddress: '', selectedAddress: '', otp: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  // Inline OTP states
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('authToken');
    try {
      // Fetch user profile for balance
      const profileRes = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.user) {
        // Use myWallet as withdrawable balance (server checks myWallet, not total balance)
        const mw = profileData.user.myWallet || 0;
        const fw = profileData.user.fundWallet || 0;
        const uw = profileData.user.utilityWallet || 0;
        setMyWallet(mw);
        setFundWallet(fw);
        setUtilityWallet(uw);
        setUserBalance(mw); // withdrawable = myWallet only
        if (profileData.user.email) setUserEmail(profileData.user.email);
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
    setOtpVerified(true);
    setSnack({ open: true, message: 'OTP verified successfully!', severity: 'success' });
  };

  const handleSendWithdrawOtp = async () => {
    if (!userEmail) { setOtpMessage('Please enter your email'); return; }
    setSendingOtp(true); setOtpMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const resp = await fetch('/api/otp/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await resp.json();
      if (data?.success) { setOtpSent(true); setOtpTimer(60); setOtpMessage(`OTP sent to ${userEmail}`); }
      else { setOtpMessage(data?.message || 'Failed to send OTP'); }
    } catch (e) { setOtpMessage('Network error'); }
    finally { setSendingOtp(false); }
  };

  const handleVerifyWithdrawOtp = async () => {
    if (!otpCode || otpCode.length !== 6) { setOtpMessage('Enter 6-digit OTP'); return; }
    setVerifyingOtp(true);
    try {
      const token = localStorage.getItem('authToken');
      const resp = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ target: userEmail, otp: otpCode, type: 'email' })
      });
      const data = await resp.json();
      if (data?.success) { handleOtpVerified(otpCode); }
      else { setOtpMessage(data?.message || 'Invalid OTP'); }
    } catch (e) { setOtpMessage('Network error'); }
    finally { setVerifyingOtp(false); }
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
        // Send notification
        notificationService.notifyWithdrawal(parseFloat(form.amount) || 0, 'submitted').catch(() => {});
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AccountBalanceWallet sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Withdrawable Balance (My Wallet)</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>${myWallet.toFixed(2)} USDT</Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', mb: 1.5 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Fund Wallet</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>${fundWallet.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Utility Wallet</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>${utilityWallet.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Balance</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>${(myWallet + fundWallet + utilityWallet).toFixed(2)}</Typography>
            </Grid>
          </Grid>
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
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Amount</Typography>
                      <Typography variant="h6">${parseFloat(form.amount).toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Charges ({settings.withdrawalFeePercent}%)</Typography>
                      <Typography variant="h6" color="error.main">-${calculateCharges().toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">You'll Receive</Typography>
                      <Typography variant="h6" color="success.main">${calculateNetAmount().toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* OTP Verification - Inline */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mt: 2, borderRadius: 3, border: `2px solid ${otpVerified ? '#00C853' : '#10b981'}`, bgcolor: otpVerified ? 'rgba(0,200,83,0.05)' : 'rgba(16,185,129,0.05)' }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="subtitle2" fontWeight={700} color={otpVerified ? 'success.main' : 'primary'}>OTP Verification</Typography>
                  {otpVerified && <CheckCircle color="success" sx={{ fontSize: 18 }} />}
                </Box>
                {!otpVerified ? (
                  <Box>
                    <TextField fullWidth size="small" label="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} sx={{ mb: 1 }} />
                    <Button variant="contained" fullWidth size="small" onClick={handleSendWithdrawOtp} disabled={sendingOtp || otpTimer > 0}
                      sx={{ mb: 1, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', fontWeight: 700 }}>
                      {sendingOtp ? 'Sending...' : otpTimer > 0 ? `Resend ${otpTimer}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </Button>
                    {otpMessage && <Alert severity={otpSent ? 'success' : 'warning'} sx={{ mb: 1, py: 0 }}>{otpMessage}</Alert>}
                    {otpSent && (
                      <Box display="flex" gap={1}>
                        <input type="tel" inputMode="numeric" placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} maxLength={6} autoFocus
                          style={{ flex: 1, minWidth: 0, padding: '10px 8px', fontSize: '20px', fontWeight: 800, textAlign: 'center', letterSpacing: '6px', border: '2px solid #10b981', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                        <Button variant="contained" onClick={handleVerifyWithdrawOtp} disabled={verifyingOtp || otpCode.length !== 6}
                          sx={{ minWidth: 80, background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)', fontWeight: 700 }}>
                          {verifyingOtp ? <CircularProgress size={18} color="inherit" /> : 'Verify'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity="success" sx={{ py: 0 }}>OTP verified</Alert>
                )}
              </Paper>
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

    </Box>
  );
};

export default WithdrawalRequest;