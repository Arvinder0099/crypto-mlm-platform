import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Card, CardContent, Typography, Grid, Divider, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Avatar, TextField, IconButton, Tooltip
} from '@mui/material';
import {
  Person, ContentCopy, WhatsApp, Telegram, LinkedIn, Link as LinkIcon, Share, Group
} from '@mui/icons-material';

const API_BASE = '';

const fetchJSON = async (url) => {
  const token = localStorage.getItem('authToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_BASE}${url}`, { headers });
  return res.data;
};

const cardBorder = {
  borderRadius: 4,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(102,126,234,0.1)',
};

const SectionCard = ({ children, sx = {} }) => (
  <Card sx={{ ...cardBorder, height: '100%', ...sx }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>{children}</CardContent>
  </Card>
);

const KeyValue = ({ label, value, icon }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" py={0.75}>
    <Box display="flex" alignItems="center" gap={1}>
      {icon}
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
    <Typography variant="body2" fontWeight={600}>{value}</Typography>
  </Box>
);

const InfoLine = ({ label, value, light }) => (
  <Typography variant="body2" sx={{ color: light ? 'rgba(255,255,255,0.9)' : 'text.secondary', mb: 0.5 }}>
    <strong>{label}:</strong> {value}
  </Typography>
);

const Dashboard = () => {
  // Real-time dashboard data state
  const [dashboardData, setDashboardData] = useState({
    userId: '',
    email: '',
    firstName: '',
    lastName: '',
    rank: 'N/A',
    dateOfRegistration: '',
    dateOfActivation: null,
    rankAchievedOn: null,
    totalInvested: 0,
    totalEarned: 0,
    dailyEarning: 0,
    activePlans: 0,
    wallet: { myWallet: 0, fundWallet: 0, utilityWallet: 0, totalBalance: 0 },
    activeIncome: 0,
    passiveIncome: 0,
    totalIncome: 0,
    recentTransactions: [],
    referralCode: '',
    referralLink: ''
  });

  // Team summary data
  const [teamSummary, setTeamSummary] = useState({
    myDirect: 0,
    myDownlines: 0,
    activeDownlines: 0,
    inactiveDownlines: 0
  });

  // Recent referrals
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [referral, setReferral] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats
        const statsRes = await fetchJSON('/api/dashboard/stats');
        const stats = statsRes?.data || statsRes;
        if (stats) {
          setDashboardData({
            userId: stats.userId || '',
            email: stats.email || '',
            firstName: stats.firstName || '',
            lastName: stats.lastName || '',
            rank: stats.rank || 'N/A',
            dateOfRegistration: stats.dateOfRegistration || '',
            dateOfActivation: stats.dateOfActivation,
            rankAchievedOn: stats.rankAchievedOn,
            totalInvested: stats.totalInvested || 0,
            totalEarned: stats.totalEarned || 0,
            dailyEarning: stats.dailyEarning || 0,
            activePlans: stats.activePlans || 0,
            wallet: stats.wallet || { myWallet: 0, fundWallet: 0, utilityWallet: 0, totalBalance: 0 },
            activeIncome: stats.activeIncome || 0,
            passiveIncome: stats.passiveIncome || 0,
            totalIncome: stats.totalIncome || 0,
            recentTransactions: stats.recentTransactions || [],
            referralCode: stats.referralCode || '',
            referralLink: stats.referralLink || ''
          });
          setReferral(stats.referralLink || `${window.location.origin}/register?ref=${stats.userId}`);
        }
      } catch (err) {
        console.warn('Failed to load dashboard stats', err?.message || err);
        // Set referral from localStorage fallback
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setReferral(`${window.location.origin}/register?ref=${userData.userId || userData._id || ''}`);
      }

      try {
        // Fetch team summary
        const teamRes = await fetchJSON('/api/dashboard/team-summary');
        const team = teamRes?.data || teamRes;
        if (team) {
          setTeamSummary({
            myDirect: team.myDirect || 0,
            myDownlines: team.myDownlines || 0,
            activeDownlines: team.activeDownlines || 0,
            inactiveDownlines: team.inactiveDownlines || 0
          });
        }
      } catch (err) {
        console.warn('Failed to load team summary', err?.message || err);
      }

      try {
        // Fetch recent referrals
        const refRes = await fetchJSON('/api/dashboard/recent-referrals');
        const refs = Array.isArray(refRes?.data) ? refRes.data : Array.isArray(refRes) ? refRes : [];
        setRecentReferrals(refs);
      } catch (err) {
        console.warn('Failed to load referrals', err?.message || err);
      }

      setLoading(false);
    };

    fetchAllData();
  }, []);

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referral);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Section 1: Crypto User Info & Investment Monitor */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {/* Crypto User Info Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ ...cardBorder, overflow: 'hidden' }}>
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
                <Avatar sx={{ width: { xs: 64, sm: 96 }, height: { xs: 64, sm: 96 }, mb: 2, bgcolor: 'rgba(255,255,255,0.2)', fontSize: { xs: 28, sm: 40 } }}>
                  {dashboardData.firstName ? dashboardData.firstName[0].toUpperCase() : 'U'}
                  {dashboardData.lastName ? dashboardData.lastName[0].toUpperCase() : ''}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {dashboardData.firstName} {dashboardData.lastName}
                </Typography>
                <Box mt={2}>
                  <InfoLine label="User ID" value={dashboardData.userId || 'N/A'} light />
                  <InfoLine label="Email ID" value={dashboardData.email || 'N/A'} light />
                  <InfoLine label="Date of Registration" value={formatDate(dashboardData.dateOfRegistration)} light />
                  <InfoLine label="Date of Activation" value={formatDate(dashboardData.dateOfActivation)} light />
                  <InfoLine label="Rank" value={dashboardData.rank} light />
                  <InfoLine label="Rank Achieved On" value={formatDate(dashboardData.rankAchievedOn)} light />
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Investment Monitor Card */}
          <Grid item xs={12} md={8}>
            <SectionCard>
              <Typography variant="h6" gutterBottom>My Investment Monitor</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Invested</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                      {dashboardData.totalInvested.toLocaleString()} USDT
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Earned</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {dashboardData.totalEarned.toLocaleString()} USDT
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#fff3e0', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Daily Earning</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {dashboardData.dailyEarning.toLocaleString()} USDT
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Active Plans</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      {dashboardData.activePlans}
                    </Typography>
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

      {/* Section 2: Wallet Overview, Team Summary, Income Breakdown */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Wallet Overview */}
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Wallet Overview</Typography>
            <Typography variant="h4" sx={{ color: 'success.main', mb: 1 }}>
              $ {dashboardData.wallet.totalBalance.toLocaleString()}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <KeyValue label="My Wallet" value={`$ ${dashboardData.wallet.myWallet.toLocaleString()}`} />
            <KeyValue label="Fund Wallet" value={`$ ${dashboardData.wallet.fundWallet.toLocaleString()}`} />
            <KeyValue label="Utility Wallet" value={`$ ${dashboardData.wallet.utilityWallet.toLocaleString()}`} />
          </SectionCard>
        </Grid>

        {/* Team Summary Details */}
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Team Summary Details</Typography>
            <KeyValue label="My Direct" value={`${teamSummary.myDirect} Nos.`} icon={<Group fontSize="small" />} />
            <KeyValue label="My Downlines" value={`${teamSummary.myDownlines} Nos.`} />
            <KeyValue label="Total Active Downlines" value={`${teamSummary.activeDownlines} Nos.`} />
            <KeyValue label="Total InActive Downlines" value={`${teamSummary.inactiveDownlines} Nos.`} />
          </SectionCard>
        </Grid>

        {/* Income Breakdown - Only Active & Passive Income */}
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Income Breakdown</Typography>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2, flex: 1, mr: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  $ {dashboardData.activeIncome.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">Active Income</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2, flex: 1, ml: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  $ {dashboardData.passiveIncome.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">Passive Income</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
              <Typography variant="body1" fontWeight={600}>Total Income</Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                $ {dashboardData.totalIncome.toLocaleString()}
              </Typography>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Section 3: Share Referral Link & My Recent Referrals (Side by Side) */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Share your Referral Link</Typography>
              <Button variant="outlined" startIcon={<Person />}>Join now</Button>
            </Box>
            <Box display="flex" gap={1}>
              <TextField fullWidth value={referral} onChange={(e) => setReferral(e.target.value)} size="small" />
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

      {/* Section 4: Transaction History (Full Width) */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Last Transaction History</Typography>
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
                  {dashboardData.recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography color="text.secondary" align="center">No Transactions Found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboardData.recentTransactions.map((t, idx) => (
                      <TableRow key={t.id || idx} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {t.credit > 0 ? `$${t.credit.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {t.debit > 0 ? `$${t.debit.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell align="right">${t.balance.toLocaleString()}</TableCell>
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
