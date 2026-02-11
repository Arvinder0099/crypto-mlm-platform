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

const DirectIncomeSummary = () => {
  const [filters, setFilters] = useState({
    userName: '',
    memberId: '',
    emailId: '',
    mobileNumber: '',
    shows: '',
  });

  const [directIncomeData, setDirectIncomeData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/reports/direct-income', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setDirectIncomeData(data.data || []);
      })
      .catch(err => console.error('Failed to load direct income data', err));
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
          DIRECT REFERRAL BONUS SUMMARY
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reports - Direct Referral Bonus Summary
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
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="User Name"
            value={filters.userName}
            onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Member ID"
            value={filters.memberId}
            onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Email ID like"
            value={filters.emailId}
            onChange={(e) => setFilters({ ...filters, emailId: e.target.value })}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            placeholder="Mobile Number like"
            value={filters.mobileNumber}
            onChange={(e) => setFilters({ ...filters, mobileNumber: e.target.value })}
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
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)',
                }}
              >
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>SR.No</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Child ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Level</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Percent</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {directIncomeData.map((row) => (
                <TableRow key={row.srNo} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.srNo}</TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.childId}</TableCell>
                  <TableCell>{row.level}</TableCell>
                  <TableCell>$ {(row.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.percent}</TableCell>
                  <TableCell>{row.date}</TableCell>
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

export default DirectIncomeSummary;
