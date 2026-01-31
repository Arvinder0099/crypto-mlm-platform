import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper, Select, FormControl, MenuItem, Link, Card, CardContent, Chip, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { fetchJSON, fetchWithAuth } from '../utils/api';
import { CheckCircle, Star, Info, AccountBalanceWallet, Warning } from '@mui/icons-material';
import OtpDialog from '../components/OtpDialog';

const Activation = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
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
    { id: 'plan1', name: 'STARTER PLAN', investment: 100, dailyEarn: 0.55, duration: 365, totalReturn: 200.75, roi: 200.75, features: ['Investment: 100 USDT', 'Daily Earning: 0.55 USDT', 'Duration: 365 Days', 'Total Return: 200.75 USDT', 'ROI: 200.75%'] },
    { id: 'plan2', name: 'BASIC PLAN', investment: 250, dailyEarn: 1.25, duration: 400, totalReturn: 500, roi: 200, features: ['Investment: 250 USDT', 'Daily Earning: 1.25 USDT', 'Duration: 400 Days', 'Total Return: 500 USDT', 'ROI: 200%'] },
    { id: 'plan3', name: 'BRONZE PLAN', investment: 500, dailyEarn: 2.5, duration: 400, totalReturn: 1000, roi: 200, features: ['Investment: 500 USDT', 'Daily Earning: 2.5 USDT', 'Duration: 400 Days', 'Total Return: 1000 USDT', 'ROI: 200%'] },
    { id: 'plan4', name: 'SILVER PLAN', investment: 1000, dailyEarn: 5, duration: 400, totalReturn: 2000, roi: 200, features: ['Investment: 1000 USDT', 'Daily Earning: 5 USDT', 'Duration: 400 Days', 'Total Return: 2000 USDT', 'ROI: 200%'] },
    { id: 'plan5', name: 'GOLD PLAN', investment: 2000, dailyEarn: 10, duration: 400, totalReturn: 4000, roi: 200, features: ['Investment: 2000 USDT', 'Daily Earning: 10 USDT', 'Duration: 400 Days', 'Total Return: 4000 USDT', 'ROI: 200%'] },
    { id: 'plan6', name: 'PLATINUM PLAN', investment: 5000, dailyEarn: 27.5, duration: 400, totalReturn: 11000, roi: 220, features: ['Investment: 5000 USDT', 'Daily Earning: 27.5 USDT', 'Duration: 400 Days', 'Total Return: 11000 USDT', 'ROI: 220%'] },
    { id: 'plan7', name: 'DIAMOND PLAN', investment: 10000, dailyEarn: 60, duration: 400, totalReturn: 24000, roi: 240, features: ['Investment: 10000 USDT', 'Daily Earning: 60 USDT', 'Duration: 400 Days', 'Total Return: 24000 USDT', 'ROI: 240%'] },
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
          note: p.note,
          features: [
            `Investment: ${p.investment} USDT`,
            `Daily Earning: ${p.dailyEarn} USDT`,
            `Duration: ${p.duration} Days`,
            `Total Return: ${p.totalReturn} USDT`,
            `ROI: ${p.roi}%`,
          ],
        })));
      } else {
        // No plans in database, use defaults
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
      // Use default plans if API fails
      setPlans(defaultPlans);
      
      // Try to get balance from localStorage
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

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleBuyClick = () => {
    if (!selectedPlan) {
      setSnack({ open: true, message: 'Please select a plan', severity: 'error' });
      return;
    }
    if (!form.otp) {
      setSnack({ open: true, message: 'Please verify OTP first', severity: 'error' });
      return;
    }
    if (walletBalance < selectedPlan.investment) {
      setSnack({ open: true, message: `Insufficient balance. You need ${selectedPlan.investment} USDT but have ${walletBalance.toFixed(2)} USDT. Please deposit funds.`, severity: 'error' });
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
        body: JSON.stringify({ planId: selectedPlan.id })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSnack({ 
          open: true, 
          message: `Successfully invested in ${data.investment.planName}! Your daily earning: ${data.investment.dailyReturn} USDT`, 
          severity: 'success' 
        });
        setWalletBalance(data.newBalance);
        setSelectedPlan(null);
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>
          🚀 Activate Investment Plan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select your investment plan and start earning daily returns
        </Typography>
      </Box>

      {/* Wallet Balance Card */}
      <Card sx={{ mb: 4, maxWidth: 400, mx: 'auto', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <AccountBalanceWallet sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Available Balance</Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>${walletBalance.toFixed(2)}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>USDT</Typography>
        </CardContent>
      </Card>

      {/* Plans Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a237e', textAlign: 'center' }}>
          Select Investment Plan
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={plan.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  border: selectedPlan?.id === plan.id ? '3px solid #667eea' : '2px solid #e0e0e0',
                  transition: 'all 0.3s',
                  opacity: walletBalance < plan.investment ? 0.6 : 1,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  }
                }}
                onClick={() => handlePlanSelect(plan)}
              >
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  p: 3, 
                  textAlign: 'center',
                  color: 'white',
                }}>
                  <Star sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                    {plan.investment} USDT
                  </Typography>
                </Box>
                
                <CardContent>
                  {/* Daily Earning Highlight */}
                  <Box sx={{ 
                    bgcolor: '#e8f5e9', 
                    p: 2, 
                    borderRadius: 2, 
                    textAlign: 'center',
                    mb: 2,
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Daily Earning
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#4caf50' }}>
                      {plan.dailyEarn} USDT
                    </Typography>
                  </Box>

                  <List dense>
                    {plan.features?.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircle sx={{ color: '#667eea', fontSize: 18 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2', fontSize: '0.75rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {walletBalance < plan.investment && (
                    <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                      <Typography variant="caption">Insufficient balance</Typography>
                    </Alert>
                  )}

                  {selectedPlan?.id === plan.id && (
                    <Chip 
                      label="Selected" 
                      color="primary" 
                      icon={<CheckCircle />}
                      sx={{ mt: 2, fontWeight: 700, width: '100%' }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Activation Form */}
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
          Complete Activation
        </Typography>
        
        {selectedPlan && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Selected Plan:</strong> {selectedPlan.name} - {selectedPlan.investment} USDT<br />
            <strong>Daily Earning:</strong> {selectedPlan.dailyEarn} USDT | <strong>Duration:</strong> {selectedPlan.duration} days
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              One Time Password * (Required for security)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                value={form.otp}
                placeholder="Enter OTP"
                InputProps={{ readOnly: true }}
                helperText={form.otp ? '✅ OTP Verified' : 'Click Send OTP to receive code'}
              />
              <Button 
                variant="outlined" 
                onClick={handleSendOtp}
                disabled={!!form.otp}
              >
                {form.otp ? 'Verified' : 'Send OTP'}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button 
              variant="contained" 
              fullWidth
              size="large"
              onClick={handleBuyClick}
              disabled={!selectedPlan || !form.otp || submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
              sx={{ 
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
                '&:disabled': {
                  background: '#ccc'
                }
              }}
            >
              {submitting ? 'Processing...' : selectedPlan ? `Invest ${selectedPlan.investment} USDT` : 'Select a Plan First'}
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
