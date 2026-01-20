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
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Calculate,
  TrendingUp,
  MonetizationOn,
  AccountBalance,
  History,
  Settings,
  Refresh,
  Download,
  Visibility,
  Payment,
  Schedule,
  AutoMode,
  ManualMode,
  CheckCircle,
  Pending,
  Error as ErrorIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const CommissionCalculator = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true);

  // ROI and Commission Data
  const roiData = {
    totalInvestment: 15000,
    expectedROI: 18750, // 25% over 12 months
    earnedROI: 12500,
    pendingROI: 6250,
    nextPayoutDate: '2024-02-01',
    nextPayoutAmount: 625,
    roiPercentage: 66.67, // (earnedROI / expectedROI) * 100
    monthlyROI: 1250
  };

  const commissionData = {
    totalCommissions: 8450,
    thisMonthCommissions: 1200,
    pendingCommissions: 450,
    paidCommissions: 8000,
    directReferralCommissions: 3200,
    levelCommissions: 2800,
    teamVolumeBonus: 2450
  };

  // ROI Chart Data
  const roiChartData = [
    { month: 'Jan', roi: 1250, target: 1250 },
    { month: 'Feb', roi: 1250, target: 1250 },
    { month: 'Mar', roi: 1250, target: 1250 },
    { month: 'Apr', roi: 1250, target: 1250 },
    { month: 'May', roi: 1250, target: 1250 },
    { month: 'Jun', roi: 1250, target: 1250 },
    { month: 'Jul', roi: 1250, target: 1250 },
    { month: 'Aug', roi: 1250, target: 1250 },
    { month: 'Sep', roi: 1250, target: 1250 },
    { month: 'Oct', roi: 1250, target: 1250 },
    { month: 'Nov', roi: 0, target: 1250 },
    { month: 'Dec', roi: 0, target: 1250 }
  ];

  // Commission Breakdown
  const commissionBreakdown = [
    { name: 'Direct Referral', value: 3200, color: '#8884d8' },
    { name: 'Level Commission', value: 2800, color: '#82ca9d' },
    { name: 'Team Volume Bonus', value: 2450, color: '#ffc658' }
  ];

  // Payout History
  const payoutHistory = [
    {
      id: 'PAY001',
      date: '2024-01-15',
      type: 'ROI Payment',
      amount: 625.00,
      currency: 'USDT',
      status: 'completed',
      txHash: '0x1234...5678',
      method: 'crypto'
    },
    {
      id: 'PAY002',
      date: '2024-01-14',
      type: 'Commission',
      amount: 150.00,
      currency: 'USDT',
      status: 'completed',
      txHash: '0x2345...6789',
      method: 'crypto'
    },
    {
      id: 'PAY003',
      date: '2024-01-13',
      type: 'Team Bonus',
      amount: 200.00,
      currency: 'USD',
      status: 'pending',
      txHash: null,
      method: 'bank'
    },
    {
      id: 'PAY004',
      date: '2024-01-12',
      type: 'ROI Payment',
      amount: 625.00,
      currency: 'BTC',
      status: 'failed',
      txHash: null,
      method: 'crypto'
    }
  ];

  // Pending Payouts
  const pendingPayouts = [
    {
      id: 'PEND001',
      type: 'ROI Payment',
      amount: 625.00,
      currency: 'USDT',
      dueDate: '2024-02-01',
      autoPayEnabled: true
    },
    {
      id: 'PEND002',
      type: 'Commission',
      amount: 275.00,
      currency: 'USDT',
      dueDate: '2024-02-01',
      autoPayEnabled: true
    },
    {
      id: 'PEND003',
      type: 'Team Bonus',
      amount: 150.00,
      currency: 'USD',
      dueDate: '2024-02-05',
      autoPayEnabled: false
    }
  ];

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

  const handleManualPayout = (payoutId) => {
    const payout = pendingPayouts.find(p => p.id === payoutId);
    setSelectedPayout(payout);
    setShowPayoutDialog(true);
  };

  const processPayout = () => {
    // Process payout logic here
    setShowPayoutDialog(false);
    setSelectedPayout(null);
  };

  const renderROIOverview = () => (
    <Grid container spacing={3}>
      {/* ROI Stats Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <MonetizationOn sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary">
              ${roiData.totalInvestment.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Investment
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main">
              ${roiData.earnedROI.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Earned ROI
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" color="warning.main">
              ${roiData.pendingROI.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending ROI
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Payment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" color="info.main">
              ${roiData.nextPayoutAmount.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next Payout
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {roiData.nextPayoutDate}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* ROI Progress */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ROI Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Progress: {roiData.roiPercentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2">
                  ${roiData.earnedROI.toLocaleString()} / ${roiData.expectedROI.toLocaleString()}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={roiData.roiPercentage}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roiChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="roi" stroke="#8884d8" strokeWidth={2} name="Actual ROI" />
                <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeDasharray="5 5" name="Target ROI" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Commission Breakdown */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Commission Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={commissionBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value}`}
                >
                  {commissionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPayoutManagement = () => (
    <Grid container spacing={3}>
      {/* Payout Settings */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payout Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={autoPayoutEnabled}
                  onChange={(e) => setAutoPayoutEnabled(e.target.checked)}
                />
              }
              label="Auto Payout Enabled"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Automatically process payouts when due
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Payout Statistics
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Total Paid"
                  secondary={`$${commissionData.paidCommissions.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Pending Payouts"
                  secondary={`$${commissionData.pendingCommissions.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="This Month"
                  secondary={`$${commissionData.thisMonthCommissions.toLocaleString()}`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Payouts */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pending Payouts
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Currency</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Auto Pay</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{payout.type}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${payout.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={payout.currency} size="small" />
                      </TableCell>
                      <TableCell>{payout.dueDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={payout.autoPayEnabled ? 'Enabled' : 'Disabled'}
                          color={payout.autoPayEnabled ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleManualPayout(payout.id)}
                        >
                          Process
                        </Button>
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
          <Typography variant="h6">
            Transaction History
          </Typography>
          <Box>
            <IconButton>
              <Refresh />
            </IconButton>
            <IconButton>
              <Download />
            </IconButton>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Transaction</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payoutHistory.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${transaction.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={transaction.currency} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.method}
                      size="small"
                      color={transaction.method === 'crypto' ? 'primary' : 'secondary'}
                    />
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
                    {transaction.txHash ? (
                      <Tooltip title="View on blockchain">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      '-'
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
        Commission & ROI Calculator
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your ROI progress, manage commission payouts, and view transaction history
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<Calculate />} label="ROI Overview" />
          <Tab icon={<Payment />} label="Payout Management" />
          <Tab icon={<History />} label="Transaction History" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderROIOverview()}
      {activeTab === 1 && renderPayoutManagement()}
      {activeTab === 2 && renderTransactionHistory()}

      {/* Manual Payout Dialog */}
      <Dialog open={showPayoutDialog} onClose={() => setShowPayoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Manual Payout</DialogTitle>
        <DialogContent>
          {selectedPayout && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Payout Details:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Type"
                    secondary={selectedPayout.type}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Amount"
                    secondary={`$${selectedPayout.amount.toFixed(2)} ${selectedPayout.currency}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Due Date"
                    secondary={selectedPayout.dueDate}
                  />
                </ListItem>
              </List>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select defaultValue="crypto">
                  <MenuItem value="crypto">Crypto Wallet</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
          <Button onClick={processPayout} variant="contained">
            Process Payout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionCalculator;