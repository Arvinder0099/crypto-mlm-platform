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

const API_BASE = process.env.REACT_APP_API_URL || '';

const TransactionSummary = () => {
  const [filters, setFilters] = useState({
    date: '',
    userId: '',
    shows: '',
  });

  const [transactionData, setTransactionData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch(`${API_BASE}/api/reports/transactions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setTransactionData(data.data || []);
      })
      .catch(err => console.error('Failed to load transaction data', err));
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          TRANSACTIONS SUMMARY
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reports - Transactions Summary
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ overflowX: 'auto' }}>
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
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)',
                }}
              >
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Credit Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Debit Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Transaction Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Closing Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactionData.map((row, idx) => (
                <TableRow key={idx} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.userId || 'N/A'}</TableCell>
                  <TableCell sx={{ color: (row.credit || 0) > 0 ? '#4caf50' : 'inherit' }}>$ {(row.credit || 0).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: (row.debit || 0) > 0 ? '#f44336' : 'inherit' }}>$ {(row.debit || 0).toFixed(2)}</TableCell>
                  <TableCell>$ {(row.totalAmount || row.credit || row.debit || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>$ {(row.balance || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.description || row.type || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default TransactionSummary;
