import React, { useEffect, useState, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  MonetizationOn,
  People,
  AccountBalance,
  SwapVert,
  AutoMode,
  EditNote,
  Refresh,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

const AdminPanel = () => {
  // 'automatic' = live data from API, 'manual' = editable dashboard values
  const [dataMode, setDataMode] = useState(() => {
    return localStorage.getItem('adminDashboardMode') || 'automatic';
  });
  const [loadingData, setLoadingData] = useState(true);

  const [investmentData, setInvestmentData] = useState({
    totalInvestment: 0,
    adminInvestment: 0,
    walletInvestment: 0,
    directInvestment: 0,
  });

  const [incomeData, setIncomeData] = useState({
    daily: 0,
    referral: 0,
  });

  const [memberStats, setMemberStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    suspendedMembers: 0,
  });

  const [creditDebitData, setCreditDebitData] = useState({
    totalCredited: 0,
    todayCredited: 0,
    yesterdayCredited: 0,
    totalDebited: 0,
    todayDebited: 0,
    yesterdayDebited: 0,
  });

  const [withdrawalData, setWithdrawalData] = useState({
    totalWithdrawal: 0,
    pendingWithdrawal: 0,
    approvedWithdrawal: 0,
    rejectedWithdrawal: 0,
  });

  const applyManualValues = (values) => {
    setInvestmentData({
      totalInvestment: values.totalInvestment || 0,
      adminInvestment: values.adminInvestment || 0,
      walletInvestment: values.walletInvestment || 0,
      directInvestment: values.directInvestment || 0,
    });
    setIncomeData({
      daily: values.dailyAllotted || 0,
      referral: values.referralBonusAllotted || 0,
    });
    setMemberStats({
      totalMembers: values.totalMembers || 0,
      activeMembers: values.activeMembers || 0,
      inactiveMembers: values.inactiveMembers || 0,
      suspendedMembers: values.suspendedMembers || 0,
    });
    setCreditDebitData({
      totalCredited: values.totalCredited || 0,
      todayCredited: values.todayCredited || 0,
      yesterdayCredited: values.yesterdayCredited || 0,
      totalDebited: values.totalDebited || 0,
      todayDebited: values.todayDebited || 0,
      yesterdayDebited: values.yesterdayDebited || 0,
    });
    setWithdrawalData({
      totalWithdrawal: values.totalWithdrawal || 0,
      pendingWithdrawal: values.pendingWithdrawal || 0,
      approvedWithdrawal: values.approvedWithdrawal || 0,
      rejectedWithdrawal: values.rejectedWithdrawal || 0,
    });
  };

  const applyLiveData = (data) => {
    setInvestmentData({
      totalInvestment: data.investments?.totalInvestment || 0,
      adminInvestment: data.investments?.adminInvestment || 0,
      walletInvestment: data.investments?.walletInvestment || 0,
      directInvestment: data.investments?.directInvestment || 0,
    });
    setIncomeData({
      daily: data.income?.daily || 0,
      referral: data.income?.referral || 0,
    });
    setMemberStats({
      totalMembers: data.members?.total || 0,
      activeMembers: data.members?.active || 0,
      inactiveMembers: data.members?.inactive || 0,
      suspendedMembers: data.members?.suspended || 0,
    });
    setCreditDebitData({
      totalCredited: data.creditDebit?.totalCredited || 0,
      todayCredited: data.creditDebit?.todayCredited || 0,
      yesterdayCredited: data.creditDebit?.yesterdayCredited || 0,
      totalDebited: data.creditDebit?.totalDebited || 0,
      todayDebited: data.creditDebit?.todayDebited || 0,
      yesterdayDebited: data.creditDebit?.yesterdayDebited || 0,
    });
    setWithdrawalData({
      totalWithdrawal: data.withdrawals?.totalWithdrawal || 0,
      pendingWithdrawal: data.withdrawals?.pendingWithdrawal || 0,
      approvedWithdrawal: data.withdrawals?.approvedWithdrawal || 0,
      rejectedWithdrawal: data.withdrawals?.rejectedWithdrawal || 0,
    });
  };

  const loadData = useCallback(async (mode) => {
    setLoadingData(true);
    try {
      if (mode === 'automatic') {
        // Load live data from real API
        const data = await fetchWithAuth('/api/admin/summary');
        applyLiveData(data);
      } else {
        // Load manual editable values
        const dashboardData = await fetchWithAuth('/api/admin/dashboard-values');
        if (dashboardData?.values) {
          applyManualValues(dashboardData.values);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      // Fallback: try the other source
      try {
        if (mode === 'automatic') {
          const dashboardData = await fetchWithAuth('/api/admin/dashboard-values');
          if (dashboardData?.values) applyManualValues(dashboardData.values);
        } else {
          const data = await fetchWithAuth('/api/admin/summary');
          applyLiveData(data);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed', fallbackError);
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData(dataMode);
  }, [dataMode, loadData]);

  // Auto-refresh every 30s in automatic mode
  useEffect(() => {
    if (dataMode !== 'automatic') return;
    const interval = setInterval(() => loadData('automatic'), 30000);
    return () => clearInterval(interval);
  }, [dataMode, loadData]);

  const handleModeChange = (e, newMode) => {
    if (!newMode) return;
    setDataMode(newMode);
    localStorage.setItem('adminDashboardMode', newMode);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography color="textSecondary" variant="caption">
                {subtitle}
              </Typography>
            )}
          </Box>
          {Icon && <Icon sx={{ fontSize: 40, color: color, opacity: 0.3 }} />}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box className="page-container admin-container" sx={{ p: { xs: 2, md: 3 } }}>
      {/* Welcome Header with Mode Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          Welcome Administrator !!!
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {loadingData && <CircularProgress size={20} />}
          {dataMode === 'automatic' && (
            <Chip 
              label="Live" 
              color="success" 
              size="small" 
              sx={{ animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } } }}
            />
          )}
          <ToggleButtonGroup
            value={dataMode}
            exclusive
            onChange={handleModeChange}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
          >
            <ToggleButton value="automatic" sx={{ textTransform: 'none', px: 2 }}>
              <AutoMode sx={{ mr: 0.5, fontSize: 18 }} />
              Automatic
            </ToggleButton>
            <ToggleButton value="manual" sx={{ textTransform: 'none', px: 2 }}>
              <EditNote sx={{ mr: 0.5, fontSize: 18 }} />
              Manual
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {dataMode === 'automatic' 
          ? '📡 Showing live data from the database (auto-refreshes every 30s)' 
          : '✏️ Showing manually set values (edit via Dashboard Settings)'}
      </Typography>

      {/* 1. Total Investment Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Total Investment
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={6}>
            <StatCard
              title="Total Investment"
              value={`$${investmentData.totalInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={MonetizationOn}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <StatCard
              title="My Wallet"
              value={`$${investmentData.walletInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={AccountBalance}
              color="#f57c00"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 2. Income Summary Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Income Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Daily Allotted"
              value={`$${incomeData.daily.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              subtitle="Total daily amount allotted to users"
              icon={TrendingUp}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard
              title="Referral Bonus Allotted"
              value={`$${incomeData.referral.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              subtitle="Total referral bonus allotted to users"
              icon={People}
              color="#388e3c"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 3. Member Count Statistics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Member Count Statistics
        </Typography>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            {memberStats.totalMembers}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            Total Member Count
          </Typography>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Members"
              value={memberStats.activeMembers}
              icon={People}
              color="#388e3c"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="In-Active Members"
              value={memberStats.inactiveMembers}
              icon={People}
              color="#f57c00"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Suspended Members"
              value={memberStats.suspendedMembers}
              icon={People}
              color="#d32f2f"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 4. Rank Achievers Section (removed) */}

      {/* 5. Credit/Debit Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Total Credited */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Total Credited
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                ${creditDebitData.totalCredited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Today's Credited
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${creditDebitData.todayCredited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Yesterday's Credited
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${creditDebitData.yesterdayCredited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Total Debited */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Total Debited
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 2 }}>
                ${creditDebitData.totalDebited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Today's Debited
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${creditDebitData.todayDebited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Yesterday's Debited
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ${creditDebitData.yesterdayDebited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 6. Withdrawal Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Withdrawal Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Withdrawal"
              value={`$${withdrawalData.totalWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={SwapVert}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Withdrawal"
              value={`$${withdrawalData.pendingWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={SwapVert}
              color="#f57c00"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Approved Withdrawal"
              value={`$${withdrawalData.approvedWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={SwapVert}
              color="#388e3c"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rejected Withdrawal"
              value={`$${withdrawalData.rejectedWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={SwapVert}
              color="#d32f2f"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminPanel;
