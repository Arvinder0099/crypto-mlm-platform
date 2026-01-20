import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Description as ExcelIcon, Print as PrintIcon } from '@mui/icons-material';

const PendingWithdrawalRequests = () => {
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    country: '',
    paymentMode: '',
    shows: '',
  });

  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/withdrawals/pending', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setPendingRequests(data.data || []);
      })
      .catch(err => console.error('Failed to load pending withdrawals', err));
  }, []);

  const handleExport = () => {
    console.log('Export to Excel');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  const handlePayReject = (orderNo) => {
    console.log('Pay/Reject action for:', orderNo);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          PENDING PAYOUT REQUESTS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Withdrawal - Pending Payout Requests
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Export and Print Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ExcelIcon />}
            sx={{ color: '#4caf50', textTransform: 'none' }}
            onClick={handleExport}
          >
            Export Excel
          </Button>
          <Typography sx={{ mx: 1, color: 'text.secondary' }}>|</Typography>
          <Button
            startIcon={<PrintIcon />}
            sx={{ color: '#1976d2', textTransform: 'none' }}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>

        {/* Search Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="User Name"
            value={filters.userName}
            onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Select Country"
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Select Payment Mo"
            value={filters.paymentMode}
            onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ textTransform: 'none' }}
          >
            Search
          </Button>
          <TextField
            placeholder="Shows"
            value={filters.shows}
            onChange={(e) => setFilters({ ...filters, shows: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)',
                }}
              >
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order No</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Final Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Withdrawal Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Method</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRequests.map((row) => (
                <TableRow key={row.orderNo} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#ff9800',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#f57c00' },
                        mb: 1,
                      }}
                      onClick={() => handlePayReject(row.orderNo)}
                    >
                      Pay / Reject
                    </Button>
                    <Typography variant="body2">{row.orderNo}</Typography>
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>$ {row.finalAmount.toFixed(2)}</TableCell>
                  <TableCell>{row.withdrawalDate}</TableCell>
                  <TableCell>{row.paymentMethod}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{row.paymentAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PendingWithdrawalRequests;
