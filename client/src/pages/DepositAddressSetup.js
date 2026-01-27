import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Save,
  ContentCopy,
  CheckCircle,
  Edit,
  QrCode2,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';

// Default wallet addresses
const DEFAULT_WALLETS = {
  usdt_trc20: { 
    address: 'TFVh7tRnCP3TnAxVSf6KvxN7qJ78SYYp7p', 
    enabled: true, 
    name: 'USDT (TRC20)' 
  },
  bnb_bep20: { 
    address: '0xcEEecCF61B06867332B3672830A3A2cDeb6b47f7', 
    enabled: true, 
    name: 'BNB (BEP20)' 
  },
};

const DepositAddressSetup = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wallets, setWallets] = useState(DEFAULT_WALLETS);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [copiedAddress, setCopiedAddress] = useState('');
  const [editMode, setEditMode] = useState({ usdt_trc20: false, bnb_bep20: false });

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch('/api/admin/wallets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.wallets) {
          // Merge with defaults to ensure all fields exist
          setWallets({
            usdt_trc20: {
              address: data.wallets.usdt_trc20?.address || DEFAULT_WALLETS.usdt_trc20.address,
              enabled: data.wallets.usdt_trc20?.enabled !== false,
              name: data.wallets.usdt_trc20?.name || DEFAULT_WALLETS.usdt_trc20.name,
            },
            bnb_bep20: {
              address: data.wallets.bnb_bep20?.address || DEFAULT_WALLETS.bnb_bep20.address,
              enabled: data.wallets.bnb_bep20?.enabled !== false,
              name: data.wallets.bnb_bep20?.name || DEFAULT_WALLETS.bnb_bep20.name,
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch wallets:', error);
        setSnack({ open: true, message: 'Using default wallet addresses', severity: 'warning' });
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/wallets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(wallets),
      });
      const data = await response.json();
      if (data.success) {
        setSnack({ open: true, message: 'Wallet addresses updated successfully!', severity: 'success' });
        setEditMode({ usdt_trc20: false, bnb_bep20: false });
      } else {
        setSnack({ open: true, message: data.message || 'Failed to update', severity: 'error' });
      }
    } catch (error) {
      setSnack({ open: true, message: 'Failed to save wallet settings', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (address, network) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(network);
    setTimeout(() => setCopiedAddress(''), 2000);
  };

  const handleChange = (network, field, value) => {
    setWallets(prev => ({
      ...prev,
      [network]: { ...prev[network], [field]: value }
    }));
  };

  const networkConfig = {
    usdt_trc20: {
      color: '#26A17B',
      icon: '₮',
      label: 'USDT (TRC20)',
      network: 'TRON Network',
      placeholder: 'Enter TRC20 wallet address (starts with T)',
    },
    bnb_bep20: {
      color: '#F3BA2F',
      icon: 'BNB',
      label: 'BNB (BEP20)',
      network: 'BSC Network',
      placeholder: 'Enter BEP20 wallet address (starts with 0x)',
    },
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
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalanceWallet sx={{ fontSize: 40, color: 'white' }} />
          <Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              Deposit Address Control
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Manage deposit wallet addresses for user payments - QR codes auto-generate
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Info Card */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> These are the wallet addresses where users will send their deposits. 
          The QR codes are automatically generated from the addresses. Make sure to double-check addresses before saving.
        </Typography>
      </Alert>

      {/* Wallet Cards */}
      <Grid container spacing={3}>
        {Object.entries(networkConfig).map(([network, config]) => (
          <Grid item xs={12} md={6} key={network}>
            <Card sx={{ 
              borderRadius: 3, 
              border: '2px solid',
              borderColor: config.color,
              overflow: 'hidden'
            }}>
              {/* Card Header */}
              <Box sx={{ 
                bgcolor: config.color, 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: 'white',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: network === 'bnb_bep20' ? 12 : 18,
                    color: config.color
                  }}>
                    {config.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {config.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {config.network}
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={wallets[network]?.enabled !== false}
                      onChange={(e) => handleChange(network, 'enabled', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: 'white' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.5)' },
                      }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: 'white' }}>Enabled</Typography>}
                />
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* QR Code Preview */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  p: 2,
                  bgcolor: alpha(config.color, 0.05),
                  borderRadius: 2
                }}>
                  <Box sx={{ 
                    bgcolor: 'white', 
                    p: 2, 
                    borderRadius: 2, 
                    border: '2px solid',
                    borderColor: config.color
                  }}>
                    {wallets[network]?.address ? (
                      <QRCodeSVG 
                        value={wallets[network].address}
                        size={150}
                        level="H"
                        includeMargin={true}
                        bgColor="white"
                        fgColor="#000000"
                      />
                    ) : (
                      <Box sx={{ 
                        width: 150, 
                        height: 150, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'text.secondary'
                      }}>
                        <Typography variant="body2">No address set</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Address Field */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Wallet Address
                  </Typography>
                  {editMode[network] ? (
                    <TextField
                      fullWidth
                      value={wallets[network]?.address || ''}
                      onChange={(e) => handleChange(network, 'address', e.target.value)}
                      placeholder={config.placeholder}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            size="small" 
                            onClick={() => setEditMode(prev => ({ ...prev, [network]: false }))}
                            color="primary"
                          >
                            <CheckCircle />
                          </IconButton>
                        )
                      }}
                    />
                  ) : (
                    <Paper 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: alpha(config.color, 0.05),
                        border: '1px dashed',
                        borderColor: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          wordBreak: 'break-all',
                          flex: 1
                        }}
                      >
                        {wallets[network]?.address || 'No address set'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Copy Address">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(wallets[network]?.address, network)}
                          >
                            {copiedAddress === network ? <CheckCircle color="success" /> : <ContentCopy />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Address">
                          <IconButton 
                            size="small" 
                            onClick={() => setEditMode(prev => ({ ...prev, [network]: true }))}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  )}
                </Box>

                {/* Network Status */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1.5,
                  bgcolor: wallets[network]?.enabled !== false ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                  borderRadius: 2
                }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: wallets[network]?.enabled !== false ? '#4caf50' : '#f44336'
                  }} />
                  <Typography variant="body2" color={wallets[network]?.enabled !== false ? 'success.main' : 'error.main'}>
                    {wallets[network]?.enabled !== false ? 'Active - Users can deposit' : 'Disabled - Deposits blocked'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            px: 6,
            py: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
            }
          }}
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </Box>

      {/* Instructions */}
      <Paper sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: alpha('#fff3e0', 0.5) }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode2 color="warning" />
          Important Instructions
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" gutterBottom>TRC20 (TRON Network)</Typography>
            <Typography variant="body2" color="text.secondary">
              • Address must start with <strong>T</strong><br />
              • Address must be exactly <strong>34 characters</strong><br />
              • Used for USDT deposits on TRON blockchain
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>BEP20 (BSC Network)</Typography>
            <Typography variant="body2" color="text.secondary">
              • Address must start with <strong>0x</strong><br />
              • Address must be exactly <strong>42 characters</strong><br />
              • Used for BNB deposits on Binance Smart Chain
            </Typography>
          </Grid>
        </Grid>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>Warning:</strong> Always verify wallet addresses before saving. Incorrect addresses will result in lost funds.
        </Alert>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepositAddressSetup;
