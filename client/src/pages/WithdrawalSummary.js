import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, CircularProgress, Alert, Chip, Card, CardContent, Grid,
  TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { AccountBalanceWallet, Pending, CheckCircle, Cancel } from '@mui/icons-material';

const WithdrawalSummary = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalRequested: 0, totalApproved: 0, totalPending: 0 });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    fetch('/api/withdrawals/summary', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRows(data.data || []);
          setSummary(data.summary || { totalRequested: 0, totalApproved: 0, totalPending: 0 });
        } else {
          setRows([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load withdrawal summary', err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const getStatusChip = (status) => {
    const config = {
      pending: { color: 'warning', icon: <Pending fontSize="small" />, label: 'Pending' },
      approved: { color: 'info', icon: <CheckCircle fontSize="small" />, label: 'Approved' },
      completed: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Completed' },
      rejected: { color: 'error', icon: <Cancel fontSize="small" />, label: 'Rejected' }
    };
    const cfg = config[status] || config.pending;
    return <Chip size="small" color={cfg.color} icon={cfg.icon} label={cfg.label} />;
  };

  const filteredRows = statusFilter === 'all' ? rows : rows.filter(r => r.status === statusFilter);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        💸 Withdrawal Summary
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Total Requested</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>${summary.totalRequested?.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Total Approved/Paid</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>${summary.totalApproved?.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="body2">Total Pending</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>${summary.totalPending?.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {filteredRows.length === 0 ? (
        <Alert severity="info">No withdrawal records found</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Request ID</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell align="right"><strong>Charges</strong></TableCell>
                  <TableCell align="right"><strong>Net Amount</strong></TableCell>
                  <TableCell><strong>Wallet Address</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Txn Hash</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{r.requestId}</TableCell>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell align="right">${r.amount?.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>-${r.charges?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>${r.netAmount?.toFixed(2)}</TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.walletAddress?.slice(0, 8)}...{r.walletAddress?.slice(-6)}
                    </TableCell>
                    <TableCell>{getStatusChip(r.status)}</TableCell>
                    <TableCell>
                      {r.transactionHash ? (
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {r.transactionHash.slice(0, 10)}...
                        </Typography>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default WithdrawalSummary;