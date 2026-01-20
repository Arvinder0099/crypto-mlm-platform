import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack, TableContainer, Alert, CircularProgress } from '@mui/material';

const StatCard = ({ title, value, color = 'primary' }) => (
  <Paper elevation={2} sx={{ p: 2 }}>
    <Typography variant="body2" color="text.secondary">{title}</Typography>
    <Typography variant="h5" color={color} fontWeight="bold">{value}</Typography>
  </Paper>
);

const MyDirect = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    fetch('/api/dashboard/my-direct', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        setRows(items.map((item, idx) => ({
          sNo: idx + 1,
          userId: item.userId || '',
          username: item.username || item.name || '',
          investment: item.investment || 0,
          rank: item.rank || 'New',
          doj: item.doj || item.dateOfJoining || '',
          doa: item.doa || item.dateOfActivation || '-',
          incomeEligible: item.incomeEligible || false,
          status: item.status || 'Inactive',
          treeView: 'View',
          directMembers: item.directMembers || 0,
          downlineMembers: item.downlineMembers || 0
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load direct members', err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const stats = {
    views: 0,
    totalDirect: rows.length,
    totalDownline: rows.reduce((sum, r) => sum + r.downlineMembers, 0),
    totalInvestment: rows.reduce((sum, r) => sum + r.investment, 0)
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My Direct</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Tree summary and direct member details.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Views" value={stats.views} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Direct Members" value={stats.totalDirect} color="secondary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Downline Members" value={stats.totalDownline} color="info" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Investment" value={`$${stats.totalInvestment}`} color="success" /></Grid>
      </Grid>

      {rows.length === 0 ? (
        <Alert severity="info">No direct members found</Alert>
      ) : (
      <Box className="page-container">
        {/* Mobile-friendly cards (show on small screens) */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Stack spacing={2}>
            {rows.map((r) => (
              <Paper variant="outlined" sx={{ p: 2 }} key={r.sNo}>
                <Typography variant="subtitle1" fontWeight="bold" className="wrap-text">
                  {r.username} ({r.userId})
                </Typography>
                <Typography variant="body2" className="wrap-text">Rank: {r.rank}</Typography>
                <Typography variant="body2" className="wrap-text">Investment: ${r.investment}</Typography>
                <Typography variant="body2" className="wrap-text">Joined: {r.doj}</Typography>
                <Typography variant="body2" className="wrap-text">Activated: {r.doa}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={r.incomeEligible ? 'Income Eligible: Yes' : 'Income Eligible: No'} color={r.incomeEligible ? 'success' : 'default'} />
                  <Chip size="small" label={`Status: ${r.status}`} color={r.status === 'Active' ? 'success' : 'default'} />
                  <Chip size="small" label={`Direct: ${r.directMembers}`} variant="outlined" />
                  <Chip size="small" label={`Downline: ${r.downlineMembers}`} variant="outlined" />
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* Desktop Table (hidden on small screens) */}
        <TableContainer component={Paper} sx={{ p: 2, display: { xs: 'none', md: 'block' } }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Investment</TableCell>
              <TableCell>Rank</TableCell>
              <TableCell>Date of Joining</TableCell>
              <TableCell>Date of Activation</TableCell>
              <TableCell>Income Eligible</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tree View</TableCell>
              <TableCell>Direct Members</TableCell>
              <TableCell>Downline Members</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.sNo}>
                <TableCell>{r.sNo}</TableCell>
                <TableCell>{r.userId}</TableCell>
                <TableCell>{r.username}</TableCell>
                <TableCell>${r.investment}</TableCell>
                <TableCell>{r.rank}</TableCell>
                <TableCell>{r.doj}</TableCell>
                <TableCell>{r.doa}</TableCell>
                <TableCell>
                  <Chip size="small" label={r.incomeEligible ? 'Yes' : 'No'} color={r.incomeEligible ? 'success' : 'default'} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={r.status} color={r.status === 'Active' ? 'success' : 'default'} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={r.treeView} variant="outlined" />
                </TableCell>
                <TableCell>{r.directMembers}</TableCell>
                <TableCell>{r.downlineMembers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Box>
      )}
    </Box>
  );
};

export default MyDirect;