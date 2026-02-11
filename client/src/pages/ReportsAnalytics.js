import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  Group,
  Assessment,
  Download,
  Print,
  Share,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  AccountBalance,
  EmojiEvents,
  Speed,
  Visibility,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

const ReportsAnalytics = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [networkGrowth, setNetworkGrowth] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setLoading(true);

    Promise.all([
      fetch('/api/admin/overview-stats', { headers }).then(r => r.json()).catch(() => ({ data: null })),
      fetch('/api/reports/transactions', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/admin/top-performers', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/admin/network-growth', { headers }).then(r => r.json()).catch(() => ({ data: [] }))
    ]).then(([statsRes, transRes, perfRes, networkRes]) => {
      // Set overview stats with zeros if no data
      setOverviewStats([
        {
          title: 'Total Revenue',
          value: `$${statsRes?.data?.totalRevenue || 0}`,
          change: '+0%',
          trend: 'up',
          icon: <MonetizationOn />,
          color: 'success'
        },
        {
          title: 'Active Members',
          value: String(statsRes?.data?.activeMembers || 0),
          change: '+0%',
          trend: 'up',
          icon: <Group />,
          color: 'primary'
        },
        {
          title: 'Commission Paid',
          value: `$${statsRes?.data?.commissionPaid || 0}`,
          change: '+0%',
          trend: 'up',
          icon: <AccountBalance />,
          color: 'warning'
        },
        {
          title: 'Total Users',
          value: String(statsRes?.data?.totalUsers || 0),
          change: '+0%',
          trend: 'up',
          icon: <Speed />,
          color: 'info'
        }
      ]);

      // Set recent transactions
      setRecentTransactions((transRes.data || []).slice(0, 5).map((t, idx) => ({
        id: t.transactionId || `TXN${idx + 1}`,
        type: t.type || 'Transaction',
        member: t.userName || 'User',
        amount: `$${t.totalAmount || 0}`,
        status: t.status || 'Pending',
        date: t.transactionDate || '',
        description: t.description || ''
      })));

      // Set top performers (empty if no data)
      setTopPerformers((perfRes.data || []).map(p => ({
        name: p.name || 'User',
        rank: p.rank || 'Member',
        earnings: `$${p.earnings || 0}`,
        team: p.teamSize || 0,
        growth: '+0%',
        avatar: ''
      })));

      // Set network growth (empty if no data)
      setNetworkGrowth((networkRes.data || []).map((n, idx) => ({
        level: `Level ${idx + 1}`,
        members: n.members || 0,
        percentage: n.percentage || 0
      })));

      setLoading(false);
    }).catch(err => {
      console.error('Failed to load reports', err);
      setLoading(false);
    });
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'success',
      'Pending': 'warning',
      'Processing': 'info',
      'Failed': 'error'
    };
    return colors[status] || 'default';
  };

  const getRankColor = (rank) => {
    const colors = {
      'Diamond': 'primary',
      'Platinum': 'secondary',
      'Gold': 'warning',
      'Silver': 'info',
      'Bronze': 'success'
    };
    return colors[rank] || 'default';
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>{children}</Box>}
    </div>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive business insights and performance metrics
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="7days">Last 7 days</MenuItem>
              <MenuItem value="30days">Last 30 days</MenuItem>
              <MenuItem value="90days">Last 90 days</MenuItem>
              <MenuItem value="1year">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<Print />}>
            Print
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
      <>
      {/* Overview Stats */}
      <Grid container spacing={3} mb={4}>
        {overviewStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.trend === 'up' ? 'success' : 'error'}
                      icon={stat.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                    />
                  </Box>
                  <Box color={`${stat.color}.main`}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Sales Analytics" icon={<ShowChart />} />
          <Tab label="Network Growth" icon={<Timeline />} />
          <Tab label="Top Performers" icon={<EmojiEvents />} />
          <Tab label="Transactions" icon={<Assessment />} />
        </Tabs>

        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue & Commission Trends
                  </Typography>
                  <Box height={300} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="text.secondary">
                      Interactive chart showing revenue and commission trends over time
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Summary
                  </Typography>
                  <List>
                    {salesData.slice(-3).map((data, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={data.month}
                          secondary={`Revenue: $${data.revenue.toLocaleString()}`}
                        />
                        <Typography variant="body2" color="primary">
                          ${data.commissions.toLocaleString()}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Network Level Distribution
                  </Typography>
                  <Box mt={3}>
                    {networkGrowth.map((level, index) => (
                      <Box key={index} mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">{level.level}</Typography>
                          <Typography variant="body2">{level.members} members</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={level.percentage}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Growth Metrics
                  </Typography>
                  <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2">Total Network Size</Typography>
                      <Typography variant="h6" color="primary">744</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2">Active Members</Typography>
                      <Typography variant="h6" color="success.main">692</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2">Monthly Growth</Typography>
                      <Typography variant="h6" color="warning.main">+12.5%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Retention Rate</Typography>
                      <Typography variant="h6" color="info.main">93.2%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performing Members
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Rank</TableCell>
                      <TableCell>Monthly Earnings</TableCell>
                      <TableCell>Team Size</TableCell>
                      <TableCell>Growth</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPerformers.map((performer, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={performer.avatar} sx={{ mr: 2 }}>
                              {performer.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography variant="subtitle2">
                              {performer.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={performer.rank}
                            color={getRankColor(performer.rank)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" color="success.main">
                            {performer.earnings}
                          </Typography>
                        </TableCell>
                        <TableCell>{performer.team}</TableCell>
                        <TableCell>
                          <Chip
                            label={performer.growth}
                            color="success"
                            size="small"
                            icon={<TrendingUp />}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton>
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
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                   <TableHead>
                     <TableRow>
                       <TableCell>Transaction ID</TableCell>
                       <TableCell>Type</TableCell>
                       <TableCell>Member</TableCell>
                       <TableCell>Amount</TableCell>
                       <TableCell>Status</TableCell>
                       <TableCell>Date</TableCell>
                       <TableCell>Description</TableCell>
                     </TableRow>
                   </TableHead>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {transaction.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{transaction.member}</TableCell>
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            color={transaction.type === 'Withdrawal' ? 'error.main' : 'success.main'}
                          >
                            {transaction.type === 'Withdrawal' ? '-' : '+'}{transaction.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            color={getStatusColor(transaction.status)}
                            size="small"
                            icon={
                              transaction.status === 'Completed' ? <CheckCircle /> :
                              transaction.status === 'Failed' ? <Warning /> : undefined
                            }
                          />
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.description}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
      </>
      )}
    </Box>
  );
};

export default ReportsAnalytics;