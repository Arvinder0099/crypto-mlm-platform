import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper, Select, FormControl, MenuItem, Link, Card, CardContent, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { fetchJSON } from '../utils/api';
import { CheckCircle, Star, Info } from '@mui/icons-material';
import OtpDialog from '../components/OtpDialog';

const Activation = () => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [form, setForm] = useState({ otp: '' });
  const [walletBalance, setWalletBalance] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  const plans = [
    {
      id: 1,
      name: 'INTRODUCTION PLAN',
      investment: '100 USDT',
      dailyEarn: '0.55 USDT',
      duration: 365,
      totalReturn: '200.75 USDT',
      note: 'Minimum withdrawal: 10 USDT',
      features: [
        'Investment: 100 USDT',
        'Daily Earning: 0.55 USDT',
        'Duration: 365 Days',
        'Total Return: 200.75 USDT',
        'ROI: 200.75%',
      ],
    },
    {
      id: 2,
      name: 'BASIC PLAN',
      investment: '250 USDT',
      dailyEarn: '1.25 USDT',
      duration: 400,
      totalReturn: '500 USDT',
      note: 'Minimum withdrawal: 50 USDT',
      features: [
        'Investment: 250 USDT',
        'Daily Earning: 1.25 USDT',
        'Duration: 400 Days',
        'Total Return: 500 USDT',
        'ROI: 200%',
      ],
    },
    {
      id: 3,
      name: 'BRONZE PLAN',
      investment: '500 USDT',
      dailyEarn: '2.5 USDT',
      duration: 400,
      totalReturn: '1000 USDT',
      note: 'Minimum withdrawal: 50 USDT',
      features: [
        'Investment: 500 USDT',
        'Daily Earning: 2.5 USDT',
        'Duration: 400 Days',
        'Total Return: 1000 USDT',
        'ROI: 200%',
      ],
    },
    {
      id: 4,
      name: 'SILVER PLAN',
      investment: '1000 USDT',
      dailyEarn: '5 USDT',
      duration: 400,
      totalReturn: '2000 USDT',
      note: 'Minimum withdrawal: 50 USDT',
      features: [
        'Investment: 1000 USDT',
        'Daily Earning: 5 USDT',
        'Duration: 400 Days',
        'Total Return: 2000 USDT',
        'ROI: 200%',
      ],
    },
    {
      id: 5,
      name: 'GOLD PLAN',
      investment: '2000 USDT',
      dailyEarn: '10 USDT',
      duration: 400,
      totalReturn: '4000 USDT',
      note: 'Minimum withdrawal: 50 USDT',
      features: [
        'Investment: 2000 USDT',
        'Daily Earning: 10 USDT',
        'Duration: 400 Days',
        'Total Return: 4000 USDT',
        'ROI: 200%',
      ],
    },
    {
      id: 6,
      name: 'PLATINUM PLAN',
      investment: '5000 USDT',
      dailyEarn: '40 USDT',
      duration: 400,
      totalReturn: '16000 USDT',
      note: 'COMING SOON',
      features: [
        'Investment: 5000 USDT',
        'Daily Earning: 40 USDT',
        'Duration: 400 Days',
        'Total Return: 16000 USDT',
        'ROI: 320%',
      ],
    },
  ];

  useEffect(() => {
    let mounted = true;
    fetchJSON('/api/dashboard/wallet')
      .then((res) => {
        const data = res?.data || res;
        if (!mounted) return;
        const total = typeof data?.totalUsdValue === 'number' ? data.totalUsdValue : 0;
        setWalletBalance(total);
      })
      .catch(() => setWalletBalance(0));
    return () => { mounted = false; };
  }, []);

  const handleSubmit = () => {
    if (!selectedPlan || !form.otp) {
      setSnack({ open: true, message: 'Please select a plan and enter OTP', severity: 'error' });
      return;
    }
    setSnack({ open: true, message: 'Activation submitted successfully', severity: 'success' });
  };

  const handleSendOtp = () => {
    setOtpDialogOpen(true);
  };

  const handleOtpVerified = (otpValue) => {
    setForm((prev) => ({ ...prev, otp: otpValue }));
    setSnack({ open: true, message: 'OTP verified', severity: 'success' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>
          Activate Member
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select your investment plan and activate your account
        </Typography>
      </Box>

      {/* Plans Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
          Select Investment Plan
        </Typography>
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={plan.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  border: selectedPlan === plan.id ? '3px solid #667eea' : '2px solid #e0e0e0',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  }
                }}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  p: 3, 
                  textAlign: 'center',
                  color: 'white',
                }}>
                  <Star sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {plan.name}
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
                      {plan.dailyEarn}
                    </Typography>
                  </Box>

                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ color: '#667eea', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {plan.note && (
                    <Alert 
                      severity="info" 
                      icon={<Info />}
                      sx={{ mt: 2, fontSize: '0.875rem' }}
                    >
                      {plan.note}
                    </Alert>
                  )}

                  {selectedPlan === plan.id && (
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
      <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
          Activation Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Activation For *
            </Typography>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value=""
                sx={{ backgroundColor: '#f9f9f9' }}
              >
                <MenuItem value="" disabled>Select Type</MenuItem>
                <MenuItem value="self">Self Activation</MenuItem>
                <MenuItem value="downline">Downline Activation</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Plan *
            </Typography>
            <FormControl fullWidth>
              <Select
                displayEmpty
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                sx={{ backgroundColor: '#f9f9f9' }}
              >
                <MenuItem value="" disabled>Select Plan</MenuItem>
                <MenuItem value={1}>INTRODUCTION PLAN - 100 USDT</MenuItem>
                <MenuItem value={2}>BASIC PLAN - 250 USDT</MenuItem>
                <MenuItem value={3}>BRONZE PLAN - 500 USDT</MenuItem>
                <MenuItem value={4}>SILVER PLAN - 1000 USDT</MenuItem>
                <MenuItem value={5}>GOLD PLAN - 2000 USDT</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Wallet *
            </Typography>
            <TextField 
              fullWidth 
              value="Fund Wallet" 
              disabled 
              sx={{ backgroundColor: '#f5f5f5' }}
            />
            <Typography variant="body2" sx={{ mt: 1, color: 'success.main', fontWeight: 500 }}>
              Wallet Balance : $ {walletBalance.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              One Time password *
            </Typography>
            <TextField
              fullWidth
              value={form.otp}
              placeholder="Enter OTP"
              InputProps={{ readOnly: true }}
              helperText={form.otp ? 'OTP verified' : 'Click Send OTP to receive code'}
            />
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link 
                component="button" 
                onClick={handleSendOtp} 
                underline="none" 
                sx={{ color: 'primary.main', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Send OTP
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                sx={{ 
                  px: 4,
                  py: 1,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  }
                }}
              >
                Activate Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
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
