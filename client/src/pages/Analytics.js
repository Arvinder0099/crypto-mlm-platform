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

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 45000, investment: 35000, profit: 10000 },
    { month: 'Feb', revenue: 52000, investment: 38000, profit: 14000 },
    { month: 'Mar', revenue: 48000, investment: 36000, profit: 12000 },
    { month: 'Apr', revenue: 61000, investment: 42000, profit: 19000 },
    { month: 'May', revenue: 55000, investment: 40000, profit: 15000 },
    { month: 'Jun', revenue: 67000, investment: 45000, profit: 22000 },
    { month: 'Jul', revenue: 71000, investment: 48000, profit: 23000 },
    { month: 'Aug', revenue: 69000, investment: 47000, profit: 22000 },
    { month: 'Sep', revenue: 78000, investment: 52000, profit: 26000 },
    { month: 'Oct', revenue: 82000, investment: 55000, profit: 27000 },
    { month: 'Nov', revenue: 85000, investment: 57000, profit: 28000 },
    { month: 'Dec', revenue: 92000, investment: 62000, profit: 30000 }
  ];

  const networkGrowthData = [
    { month: 'Jan', active: 1250, new: 180, inactive: 45 },
    { month: 'Feb', active: 1380, new: 220, inactive: 90 },
    { month: 'Mar', active: 1520, new: 195, inactive: 55 },
    { month: 'Apr', active: 1680, new: 240, inactive: 80 },
    { month: 'May', active: 1850, new: 210, inactive: 40 },
    { month: 'Jun', active: 2020, new: 280, inactive: 110 },
    { month: 'Jul', active: 2180, new: 260, inactive: 100 },
    { month: 'Aug', active: 2350, new: 290, inactive: 120 },
    { month: 'Sep', active: 2520, new: 310, inactive: 140 },
    { month: 'Oct', active: 2680, new: 280, inactive: 120 },
    { month: 'Nov', active: 2850, new: 320, inactive: 150 },
    { month: 'Dec', active: 3020, new: 340, inactive: 170 }
  ];

  const investmentDistribution = [
    { name: 'Bitcoin', value: 35, amount: 245000, color: '#f7931a' },
    { name: 'Ethereum', value: 25, amount: 175000, color: '#627eea' },
    { name: 'Binance Coin', value: 15, amount: 105000, color: '#f3ba2f' },
    { name: 'Cardano', value: 12, amount: 84000, color: '#0033ad' },
    { name: 'Solana', value: 8, amount: 56000, color: '#9945ff' },
    { name: 'Others', value: 5, amount: 35000, color: '#8884d8' }
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', level: 'Diamond', earnings: 15420, growth: 23.5, avatar: 'SJ' },
    { name: 'Michael Chen', level: 'Platinum', earnings: 12890, growth: 18.2, avatar: 'MC' },
    { name: 'Lisa Rodriguez', level: 'Gold', earnings: 9650, growth: 15.8, avatar: 'LR' },
    { name: 'David Kim', level: 'Silver', earnings: 7320, growth: 12.4, avatar: 'DK' },
    { name: 'Emma Wilson', level: 'Bronze', earnings: 5480, growth: 9.7, avatar: 'EW' }
  ];

  const kpiMetrics = [
    {
      title: 'Total Revenue',
      value: '$847,250',
      change: '+12.5%',
      trend: 'up',
      icon: <AttachMoney />,
      color: 'success'
    },
    {
      title: 'Active Members',
      value: '3,024',
      change: '+8.3%',
      trend: 'up',
      icon: <Group />,
      color: 'primary'
    },
    {
      title: 'Investment Pool',
      value: '$1.2M',
      change: '+15.7%',
      trend: 'up',
      icon: <AccountBalance />,
      color: 'info'
    },
    {
      title: 'ROI Average',
      value: '24.8%',
      change: '-2.1%',
      trend: 'down',
      icon: <ShowChart />,
      color: 'warning'
    }
  ];

  const recentTransactions = [
    { id: 1, user: 'John Doe', type: 'Investment', amount: 5000, status: 'Completed', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', type: 'Withdrawal', amount: 1200, status: 'Pending', time: '4 hours ago' },
    { id: 3, user: 'Mike Johnson', type: 'Commission', amount: 850, status: 'Completed', time: '6 hours ago' },
    { id: 4, user: 'Sarah Wilson', type: 'Investment', amount: 3500, status: 'Completed', time: '8 hours ago' },
    { id: 5, user: 'David Brown', type: 'Bonus', amount: 420, status: 'Completed', time: '12 hours ago' }
  ];

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
          Comprehensive analytics and performance metrics for your MLM platform
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