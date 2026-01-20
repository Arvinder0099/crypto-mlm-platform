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
    totalGenerated: 0,
    daily: 0,
    referral: 0,
    dailyLevel: 0,
    rank: 0,
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
        const data = await fetchWithAuth('/api/admin/summary');

        setInvestmentData({
          totalInvestment: data.investments?.totalInvestment || 0,
          adminInvestment: data.investments?.adminInvestment || 0,
          walletInvestment: data.investments?.walletInvestment || 0,
          directInvestment: data.investments?.directInvestment || 0,
        });

        setIncomeData({
          totalGenerated: data.income?.totalGenerated || 0,
          daily: data.income?.daily || 0,
          referral: data.income?.referral || 0,
          dailyLevel: data.income?.dailyLevel || 0,
          rank: data.income?.rank || 0,
        });

        setMemberStats({
          totalMembers: data.members?.total || 0,
          activeMembers: data.members?.active || 0,
          inactiveMembers: data.members?.inactive || 0,
          suspendedMembers: data.members?.suspended || 0,
        });

        setRankAchievers(data.rankAchievers || []);

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
      } catch (error) {
        console.error('Failed to load admin summary', error);
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
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Investment"
              value={`$${investmentData.totalInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={MonetizationOn}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Admin Investment"
              value={`$${investmentData.adminInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={MonetizationOn}
              color="#388e3c"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Wallet Investment"
              value={`$${investmentData.walletInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={AccountBalance}
              color="#f57c00"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Direct Investment"
              value={`$${investmentData.directInvestment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              color="#d32f2f"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 2. Income Summary Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Income Summary
        </Typography>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            ${incomeData.totalGenerated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            Total Generated Income
          </Typography>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Daily"
              value={`$${incomeData.daily.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Referral"
              value={`$${incomeData.referral.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={People}
              color="#388e3c"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Daily Level"
              value={`$${incomeData.dailyLevel.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              color="#f57c00"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rank"
              value={`$${incomeData.rank.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={EmojiEvents}
              color="#d32f2f"
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

      {/* 4. Rank Achievers Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Rank Achievers
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {rankAchievers.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    {index + 1}. {item.rank}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {item.count} Nos
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

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
