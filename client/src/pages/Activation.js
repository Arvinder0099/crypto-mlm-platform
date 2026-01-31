import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper, Select, FormControl, MenuItem, InputLabel, Card, CardContent, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { fetchJSON } from '../utils/api';
import { Warning } from '@mui/icons-material';
import OtpDialog from '../components/OtpDialog';

const Activation = () => {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [activationType, setActivationType] = useState('self');
  const [selectedWallet, setSelectedWallet] = useState('fund');
  const [form, setForm] = useState({ otp: '' });
  const [walletBalance, setWalletBalance] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, plan: null });

  useEffect(() => {
    fetchData();
  }, []);

  // Default plans to show when API has no data
  const defaultPlans = [
    { id: 'plan1', name: 'STARTER PLAN', investment: 100, dailyEarn: 0.55, duration: 365, totalReturn: 200.75, roi: 200.75 },
    { id: 'plan2', name: 'BASIC PLAN', investment: 250, dailyEarn: 1.25, duration: 400, totalReturn: 500, roi: 200 },
    { id: 'plan3', name: 'BRONZE PLAN', investment: 500, dailyEarn: 2.5, duration: 400, totalReturn: 1000, roi: 200 },
    { id: 'plan4', name: 'SILVER PLAN', investment: 1000, dailyEarn: 5, duration: 400, totalReturn: 2000, roi: 200 },
    { id: 'plan5', name: 'GOLD PLAN', investment: 2000, dailyEarn: 10, duration: 400, totalReturn: 4000, roi: 200 },
    { id: 'plan6', name: 'PLATINUM PLAN', investment: 5000, dailyEarn: 27.5, duration: 400, totalReturn: 11000, roi: 220 },
    { id: 'plan7', name: 'DIAMOND PLAN', investment: 10000, dailyEarn: 60, duration: 400, totalReturn: 24000, roi: 240 },
  ];

  const fetchData = async () => {
    try {
      // Fetch plans from API
      const plansRes = await fetchJSON('/api/plans');
      if (plansRes.plans && plansRes.plans.length > 0) {
        setPlans(plansRes.plans.map(p => ({
          id: p._id,
          name: p.name,
          investment: p.investment,
          dailyEarn: p.dailyEarn,
          duration: p.duration,
          totalReturn: p.totalReturn,
          roi: p.roi,
        })));
      } else {
        setPlans(defaultPlans);
      }

      // Fetch wallet balance
      const token = localStorage.getItem('authToken');
      const profileRes = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.user) {
        setWalletBalance(profileData.user.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setPlans(defaultPlans);
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setWalletBalance(userData.balance || 0);
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
    if (!form.otp) {
      setSnack({ open: true, message: 'Please verify OTP first', severity: 'error' });
      return;
    }
    if (walletBalance < selectedPlan.investment) {
      setSnack({ open: true, message: `Insufficient balance. You need ${selectedPlan.investment} USDT but have ${walletBalance.toFixed(2)} USDT.`, severity: 'error' });
      return;
    }
    setConfirmDialog({ open: true, plan: selectedPlan });
  };

  const handleConfirmPurchase = async () => {
    setConfirmDialog({ open: false, plan: null });
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/plans/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planId: selectedPlanId })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSnack({ 
          open: true, 
          message: `Successfully invested in ${data.investment.planName}! Your daily earning: ${data.investment.dailyReturn} USDT`, 
          severity: 'success' 
        });
        setWalletBalance(data.newBalance);
        setSelectedPlanId('');
        setForm({ otp: '' });
      } else {
        setSnack({ open: true, message: data.message || 'Failed to purchase plan', severity: 'error' });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setSnack({ open: true, message: 'Error processing purchase', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = () => {
    setOtpDialogOpen(true);
  };

  const handleOtpVerified = (otpValue) => {
    setForm((prev) => ({ ...prev, otp: otpValue }));
    setSnack({ open: true, message: 'OTP verified successfully!', severity: 'success' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
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
                  border: selectedPlanId === plan.id ? '3px solid #4caf50' : '1px solid #e0e0e0',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                {/* Daily Earning Header - Green */}
                <Box sx={{ 
                  bgcolor: '#4caf50', 
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
                    <Typography variant="caption" color="text.secondary">Daily Earning</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {plan.dailyEarn} USDT
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
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">ROI</Typography>
                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                      {plan.roi}%
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
                    }}
                  >
                    {plan.name.includes('STARTER') ? 'Minimum' : 'Select'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Activation Details Form */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#333' }}>
          Activation Details
        </Typography>

        <Grid container spacing={3}>
          {/* Activation For */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Activation For</InputLabel>
              <Select
                value={activationType}
                label="Activation For"
                onChange={(e) => setActivationType(e.target.value)}
              >
                <MenuItem value="self">Self Activation</MenuItem>
                <MenuItem value="downline">Downline Activation</MenuItem>
              </Select>
            </FormControl>
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

          {/* Wallet Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Wallet</InputLabel>
              <Select
                value={selectedWallet}
                label="Wallet"
                onChange={(e) => setSelectedWallet(e.target.value)}
              >
                <MenuItem value="fund">Fund Wallet</MenuItem>
                <MenuItem value="income">Income Wallet</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Wallet Balance Display */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Wallet Balance"
              value={`$ ${walletBalance.toFixed(2)}`}
              InputProps={{ readOnly: true }}
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontWeight: 600,
                  color: '#4caf50',
                  fontSize: '1.1rem'
                }
              }}
            />
          </Grid>

          {/* OTP Field */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="One Time Password"
                value={form.otp}
                placeholder="Enter OTP"
                InputProps={{ readOnly: true }}
                helperText={form.otp ? '✅ OTP Verified' : 'Click Send OTP to verify'}
              />
              <Button 
                variant="contained" 
                onClick={handleSendOtp}
                disabled={!!form.otp}
                sx={{ 
                  minWidth: 120,
                  bgcolor: form.otp ? '#4caf50' : '#1976d2'
                }}
              >
                {form.otp ? 'Verified' : 'Send OTP'}
              </Button>
            </Box>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              fullWidth
              size="large"
              onClick={handleBuyClick}
              disabled={!selectedPlanId || !form.otp || submitting}
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

      <OtpDialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        onVerified={(otp) => handleOtpVerified(otp)}
        title="Activation OTP Verification"
      />
    </Box>
  );
};

export default Activation;
