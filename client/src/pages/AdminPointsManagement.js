import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Person,
  Send,
  History,
  MonetizationOn,
  CheckCircle,
  Error,
  TrendingUp,
  CalendarToday,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

const AdminPointsManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [dailyReturnAmount, setDailyReturnAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [dailyReturnUsers, setDailyReturnUsers] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalPointsAdded: 0,
    totalUsersCredit: 0,
    todayPointsAdded: 0,
    totalDailyReturns: 0,
  });

  // Admin pool balance (25,000,000 USDT points)
  const [adminPoolBalance, setAdminPoolBalance] = useState(25000000);

  useEffect(() => {
    loadRecentTransactions();
    loadStats();
    loadDailyReturnUsers();
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchWithAuth('/api/admin/points/stats');
      if (data) {
        setStats(data);
        if (data.adminPoolBalance !== undefined) {
          setAdminPoolBalance(data.adminPoolBalance);
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadRecentTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const data = await fetchWithAuth('/api/admin/points/transactions');
      setRecentTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadDailyReturnUsers = async () => {
    try {
      const data = await fetchWithAuth('/api/admin/daily-returns/users');
      setDailyReturnUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load daily return users:', error);
    }
  };

  const searchUser = async () => {
    if (!userId.trim()) {
      setSnackbar({ open: true, message: 'Please enter a User ID', severity: 'warning' });
      return;
    }

    setSearchLoading(true);
    setUserInfo(null);
    try {
      const data = await fetchWithAuth(`/api/admin/points/user/${userId.trim()}`);
      if (data.user) {
        setUserInfo(data.user);
      } else {
        setSnackbar({ open: true, message: 'User not found', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'User not found', severity: 'error' });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddPoints = async () => {
    if (!userId.trim()) {
      setSnackbar({ open: true, message: 'Please enter a User ID', severity: 'warning' });
      return;
    }

    const pointsAmount = parseFloat(amount);
    if (isNaN(pointsAmount) || pointsAmount <= 0) {
      setSnackbar({ open: true, message: 'Please enter a valid amount', severity: 'warning' });
      return;
    }

    if (pointsAmount > adminPoolBalance) {
      setSnackbar({ open: true, message: 'Insufficient admin pool balance', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/admin/points/add', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId.trim(),
          amount: pointsAmount,
          description: description.trim() || 'USDT points added by admin',
        }),
      });

      if (response.success) {
        setSnackbar({ 
          open: true, 
          message: `Successfully added ${pointsAmount} USDT to ${userId}'s wallet!`, 
          severity: 'success' 
        });
        
        // Update local state
        if (userInfo) {
          setUserInfo({
            ...userInfo,
            balance: (userInfo.balance || 0) + pointsAmount,
          });
        }
        
        // Deduct from admin pool
        setAdminPoolBalance(prev => prev - pointsAmount);
        
        // Reset form
        setAmount('');
        setDescription('');
        
        // Reload transactions
        loadRecentTransactions();
        loadStats();
      } else {
        setSnackbar({ open: true, message: response.message || 'Failed to add points', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to add points', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDailyReturn = async () => {
    if (!userId.trim()) {
      setSnackbar({ open: true, message: 'Please enter a User ID', severity: 'warning' });
      return;
    }

    const dailyAmount = parseFloat(dailyReturnAmount);
    if (isNaN(dailyAmount) || dailyAmount < 0) {
      setSnackbar({ open: true, message: 'Please enter a valid daily return amount', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/admin/daily-returns/set', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId.trim(),
          dailyReturnAmount: dailyAmount,
        }),
      });

      if (response.success) {
        setSnackbar({ 
          open: true, 
          message: `Daily return of $${dailyAmount} USDT set for ${userId}!`, 
          severity: 'success' 
        });
        
        // Update local state
        if (userInfo) {
          setUserInfo({
            ...userInfo,
            dailyReturnAmount: dailyAmount,
          });
        }
        
        // Reset form
        setDailyReturnAmount('');
        
        // Reload data
        loadDailyReturnUsers();
        loadStats();
      } else {
        setSnackbar({ open: true, message: response.message || 'Failed to set daily return', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to set daily return', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDailyReturn = async (userIdToRemove) => {
    try {
      const response = await fetchWithAuth('/api/admin/daily-returns/remove', {
        method: 'POST',
        body: JSON.stringify({ userId: userIdToRemove }),
      });

      if (response.success) {
        setSnackbar({ open: true, message: 'Daily return removed successfully', severity: 'success' });
        loadDailyReturnUsers();
      } else {
        setSnackbar({ open: true, message: response.message || 'Failed to remove daily return', severity: 'error' });
      }
    } catch (error) {
      console.error('Remove daily return error:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to remove daily return', severity: 'error' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchUser();
    }
  };

  return (
    <Box className="page-container" sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <AccountBalanceWallet sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Admin Points Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Add USDT points & Set Daily Returns for users
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Admin Pool Balance
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${adminPoolBalance.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                USDT Points Available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Total Points Distributed
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${stats.totalPointsAdded?.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                All Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Today's Distribution
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${stats.todayPointsAdded?.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                USDT Points
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                Active Daily Returns
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {dailyReturnUsers.length}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Users Receiving Daily
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<MonetizationOn />} label="Add USDT Points" />
          <Tab icon={<TrendingUp />} label="Set Daily Return" />
          <Tab icon={<History />} label="Transaction History" />
        </Tabs>
      </Paper>

      {/* Tab 0: Add USDT Points */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOn color="primary" />
                Add USDT Points to User Wallet
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* User ID Input */}
              <TextField
                fullWidth
                label="User ID"
                placeholder="Enter User ID (e.g., USR001)"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={searchUser}
                        disabled={searchLoading}
                      >
                        {searchLoading ? <CircularProgress size={20} /> : 'Search'}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />

              {/* User Info Display */}
              {userInfo && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    User Found: {userInfo.firstName} {userInfo.lastName}
                  </Typography>
                  <Typography variant="body2">
                    Email: {userInfo.email}
                  </Typography>
                  <Typography variant="body2">
                    Current Balance: <strong>${userInfo.balance?.toLocaleString() || 0} USDT</strong>
                  </Typography>
                  {userInfo.dailyReturnAmount > 0 && (
                    <Typography variant="body2" color="primary">
                      Daily Return: <strong>${userInfo.dailyReturnAmount?.toLocaleString() || 0} USDT/day</strong>
                    </Typography>
                  )}
                </Alert>
              )}

              {/* Amount Input */}
              <TextField
                fullWidth
                label="Amount (USDT)"
                placeholder="Enter amount to add"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      $
                    </InputAdornment>
                  ),
                }}
              />

              {/* Description Input */}
              <TextField
                fullWidth
                label="Description (Optional)"
                placeholder="e.g., Deposit confirmation, Bonus, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 3 }}
                multiline
                rows={2}
              />

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAddPoints}
                disabled={loading || !userId || !amount}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                  },
                }}
              >
                {loading ? 'Processing...' : 'Add USDT Points to Wallet'}
              </Button>
            </Paper>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History color="primary" />
                Recent Point Transactions
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {transactionsLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : recentTransactions.length === 0 ? (
                <Alert severity="info">No transactions yet</Alert>
              ) : (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>User ID</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTransactions.map((tx, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{tx.userId}</TableCell>
                          <TableCell>
                            <Typography color="success.main" fontWeight="bold">
                              +${tx.amount?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              icon={tx.status === 'completed' ? <CheckCircle /> : <Error />}
                              label={tx.status || 'Completed'}
                              color={tx.status === 'completed' ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Set Daily Return */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="success" />
                Set Daily Return Amount
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Set a daily return amount for a user. This amount will be automatically added to their wallet every day.
              </Alert>
              <Divider sx={{ mb: 3 }} />

              {/* User ID Input */}
              <TextField
                fullWidth
                label="User ID"
                placeholder="Enter User ID (e.g., USR001)"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={searchUser}
                        disabled={searchLoading}
                      >
                        {searchLoading ? <CircularProgress size={20} /> : 'Search'}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />

              {/* User Info Display */}
              {userInfo && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    User Found: {userInfo.firstName} {userInfo.lastName}
                  </Typography>
                  <Typography variant="body2">
                    Current Balance: <strong>${userInfo.balance?.toLocaleString() || 0} USDT</strong>
                  </Typography>
                  <Typography variant="body2" color={userInfo.dailyReturnAmount > 0 ? 'success.main' : 'text.secondary'}>
                    Current Daily Return: <strong>${userInfo.dailyReturnAmount?.toLocaleString() || 0} USDT/day</strong>
                  </Typography>
                </Alert>
              )}

              {/* Daily Return Amount Input */}
              <TextField
                fullWidth
                label="Daily Return Amount (USDT per day)"
                placeholder="Enter daily return amount"
                type="number"
                value={dailyReturnAmount}
                onChange={(e) => setDailyReturnAmount(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      /day
                    </InputAdornment>
                  ),
                }}
                helperText="Set to 0 to stop daily returns for this user"
              />

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSetDailyReturn}
                disabled={loading || !userId || dailyReturnAmount === ''}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TrendingUp />}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0f8a7e 0%, #2fd66d 100%)',
                  },
                }}
              >
                {loading ? 'Processing...' : 'Set Daily Return'}
              </Button>
            </Paper>
          </Grid>

          {/* Users with Daily Returns */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday color="primary" />
                Users with Active Daily Returns
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {dailyReturnUsers.length === 0 ? (
                <Alert severity="info">No users with active daily returns</Alert>
              ) : (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>User ID</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Daily Amount</strong></TableCell>
                        <TableCell><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dailyReturnUsers.map((user, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{user.userId}</TableCell>
                          <TableCell>{user.firstName} {user.lastName}</TableCell>
                          <TableCell>
                            <Typography color="success.main" fontWeight="bold">
                              ${user.dailyReturnAmount?.toLocaleString()}/day
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveDailyReturn(user.userId)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Transaction History */}
      {tabValue === 2 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History color="primary" />
            All Point Transactions
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {transactionsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : recentTransactions.length === 0 ? (
            <Alert severity="info">No transactions yet</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>User ID</strong></TableCell>
                    <TableCell><strong>User Name</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.map((tx, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{tx.userId}</TableCell>
                      <TableCell>{tx.userName || '-'}</TableCell>
                      <TableCell>
                        <Typography color="success.main" fontWeight="bold">
                          +${tx.amount?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.type === 'daily_return' ? 'Daily Return' : 'Admin Credit'}
                          color={tx.type === 'daily_return' ? 'success' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>{tx.description || '-'}</TableCell>
                      <TableCell>
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={tx.status === 'completed' ? <CheckCircle /> : <Error />}
                          label={tx.status || 'Completed'}
                          color={tx.status === 'completed' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPointsManagement;
