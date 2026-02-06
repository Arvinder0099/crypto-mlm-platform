import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  MonetizationOn,
  People,
  EmojiEvents,
  AccountBalance,
  SwapVert,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

const AdminPanel = () => {
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

  const [rankAchievers, setRankAchievers] = useState([]);

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

  useEffect(() => {
    const loadSummary = async () => {
      try {
        // Load editable dashboard values
        console.log('AdminPanel: Fetching dashboard values...');
        const dashboardData = await fetchWithAuth('/api/admin/dashboard-values');
        console.log('AdminPanel: Received data:', dashboardData);
        
        if (dashboardData?.values) {
          const values = dashboardData.values;
          console.log('AdminPanel: Setting values:', values);
          
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
        }

        // Also try to load rank achievers from summary
        try {
          const data = await fetchWithAuth('/api/admin/summary');
          setRankAchievers(data.rankAchievers || []);
        } catch (err) {
          console.log('Could not load rank achievers');
        }
      } catch (error) {
        console.error('Failed to load dashboard values', error);
      }
    };

    loadSummary();
  }, []);

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
      {/* Welcome Header */}
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 'bold',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        Welcome Administrator !!!
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
      {/* Rank achievers feature removed in favor of real data widgets */}

      {/* 5. Credit/Debit Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Total Credited */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
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
            <Paper sx={{ p: 3 }}>
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
