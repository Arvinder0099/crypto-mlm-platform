import React, { useState, useEffect } from 'react';
import axios from 'axios'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Person,
  AccountBalanceWallet,
  TrendingUp,
  Security,
  Verified,
  Edit,
  Save,
  Cancel,
  Add,
  Remove,
  History,
  Download,
  Upload,
  Visibility,
  VisibilityOff,
  QrCode,
  ContentCopy,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Notifications,
  Group,
  MonetizationOn,
  Timeline,
  Assessment,
  Star,
  EmojiEvents,
  TrendingDown,
  Schedule,
  Info,
  Dashboard as DashboardIcon,
  ShowChart,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  WhatsApp,
  Telegram,
  LinkedIn,
  Link as LinkIcon,
  Share,
  Savings
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { fetchJSON } from '../utils/api';

const cardBorder = { border: '2px solid #f06292', borderRadius: 3 };

const SectionCard = ({ children, sx }) => (
  <Card sx={{ ...cardBorder, ...sx }}>
    <CardContent>{children}</CardContent>
  </Card>
);

const KeyValue = ({ label, value, icon }) => (
  <Box display="flex" justifyContent="space-between" py={0.5}>
    <Box display="flex" alignItems="center" gap={1}>
      {icon}
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

const BreakdownRow = ({ label, value, strong }) => (
  <Box display="flex" justifyContent="space-between" py={0.5}>
    <Typography variant={strong ? 'subtitle2' : 'body2'}>{label}</Typography>
    <Typography variant={strong ? 'subtitle2' : 'body2'}>{value}</Typography>
  </Box>
);

const InfoLine = ({ label, value, light }) => (
  <Box display="flex" justifyContent="space-between" gap={2} sx={{ opacity: light ? 0.95 : 1 }}>
    <Typography variant="body2" sx={{ color: light ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>{label}:</Typography>
    <Typography variant="body2" sx={{ color: light ? '#fff' : 'text.primary' }}>{value}</Typography>
  </Box>
);

const RequirementLine = ({ color, label, current, target }) => {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <Box my={1}>
      <Box display="flex" alignItems="center" mb={0.5}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, mr: 1 }} />
        <Typography variant="body2">{label}</Typography>
      </Box>
      <Box sx={{ position: 'relative', height: 8, bgcolor: 'grey.200', borderRadius: 10 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, bgcolor: color, borderRadius: 10 }} />
      </Box>
      <Typography variant="caption">${current.toFixed(2)} / ${target}</Typography>
    </Box>
  );
};

const StatMiniCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
  <SectionCard>
    <Box display="flex" alignItems="center" gap={2}>
      <Box color={`${color}.main`}>
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h6">{value}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      </Box>
    </Box>
  </SectionCard>
);

function PlaceholderBars({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box sx={{ height: 260, position: 'relative', p: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', left: 8, top: 8 }}>
        Amounts in USDT
      </Typography>
      <Box display="flex" alignItems="end" justifyContent="space-between" sx={{ height: '100%' }}>
        {data.map((d) => (
          <Box key={d.label} textAlign="center" sx={{ width: `${100 / data.length - 2}%` }}>
            <Box
              sx={{
                height: `${(d.value / max) * 160}px`,
                minHeight: 3,
                background: 'linear-gradient(180deg,#ff8ea1,#f06292)',
                borderRadius: 1,
                border: '1px solid #f48fb1',
                boxShadow: '0 2px 6px rgba(240,98,146,0.3)'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-block', mt: 1 }}>
              {d.label}
            </Typography>
            <Typography variant="caption" display="block">${d.value.toLocaleString()}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Dashboard data - starts with zeros for fresh users
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    availableBalance: 0,
    totalInvestment: 0,
    totalProfit: 0,
    todayProfit: 0,
    monthlyProfit: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    portfolioGrowth: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    let mounted = true;
    fetchJSON('/api/dashboard/stats')
      .then((res) => {
        const data = res?.data || res;
        if (!mounted || !data) return;
        setDashboardData((prev) => ({
          ...prev,
          totalBalance: data.totalBalance ?? prev.totalBalance,
          totalProfit: data.totalEarnings ?? prev.totalProfit,
          monthlyGrowth: data.monthlyGrowth ?? prev.monthlyGrowth,
          totalReferrals: data.totalReferrals ?? prev.totalReferrals,
          pendingWithdrawals: data.pendingWithdrawals ?? prev.pendingWithdrawals,
        }));
        const activity = Array.isArray(data.recentActivity) ? data.recentActivity : [];
        if (activity.length) {
          setRecentTransactions(activity.map((a, idx) => ({
            id: a.id || idx + 1,
            type: a.type,
            amount: a.amount,
            currency: 'USDT',
            status: a.description,
            date: (a.date || '').slice(0, 10),
            time: (a.date || '').slice(11, 16)
          })));
        }
      })
      .catch((err) => console.warn('Failed to load dashboard stats; using defaults.', err?.message || err));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchJSON('/api/dashboard/plans')
      .then((res) => {
        const plans = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!mounted || !plans.length) return;
        setActivePlans(plans.map((p, idx) => ({
          name: p.name,
          amount: p.minAmount,
          roi: `${p.dailyReturn}%`,
          duration: `${p.duration} days`,
          progress: 50,
          status: p.status === 'active' ? 'Active' : 'Inactive'
        })));
      })
      .catch((err) => console.warn('Failed to load active plans; using defaults.', err?.message || err));
    return () => { mounted = false; };
  }, []);

  // Chart data for performance tracking
  const performanceData = [
    { month: 'Jan', profit: 2500, investment: 15000, growth: 16.7 },
    { month: 'Feb', profit: 3200, investment: 20000, growth: 16.0 },
    { month: 'Mar', profit: 4100, investment: 25000, growth: 16.4 },
    { month: 'Apr', profit: 5800, investment: 35000, growth: 16.6 },
    { month: 'May', profit: 7200, investment: 45000, growth: 16.0 },
    { month: 'Jun', profit: 8900, investment: 55000, growth: 16.2 },
    { month: 'Jul', profit: 11200, investment: 65000, growth: 17.2 },
    { month: 'Aug', profit: 13500, investment: 75000, growth: 18.0 }
  ];

  // Investment distribution data
  const investmentDistribution = [
    { name: 'Bitcoin', value: 35, color: '#f7931a' },
    { name: 'Ethereum', value: 25, color: '#627eea' },
    { name: 'USDT', value: 20, color: '#26a17b' },
    { name: 'BNB', value: 15, color: '#f3ba2f' },
    { name: 'Others', value: 5, color: '#8884d8' }
  ];

  // Recent transactions - empty for fresh users
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Active investment plans - empty for fresh users
  const [activePlans, setActivePlans] = useState([]);

  const accountSummary = [
    { label: 'Total Invest', value: 0 },
    { label: 'Eligible For', value: 0 },
    { label: 'Total Earned', value: 0 },
    { label: 'Available Earning', value: 0 },
    { label: 'Total Withdrawn', value: 0 },
    { label: 'Pending Withdraw', value: 0 },
  ];

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const [referral, setReferral] = useState('');
  const [copied, setCopied] = useState(false);
  // Recent referrals - empty for fresh users, will be fetched from API
  const [recentReferrals, setRecentReferrals] = useState([]);

  // Team summary data - starts with zeros
  const [teamSummary, setTeamSummary] = useState({
    myDirect: 0,
    myDownlines: 0,
    activeDownlines: 0,
    inactiveDownlines: 0,
    totalDownlineBusiness: 0
  });

  // Fetch team summary and referrals
  useEffect(() => {
    fetchJSON('/api/dashboard/team-summary')
      .then((res) => {
        const data = res?.data || res;
        if (data) {
          setTeamSummary({
            myDirect: data.myDirect || 0,
            myDownlines: data.myDownlines || 0,
            activeDownlines: data.activeDownlines || 0,
            inactiveDownlines: data.inactiveDownlines || 0,
            totalDownlineBusiness: data.totalDownlineBusiness || 0
          });
        }
      })
      .catch((err) => console.warn('Failed to load team summary', err?.message || err));
    
    fetchJSON('/api/dashboard/recent-referrals')
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setRecentReferrals(data);
      })
      .catch((err) => console.warn('Failed to load referrals', err?.message || err));
    
    // Set referral link with user ID
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData.userId || userData._id || '';
    setReferral(`${window.location.origin}/register?ref=${userId}`);
  }, []);

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referral);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  // Wallet Management (Finoforce-style)
  const [walletTabIndex, setWalletTabIndex] = useState(0);
  const [creditCurrency, setCreditCurrency] = useState('USD');
  const [debitCurrency, setDebitCurrency] = useState('USD');
  const [withdrawalCurrency, setWithdrawalCurrency] = useState('Bitcoin (BTC)');

  const walletStats = [
    { label: 'Total Balance', value: `$${dashboardData.totalBalance.toLocaleString()}` },
    { label: 'Total Credits', value: `$${(dashboardData.totalInvestment + 5000).toLocaleString()}` },
    { label: 'Total Debits', value: `$${(dashboardData.totalWithdrawals).toLocaleString()}` },
    { label: 'Pending Withdrawals', value: `$${dashboardData.pendingWithdrawals.toLocaleString()}` }
  ];

  const [walletHistory, setWalletHistory] = useState([]);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const showDebit = false;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get('/api/transactions', { headers })
      .then((res) => {
        const data = res.data?.data || [];
        setWalletHistory(data);
      })
      .catch((err) => {
        console.error('Failed to load transactions', err);
      });
  }, []);

  const handleCreditSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post('/api/transactions', {
        type: 'deposit',
        amount: Number(creditAmount),
        currency: creditCurrency,
        description: creditDescription,
      }, { headers });
      setWalletHistory((prev) => [res.data?.data, ...prev]);
      setCreditAmount('');
      setCreditDescription('');
    } catch (err) {
      console.error('Credit submit failed', err);
      alert('Failed to credit account');
    }
  };

  const handleWithdrawalSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const currencyMap = {
        'Bitcoin (BTC)': 'BTC',
        'Ethereum (ETH)': 'ETH',
        'Tether (USDT)': 'USDT',
      };
      const res = await axios.post('/api/transactions', {
        type: 'withdrawal',
        amount: Number(withdrawalAmount),
        currency: currencyMap[withdrawalCurrency] || withdrawalCurrency,
        walletAddress,
      }, { headers });
      setWalletHistory((prev) => [res.data?.data, ...prev]);
      setWithdrawalAmount('');
      setWalletAddress('');
    } catch (err) {
      console.error('Withdrawal submit failed', err);
      alert('Failed to process withdrawal');
    }
  };

  // Users Overview (User-only) - empty for fresh users
  const referredUsers = [];

  // Investment Management (User-only)
  const [investmentForm, setInvestmentForm] = useState({ plan: activePlans[0]?.name || '', amount: '', currency: 'USDT' });
  // Investment history - empty for fresh users
  const investmentHistory = [];

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                ...cardBorder,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg,#7F00FF 0%, #E100FF 100%)',
                  color: '#fff',
                  p: { xs: 2, sm: 3 },
                  minHeight: { xs: 'auto', sm: 300 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Avatar sx={{ width: { xs: 64, sm: 96 }, height: { xs: 64, sm: 96 }, mb: 2, bgcolor: 'rgba(255,255,255,0.2)', fontSize: { xs: 28, sm: 40 } }}>FF</Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Crypto User</Typography>
                <Box mt={2}>
                  <InfoLine label="User ID" value="member" light />
                  <InfoLine label="Email ID" value="member" light />
                  <InfoLine label="Date of Registration" value="Wed Oct 13 2021" light />
                  <InfoLine label="Date of Activation" value="N/A" light />
                  <InfoLine label="Rank" value="N/A" light />
                  <InfoLine label="Rank Achieved On" value="N/A" light />
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <SectionCard>
              <Typography variant="h6" gutterBottom>My Investment Monitor</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Invested</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>0 USDT</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Earned</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>0 USDT</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#fff3e0', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Daily Earning</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>0 USDT</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Active Plans</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>0</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Next Earning In:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>--:--:--</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => window.location.href = '/my-investments'}
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none'
                  }}
                >
                  View Details
                </Button>
              </Box>
            </SectionCard>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Wallet Overview</Typography>
            <Typography variant="h4" sx={{ color: 'success.main', mb: 1 }}>$ 0</Typography>
            <Divider sx={{ mb: 2 }} />
            <KeyValue label="My Wallet" value="$ 0" />
            <KeyValue label="Fund Wallet" value="$ 0" />
            <KeyValue label="Utility Wallet" value="$ 0" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Team Summery Details</Typography>
            <KeyValue label="My Direct" value={`${teamSummary.myDirect} Nos.`} icon={<Group fontSize="small" />} />
            <KeyValue label="My Downlines" value={`${teamSummary.myDownlines} Nos.`} />
            <KeyValue label="Total Active Downlines" value={`${teamSummary.activeDownlines} Nos.`} />
            <KeyValue label="Total InActive Downlines" value={`${teamSummary.inactiveDownlines} Nos.`} />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Income Breakdown ; Date : {todayLabel}</Typography>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="h5">$ 0</Typography>
                <Typography variant="caption">Today’s Active Income</Typography>
              </Box>
              <Box>
                <Typography variant="h5">$ 0</Typography>
                <Typography variant="caption">Today’s Passive Income</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <BreakdownRow label="1. Daily Income" value="$ 0.00" />
            <BreakdownRow label="2. Direct Income" value="$ 0.00" />
            <BreakdownRow label="3. Daily Level Income" value="$ 0.00" />
            <BreakdownRow label="4. Rank Income" value="$ 0.00" />
            <Divider sx={{ my: 1 }} />
            <BreakdownRow label="Total Income" value="$ 0.00" strong />
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Rank Statistics</Typography>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Next Rank Requirement</Typography>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px dashed #f48fb1', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Next Rank : Bronze ; Income : $ 200</Typography>
            </Box>
            <RequirementLine color="#42a5f5" label="Required Business From Leg A" current={0} target={4000} />
            <RequirementLine color="#ff7043" label="Required Business From Leg B" current={0} target={3000} />
            <RequirementLine color="#66bb6a" label="Required Business From Leg C" current={0} target={3000} />
            <Box mt={2}>
              <Chip size="small" color="default" label="Direct Members of Rank: 0 No / 0 No" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', width: 180, height: 180 }}>
                <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '20px solid #eee' }} />
                <Box sx={{ position: 'absolute', inset: 20, borderRadius: '50%', border: '20px solid #f5f5f5' }} />
                <Box sx={{ position: 'absolute', inset: 40, borderRadius: '50%', border: '20px solid #fafafa' }} />
              </Box>
            </Box>
            <Typography variant="subtitle2" textAlign="center">Your Achieved Rank</Typography>
            <Box display="flex" justifyContent="center" mt={1}>
              <Button variant="contained">View more</Button>
            </Box>
          </Grid>
        </Grid>
      </SectionCard>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Share your Referral Link</Typography>
              <Button variant="outlined" startIcon={<Person />}>Join now</Button>
            </Box>
            <Box display="flex" gap={1}>
              <TextField fullWidth value={referral} onChange={(e) => setReferral(e.target.value)} />
              <Button variant="contained" color="success" onClick={copyReferral}><ContentCopy /></Button>
            </Box>
            <Box display="flex" gap={1} mt={2}>
              <Tooltip title="WhatsApp"><IconButton color="success"><WhatsApp /></IconButton></Tooltip>
              <Tooltip title="Telegram"><IconButton color="primary"><Telegram /></IconButton></Tooltip>
              <Tooltip title="LinkedIn"><IconButton color="primary"><LinkedIn /></IconButton></Tooltip>
              <Tooltip title="Copy"><IconButton onClick={copyReferral}><LinkIcon /></IconButton></Tooltip>
              <Tooltip title="Share"><IconButton><Share /></IconButton></Tooltip>
            </Box>
            {copied && <Typography variant="caption" color="success.main">Copied!</Typography>}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <StatMiniCard
            title="Total Downline Business"
            value={`$ ${teamSummary.totalDownlineBusiness.toLocaleString()}`}
            subtitle="Your Total Downline Business"
            icon={<TrendingUp />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatMiniCard
            title="Total Investment"
            value="$ 0"
            subtitle="Your Total Investment Till ..."
            icon={<Savings />}
            color="primary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Transaction History</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No.</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Credit</TableCell>
                    <TableCell align="right">Debit</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="error">No Records Found</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>My Recent Referrals</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentReferrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography color="text.secondary" align="center">No referrals yet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentReferrals.map((r) => (
                      <TableRow key={r.id || r.userId} hover>
                        <TableCell>{r.id || r.userId}</TableCell>
                        <TableCell>{r.name || r.firstName || 'User'}</TableCell>
                        <TableCell>{r.email}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
