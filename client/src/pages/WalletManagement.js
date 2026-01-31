import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  CreditCard,
  AccountBalance
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WalletManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [creditForm, setCreditForm] = useState({
    userId: '',
    amount: '',
    description: '',
    currency: 'USD'
  });
  const [debitForm, setDebitForm] = useState({
    userId: '',
    amount: '',
    description: '',
    currency: 'USD'
  });
  const [withdrawalForm, setWithdrawalForm] = useState({
    userId: '',
    amount: '',
    walletAddress: '',
    currency: 'BTC'
  });

  const [walletStats, setWalletStats] = useState({
    totalBalance: 0,
    totalCredits: 0,
    totalDebits: 0,
    pendingWithdrawals: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch wallet stats and transactions from API
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Fetch wallet statistics
        const statsResponse = await fetch('/api/admin/wallet/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setWalletStats(statsData.stats || {
            totalBalance: 0,
            totalCredits: 0,
            totalDebits: 0,
            pendingWithdrawals: 0
          });
        }

        // Fetch recent transactions
        const txResponse = await fetch('/api/admin/transactions/recent', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const txData = await txResponse.json();
        if (txData.success && txData.transactions) {
          setRecentTransactions(txData.transactions);
        }
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
      }
    };
    fetchWalletData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreditSubmit = (e) => {
    e.preventDefault();
    console.log('Credit transaction:', creditForm);
    // Add API call here
    setCreditForm({ userId: '', amount: '', description: '', currency: 'USD' });
  };

  const handleDebitSubmit = (e) => {
    e.preventDefault();
    console.log('Debit transaction:', debitForm);
    // Add API call here
    setDebitForm({ userId: '', amount: '', description: '', currency: 'USD' });
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    console.log('Withdrawal transaction:', withdrawalForm);
    // Add API call here
    setWithdrawalForm({ userId: '', amount: '', walletAddress: '', currency: 'BTC' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Wallet Management
      </Typography>

      {/* Wallet Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Total Balance</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${walletStats.totalBalance.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AccountBalanceWallet />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Total Credits</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${walletStats.totalCredits.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Total Debits</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${walletStats.totalDebits.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <TrendingDown />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">Pending Withdrawals</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${walletStats.pendingWithdrawals.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <MonetizationOn />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different operations */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Credit Funds" icon={<CreditCard />} />
          <Tab label="Debit Funds" icon={<TrendingDown />} />
          <Tab label="Withdrawals" icon={<AccountBalance />} />
          <Tab label="Transaction History" icon={<AccountBalanceWallet />} />
        </Tabs>

        {/* Credit Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Credit User Account</Typography>
          <Box component="form" onSubmit={handleCreditSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="User ID / Email"
                  value={creditForm.userId}
                  onChange={(e) => setCreditForm({...creditForm, userId: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm({...creditForm, amount: e.target.value})}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={creditForm.currency}
                    onChange={(e) => setCreditForm({...creditForm, currency: e.target.value})}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="BTC">BTC</MenuItem>
                    <MenuItem value="ETH">ETH</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={creditForm.description}
                  onChange={(e) => setCreditForm({...creditForm, description: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" size="large" sx={{ mr: 2 }}>
                  Credit Account
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Debit Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Debit User Account</Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please ensure sufficient balance before debiting user accounts.
          </Alert>
          <Box component="form" onSubmit={handleDebitSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="User ID / Email"
                  value={debitForm.userId}
                  onChange={(e) => setDebitForm({...debitForm, userId: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={debitForm.amount}
                  onChange={(e) => setDebitForm({...debitForm, amount: e.target.value})}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={debitForm.currency}
                    onChange={(e) => setDebitForm({...debitForm, currency: e.target.value})}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="BTC">BTC</MenuItem>
                    <MenuItem value="ETH">ETH</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={debitForm.description}
                  onChange={(e) => setDebitForm({...debitForm, description: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="error" size="large" sx={{ mr: 2 }}>
                  Debit Account
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Withdrawal Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Process Withdrawal</Typography>
          <Box component="form" onSubmit={handleWithdrawalSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="User ID / Email"
                  value={withdrawalForm.userId}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, userId: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={withdrawalForm.amount}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, amount: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={withdrawalForm.currency}
                    onChange={(e) => setWithdrawalForm({...withdrawalForm, currency: e.target.value})}
                  >
                    <MenuItem value="BTC">Bitcoin (BTC)</MenuItem>
                    <MenuItem value="ETH">Ethereum (ETH)</MenuItem>
                    <MenuItem value="USDT">Tether (USDT)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  value={withdrawalForm.walletAddress}
                  onChange={(e) => setWithdrawalForm({...withdrawalForm, walletAddress: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="warning" size="large" sx={{ mr: 2 }}>
                  Process Withdrawal
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Transaction History Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.type}
                        color={transaction.type === 'Credit' ? 'success' : transaction.type === 'Debit' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.user}</TableCell>
                    <TableCell>${transaction.amount}</TableCell>
                    <TableCell>{transaction.currency}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default WalletManagement;