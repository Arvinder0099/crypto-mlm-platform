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
import { Description as ExcelIcon, Print as PrintIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';

const WithdrawalRequestsSummary = () => {
  const [filters, setFilters] = useState({
    date: '',
    userId: '',
    accountNo: '',
    shows: '',
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/withdrawals/summary', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setWithdrawalRequests(data.data || []);
      })
      .catch(err => console.error('Failed to load withdrawal requests', err));
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          PAYOUT REQUEST SUMMARY
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Withdrawal - Payout Request Summary
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
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="dd/mm/yyyy"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            size="small"
            type="date"
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />,
            }}
          />
          <TextField
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Account No."
            value={filters.accountNo}
            onChange={(e) => setFilters({ ...filters, accountNo: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fee</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Final Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Coin</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>To Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawalRequests.map((row, index) => (
                <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>$ {row.amount.toFixed(2)}</TableCell>
                  <TableCell>$ {row.fee.toFixed(2)}</TableCell>
                  <TableCell>$ {row.finalAmount.toFixed(2)}</TableCell>
                  <TableCell>{row.coin}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{row.toAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default WithdrawalRequestsSummary;
