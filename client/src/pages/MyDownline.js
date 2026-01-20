import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack, TableContainer, Alert, CircularProgress } from '@mui/material';

const StatCard = ({ title, value, color = 'primary' }) => (
  <Paper elevation={2} sx={{ p: 2 }}>
    <Typography variant="body2" color="text.secondary">{title}</Typography>
    <Typography variant="h5" color={color} fontWeight="bold">{value}</Typography>
  </Paper>
);

const MyDownline = () => {
  const [level, setLevel] = useState(1);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    fetch('/api/dashboard/my-downline', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        setAllRows(items.map((item, idx) => ({
          sNo: idx + 1,
          userId: item.userId || '',
          username: item.username || item.name || '',
          referredBy: item.referredBy || '',
          referredByName: item.referredByName || '',
          investment: item.investment || 0,
          rank: item.rank || 'New',
          level: item.level || 1,
          incomeEligible: item.incomeEligible || false,
          status: item.status || 'Inactive'
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load downline', err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const rows = allRows.filter(r => r.level === level);

  const stats = {
    levelMembers: rows.length,
    activeMembers: rows.filter(r => r.status === 'Active').length,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="page-container">
      <Typography variant="h5" gutterBottom>My Downline</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select a level to view downline details.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="level-select-label">Select Level</InputLabel>
            <Select labelId="level-select-label" value={level} label="Select Level" onChange={(e) => setLevel(Number(e.target.value))}>
              {[1,2,3,4,5,6,7,8,9,10].map(l => (
                <MenuItem key={l} value={l}>Level {l}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}><StatCard title="Level Members" value={stats.levelMembers} /></Grid>
        <Grid item xs={12} md={4}><StatCard title="Active in Level" value={stats.activeMembers} color="success" /></Grid>
      </Grid>

      {rows.length === 0 ? (
        <Alert severity="info">No downline members found at level {level}</Alert>
      ) : (
      <>
      {/* Mobile-friendly cards (show on small screens) */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Stack spacing={2}>
          {rows.map((r) => (
            <Paper variant="outlined" sx={{ p: 2 }} key={r.sNo}>
              <Typography variant="subtitle1" fontWeight="bold" className="wrap-text">
                {r.username} ({r.userId})
              </Typography>
              <Typography variant="body2" className="wrap-text">Referred By: {r.referredByName} ({r.referredBy})</Typography>
              <Typography variant="body2" className="wrap-text">Rank: {r.rank}</Typography>
              <Typography variant="body2" className="wrap-text">Level: {r.level}</Typography>
              <Typography variant="body2" className="wrap-text">Investment: ${r.investment}</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={r.incomeEligible ? 'Income Eligible: Yes' : 'Income Eligible: No'} color={r.incomeEligible ? 'success' : 'default'} />
                <Chip size="small" label={`Status: ${r.status}`} color={r.status === 'Active' ? 'success' : 'default'} />
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* Original table (hide on small screens) */}
      <Paper elevation={2} sx={{ p: 2, display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper}>
          <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Referred By</TableCell>
                    <TableCell>Referred By Name</TableCell>
                    <TableCell>Investment</TableCell>
                    <TableCell>Rank</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Income Eligible</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.sNo}>
                      <TableCell>{r.sNo}</TableCell>
                      <TableCell>{r.userId}</TableCell>
                      <TableCell>{r.username}</TableCell>
                      <TableCell>{r.referredBy}</TableCell>
                      <TableCell>{r.referredByName}</TableCell>
                      <TableCell>${r.investment}</TableCell>
                      <TableCell>{r.rank}</TableCell>
                      <TableCell>{r.level}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.incomeEligible ? 'Yes' : 'No'} color={r.incomeEligible ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={r.status} color={r.status === 'Active' ? 'success' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
      </>
      )}
    </Box>
  );
};

export default MyDownline;