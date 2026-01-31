import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper, CircularProgress, InputAdornment } from '@mui/material';
import { AccountBalanceWallet, Save } from '@mui/icons-material';

const WithdrawalAddress = () => {
  const [form, setForm] = useState({
    usdtTrc20: '',
    bnbBep20: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/user/withdrawal-addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.addresses) {
        setForm({
          usdtTrc20: data.addresses.usdtTrc20 || '',
          bnbBep20: data.addresses.bnbBep20 || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.usdtTrc20 && !form.bnbBep20) {
      setSnack({ open: true, message: 'Please enter at least one withdrawal address', severity: 'error' });
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/user/withdrawal-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSnack({ open: true, message: 'Withdrawal addresses saved successfully!', severity: 'success' });
      } else {
        setSnack({ open: true, message: data.message || 'Failed to save addresses', severity: 'error' });
      }
    } catch (error) {
      setSnack({ open: true, message: 'Error saving addresses', severity: 'error' });
    } finally {
      setSaving(false);
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
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWallet /> Withdrawal Address
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your cryptocurrency wallet addresses for withdrawals
      </Typography>
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="USDT (TRC20) Address" 
              name="usdtTrc20" 
              value={form.usdtTrc20} 
              onChange={handleChange}
              placeholder="Enter your USDT TRC20 wallet address (starts with T)"
              helperText="TRON Network - TRC20 Token"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT" style={{ width: 24, height: 24 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="BNB (BEP20) Address" 
              name="bnbBep20" 
              value={form.bnbBep20} 
              onChange={handleChange}
              placeholder="Enter your BNB BEP20 wallet address (starts with 0x)"
              helperText="Binance Smart Chain - BEP20 Token"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" alt="BNB" style={{ width: 24, height: 24 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              onClick={handleSave} 
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Addresses'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default WithdrawalAddress;