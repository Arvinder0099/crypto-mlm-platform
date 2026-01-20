import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  AccountBalanceWallet,
  Send,
  GetApp,
  History,
  QrCode,
  ContentCopy,
  Refresh,
  Security,
  SwapHoriz,
  TrendingUp,
  TrendingDown,
  Visibility,
  VisibilityOff,
  Add,
  Remove,
  Settings,
  Warning,
  CheckCircle,
  Pending,
  Error as ErrorIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { fetchJSON } from '../utils/api';

const Wallet = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [showBalances, setShowBalances] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // Wallet balances
  const [walletBalances, setWalletBalances] = useState([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 0,
      usdValue: 0,
      change24h: 0,
      icon: '₿',
      color: '#f7931a'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 0,
      usdValue: 0,
      change24h: 0,
      icon: 'Ξ',
      color: '#627eea'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      balance: 0,
      usdValue: 0,
      change24h: 0,
      icon: '₮',
      color: '#26a17b'
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      balance: 0,
      usdValue: 0,
      change24h: 0,
      icon: 'BNB',
      color: '#f3ba2f'
    }
  ]);

  // Wallet addresses
  const [walletAddresses, setWalletAddresses] = useState({
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ETH: '0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1',
    USDT: '0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1',
    BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'
  });
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchJSON('/api/dashboard/wallet')
      .then((res) => {
        const data = res?.data || res;
        if (!mounted || !data) return;
        const balances = Array.isArray(data.balances) ? data.balances : [];
        const mapped = balances.map((b) => ({
          symbol: b.currency,
          name: b.currency === 'BTC' ? 'Bitcoin' : b.currency === 'ETH' ? 'Ethereum' : b.currency === 'USDT' ? 'Tether' : b.currency,
          balance: b.amount,
          usdValue: b.usdValue,
          change24h: 0,
          icon: b.currency === 'BTC' ? '₿' : b.currency === 'ETH' ? 'Ξ' : b.currency === 'USDT' ? '₮' : b.currency,
          color: b.currency === 'BTC' ? '#f7931a' : b.currency === 'ETH' ? '#627eea' : b.currency === 'USDT' ? '#26a17b' : '#1976d2'
        }));
        if (mapped.length) setWalletBalances(mapped);
        if (data.addresses && Object.keys(data.addresses).length) setWalletAddresses(data.addresses);
        // Set transaction history from API
        if (Array.isArray(data.transactions)) {
          setTransactionHistory(data.transactions.map((t, idx) => ({
            id: t.id || `TXN${idx + 1}`,
            type: t.type || 'deposit',
            crypto: t.crypto || 'USDT',
            amount: t.amount || 0,
            usdValue: t.usdValue || 0,
            status: t.status || 'pending',
            date: t.date || '',
            txHash: t.txHash || null,
            confirmations: t.confirmations || 0,
            requiredConfirmations: t.requiredConfirmations || 1
          })));
        }
      })
      .catch((err) => console.warn('Failed to load wallet; using defaults.', err?.message || err));
    return () => { mounted = false; };
  }, []);

  const totalPortfolioValue = walletBalances.reduce((sum, wallet) => sum + wallet.usdValue, 0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'pending': return <Pending />;
      case 'failed': return <ErrorIcon />;
      default: return null;
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return <GetApp sx={{ color: 'success.main' }} />;
      case 'withdrawal': return <Send sx={{ color: 'error.main' }} />;
      case 'convert': return <SwapHoriz sx={{ color: 'info.main' }} />;
      default: return <History />;
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    // Show success message
  };

  const handleDeposit = () => {
    // Process deposit logic
    setShowDepositDialog(false);
    setDepositAmount('');
  };

  const handleWithdraw = () => {
    // Process withdrawal logic
    setShowWithdrawDialog(false);
    setWithdrawAmount('');
    setWithdrawAddress('');
  };

  const renderWalletOverview = () => (
    <Grid container spacing={3}>
      {/* Portfolio Summary */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Portfolio Overview</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={showBalances}
                    onChange={(e) => setShowBalances(e.target.checked)}
                    icon={<VisibilityOff />}
                    checkedIcon={<Visibility />}
                  />
                }
                label="Show Balances"
              />
            </Box>
            
            <Typography variant="h4" color="primary" gutterBottom>
              {showBalances ? `$${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '****'}
            </Typography>
            
            <Typography variant="body2" color="success.main" sx={{ mb: 3 }}>
              <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
              5.67% (24h)
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<GetApp />}
                  onClick={() => setShowDepositDialog(true)}
                  sx={{ mb: 1 }}
                >
                  Deposit
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Send />}
                  onClick={() => setShowWithdrawDialog(true)}
                  sx={{ mb: 1 }}
                >
                  Withdraw
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Security Status
            </Typography>
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }}>
                    <CheckCircle sx={{ fontSize: 16 }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="2FA Enabled"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }}>
                    <CheckCircle sx={{ fontSize: 16 }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="KYC Verified"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 24, height: 24 }}>
                    <Warning sx={{ fontSize: 16 }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Withdrawal Limits"
                  secondary="$10,000/day"
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Crypto Balances */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Crypto Balances
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>USD Value</TableCell>
                    <TableCell>24h Change</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {walletBalances.map((wallet) => (
                    <TableRow key={wallet.symbol}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: wallet.color, width: 32, height: 32, mr: 2 }}>
                            {wallet.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {wallet.symbol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {wallet.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {showBalances ? wallet.balance.toFixed(6) : '****'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {showBalances ? `$${wallet.usdValue.toLocaleString()}` : '****'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={wallet.change24h >= 0 ? 'success.main' : 'error.main'}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          {wallet.change24h >= 0 ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
                          {wallet.change24h >= 0 ? '+' : ''}{wallet.change24h.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => { setSelectedCrypto(wallet.symbol); setShowDepositDialog(true); }}>
                          <GetApp />
                        </IconButton>
                        <IconButton size="small" onClick={() => { setSelectedCrypto(wallet.symbol); setShowWithdrawDialog(true); }}>
                          <Send />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTransactionHistory = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Transaction History</Typography>
          <IconButton>
            <Refresh />
          </IconButton>
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>USD Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Confirmations</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactionHistory.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTransactionIcon(transaction.type)}
                      <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                        {transaction.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={transaction.crypto} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.amount} {transaction.crypto}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ${transaction.usdValue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(transaction.status)}
                      label={transaction.status}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transaction.confirmations}/{transaction.requiredConfirmations}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {transaction.txHash && (
                      <Tooltip title="View on blockchain">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crypto Wallet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your cryptocurrency assets, deposits, withdrawals, and transactions
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<AccountBalanceWallet />} label="Overview" />
          <Tab icon={<History />} label="Transaction History" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderWalletOverview()}
      {activeTab === 1 && renderTransactionHistory()}

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onClose={() => setShowDepositDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit {selectedCrypto}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Send {selectedCrypto} to this address:
            </Typography>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                {walletAddresses[selectedCrypto]}
              </Typography>
              <IconButton onClick={() => copyAddress(walletAddresses[selectedCrypto])}>
                <ContentCopy />
              </IconButton>
            </Paper>
            
            {/* QR Code would go here */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Paper sx={{ p: 2 }}>
                <QrCode sx={{ fontSize: 100 }} />
              </Paper>
            </Box>
          </Box>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Only send {selectedCrypto} to this address. Sending other cryptocurrencies may result in permanent loss.
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            • Minimum deposit: 0.001 {selectedCrypto}
            • Network confirmations required: {selectedCrypto === 'BTC' ? '6' : selectedCrypto === 'ETH' ? '12' : '1'}
            • Deposits are usually credited within 10-30 minutes
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDepositDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onClose={() => setShowWithdrawDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw {selectedCrypto}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Withdrawal Address"
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
            sx={{ mb: 2 }}
            placeholder={`Enter ${selectedCrypto} address`}
          />
          
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{selectedCrypto}</InputAdornment>
            }}
          />
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Network fee: 0.001 {selectedCrypto} • Minimum withdrawal: 0.01 {selectedCrypto}
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            Available balance: {walletBalances.find(w => w.symbol === selectedCrypto)?.balance} {selectedCrypto}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
          <Button onClick={handleWithdraw} variant="contained" disabled={!withdrawAddress || !withdrawAmount}>
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wallet;