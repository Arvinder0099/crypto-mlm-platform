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
  FormControl,
  InputLabel,
  Select,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Assessment,
  Download,
  Refresh,
  Search,
  MonetizationOn,
  Schedule,
  Person,
  Group,
  Star,
  Timeline,
  ShowChart,
  Visibility,
} from '@mui/icons-material';

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dailyIncomeData, setDailyIncomeData] = useState([]);
  const [directIncomeData, setDirectIncomeData] = useState([]);
  const [levelIncomeData, setLevelIncomeData] = useState([]);
  const [rankIncomeData, setRankIncomeData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setLoading(true);

    Promise.all([
      fetch('/api/reports/daily-income', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/reports/direct-income', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/reports/level-income', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/reports/rank-income', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/reports/transactions', { headers }).then(r => r.json()).catch(() => ({ data: [] }))
    ]).then(([daily, direct, level, rank, transactions]) => {
      setDailyIncomeData((daily.data || []).map((item, idx) => ({
        id: idx + 1,
        date: item.roiDate || '',
        user: { name: item.userName || 'User', email: item.email || '', avatar: '', id: item.userId || '' },
        package: { name: item.package || '', value: item.packageAmount || 0, roi: item.roiRate || 0 },
        dailyIncome: item.roiAmount || 0,
        totalIncome: item.totalIncome || 0,
        daysActive: item.day || 0,
        status: item.status || 'pending',
        performance: 0
      })));
      setDirectIncomeData((direct.data || []).map((item, idx) => ({
        id: idx + 1,
        referrer: { name: item.userName || 'User', email: item.email || '', avatar: '', id: item.userId || '' },
        referred: { name: item.childName || '', email: item.childEmail || '', avatar: '', id: item.childId || '' },
        package: { name: '', value: item.amount || 0 },
        commission: item.amount || 0,
        commissionRate: item.percent || 0,
        date: item.date || '',
        status: item.status || 'pending'
      })));
      setLevelIncomeData((level.data || []).map((item, idx) => ({
        id: idx + 1,
        user: { name: item.userName || 'User', email: '', avatar: '', id: item.userId || '' },
        level: item.level || 1,
        downlineUser: { name: item.memberName || '', email: '', id: item.memberId || '' },
        package: { name: '', value: item.investmentAmount || 0 },
        commission: item.levelIncome || 0,
        commissionRate: item.levelPercent || 0,
        date: item.datedOn || '',
        status: item.status || 'pending'
      })));
      setRankIncomeData((rank.data || []).map((item, idx) => ({
        id: idx + 1,
        user: { name: item.userName || 'User', email: '', avatar: '', id: item.userId || '' },
        currentRank: item.rank || '',
        monthlyBonus: item.rewardAmount || 0,
        status: item.status || 'pending'
      })));
      setTransactionData((transactions.data || []).map((item, idx) => ({
        id: idx + 1,
        transactionId: item.transactionId || `TXN${idx + 1}`,
        user: { name: item.userName || 'User', email: '', avatar: '', id: item.userId || '' },
        type: item.type || '',
        amount: item.totalAmount || item.creditAmount || 0,
        date: item.transactionDate || '',
        status: item.status || 'pending',
        description: item.description || ''
      })));
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load financial reports', err);
      setLoading(false);
    });
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'completed':
      case 'qualified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'paused':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 0: return dailyIncomeData;
      case 1: return directIncomeData;
      case 2: return levelIncomeData;
      case 3: return rankIncomeData;
      case 4: return transactionData;
      default: return [];
    }
  };

  const renderDailyIncome = () => (
    <Box>
      {/* Daily Income Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Today's Income</Typography>
              </Box>
              <Typography variant="h4" color="success.main">${dailyIncomeData.reduce((sum, d) => sum + (d.dailyIncome || 0), 0).toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">From {dailyIncomeData.length} records</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Users</Typography>
              </Box>
              <Typography variant="h4" color="primary">{dailyIncomeData.filter(d => d.status === 'active').length}</Typography>
              <Typography variant="body2" color="text.secondary">Currently active</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg. Daily ROI</Typography>
              </Box>
              <Typography variant="h4" color="info.main">{dailyIncomeData.length > 0 ? (dailyIncomeData.reduce((sum, d) => sum + (d.package?.roi || 0), 0) / dailyIncomeData.length).toFixed(1) : 0}%</Typography>
              <Typography variant="body2" color="text.secondary">Across all packages</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Payouts</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">${dailyIncomeData.reduce((sum, d) => sum + (d.totalIncome || 0), 0).toFixed(0)}</Typography>
              <Typography variant="body2" color="text.secondary">Total income</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Daily Income Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Daily Income Details</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" startIcon={<Refresh />}>Refresh</Button>
              <Button variant="outlined" size="small" startIcon={<Download />}>Export</Button>
            </Box>
          </Box>
          {dailyIncomeData.length === 0 ? (
            <Alert severity="info">No daily income records found</Alert>
          ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User Details</TableCell>
                  <TableCell>Package Info</TableCell>
                  <TableCell>Daily Income</TableCell>
                  <TableCell>Total Income</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyIncomeData.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={income.user.avatar} sx={{ mr: 2 }}>{income.user.name[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{income.user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{income.user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{income.package.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${income.package.value} • {income.package.roi}% ROI
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${income.dailyIncome.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">${income.totalIncome.toFixed(2)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {income.daysActive} days active
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={income.performance} 
                          sx={{ width: 60, mr: 1 }}
                        />
                        <Typography variant="caption">{income.performance}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={income.status} 
                        color={getStatusColor(income.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderDirectIncome = () => (
    <Box>
      {/* Direct Income Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Group color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Referrals</Typography>
              </Box>
              <Typography variant="h4" color="primary">{directIncomeData.length}</Typography>
              <Typography variant="body2" color="text.secondary">All time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Commissions</Typography>
              </Box>
              <Typography variant="h4" color="success.main">${directIncomeData.reduce((sum, d) => sum + (d.commission || 0), 0).toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg. Commission</Typography>
              </Box>
              <Typography variant="h4" color="info.main">${directIncomeData.length > 0 ? (directIncomeData.reduce((sum, d) => sum + (d.commission || 0), 0) / directIncomeData.length).toFixed(2) : 0}</Typography>
              <Typography variant="body2" color="text.secondary">Per referral</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Paid Referrals</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">{directIncomeData.filter(d => d.status === 'paid').length}</Typography>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Direct Income Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Direct Income Summary</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Search referrers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Button variant="outlined" size="small" startIcon={<Download />}>Export</Button>
            </Box>
          </Box>
          {directIncomeData.length === 0 ? (
            <Alert severity="info">No direct income records found</Alert>
          ) : (
            <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Referrer</TableCell>
                  <TableCell>Referred User</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Commission</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {directIncomeData.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={income.referrer.avatar} sx={{ mr: 2 }}>{income.referrer.name[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{income.referrer.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{income.referrer.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={income.referred.avatar} sx={{ mr: 2, width: 32, height: 32 }}>{income.referred.name[0]}</Avatar>
                        <Box>
                          <Typography variant="body2">{income.referred.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{income.referred.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{income.package.name}</Typography>
                      <Typography variant="caption" color="text.secondary">${income.package.value}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${income.commission.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {income.commissionRate}% rate
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{income.activeReferrals} active</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={income.achievement} 
                          sx={{ width: 60, mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={income.status} 
                        color={getStatusColor(income.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderLevelIncome = () => (
    <>
      <Box>
        {/* Level Income Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Timeline color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Levels</Typography>
                </Box>
                <Typography variant="h4" color="primary">7</Typography>
                <Typography variant="body2" color="text.secondary">Active levels</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Group color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Downline</Typography>
                </Box>
                <Typography variant="h4" color="success.main">1,445</Typography>
                <Typography variant="body2" color="text.secondary">All levels</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Level Commissions</Typography>
                </Box>
                <Typography variant="h4" color="info.main">$28,500</Typography>
                <Typography variant="body2" color="text.secondary">This month</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Team Volume</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">$155K</Typography>
                <Typography variant="body2" color="text.secondary">Monthly volume</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Level Income Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Level Income Details</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter Level</InputLabel>
                  <Select value="" label="Filter Level">
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="2">Level 2</MenuItem>
                    <MenuItem value="3">Level 3</MenuItem>
                    <MenuItem value="4">Level 4+</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" size="small" startIcon={<Download />}>Export</Button>
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Downline User</TableCell>
                    <TableCell>Commission</TableCell>
                    <TableCell>Team Performance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {levelIncomeData.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={income.user.avatar} sx={{ mr: 2 }}>{income.user.name[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{income.user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{income.user.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`Level ${income.level}`} 
                          color="primary" 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{income.downlineUser.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {income.activeDownline}/{income.totalDownline} active
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ${income.commission.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {income.commissionRate}% rate
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={income.teamPerformance} 
                            sx={{ width: 60, mr: 1 }}
                          />
                          <Typography variant="caption">{income.teamPerformance}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={income.status} 
                          color={getStatusColor(income.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Team">
                          <IconButton size="small">
                            <Group />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </>
  );

  const renderRankIncome = () => (
    <>
      <Box>
      {/* Rank Income Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Ranks</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">8</Typography>
              <Typography variant="body2" color="text.secondary">Available ranks</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Group color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Qualified Users</Typography>
              </Box>
              <Typography variant="h4" color="primary">283</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Rank Bonuses</Typography>
              </Box>
              <Typography variant="h4" color="success.main">$26,950</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Promotions</Typography>
              </Box>
              <Typography variant="h4" color="info.main">47</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Rank Income Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Rank Achievement Details</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter Rank</InputLabel>
                <Select value="" label="Filter Rank">
                  <MenuItem value="">All Ranks</MenuItem>
                  <MenuItem value="silver">Silver</MenuItem>
                  <MenuItem value="gold">Gold</MenuItem>
                  <MenuItem value="diamond">Diamond</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" size="small" startIcon={<Download />}>Export</Button>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Current Rank</TableCell>
                  <TableCell>Monthly Bonus</TableCell>
                  <TableCell>Progress to Next</TableCell>
                  <TableCell>Total Earned</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankIncomeData.map((rank) => (
                  <TableRow key={rank.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={rank.user.avatar} sx={{ mr: 2 }}>{rank.user.name[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{rank.user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{rank.user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip 
                          label={rank.currentRank} 
                          color="warning" 
                          size="small" 
                          icon={<Star />}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Since {rank.rankAchievedDate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${rank.monthlyBonus.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{rank.nextRank}</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={rank.nextRankProgress} 
                          sx={{ width: 80, mt: 0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {rank.nextRankProgress}% complete
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${rank.totalRankBonus.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rank.status} 
                        color={getStatusColor(rank.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Progress">
                        <IconButton size="small">
                          <Assessment />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
    </>
  );

  const renderTransactionSummary = () => (
    <>
      <Box>
        {/* Transaction Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShowChart color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Transactions</Typography>
              </Box>
              <Typography variant="h4" color="primary">12,847</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Volume</Typography>
              </Box>
              <Typography variant="h4" color="success.main">$1.2M</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Success Rate</Typography>
              </Box>
              <Typography variant="h4" color="info.main">98.7%</Typography>
              <Typography variant="body2" color="text.secondary">Transaction success</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg. Processing</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">2.3m</Typography>
              <Typography variant="body2" color="text.secondary">Average time</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Transaction Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Transaction Details</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Type">
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="deposit">Deposits</MenuItem>
                  <MenuItem value="withdrawal">Withdrawals</MenuItem>
                  <MenuItem value="commission">Commissions</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" size="small" startIcon={<Download />}>Export</Button>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactionData.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                        {transaction.transactionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={transaction.user.avatar} sx={{ mr: 2, width: 32, height: 32 }}>
                          {transaction.user.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{transaction.user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{transaction.user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.type} 
                        color={transaction.type === 'deposit' ? 'success' : transaction.type === 'withdrawal' ? 'error' : 'info'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${transaction.amount.toFixed(2)}
                      </Typography>
                      {transaction.cryptoAmount && (
                        <Typography variant="caption" color="text.secondary">
                          {transaction.cryptoAmount} {transaction.cryptoCurrency}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{transaction.paymentMethod}</Typography>
                      {transaction.networkFee > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Fee: ${transaction.networkFee}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status} 
                        color={getStatusColor(transaction.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{transaction.date}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
    </>
  );

  const tabContent = [
    renderDailyIncome(),
    renderDirectIncome(),
    renderLevelIncome(),
    renderRankIncome(),
    renderTransactionSummary(),
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Financial Reports
        </Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Daily Income Summary" />
              <Tab label="Direct Income Summary" />
              <Tab label="Daily Level Income Summary" />
              <Tab label="Rank Income Summary" />
              <Tab label="Transaction Summary" />
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {tabContent[activeTab]}
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default FinancialReports;