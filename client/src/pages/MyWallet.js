import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, CircularProgress
} from '@mui/material';
import {
  AccountBalanceWallet, SwapHoriz, TrendingUp, Savings, CardGiftcard
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = '';

const MyWallet = () => {
  const [wallets, setWallets] = useState({
    myWallet: 0,
    fundWallet: 0,
    utilityWallet: 0,
    totalInvested: 0,
    totalEarned: 0,
    todayEarning: 0
  });
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  
  // Transfer dialogs
  const [utilityToMyDialog, setUtilityToMyDialog] = useState(false);
  const [myToFundDialog, setMyToFundDialog] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  
  // Alerts
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const fetchWallets = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_BASE}/api/user/wallets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallets(res.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      setAlert({ open: true, message: 'Failed to fetch wallet data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleTransferUtilityToMy = async () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      setAlert({ open: true, message: 'Please enter a valid amount', severity: 'error' });
      return;
    }
    if (amount > wallets.utilityWallet) {
      setAlert({ open: true, message: 'Insufficient balance in Utility Wallet', severity: 'error' });
      return;
    }

    setTransferLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(`${API_BASE}/api/user/transfer/utility-to-mywallet`, 
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update wallets immediately from response, then re-fetch for full sync
      setWallets(prev => ({
        ...prev,
        myWallet: res.data.myWallet ?? (prev.myWallet + amount),
        utilityWallet: res.data.utilityWallet ?? (prev.utilityWallet - amount),
      }));
      setAlert({ open: true, message: `Successfully transferred $${amount} to My Wallet`, severity: 'success' });
      setUtilityToMyDialog(false);
      setTransferAmount('');
      fetchWallets();
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.message || 'Transfer failed', severity: 'error' });
    } finally {
      setTransferLoading(false);
    }
  };

  const handleTransferMyToFund = async () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      setAlert({ open: true, message: 'Please enter a valid amount', severity: 'error' });
      return;
    }
    if (amount > wallets.myWallet) {
      setAlert({ open: true, message: 'Insufficient balance in My Wallet', severity: 'error' });
      return;
    }

    setTransferLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_BASE}/api/user/transfer/mywallet-to-fund`, 
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ open: true, message: `Successfully transferred $${amount} to Fund Wallet`, severity: 'success' });
      setMyToFundDialog(false);
      setTransferAmount('');
      fetchWallets();
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.message || 'Transfer failed', severity: 'error' });
    } finally {
      setTransferLoading(false);
    }
  };

  const WalletCard = ({ title, balance, icon, color, gradient, note }) => (
    <Card sx={{ 
      height: '100%',
      background: gradient,
      color: '#fff',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex'
          }}>
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={600}>{title}</Typography>
        </Box>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }, wordBreak: 'break-word' }}>
          $ {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        {note && (
          <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 1 }}>
            {note}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#10b981' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: '#1e3a5f' }}>
        My Wallet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your wallets and transfer funds between them
      </Typography>

      {/* Wallet Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* My Wallet */}
        <Grid item xs={12} md={4}>
          <WalletCard
            title="My Wallet"
            balance={wallets.myWallet}
            icon={<AccountBalanceWallet sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            note="Daily earnings credited here"
          />
        </Grid>

        {/* Fund Wallet */}
        <Grid item xs={12} md={4}>
          <WalletCard
            title="Fund Wallet"
            balance={wallets.fundWallet}
            icon={<Savings sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            note="Used to buy investment plans"
          />
        </Grid>

        {/* Utility Wallet */}
        <Grid item xs={12} md={4}>
          <WalletCard
            title="Utility Wallet"
            balance={wallets.utilityWallet}
            icon={<CardGiftcard sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
            note="Referral bonus credited here"
          />
        </Grid>
      </Grid>

      {/* Transfer Options */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SwapHoriz sx={{ color: '#10b981' }} />
            Transfer Funds
          </Typography>
          
          <Grid container spacing={3}>
            {/* Utility to My Wallet */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: 3, 
                border: '2px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': { borderColor: '#10b981', boxShadow: '0 4px 20px rgba(16,185,129,0.15)' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CardGiftcard sx={{ color: '#f45c43' }} />
                  <Typography variant="subtitle1">→</Typography>
                  <AccountBalanceWallet sx={{ color: '#764ba2' }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Utility Wallet → My Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Transfer your referral bonus to My Wallet for withdrawal
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    setTransferAmount('');
                    setUtilityToMyDialog(true);
                  }}
                  disabled={wallets.utilityWallet <= 0}
                  sx={{ 
                    background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Transfer to My Wallet
                </Button>
              </Card>
            </Grid>

            {/* My Wallet to Fund */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: 3, 
                border: '2px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': { borderColor: '#10b981', boxShadow: '0 4px 20px rgba(16,185,129,0.15)' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <AccountBalanceWallet sx={{ color: '#764ba2' }} />
                  <Typography variant="subtitle1">→</Typography>
                  <Savings sx={{ color: '#38ef7d' }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  My Wallet → Fund Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Transfer to Fund Wallet to buy new investment plans
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    setTransferAmount('');
                    setMyToFundDialog(true);
                  }}
                  disabled={wallets.myWallet <= 0}
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Transfer to Fund Wallet
                </Button>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card sx={{ borderRadius: 3, border: '2px solid #10b981' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#10b981' }}>
            📝 Important Notes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <strong>My Wallet:</strong> You can withdraw amount only from My Wallet, not from Fund Wallet and Utility Wallet.
            </Alert>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <strong>Fund Wallet:</strong> If you want to activate another plan, you can transfer the amount from My Wallet to Fund Wallet. After transfer, you can buy plans from Fund Wallet.
            </Alert>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <strong>Utility Wallet:</strong> This wallet is only for Referral Bonus. You can transfer the amount to My Wallet for withdrawal.
            </Alert>
          </Box>
        </CardContent>
      </Card>

      {/* Transfer Dialog: Utility to My Wallet */}
      <Dialog open={utilityToMyDialog} onClose={() => setUtilityToMyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer from Utility Wallet to My Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Available in Utility Wallet: <strong>${wallets.utilityWallet.toFixed(2)}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Amount to Transfer"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              sx={{ mb: 2 }}
            />
            <Button
              size="small"
              onClick={() => setTransferAmount(wallets.utilityWallet.toString())}
              sx={{ textTransform: 'none' }}
            >
              Transfer All
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUtilityToMyDialog(false)} disabled={transferLoading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleTransferUtilityToMy}
            disabled={transferLoading}
            sx={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' }}
          >
            {transferLoading ? <CircularProgress size={24} color="inherit" /> : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog: My Wallet to Fund */}
      <Dialog open={myToFundDialog} onClose={() => setMyToFundDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer from My Wallet to Fund Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Available in My Wallet: <strong>${wallets.myWallet.toFixed(2)}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Amount to Transfer"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              sx={{ mb: 2 }}
            />
            <Button
              size="small"
              onClick={() => setTransferAmount(wallets.myWallet.toString())}
              sx={{ textTransform: 'none' }}
            >
              Transfer All
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMyToFundDialog(false)} disabled={transferLoading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleTransferMyToFund}
            disabled={transferLoading}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {transferLoading ? <CircularProgress size={24} color="inherit" /> : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setAlert({ ...alert, open: false })} 
          severity={alert.severity}
          sx={{ borderRadius: 2 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyWallet;
