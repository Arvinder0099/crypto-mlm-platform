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

const DailyLevelIncomeSummary = () => {
  const [filters, setFilters] = useState({
    date: '',
    memberId: '',
    shows: '',
  });

  const [levelIncomeData, setLevelIncomeData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/reports/level-income', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setLevelIncomeData(data.data || []);
      })
      .catch(err => console.error('Failed to load level income data', err));
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
          LEVEL INCOME SUMMARY
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reports - Level Income Summary
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
            placeholder="Member ID"
            value={filters.memberId}
            onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
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
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)',
                }}
              >
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Level</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Level(%)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Investment Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Level Income</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dated On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {levelIncomeData.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.memberId}</TableCell>
                  <TableCell>{row.level}</TableCell>
                  <TableCell>{row.levelPercent}</TableCell>
                  <TableCell>$ {(row.investmentAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>$ {(row.levelIncome || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.datedOn}</TableCell>
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

export default DailyLevelIncomeSummary;
