import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Avatar,
  Tooltip,
  Checkbox,
} from '@mui/material';
import {
  AccountBalanceWallet,
  AttachMoney,
  Visibility,
  Check,
  Close,
  Search,
  FilterList,
  Download,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Cancel,
  Email,
  Refresh,
  Schedule,
  Assessment,
  Warning,
  MonetizationOn,
  Block,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const WithdrawalManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestSummary, setRequestSummary] = useState([]);
  const [datewiseSummary, setDatewiseSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch withdrawal data from API
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Fetch pending withdrawals
        const pendingRes = await fetch('/api/admin/withdrawals/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const pendingData = await pendingRes.json();
        if (pendingData.success && pendingData.withdrawals) {
          setPendingRequests(pendingData.withdrawals.map(w => ({
            id: w._id,
            username: w.user?.username || w.username || 'Unknown',
            email: w.user?.email || w.email || '',
            amount: w.amount,
            currency: w.currency || 'USDT',
            walletAddress: w.walletAddress,
            network: w.network || 'TRC20',
            requestDate: new Date(w.createdAt).toISOString().split('T')[0],
            status: w.status,
            priority: w.priority || 'medium',
            availableBalance: w.user?.balance || 0,
            totalWithdrawn: w.user?.totalWithdrawn || 0,
            kycStatus: w.user?.kycStatus || 'pending',
            accountLevel: w.user?.rank || 'Basic',
            lastActivity: w.updatedAt || w.createdAt,
            withdrawalFee: w.fee || 0,
            estimatedProcessTime: '2-4 hours',
            verificationCode: `WD${w._id?.slice(-6) || '000000'}`,
            notes: w.notes || ''
          })));
        }

        // Fetch summary data
        const summaryRes = await fetch('/api/admin/withdrawals/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const summaryData = await summaryRes.json();
        if (summaryData.success) {
          if (summaryData.userSummary) setRequestSummary(summaryData.userSummary);
          if (summaryData.datewiseSummary) setDatewiseSummary(summaryData.datewiseSummary);
        }
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleApprove = (requestId) => {
    console.log('Approving withdrawal request:', requestId);
    // Add approval logic here
  };

  const handleReject = (requestId) => {
    console.log('Rejecting withdrawal request:', requestId);
    // Add rejection logic here
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderPendingRequests = () => (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Requests</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {pendingRequests.filter(req => req.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: ${pendingRequests.filter(req => req.status === 'pending').reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Under Review</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {pendingRequests.filter(req => req.status === 'reviewing').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: ${pendingRequests.filter(req => req.status === 'reviewing').reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">On Hold</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {pendingRequests.filter(req => req.status === 'on_hold').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: ${pendingRequests.filter(req => req.status === 'on_hold').reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Amount</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ${pendingRequests.reduce((sum, req) => sum + req.amount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg: ${Math.round(pendingRequests.reduce((sum, req) => sum + req.amount, 0) / pendingRequests.length).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Advanced Filters & Search
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by username, email, or verification code"
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue="">
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="reviewing">Under Review</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Currency</InputLabel>
                <Select label="Currency" defaultValue="">
                  <MenuItem value="">All Currencies</MenuItem>
                  <MenuItem value="USDT">USDT</MenuItem>
                  <MenuItem value="Bitcoin">Bitcoin</MenuItem>
                  <MenuItem value="Ethereum">Ethereum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select label="Priority" defaultValue="">
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<FilterList />} size="small">
                  Apply Filters
                </Button>
                <Button variant="outlined" startIcon={<Refresh />} size="small">
                  Refresh
                </Button>
                <Button variant="outlined" startIcon={<Download />} size="small">
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Enhanced Pending Requests Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox size="small" />
              </TableCell>
              <TableCell>User Details</TableCell>
              <TableCell>Withdrawal Info</TableCell>
              <TableCell>Amount & Fees</TableCell>
              <TableCell>Status & Priority</TableCell>
              <TableCell>Account Info</TableCell>
              <TableCell>Processing Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Checkbox size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {request.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {request.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.email}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Code: {request.verificationCode}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {request.currency} ({request.network})
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {request.walletAddress.substring(0, 20)}...
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {request.requestDate}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      ${request.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fee: ${request.withdrawalFee}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Net: ${(request.amount - request.withdrawalFee).toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={request.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(request.status)}
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    <Chip
                      label={request.priority.toUpperCase()}
                      color={request.priority === 'high' ? 'error' : request.priority === 'medium' ? 'warning' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="caption" display="block">
                      Level: {request.accountLevel}
                    </Typography>
                    <Typography variant="caption" display="block">
                      KYC: {request.kycStatus}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Balance: ${request.availableBalance.toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {request.estimatedProcessTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Approve">
                      <IconButton
                        color="success"
                        size="small"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleReject(request.id)}
                      >
                        <Cancel />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Email">
                      <IconButton
                        color="info"
                        size="small"
                      >
                        <Email />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bulk Actions */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">Bulk Actions:</Typography>
            <Button variant="outlined" color="success" size="small" startIcon={<CheckCircle />}>
              Approve Selected
            </Button>
            <Button variant="outlined" color="error" size="small" startIcon={<Cancel />}>
              Reject Selected
            </Button>
            <Button variant="outlined" size="small" startIcon={<Email />}>
              Send Notification
            </Button>
            <Button variant="outlined" size="small" startIcon={<Download />}>
              Export Selected
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderRequestSummary = () => (
    <Box>
      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Processed</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                ${requestSummary.reduce((sum, user) => sum + user.totalAmount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {requestSummary.reduce((sum, user) => sum + user.totalRequests, 0)} requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Success Rate</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {(requestSummary.reduce((sum, user) => sum + user.successRate, 0) / requestSummary.length).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average across all users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Users</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {requestSummary.filter(user => user.accountStatus === 'Active' || user.accountStatus === 'VIP' || user.accountStatus === 'Premium').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of {requestSummary.length} total users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Amount</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                ${Math.round(requestSummary.reduce((sum, user) => sum + user.averageAmount, 0) / requestSummary.length).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per withdrawal request
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Request Summary Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User Details</TableCell>
              <TableCell>Request Statistics</TableCell>
              <TableCell>Financial Summary</TableCell>
              <TableCell>Account Status</TableCell>
              <TableCell>Limits & Usage</TableCell>
              <TableCell>Risk Assessment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requestSummary.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last: {user.lastWithdrawal}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Preferred: {user.preferredCurrency}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.totalRequests} requests
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Success: {user.successRate}%
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Avg: ${user.averageAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      ${user.totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Approved: ${user.approvedAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" display="block" color="warning.main">
                      Pending: ${user.pendingAmount.toLocaleString()}
                    </Typography>
                    {user.rejectedAmount > 0 && (
                      <Typography variant="caption" display="block" color="error.main">
                        Rejected: ${user.rejectedAmount.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={user.accountStatus}
                      color={user.accountStatus === 'VIP' ? 'secondary' : user.accountStatus === 'Premium' ? 'primary' : 'default'}
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      Risk: {user.riskLevel}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="caption" display="block">
                      Limit: ${user.monthlyLimit.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" display="block" color="warning.main">
                      Used: ${user.usedLimit.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" display="block" color="success.main">
                      Available: ${user.availableLimit.toLocaleString()}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(user.usedLimit / user.monthlyLimit) * 100}
                      sx={{ mt: 0.5, height: 4 }}
                      color={user.usedLimit / user.monthlyLimit > 0.8 ? 'error' : 'primary'}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={user.riskLevel}
                      color={user.riskLevel === 'Low' ? 'success' : user.riskLevel === 'Medium' ? 'warning' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton color="primary" size="small">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Adjust Limits">
                      <IconButton color="warning" size="small">
                        <Assessment />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Block User">
                      <IconButton color="error" size="small">
                        <Block />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderDatewiseSummary = () => (
    <Box>
      {/* Date Range Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select label="Period" defaultValue="daily">
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small">Apply</Button>
                <Button variant="outlined" startIcon={<Download />} size="small">Export</Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Daily Performance Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Volume</Typography>
              <Typography variant="h4" color="primary.main">
                ${datewiseSummary.reduce((sum, day) => sum + day.totalAmount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 5 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Avg Success Rate</Typography>
              <Typography variant="h4" color="success.main">
                {(datewiseSummary.reduce((sum, day) => sum + day.successRate, 0) / datewiseSummary.length).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Requests</Typography>
              <Typography variant="h4" color="info.main">
                {datewiseSummary.reduce((sum, day) => sum + day.totalRequests, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 5 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Network Fees</Typography>
              <Typography variant="h4" color="warning.main">
                ${datewiseSummary.reduce((sum, day) => sum + day.networkFees, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total fees collected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Datewise Summary Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Request Overview</TableCell>
              <TableCell>Financial Summary</TableCell>
              <TableCell>Performance Metrics</TableCell>
              <TableCell>Currency Breakdown</TableCell>
              <TableCell>Peak Activity</TableCell>
              <TableCell>Top Performer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datewiseSummary.map((day, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {day.date}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {day.totalRequests} requests
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Approved: {day.approvedRequests}
                    </Typography>
                    <Typography variant="caption" display="block" color="warning.main">
                      Pending: {day.pendingRequests}
                    </Typography>
                    <Typography variant="caption" display="block" color="error.main">
                      Rejected: {day.rejectedRequests}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      ${day.totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Approved: ${day.approvedAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" display="block" color="warning.main">
                      Pending: ${day.pendingAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Avg: ${day.averageAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {day.successRate}% success
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg time: {day.processingTime}
                    </Typography>
                    <Typography variant="caption" display="block" color="warning.main">
                      Fees: ${day.networkFees}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="caption" display="block">
                      USDT: ${day.currencies.USDT?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="caption" display="block">
                      BTC: ${day.currencies.Bitcoin?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="caption" display="block">
                      ETH: ${day.currencies.Ethereum?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Peak: {day.peakHour}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {day.topUser}
                    </Typography>
                    <Typography variant="caption" color="primary.main">
                      ${day.topAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Analytics */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Weekly Performance Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Best Performing Day
                </Typography>
                <Typography variant="h6" color="success.main">
                  {datewiseSummary.reduce((best, day) => day.successRate > best.successRate ? day : best).date}
                </Typography>
                <Typography variant="caption">
                  {datewiseSummary.reduce((best, day) => day.successRate > best.successRate ? day : best).successRate}% success rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Highest Volume Day
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {datewiseSummary.reduce((highest, day) => day.totalAmount > highest.totalAmount ? day : highest).date}
                </Typography>
                <Typography variant="caption">
                  ${datewiseSummary.reduce((highest, day) => day.totalAmount > highest.totalAmount ? day : highest).totalAmount.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Most Active Day
                </Typography>
                <Typography variant="h6" color="info.main">
                  {datewiseSummary.reduce((most, day) => day.totalRequests > most.totalRequests ? day : most).date}
                </Typography>
                <Typography variant="caption">
                  {datewiseSummary.reduce((most, day) => day.totalRequests > most.totalRequests ? day : most).totalRequests} requests
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const tabContent = [
    renderPendingRequests(),
    renderRequestSummary(),
    renderDatewiseSummary(),
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Withdrawal Management
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Pending Requests" />
            <Tab label="Request Summary" />
            <Tab label="Datewise Summary" />
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {tabContent[activeTab]}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Withdrawal Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Username:</Typography>
                <Typography variant="body1">{selectedRequest.username}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email:</Typography>
                <Typography variant="body1">{selectedRequest.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Amount:</Typography>
                <Typography variant="body1">${selectedRequest.amount}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Fees:</Typography>
                <Typography variant="body1">${selectedRequest.fees}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Net Amount:</Typography>
                <Typography variant="body1">${selectedRequest.netAmount}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Payment Method:</Typography>
                <Typography variant="body1">{selectedRequest.paymentMethod}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Wallet Address:</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                  {selectedRequest.walletAddress}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedRequest && selectedRequest.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleApprove(selectedRequest.id);
                  setOpenDialog(false);
                }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleReject(selectedRequest.id);
                  setOpenDialog(false);
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawalManagement;