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
import { Description as ExcelIcon, Print as PrintIcon, Search as SearchIcon } from '@mui/icons-material';

const WalletStatistics = () => {
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    shows: '',
  });

  const [walletData, setWalletData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/wallet-statistics', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setWalletData(data.data || []);
      })
      .catch(err => console.error('Failed to load wallet data', err));
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          WALLET SUMMARY
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Member Area - Wallet Summary
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
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
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            placeholder="User Name ex. ABC"
            value={filters.userName}
            onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
            size="small"
            sx={{ minWidth: 200 }}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>SR.No</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cash Wallet Balance</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Utility Wallet Balance</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank Wallet Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {walletData.map((row) => (
                <TableRow key={row.srNo} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.srNo}</TableCell>
                  <TableCell sx={{ color: '#1976d2', cursor: 'pointer' }}>{row.userId}</TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>$ {(row.cashWalletBalance || 0).toFixed(2)}</TableCell>
                  <TableCell>$ {(row.utilityWalletBalance || 0).toFixed(2)}</TableCell>
                  <TableCell>$ {(row.rankWalletBalance || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default WalletStatistics;
