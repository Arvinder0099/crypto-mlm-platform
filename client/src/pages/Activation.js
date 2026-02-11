import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper, Select, FormControl, MenuItem, InputLabel, Card, CardContent, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, alpha } from '@mui/material';
import { fetchJSON } from '../utils/api';
import { Warning, Info, Email, Send, Verified, CheckCircle } from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_URL || '';

const Activation = () => {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [fundWalletBalance, setFundWalletBalance] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, plan: null });
  const [activatedInvestment, setActivatedInvestment] = useState(null); // tracks successful activation
  
  // Inline OTP states
  const [userEmail, setUserEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const formRef = useRef(null);

  useEffect(() => {
    fetchData();
    // Auto-fetch user email
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch(`${API_BASE}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (data?.user?.email) setUserEmail(data.user.email); })
        .catch(() => {});
    }
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // 6 Plans: Introduction, Basic, Bronze, Silver, Gold, Platinum
  const defaultPlans = [
    { id: 'plan1', name: 'INTRODUCTION PLAN', investment: 100, dailyEarn: 0.55, duration: 365, totalReturn: 200.75, roi: 200.75, minWithdraw: '10 USDT' },
    { id: 'plan2', name: 'BASIC PLAN', investment: 250, dailyEarn: 1.25, duration: 400, totalReturn: 500, roi: 200, minWithdraw: '50 USDT' },
    { id: 'plan3', name: 'BRONZE PLAN', investment: 500, dailyEarn: 2.5, duration: 400, totalReturn: 1000, roi: 200, minWithdraw: '50 USDT' },
    { id: 'plan4', name: 'SILVER PLAN', investment: 1000, dailyEarn: 5, duration: 400, totalReturn: 2000, roi: 200, minWithdraw: '50 USDT' },
    { id: 'plan5', name: 'GOLD PLAN', investment: 2000, dailyEarn: 10, duration: 400, totalReturn: 4000, roi: 200, minWithdraw: '50 USDT' },
    { id: 'plan6', name: 'PLATINUM PLAN', investment: 5000, dailyEarn: 40, duration: 400, totalReturn: 16000, roi: 320, minWithdraw: 'Coming Soon' },
  ];

  const fetchData = async () => {
    try {
      // Fetch plans from API
      const plansRes = await fetchJSON('/api/plans');
      if (plansRes.plans && plansRes.plans.length > 0) {
        // Map API plans with minWithdraw based on plan name
        const getMinWithdraw = (name) => {
          if (name.toUpperCase().includes('INTRODUCTION')) return '10 USDT';
          if (name.toUpperCase().includes('PLATINUM')) return 'Coming Soon';
          return '50 USDT';
        };
        const mappedPlans = plansRes.plans.map(p => ({
          id: p._id,
          name: p.name,
          investment: p.investment,
          dailyEarn: p.dailyEarn,
          duration: p.duration,
          totalReturn: p.totalReturn,
          roi: p.roi,
          minWithdraw: getMinWithdraw(p.name),
        }));
        // Show all plans including Platinum
        setPlans(mappedPlans);
      } else {
        setPlans(defaultPlans);
      }

      // Fetch Fund Wallet balance
      const token = localStorage.getItem('authToken');
      const walletsRes = await fetch(`${API_BASE}/api/user/wallets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const walletsData = await walletsRes.json();
      if (walletsData) {
        setFundWalletBalance(walletsData.fundWallet || 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setPlans(defaultPlans);
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setFundWalletBalance(userData.fundWallet || 0);
      } catch (e) {
        console.error('Could not get user balance', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleBuyClick = () => {
    if (!selectedPlanId) {
      setSnack({ open: true, message: 'Please select an investment plan', severity: 'error' });
      return;
    }
    if (!otpVerified) {
      setSnack({ open: true, message: 'Please verify OTP first', severity: 'error' });
      return;
    }
    if (fundWalletBalance < selectedPlan.investment) {
      setSnack({ open: true, message: `Insufficient Fund Wallet balance. You need ${selectedPlan.investment} USDT but have ${fundWalletBalance.toFixed(2)} USDT. Please deposit or transfer funds.`, severity: 'error' });
      return;
    }
    setConfirmDialog({ open: true, plan: selectedPlan });
  };

  const handleConfirmPurchase = async () => {
    setConfirmDialog({ open: false, plan: null });
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/plans/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planId: selectedPlanId })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Save the activated investment details for display
        setActivatedInvestment({
          planName: data.investment.planName,
          amount: data.investment.amount,
          dailyReturn: data.investment.dailyReturn,
          duration: data.investment.duration,
          expectedReturn: data.investment.expectedReturn,
          startDate: data.investment.startDate,
          endDate: data.investment.endDate,
        });
        setFundWalletBalance(data.newBalance);
        setSnack({ 
          open: true, 
          message: `Successfully invested in ${data.investment.planName}! Your daily earning: ${data.investment.dailyReturn} USDT`, 
          severity: 'success' 
        });
        // Reset form
        setSelectedPlanId('');
        setOtpVerified(false);
        setOtpCode('');
        setOtpSent(false);
        setOtpMessage('');
      } else {
        setSnack({ open: true, message: data.message || 'Failed to purchase plan', severity: 'error' });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setSnack({ open: true, message: 'Error processing purchase. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!userEmail) {
      setOtpMessage('Please enter your email address');
      return;
    }
    setSendingOtp(true);
    setOtpMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`${API_BASE}/api/otp/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await resp.json();
      if (data?.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setOtpMessage(`OTP sent to ${userEmail}`);
        setSnack({ open: true, message: `OTP sent to ${userEmail}`, severity: 'success' });
      } else {
        setOtpMessage(data?.message || 'Failed to send OTP');
      }
    } catch (error) {
      setOtpMessage('Network error. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpMessage('Enter the complete 6-digit OTP');
      return;
    }
    setVerifyingOtp(true);
    try {
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`${API_BASE}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ target: userEmail, otp: otpCode, type: 'email' })
      });
      const data = await resp.json();
      if (data?.success) {
        setOtpVerified(true);
        setOtpMessage('');
        setSnack({ open: true, message: 'OTP verified successfully!', severity: 'success' });
      } else {
        setOtpMessage(data?.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setOtpMessage('Network error. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: '100vh', width: '100%', minWidth: 0 }}>
      {/* Plan Cards - Horizontal Scroll */}
      <Box sx={{ mb: 3, overflowX: 'auto', pb: 2 }}>
        <Grid container spacing={2} sx={{ flexWrap: 'nowrap', minWidth: 'max-content' }}>
          {plans.map((plan) => (
            <Grid item key={plan.id} sx={{ minWidth: 180 }}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedPlanId === plan.id ? '3px solid #10b981' : '1px solid #e2e8f0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.15)' }
                }}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  // Auto-scroll to form
                  setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                }}
              >
                {/* Plan Name Header - Green */}
                <Box sx={{ 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  py: 1, 
                  px: 1, 
                  textAlign: 'center' 
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                    {plan.name}
                  </Typography>
                </Box>

                {/* Daily Earning - Light Green */}
                <Box sx={{ 
                  backgroundColor: '#34d399', 
                  color: 'white', 
                  py: 1.5, 
                  px: 2, 
                  textAlign: 'center' 
                }}>
                  <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                    Daily Earning
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {plan.dailyEarn}
                  </Typography>
                  <Typography variant="caption">USDT</Typography>
                </Box>

                {/* Plan Details - White */}
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Investment</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {plan.investment} USDT
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                    <Typography variant="body2">
                      {plan.duration} Days
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Total Return</Typography>
                    <Typography variant="body2">
                      {plan.totalReturn} USDT
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">ROI</Typography>
                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                      {plan.roi}%
                    </Typography>
                  </Box>
                  
                  {/* Info Icon with Minimum Withdraw */}
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title={`Minimum Withdraw: ${plan.minWithdraw}`} arrow>
                      <Info sx={{ fontSize: 16, color: '#1976d2', cursor: 'pointer' }} />
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Min Withdraw: {plan.minWithdraw}
                    </Typography>
                  </Box>

                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth
                    sx={{ 
                      bgcolor: '#ff9800', 
                      color: 'white',
                      '&:hover': { bgcolor: '#f57c00' },
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanId(plan.id);
                      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                    }}
                  >
                    {selectedPlanId === plan.id ? '✓ Selected' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Activation Details Form */}
      <Paper ref={formRef} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
          Activation Details
        </Typography>

        <Grid container spacing={3}>
          {/* Activation For - Read Only */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Activation For"
              value="Self Activation"
              InputProps={{ 
                readOnly: true,
                sx: { fontWeight: 500 }
              }}
              helperText="Only self activation is currently available"
            />
          </Grid>

          {/* Investment Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Investment</InputLabel>
              <Select
                value={selectedPlanId}
                label="Investment"
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                <MenuItem value="">Select Investment Plan</MenuItem>
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    ${plan.investment} - {plan.name} (Daily: {plan.dailyEarn} USDT)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Fund Wallet Balance Display */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Fund Wallet"
              value={`$ ${fundWalletBalance.toFixed(2)}`}
              InputProps={{ readOnly: true }}
              helperText="Only Fund Wallet balance can be used to activate plans"
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontWeight: 600,
                  color: '#4caf50',
                  fontSize: '1.1rem'
                }
              }}
            />
          </Grid>

          {/* OTP Verification - Inline */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2.5 },
                borderRadius: 3,
                border: `2px solid ${otpVerified ? '#00C853' : '#10b981'}`,
                bgcolor: otpVerified ? alpha('#00C853', 0.05) : alpha('#10b981', 0.05),
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email sx={{ color: otpVerified ? '#00C853' : '#10b981' }} />
                  <Typography variant="subtitle1" fontWeight={700} color={otpVerified ? 'success.main' : 'primary'}>
                    OTP Verification
                  </Typography>
                </Box>
                {otpVerified && (
                  <Chip icon={<Verified sx={{ fontSize: 16 }} />} label="VERIFIED" color="success" size="small" sx={{ fontWeight: 700 }} />
                )}
              </Box>

              {!otpVerified ? (
                <Box>
                  {/* Email field */}
                  <TextField
                    fullWidth
                    size="small"
                    label="Email Address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Send OTP Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={sendingOtp ? <CircularProgress size={18} color="inherit" /> : <Send />}
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpTimer > 0}
                    sx={{
                      py: 1.2,
                      mb: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      fontWeight: 700,
                      '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
                    }}
                  >
                    {sendingOtp ? 'Sending...' : otpTimer > 0 ? `Resend in ${otpTimer}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </Button>

                  {/* OTP Message */}
                  {otpMessage && (
                    <Alert severity={otpSent ? 'success' : 'warning'} sx={{ mb: 2, borderRadius: 2 }}>
                      {otpMessage}
                    </Alert>
                  )}

                  {/* OTP Code Input - always visible after sent */}
                  {otpSent && (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Enter the 6-digit code sent to your email
                      </Typography>
                      <Box display="flex" gap={1} mb={1}>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          maxLength={6}
                          autoFocus
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '12px 8px',
                            fontSize: '22px',
                            fontWeight: 800,
                            textAlign: 'center',
                            letterSpacing: '6px',
                            border: '2px solid #10b981',
                            borderRadius: '8px',
                            outline: 'none',
                            backgroundColor: '#ffffff',
                            color: '#065f46',
                            boxSizing: 'border-box',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.2)'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = 'none'; }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otpCode.length !== 6}
                          sx={{
                            minWidth: 90,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                            fontWeight: 700,
                            '&:hover': { background: 'linear-gradient(135deg, #00A846 0%, #00C853 100%)' },
                          }}
                        >
                          {verifyingOtp ? <CircularProgress size={20} color="inherit" /> : 'Verify'}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  OTP has been verified successfully. You can now activate your plan.
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              fullWidth
              size="large"
              onClick={handleBuyClick}
              disabled={!selectedPlanId || !otpVerified || submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                py: 1.5,
                fontSize: '1rem',
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#388e3c' },
                '&:disabled': { bgcolor: '#ccc' },
                borderRadius: 2
              }}
            >
              {submitting ? 'Processing...' : selectedPlan ? `Activate ${selectedPlan.name} - $${selectedPlan.investment}` : 'Select a Plan to Activate'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Success - Activated Investment Display */}
      {activatedInvestment && (
        <Paper sx={{ p: 3, borderRadius: 3, mt: 3, border: '2px solid #4caf50', bgcolor: alpha('#4caf50', 0.05) }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <CheckCircle sx={{ color: '#4caf50', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
              Investment Activated Successfully!
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Plan</Typography>
              <Typography variant="body1" fontWeight={600}>{activatedInvestment.planName}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Amount Invested</Typography>
              <Typography variant="body1" fontWeight={600}>${activatedInvestment.amount} USDT</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Daily Earning</Typography>
              <Typography variant="body1" fontWeight={600} color="success.main">${activatedInvestment.dailyReturn} USDT</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Fund Wallet Balance</Typography>
              <Typography variant="body1" fontWeight={600} color={fundWalletBalance > 0 ? 'success.main' : 'error.main'}>${fundWalletBalance.toFixed(2)} USDT</Typography>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            Your daily earnings of ${activatedInvestment.dailyReturn} USDT will be credited to your My Wallet automatically.
            Duration: {activatedInvestment.duration} days | Expected Return: ${activatedInvestment.expectedReturn} USDT
          </Alert>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => setActivatedInvestment(null)}
          >
            Activate Another Plan
          </Button>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, plan: null })}>
        <DialogTitle>Confirm Investment</DialogTitle>
        <DialogContent>
          {confirmDialog.plan && (
            <Box>
              <Typography variant="body1" gutterBottom>
                You are about to invest in:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
                <Typography variant="h6" color="primary">{confirmDialog.plan.name}</Typography>
                <Typography>Investment: <strong>{confirmDialog.plan.investment} USDT</strong></Typography>
                <Typography>Daily Earning: <strong>{confirmDialog.plan.dailyEarn} USDT</strong></Typography>
                <Typography>Duration: <strong>{confirmDialog.plan.duration} Days</strong></Typography>
                <Typography>Total Return: <strong>{confirmDialog.plan.totalReturn} USDT</strong></Typography>
              </Paper>
              <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
                <Typography variant="body2">
                  ${confirmDialog.plan.investment} will be deducted from your wallet.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, plan: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmPurchase} color="primary">
            Confirm Investment
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Activation;
