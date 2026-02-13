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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Person,
  AttachMoney,
  Visibility,
  Edit,
  Check,
  Close,
  Search,
  FilterList,
  Refresh,
  Email,
  Download,
} from '@mui/icons-material';

const ActivationOptions = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for real data from API
  const [adminActivationData, setAdminActivationData] = useState([]);
  const [activeSummaryData, setActiveSummaryData] = useState([]);
  const [pendingFundRequests, setPendingFundRequests] = useState([]);
  const [processedData, setProcessedData] = useState([]);

  // Fetch all activation data on mount
  useEffect(() => {
    const fetchActivationData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      try {
        // Fetch pending activation users
        const usersResponse = await fetch('/api/admin/users?status=pending', { headers });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setAdminActivationData((usersData.users || []).map(u => ({
            id: u._id,
            username: u.userId || u.username,
            email: u.email,
            registrationDate: new Date(u.createdAt).toLocaleDateString(),
            status: u.status || 'pending',
            package: u.package || 'Basic',
            amount: u.totalInvested || 0,
            referredBy: u.referredBy || 'Direct',
          })));
        }

        // Fetch active summary by package
        const summaryResponse = await fetch('/api/admin/summary', { headers });
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          // Group users by package for active summary
          const packageStats = {};
          (summaryData.users || []).filter(u => u.status === 'active').forEach(u => {
            const pkg = u.package || 'Basic';
            if (!packageStats[pkg]) {
              packageStats[pkg] = { package: pkg, totalUsers: 0, totalAmount: 0, thisMonth: 0, lastMonth: 0 };
            }
            packageStats[pkg].totalUsers++;
            packageStats[pkg].totalAmount += u.totalInvested || 0;
            const userDate = new Date(u.createdAt);
            const now = new Date();
            if (userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()) {
              packageStats[pkg].thisMonth++;
            } else if (userDate.getMonth() === now.getMonth() - 1) {
              packageStats[pkg].lastMonth++;
            }
          });
          setActiveSummaryData(Object.values(packageStats).length > 0 ? Object.values(packageStats) : [
            { package: 'Basic', totalUsers: 0, totalAmount: 0, thisMonth: 0, lastMonth: 0 },
            { package: 'Premium', totalUsers: 0, totalAmount: 0, thisMonth: 0, lastMonth: 0 },
            { package: 'VIP', totalUsers: 0, totalAmount: 0, thisMonth: 0, lastMonth: 0 },
          ]);
        }

        // Fetch pending deposits for pending fund requests
        const depositsResponse = await fetch('/api/admin/deposits/pending', { headers });
        if (depositsResponse.ok) {
          const depositsData = await depositsResponse.json();
          setPendingFundRequests((depositsData.deposits || []).map(d => ({
            id: d._id,
            username: d.userId?.userId || d.userId?.firstName || 'Unknown',
            requestDate: new Date(d.createdAt).toLocaleDateString(),
            amount: d.amount,
            paymentMethod: d.currency || 'USDT',
            transactionId: d.txHash || d.transactionId || 'N/A',
            status: d.status || 'pending',
          })));
        }

        // Fetch processed transactions
        const processedResponse = await fetch('/api/admin/transactions/recent?limit=50', { headers });
        if (processedResponse.ok) {
          const processedTx = await processedResponse.json();
          setProcessedData((processedTx.transactions || []).filter(t => t.status !== 'pending').map(t => ({
            id: t.id,
            username: t.userName || 'Unknown',
            processedDate: new Date(t.date).toLocaleDateString(),
            amount: t.amount,
            status: t.status,
            processedBy: 'admin',
            remarks: t.status === 'approved' ? 'Successfully processed' : 'Transaction rejected',
          })));
        }
      } catch (error) {
        console.error('Error fetching activation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivationData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleApprove = (userId) => {
    console.log('Approving user:', userId);
    // Add approval logic here
  };

  const handleReject = (userId) => {
    console.log('Rejecting user:', userId);
    // Add rejection logic here
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderAdminActivation = () => (
    <Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Enhanced Search and Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by username, email, or package..."
          variant="outlined"
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select label="Status Filter" defaultValue="">
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Package Filter</InputLabel>
          <Select label="Package Filter" defaultValue="">
            <MenuItem value="">All Packages</MenuItem>
            <MenuItem value="Basic">Basic</MenuItem>
            <MenuItem value="Premium">Premium</MenuItem>
            <MenuItem value="VIP">VIP</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<FilterList />}>
          Apply Filters
        </Button>
        <Button variant="outlined" startIcon={<Refresh />}>
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{adminActivationData.length}</Typography>
              <Typography variant="body2">All registered users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Pending</Typography>
              <Typography variant="h4">
                {adminActivationData.filter(u => u.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Awaiting approval</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Approved</Typography>
              <Typography variant="h4">
                {adminActivationData.filter(u => u.status === 'approved').length}
              </Typography>
              <Typography variant="body2">Active users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Rejected</Typography>
              <Typography variant="h4">
                {adminActivationData.filter(u => u.status === 'rejected').length}
              </Typography>
              <Typography variant="body2">Declined users</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced User Management Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>User Info</TableCell>
              <TableCell>Package Details</TableCell>
              <TableCell>Investment</TableCell>
              <TableCell>Registration</TableCell>
              <TableCell>Referral Info</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adminActivationData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No pending activations found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : adminActivationData.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{user.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {user.id}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip 
                      label={user.package} 
                      color={user.package === 'VIP' ? 'primary' : user.package === 'Premium' ? 'secondary' : 'default'}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {user.package === 'VIP' ? 'Full Access + Bonuses' : 
                       user.package === 'Premium' ? 'Enhanced Features' : 
                       'Standard Features'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="h6" color="primary">
                      ${user.amount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Initial Investment
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{user.registrationDate}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{user.referredBy}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Referrer
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Approve User">
                      <IconButton
                        color="success"
                        size="small"
                        onClick={() => handleApprove(user.id)}
                        disabled={user.status === 'approved'}
                      >
                        <Check />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject User">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleReject(user.id)}
                        disabled={user.status === 'rejected'}
                      >
                        <Close />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenDialog(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Message">
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
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="success" startIcon={<Check />}>
          Approve Selected
        </Button>
        <Button variant="outlined" color="error" startIcon={<Close />}>
          Reject Selected
        </Button>
        <Button variant="outlined" startIcon={<Email />}>
          Send Bulk Email
        </Button>
      </Box>
    </Box>
  );

  const renderActiveSummary = () => (
    <Box>
      {/* Summary Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Total Active Users</Typography>
              <Typography variant="h3">
                {activeSummaryData.reduce((sum, item) => sum + item.totalUsers, 0)}
              </Typography>
              <Typography variant="body2">Across all packages</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Total Investment</Typography>
              <Typography variant="h3">
                ${activeSummaryData.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2">Total platform value</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6">This Month Growth</Typography>
              <Typography variant="h3">
                {activeSummaryData.reduce((sum, item) => sum + item.thisMonth, 0)}
              </Typography>
              <Typography variant="body2">New activations</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Average Investment</Typography>
              <Typography variant="h3">
                ${Math.round(activeSummaryData.reduce((sum, item) => sum + item.totalAmount, 0) / 
                  activeSummaryData.reduce((sum, item) => sum + item.totalUsers, 0)).toLocaleString()}
              </Typography>
              <Typography variant="body2">Per user</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Package Details */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Package Performance Analysis
      </Typography>
      
      <Grid container spacing={3}>
        {activeSummaryData.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={item.package} 
                    color={item.package === 'VIP' ? 'primary' : item.package === 'Premium' ? 'secondary' : 'default'}
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h6">
                    Package
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" color="primary">
                    {item.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.totalUsers / activeSummaryData.reduce((sum, i) => sum + i.totalUsers, 0)) * 100}
                    sx={{ mt: 1 }}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" color="success.main">
                    ${item.totalAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Investment
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg: ${Math.round(item.totalAmount / item.totalUsers).toLocaleString()} per user
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="success.main">
                      {item.thisMonth} This Month
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      New users
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.lastMonth} Last Month
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Previous period
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Package Features:
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.package === 'VIP' ? 
                      '• Premium support • Advanced analytics • Bonus rewards • Priority processing' :
                      item.package === 'Premium' ?
                      '• Enhanced features • Priority support • Monthly bonuses' :
                      '• Basic features • Standard support • Community access'
                    }
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined">
                    View Details
                  </Button>
                  <Button size="small" variant="text">
                    Export Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Metrics */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Performance Trends
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Package</TableCell>
                <TableCell align="right">Current Users</TableCell>
                <TableCell align="right">This Month</TableCell>
                <TableCell align="right">Last Month</TableCell>
                <TableCell align="right">Growth Rate</TableCell>
                <TableCell align="right">Revenue Share</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeSummaryData.map((item) => {
                const growthRate = ((item.thisMonth - item.lastMonth) / item.lastMonth * 100).toFixed(1);
                const totalRevenue = activeSummaryData.reduce((sum, i) => sum + i.totalAmount, 0);
                const revenueShare = ((item.totalAmount / totalRevenue) * 100).toFixed(1);
                
                return (
                  <TableRow key={item.package}>
                    <TableCell>
                      <Chip 
                        label={item.package} 
                        color={item.package === 'VIP' ? 'primary' : item.package === 'Premium' ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{item.totalUsers}</TableCell>
                    <TableCell align="right">
                      <Typography color="success.main">+{item.thisMonth}</Typography>
                    </TableCell>
                    <TableCell align="right">{item.lastMonth}</TableCell>
                    <TableCell align="right">
                      <Typography color={growthRate > 0 ? 'success.main' : 'error.main'}>
                        {growthRate > 0 ? '+' : ''}{growthRate}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{revenueShare}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );

  const renderPendingFunds = () => (
    <Box>
      {/* Fund Request Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Pending Requests</Typography>
              <Typography variant="h4">
                {pendingFundRequests.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2">Awaiting review</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Under Review</Typography>
              <Typography variant="h4">
                {pendingFundRequests.filter(r => r.status === 'under_review').length}
              </Typography>
              <Typography variant="body2">Being processed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Total Amount</Typography>
              <Typography variant="h4">
                ${pendingFundRequests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2">Pending funds</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Digital Payments</Typography>
              <Typography variant="h4">
                {pendingFundRequests.filter(r => r.paymentMethod.includes('Bitcoin') || r.paymentMethod.includes('Ethereum')).length}
              </Typography>
              <Typography variant="body2">Digital currency</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by username or transaction ID..."
          variant="outlined"
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Payment Method</InputLabel>
          <Select label="Payment Method" defaultValue="">
            <MenuItem value="">All Methods</MenuItem>
            <MenuItem value="Bitcoin">Bitcoin</MenuItem>
            <MenuItem value="Ethereum">Ethereum</MenuItem>
            <MenuItem value="USDT">USDT</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" defaultValue="">
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<FilterList />}>
          Apply Filters
        </Button>
      </Box>

      {/* Enhanced Fund Requests Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>User Details</TableCell>
              <TableCell>Payment Info</TableCell>
              <TableCell>Transaction Details</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verification</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingFundRequests.map((request) => (
              <TableRow key={request.id} hover>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{request.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Request Date: {request.requestDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {request.id}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip 
                      label={request.paymentMethod}
                      color={request.paymentMethod.includes('Bitcoin') ? 'warning' : 
                             request.paymentMethod.includes('Ethereum') ? 'info' : 'default'}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {request.paymentMethod.includes('Bitcoin') ? 'Cryptocurrency' :
                       request.paymentMethod.includes('Ethereum') ? 'Smart Contract' :
                       'Traditional Payment'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {request.transactionId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Transaction ID
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button size="small" variant="text" startIcon={<Visibility />}>
                        Verify on Blockchain
                      </Button>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="h6" color="primary">
                      ${request.amount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.paymentMethod.includes('Bitcoin') ? '≈ 0.0041 BTC' :
                       request.paymentMethod.includes('Ethereum') ? '≈ 0.15 ETH' :
                       'USD'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status.replace('_', ' ')}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" color="success.main">
                      ✓ Amount Verified
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      ⏳ Blockchain Pending
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      2/3 confirmations
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Approve Request">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                      </Tooltip>
                      <Tooltip title="Reject Request">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </Button>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Transaction">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Contact User">
                        <IconButton size="small" color="info">
                          <Email />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bulk Actions */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button variant="contained" color="success" startIcon={<Check />}>
          Approve Selected
        </Button>
        <Button variant="outlined" color="error" startIcon={<Close />}>
          Reject Selected
        </Button>
        <Button variant="outlined" startIcon={<Refresh />}>
          Refresh Blockchain Status
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          Auto-refresh every 30 seconds
        </Typography>
      </Box>
    </Box>
  );

  const renderProcessed = () => (
    <Box>
      {/* Processed Data Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Total Processed</Typography>
              <Typography variant="h4">
                {processedData.length}
              </Typography>
              <Typography variant="body2">All time transactions</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6">This Month</Typography>
              <Typography variant="h4">
                {processedData.filter(p => new Date(p.processedDate).getMonth() === new Date().getMonth()).length}
              </Typography>
              <Typography variant="body2">Recent activity</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Total Volume</Typography>
              <Typography variant="h4">
                ${processedData.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2">Processed amount</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6">Success Rate</Typography>
              <Typography variant="h4">
                {Math.round((processedData.filter(p => p.status === 'approved').length / processedData.length) * 100)}%
              </Typography>
              <Typography variant="body2">Transaction success</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Advanced Filter and Search Section */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Advanced Filters</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by username, transaction ID, or package..."
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" defaultValue="">
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select label="Date Range" defaultValue="">
                <MenuItem value="">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" size="small" startIcon={<FilterList />}>
                Filter
              </Button>
              <Button variant="outlined" size="small" startIcon={<Refresh />}>
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Enhanced Processed Data Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>User Details</TableCell>
              <TableCell>Processing Info</TableCell>
              <TableCell>Financial Details</TableCell>
              <TableCell>Status & Results</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processedData.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{item.username}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      User ID: {item.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processed: {item.processedDate}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      <strong>Processed By:</strong> {item.processedBy}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processing Time: {Math.floor(Math.random() * 24) + 1} hours
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Auto-processed
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="h6" color="primary">
                      ${item.amount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processing Fee: ${(item.amount * 0.03).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Net Amount: ${(item.amount * 0.97).toFixed(2)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {item.status === 'approved' ? '✓ Successfully processed' :
                       item.status === 'rejected' ? '✗ Processing failed' :
                       '⏳ Under review'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.remarks}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Contact User">
                        <IconButton size="small" color="secondary">
                          <Email />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {item.status === 'rejected' && (
                      <Button size="small" variant="outlined" color="warning">
                        Review Again
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bulk Actions and Export Options */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<Email />}>
          Send Notifications
        </Button>
        <Button variant="outlined" startIcon={<Refresh />}>
          Refresh Data
        </Button>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Export Format</InputLabel>
          <Select label="Export Format" defaultValue="excel">
            <MenuItem value="excel">Excel (.xlsx)</MenuItem>
            <MenuItem value="csv">CSV (.csv)</MenuItem>
            <MenuItem value="pdf">PDF Report</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          Showing {processedData.length} transactions
        </Typography>
      </Box>

      {/* Transaction Analytics Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Processing Analytics</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Average Transaction Value</Typography>
            <Typography variant="h5" color="primary">
              ${Math.round(processedData.reduce((sum, p) => sum + p.amount, 0) / processedData.length).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Average Processing Time</Typography>
            <Typography variant="h5" color="secondary">
              18 hours
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Peak Processing Day</Typography>
            <Typography variant="h5" color="info.main">
              Monday
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  const tabContent = [
    renderAdminActivation(),
    renderActiveSummary(),
    renderPendingFunds(),
    renderProcessed(),
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h4" gutterBottom>
        Activation Options
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Admin Activation" />
            <Tab label="All Active Summary" />
            <Tab label="Pending Fund Request" />
            <Tab label="Processed" />
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {tabContent[activeTab]}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Username:</Typography>
                <Typography variant="body1">{selectedUser.username}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email:</Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Package:</Typography>
                <Typography variant="body1">{selectedUser.package}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Amount:</Typography>
                <Typography variant="body1">${selectedUser.amount}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Registration Date:</Typography>
                <Typography variant="body1">{selectedUser.registrationDate}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Referred By:</Typography>
                <Typography variant="body1">{selectedUser.referredBy}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivationOptions;
