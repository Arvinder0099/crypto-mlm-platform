import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Alert, CircularProgress } from '@mui/material';

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
          date: item.transactionDate || item.date || '',
          type: item.type || '',
          amount: item.totalAmount || item.amount || 0,
          reference: item.reference || item.id || ''
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
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount ($)</TableCell>
                <TableCell>Reference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.sNo}</TableCell>
                  <TableCell>{r.userId}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.amount}</TableCell>
                  <TableCell>{r.reference}</TableCell>
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