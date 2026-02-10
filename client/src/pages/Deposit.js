import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  Paper,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import {
  ContentCopy,
  CheckCircle,
  CloudUpload,
  AccountBalanceWallet,
  QrCode2,
  Send,
  Info,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import OtpDialog from '../components/OtpDialog';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || '';

// Default admin deposit addresses (fallback)
const DEFAULT_ADDRESSES = {
  usdt_trc20: {
    address: 'TFVh7tRnCP3TnAxVSf6KvxN7qJ78SYYp7p',
    network: 'TRC20',
    name: 'USDT (TRC20)',
    color: '#26A17B',
    icon: '₮',
    enabled: true,
  },
  bnb_bep20: {
    address: '0xcEEecCF61B06867332B3672830A3A2cDeb6b47f7',
    network: 'BEP20',
    name: 'BNB (BEP20)',
    color: '#F3BA2F',
    icon: 'BNB',
    enabled: true,
  },
};

const Deposit = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userWallet, setUserWallet] = useState({ address: '', type: 'usdt_trc20' });
  const [selectedNetwork, setSelectedNetwork] = useState('usdt_trc20');
  const [adminAddresses, setAdminAddresses] = useState(DEFAULT_ADDRESSES);
  const [form, setForm] = useState({
    amount: '',
    transactionHash: '',
    otp: '',
    slip: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch admin wallet addresses from API
  useEffect(() => {
    const fetchAdminWallets = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/deposit-wallets`);
        const data = await response.json();
        if (data.success && data.wallets) {
          setAdminAddresses(data.wallets);
        }
      } catch (err) {
        console.error('Failed to fetch admin wallets:', err);
        // Keep default addresses on error
      }
    };
    fetchAdminWallets();
  }, []);

  // Fetch user wallet details
  useEffect(() => {
    const fetchUserWallet = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.user) {
          setUserWallet({
            address: data.user.walletAddress || '',
            type: data.user.walletType || 'usdt_trc20',
          });
          setSelectedNetwork(data.user.walletType || 'usdt_trc20');
        }
      } catch (err) {
        console.error('Failed to fetch user wallet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserWallet();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'slip') {
      const file = files?.[0];
      setForm(prev => ({ ...prev, slip: file || null }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOtpVerified = (otpValue) => {
    setForm(prev => ({ ...prev, otp: otpValue }));
    setSnack({ open: true, message: 'OTP verified successfully!', severity: 'success' });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setSnack({ open: true, message: 'Address copied to clipboard!', severity: 'success' });
    setTimeout(() => setCopiedAddress(''), 2000);
  };

  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setSnack({ open: true, message: 'Please enter a valid deposit amount', severity: 'error' });
      return;
    }
    if (!form.transactionHash) {
      setSnack({ open: true, message: 'Please enter the transaction hash/number', severity: 'error' });
      return;
    }
    if (!form.otp) {
      setSnack({ open: true, message: 'Please verify OTP first', severity: 'error' });
      return;
    }
    if (!form.slip) {
      setSnack({ open: true, message: 'Please upload payment slip/screenshot', severity: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', form.amount);
      formData.append('transactionHash', form.transactionHash);
      formData.append('network', selectedNetwork);
      formData.append('adminAddress', adminAddresses[selectedNetwork].address);
      formData.append('userWalletAddress', userWallet.address);
      formData.append('slip', form.slip);

      const response = await fetch(`${API_BASE}/api/deposits`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setSnack({ open: true, message: 'Deposit request submitted successfully! Admin will review and approve.', severity: 'success' });
        setForm({ amount: '', transactionHash: '', otp: '', slip: null });
        setPreviewUrl(null);
      } else {
        setSnack({ open: true, message: data.message || 'Failed to submit deposit', severity: 'error' });
      }
    } catch (error) {
      console.error('Deposit error:', error);
      setSnack({ open: true, message: 'Error submitting deposit request', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const adminAddress = adminAddresses[selectedNetwork];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        💰 Fund Wallet - Deposit
      </Typography>

      {/* Step 1: Your Wallet Address */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet color="primary" />
          Step 1: Your Wallet Address
        </Typography>
        <Card sx={{ bgcolor: alpha('#1976d2', 0.05), border: '1px solid', borderColor: alpha('#1976d2', 0.2) }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your registered {userWallet.type === 'usdt_trc20' ? 'USDT (TRC20)' : 'BNB (BEP20)'} wallet:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip 
                label={userWallet.type === 'usdt_trc20' ? 'TRC20' : 'BEP20'} 
                size="small" 
                sx={{ bgcolor: userWallet.type === 'usdt_trc20' ? '#26A17B' : '#F3BA2F', color: 'white' }}
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: 'monospace', 
                  fontWeight: 600,
                  wordBreak: 'break-all',
                  flex: 1
                }}
              >
                {userWallet.address || 'No wallet address found'}
              </Typography>
              {userWallet.address && (
                <IconButton size="small" onClick={() => copyToClipboard(userWallet.address, 'user')}>
                  {copiedAddress === 'user' ? <CheckCircle color="success" /> : <ContentCopy />}
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      </Paper>

      {/* Step 2: Select Network & Deposit Address */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode2 color="primary" />
          Step 2: Select Network & Send Payment
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Payment Network</InputLabel>
          <Select
            value={selectedNetwork}
            label="Select Payment Network"
            onChange={(e) => setSelectedNetwork(e.target.value)}
          >
            <MenuItem value="usdt_trc20">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 24, height: 24, borderRadius: '50%', 
                  bgcolor: '#26A17B', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 'bold'
                }}>₮</Box>
                USDT (TRC20) - TRON Network
              </Box>
            </MenuItem>
            <MenuItem value="bnb_bep20">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 24, height: 24, borderRadius: '50%', 
                  bgcolor: '#F3BA2F', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 'bold'
                }}>BNB</Box>
                BNB (BEP20) - BSC Network
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={3}>
          {/* QR Code */}
          <Grid item xs={12} md={5}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: 'white',
              border: '3px solid',
              borderColor: adminAddress.color,
              borderRadius: 3
            }}>
              <Chip 
                label={adminAddress.name} 
                sx={{ 
                  mb: 2, 
                  bgcolor: adminAddress.color, 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              />
              <Box sx={{ 
                width: 200, 
                height: 200, 
                mx: 'auto', 
                bgcolor: 'white',
                p: 1,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QRCodeSVG 
                  value={adminAddress.address}
                  size={180}
                  level="H"
                  includeMargin={true}
                  bgColor="white"
                  fgColor="#000000"
                />
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                Scan QR code to deposit
              </Typography>
            </Card>
          </Grid>

          {/* Address Details */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%', p: 2, bgcolor: alpha(adminAddress.color, 0.05) }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Send {adminAddress.name} to this address:
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: 'white', 
                  border: '1px dashed',
                  borderColor: adminAddress.color,
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontWeight: 600, 
                    wordBreak: 'break-all',
                    color: '#333'
                  }}
                >
                  {adminAddress.address}
                </Typography>
              </Paper>
              <Button
                variant="contained"
                startIcon={copiedAddress === 'admin' ? <CheckCircle /> : <ContentCopy />}
                onClick={() => copyToClipboard(adminAddress.address, 'admin')}
                sx={{ 
                  bgcolor: adminAddress.color, 
                  '&:hover': { bgcolor: alpha(adminAddress.color, 0.8) } 
                }}
                fullWidth
              >
                {copiedAddress === 'admin' ? 'Copied!' : 'Copy Address'}
              </Button>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ⚠️ Only send <strong>{adminAddress.name}</strong> on <strong>{adminAddress.network}</strong> network. 
                  Sending other tokens may result in permanent loss!
                </Typography>
              </Alert>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Step 3: Enter Deposit Details */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send color="primary" />
          Step 3: Enter Deposit Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Deposit Amount (USD)"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              placeholder="Enter amount"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Transaction Hash / TXID"
              name="transactionHash"
              value={form.transactionHash}
              onChange={handleChange}
              placeholder="Enter transaction hash after transfer"
              helperText="Copy from your wallet after sending"
            />
          </Grid>

          {/* Payment Slip Upload */}
          <Grid item xs={12} md={6}>
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ height: 56 }}
              >
                Upload Payment Screenshot
                <input
                  hidden
                  type="file"
                  name="slip"
                  accept="image/*,.pdf"
                  onChange={handleChange}
                />
              </Button>
              {form.slip && (
                <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                  ✅ {form.slip.name}
                </Typography>
              )}
              {previewUrl && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img 
                    src={previewUrl} 
                    alt="Payment slip preview" 
                    style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }}
                  />
                </Box>
              )}
            </Box>
          </Grid>

          {/* OTP Verification */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="OTP Verification"
              name="otp"
              value={form.otp}
              InputProps={{ readOnly: true }}
              helperText={form.otp ? '✅ OTP verified' : 'Click Send OTP to verify'}
            />
            <Box sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setOtpDialogOpen(true)}
                disabled={!!form.otp}
                startIcon={form.otp ? <CheckCircle color="success" /> : null}
              >
                {form.otp ? 'OTP Verified' : 'Send OTP'}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
              fullWidth
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : '🚀 Submit Deposit Request'}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info" icon={<Info />}>
              <Typography variant="body2">
                <strong>After submitting:</strong> Admin will verify your payment and approve your deposit. 
                Once approved, the amount will be credited to your wallet balance automatically.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>

      <OtpDialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        onVerified={handleOtpVerified}
        title="Deposit OTP Verification"
      />
    </Box>
  );
};

export default Deposit;
