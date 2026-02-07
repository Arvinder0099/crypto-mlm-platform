import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Group,
  AttachMoney,
  ShowChart,
  PieChart,
  BarChart,
  Timeline,
  Download,
  Refresh,
  FilterList,
  Visibility,
  Share,
  Print,
  DateRange,
  Analytics as AnalyticsIcon,
  Dashboard,
  Assessment
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [reportDialog, setReportDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for API data
  const [topPerformers, setTopPerformers] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState([
    { title: 'Total Revenue', value: '$0', change: '0%', trend: 'up', icon: <AttachMoney />, color: 'success' },
    { title: 'Active Members', value: '0', change: '0%', trend: 'up', icon: <Group />, color: 'primary' },
    { title: 'Investment Pool', value: '$0', change: '0%', trend: 'up', icon: <AccountBalance />, color: 'info' },
    { title: 'ROI Average', value: '0%', change: '0%', trend: 'up', icon: <ShowChart />, color: 'warning' }
  ]);

  // Sample data for charts - these show trends and can remain as visualization examples
  const revenueData = [
    { month: 'Jan', revenue: 0, investment: 0, profit: 0 },
    { month: 'Feb', revenue: 0, investment: 0, profit: 0 },
    { month: 'Mar', revenue: 0, investment: 0, profit: 0 },
    { month: 'Apr', revenue: 0, investment: 0, profit: 0 },
    { month: 'May', revenue: 0, investment: 0, profit: 0 },
    { month: 'Jun', revenue: 0, investment: 0, profit: 0 }
  ];

  const networkGrowthData = [
    { month: 'Jan', active: 0, new: 0, inactive: 0 },
    { month: 'Feb', active: 0, new: 0, inactive: 0 },
    { month: 'Mar', active: 0, new: 0, inactive: 0 },
    { month: 'Apr', active: 0, new: 0, inactive: 0 },
    { month: 'May', active: 0, new: 0, inactive: 0 },
    { month: 'Jun', active: 0, new: 0, inactive: 0 }
  ];

  const investmentDistribution = [
    { name: 'Bitcoin', value: 0, amount: 0, color: '#f7931a' },
    { name: 'Ethereum', value: 0, amount: 0, color: '#627eea' },
    { name: 'USDT', value: 0, amount: 0, color: '#26a17b' },
    { name: 'Others', value: 0, amount: 0, color: '#8884d8' }
  ];

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      try {
        // Fetch summary for KPIs
        const summaryResponse = await fetch('/api/admin/summary', { headers });
        if (summaryResponse.ok) {
          const summary = await summaryResponse.json();
          const totalRevenue = summary.creditDebit?.totalCredited || 0;
          const activeMembers = summary.members?.active || 0;
          const investmentPool = summary.investments?.totalInvestment || 0;

          setKpiMetrics([
            { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+0%', trend: 'up', icon: <AttachMoney />, color: 'success' },
            { title: 'Active Members', value: activeMembers.toLocaleString(), change: '+0%', trend: 'up', icon: <Group />, color: 'primary' },
            { title: 'Investment Pool', value: `$${investmentPool.toLocaleString()}`, change: '+0%', trend: 'up', icon: <AccountBalance />, color: 'info' },
            { title: 'ROI Average', value: '0%', change: '0%', trend: 'up', icon: <ShowChart />, color: 'warning' }
          ]);
        }

        // Fetch top performers (top earners)
        const membersResponse = await fetch('/api/admin/members?sort=totalEarned&limit=5', { headers });
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setTopPerformers((membersData.members || []).map(m => ({
            name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.userId,
            level: m.rank || 'Member',
            earnings: m.totalEarned || 0,
            growth: 0,
            avatar: (m.firstName?.[0] || 'U') + (m.lastName?.[0] || '')
          })));
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Recent transactions will be fetched from API - showing empty state initially
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch recent transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/admin/transactions/recent', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.transactions) {
          setRecentTransactions(data.transactions);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      }
    };
    fetchTransactions();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Diamond':
        return '#e3f2fd';
      case 'Platinum':
        return '#f3e5f5';
      case 'Gold':
        return '#fff8e1';
      case 'Silver':
        return '#fafafa';
      case 'Bronze':
        return '#efebe9';
      default:
        return '#f5f5f5';
    }
  };

  const exportReport = () => {
    // Simulate report generation
    setReportDialog(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Analytics & Reports
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select value={timeRange} onChange={handleTimeRangeChange} label="Time Range">
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportReport}
            >
              Export Report
            </Button>
            <IconButton>
              <Refresh />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive analytics and performance metrics for your Hexanova platform
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" icon={<Dashboard />} />
          <Tab label="Revenue" icon={<AttachMoney />} />
          <Tab label="Network Growth" icon={<Group />} />
          <Tab label="Investments" icon={<PieChart />} />
          <Tab label="Performance" icon={<Assessment />} />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Box>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpiMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                          {metric.title}
                        </Typography>
                        <Typography variant="h4" component="div">
                          {metric.value}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {metric.trend === 'up' ? (
                            <TrendingUp color="success" sx={{ mr: 0.5 }} />
                          ) : (
                            <TrendingDown color="error" sx={{ mr: 0.5 }} />
                          )}
                          <Typography
                            variant="body2"
                            color={metric.trend === 'up' ? 'success.main' : 'error.main'}
                          >
                            {metric.change}
                          </Typography>
                        </Box>
                      </Box>
                      <Avatar sx={{ bgcolor: `${metric.color}.light` }}>
                        {metric.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Revenue Trend" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        fill="#8884d8"
                        stroke="#8884d8"
                        fillOpacity={0.3}
                      />
                      <Bar dataKey="profit" fill="#82ca9d" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Investment Distribution" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <RechartsTooltip />
                      <RechartsPieChart
                        data={investmentDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {investmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Top Performers" />
                <CardContent>
                  <List>
                    {topPerformers.map((performer, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getLevelColor(performer.level) }}>
                            {performer.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={performer.name}
                          secondary={
                            <Box>
                              <Chip label={performer.level} size="small" sx={{ mr: 1 }} />
                              <Typography variant="body2" component="span">
                                ${performer.earnings.toLocaleString()} (+{performer.growth}%)
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Recent Transactions" />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{transaction.user}</TableCell>
                            <TableCell>{transaction.type}</TableCell>
                            <TableCell>${transaction.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.status}
                                color={getStatusColor(transaction.status)}
                                size="small"
                              />
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
        </Box>
      )}

      {/* Revenue Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Revenue Analytics" />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="investment" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Network Growth Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Network Growth Analytics" />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={networkGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="new"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                    <Area
                      type="monotone"
                      dataKey="inactive"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Investments Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Investment Distribution" />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart>
                    <RechartsTooltip />
                    <RechartsPieChart
                      data={investmentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {investmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Investment Breakdown" />
              <CardContent>
                <List>
                  {investmentDistribution.map((investment, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: investment.color, width: 24, height: 24 }}>
                          {' '}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={investment.name}
                        secondary={`${investment.value}% - $${investment.amount.toLocaleString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Performance Tab */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Performance Metrics" />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Conversion Rate</Typography>
                      <Typography variant="h3" color="primary">
                        12.5%
                      </Typography>
                      <LinearProgress variant="determinate" value={12.5} sx={{ mt: 1 }} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Retention Rate</Typography>
                      <Typography variant="h3" color="success.main">
                        87.3%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={87.3}
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Average ROI</Typography>
                      <Typography variant="h3" color="warning.main">
                        24.8%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={24.8}
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Export Report Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)}>
        <DialogTitle>Export Analytics Report</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Select the report format and data range for export:
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Report Format</InputLabel>
            <Select defaultValue="pdf" label="Report Format">
              <MenuItem value="pdf">PDF Report</MenuItem>
              <MenuItem value="excel">Excel Spreadsheet</MenuItem>
              <MenuItem value="csv">CSV Data</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Data Range</InputLabel>
            <Select defaultValue="30d" label="Data Range">
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Download />}>
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Analytics;