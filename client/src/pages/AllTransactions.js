import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Alert, CircularProgress, Chip } from '@mui/material';

const AllTransactions = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    fetch('/api/reports/transactions', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        setRows(items.map((item, idx) => ({
          sNo: idx + 1,
          userId: item.userId || '',
          date: item.date || item.transactionDate || '',
          description: item.description || item.type || '',
          credit: item.credit || 0,
          debit: item.debit || 0,
          balance: item.balance || 0,
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load transactions', err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom>All Transactions</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : rows.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No transactions found</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>S.No</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Credit ($)</TableCell>
                <TableCell align="right">Debit ($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i} sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell>{r.sNo}</TableCell>
                  <TableCell>{r.userId}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell align="right">
                    {r.credit > 0 ? (
                      <Chip label={`+$${Number(r.credit).toFixed(2)}`} size="small" color="success" variant="outlined" />
                    ) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {r.debit > 0 ? (
                      <Chip label={`-$${Number(r.debit).toFixed(2)}`} size="small" color="error" variant="outlined" />
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AllTransactions;