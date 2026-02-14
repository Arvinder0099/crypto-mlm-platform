import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  CardGiftcard,
  Person,
  MonetizationOn,
  CheckCircle,
  Pending,
  TrendingUp,
  Search,
  ContentCopy,
  Share,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

const ReferralBonus = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bonuses, setBonuses] = useState([]);
  const [summary, setSummary] = useState({
    totalReferrals: 0,
    totalBonus: 0,
    creditedBonus: 0,
    pendingBonus: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Get referral link
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const referralLink = `${window.location.origin}/register?ref=${userData.referralCode || userData.userId || ''}`;

  useEffect(() => {
    fetchReferralBonuses();
  }, []);

  const fetchReferralBonuses = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/user/referral-bonuses');
      if (response.success) {
        setBonuses(response.data.bonuses || []);
        setSummary(response.data.summary || {});
      }
    } catch (err) {
      setError('Failed to load referral bonuses');
      console.error('Error fetching referral bonuses:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusChip = (status, bonusAmount) => {
    // If pending with no bonus amount, the referred user hasn't invested yet
    if (status === 'pending' && (!bonusAmount || bonusAmount === 0)) {
      return (
        <Chip
          size="small"
          color="default"
          label="Awaiting Investment"
          sx={{ fontWeight: 600 }}
        />
      );
    }
    
    const statusConfig = {
      credited: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Credited' },
      pending: { color: 'warning', icon: <Pending fontSize="small" />, label: 'Pending Approval' },
      rejected: { color: 'error', icon: null, label: 'Rejected' },
      cancelled: { color: 'error', icon: null, label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        size="small"
        color={config.color}
        icon={config.icon}
        label={config.label}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const filteredBonuses = bonuses.filter(bonus => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      bonus.referredUser?.name?.toLowerCase().includes(search) ||
      bonus.referredUser?.email?.toLowerCase().includes(search) ||
      bonus.referredUser?.userId?.toLowerCase().includes(search)
    );
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card sx={{ height: '100%', border: `2px solid ${color}`, borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, width: 56, height: 56 }}>
            <Icon sx={{ color, fontSize: 32 }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
          <CardGiftcard sx={{ mr: 1, verticalAlign: 'middle' }} />
          Referral Bonus
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Earn 5% bonus for every user who registers using your referral link!
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* How It Works Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>How Referral Bonus Works:</Typography>
        <Typography variant="body2" component="div">
          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
            <li>Share your referral link with friends</li>
            <li>When they register and make their first investment, you earn 5% of their investment as bonus and new user will also get 5% welcome bonus as per their investment.</li>
            <li>Bonus is credited to your Utility Wallet instantly.</li>
          </ol>
        </Typography>
      </Alert>

      {/* Referral Link Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Share sx={{ mr: 1, verticalAlign: 'middle' }} />
            Your Referral Link
          </Typography>
          <Box display="flex" gap={1} alignItems="center" mt={2}>
            <TextField
              fullWidth
              value={referralLink}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
                sx: { bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2 }
              }}
            />
            <Tooltip title={copied ? 'Copied!' : 'Copy Link'}>
              <IconButton onClick={copyReferralLink} sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}>
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
          {copied && (
            <Typography variant="caption" sx={{ color: '#90EE90', mt: 1, display: 'block' }}>
              ✓ Link copied to clipboard!
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Referrals"
            value={summary.totalReferrals}
            subtitle="Users joined via your link"
            icon={Person}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Bonus"
            value={`$${(summary.totalBonus || 0).toFixed(2)}`}
            subtitle="Lifetime earnings"
            icon={MonetizationOn}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Credited Bonus"
            value={`$${(summary.creditedBonus || 0).toFixed(2)}`}
            subtitle="Already received"
            icon={CheckCircle}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* How It Works */}
      <Card sx={{ mb: 4, border: '2px solid #e3f2fd', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            How Referral Bonus Works
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2}>
                <Avatar sx={{ bgcolor: '#e3f2fd', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <Share sx={{ color: '#1976d2', fontSize: 32 }} />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">1. Share Your Link</Typography>
                <Typography variant="body2" color="text.secondary">
                  Copy your unique referral link and share it with friends
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2}>
                <Avatar sx={{ bgcolor: '#e8f5e9', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <Person sx={{ color: '#388e3c', fontSize: 32 }} />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">2. They Register</Typography>
                <Typography variant="body2" color="text.secondary">
                  When someone registers using your link, they become your referral
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2}>
                <Avatar sx={{ bgcolor: '#fff3e0', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                  <CardGiftcard sx={{ color: '#f57c00', fontSize: 32 }} />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">3. Earn 5% Bonus</Typography>
                <Typography variant="body2" color="text.secondary">
                  You earn 5% bonus and they get 5% welcome bonus when they invest!
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Referral History Table */}
      <Card sx={{ border: '2px solid #f5f5f5', borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
            <Typography variant="h6">
              Referral History
            </Typography>
            <TextField
              size="small"
              placeholder="Search referrals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 250 } }}
            />
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Joined Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Bonus %</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Bonus Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBonuses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {searchTerm ? 'No matching referrals found' : 'No referrals yet. Share your link to start earning!'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBonuses.map((bonus) => (
                    <TableRow key={bonus.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {bonus.referredUser?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {bonus.referredUser?.name || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {bonus.referredUser?.userId || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{bonus.referredUser?.email || 'N/A'}</TableCell>
                      <TableCell>
                        {bonus.referredUser?.joinedAt 
                          ? new Date(bonus.referredUser.joinedAt).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={`${bonus.bonusPercentage}%`} color="info" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="600" color={bonus.status === 'credited' ? 'success.main' : 'text.secondary'}>
                          ${(bonus.bonusAmount || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getStatusChip(bonus.status, bonus.bonusAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReferralBonus;
