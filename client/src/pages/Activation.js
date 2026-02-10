import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper, Select, FormControl, MenuItem, InputLabel, Card, CardContent, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { fetchJSON, fetchWithAuth } from '../utils/api';
import { Warning, Info } from '@mui/icons-material';
import OtpDialog from '../components/OtpDialog';

const API_BASE = process.env.REACT_APP_API_URL || '';

const Activation = () => {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [activationType, setActivationType] = useState('self');
  const [selectedWallet, setSelectedWallet] = useState('fund');
  const [form, setForm] = useState({ otp: '' });
  const [fundWalletBalance, setFundWalletBalance] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, plan: null });

  useEffect(() => {
    fetchData();
  }, []);

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
    if (!form.otp) {
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
        setSnack({ 
          open: true, 
          message: `Successfully invested in ${data.investment.planName}! Your daily earning: ${data.investment.dailyReturn} USDT`, 
          severity: 'success' 
        });
        setFundWalletBalance(data.newBalance);
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
    <Box sx={{ p: 2, minHeight: '100vh' }}>
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
                onClick={() => setSelectedPlanId(plan.id)}
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
                    }}
                  >
                    {plan.name.includes('INTRODUCTION') ? 'Minimum' : 'Select'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Activation Details Form */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
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
