import React, { useState } from 'react';
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

const WithdrawalDatewiseSummary = () => {
  const [searchYear, setSearchYear] = useState('2022');
  const [selectDate, setSelectDate] = useState('');
  const [shows, setShows] = useState('');

  const handleExport = () => {
    console.log('Export to Excel');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearch = () => {
    console.log('Search for year:', searchYear);
  };

  const handleDownloadSummary = () => {
    console.log('Download Summary');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          DAILY APPROVED WITHDRAWAL SUMMARY
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Withdrawal - Daily Approved Withdrawal Summary
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
            placeholder="2022"
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
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
            placeholder="Select Date"
            value={selectDate}
            onChange={(e) => setSelectDate(e.target.value)}
            size="small"
            type="date"
            sx={{ minWidth: 180 }}
          />
          <Button
            variant="contained"
            onClick={handleDownloadSummary}
            sx={{
              backgroundColor: '#ff9800',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f57c00' },
            }}
          >
            DownLoad Summary
          </Button>
          <TextField
            placeholder="Shows"
            value={shows}
            onChange={(e) => setShows(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          />
        </Box>

        {/* No Records Message */}
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'red', 
            mb: 2, 
            fontWeight: 'bold' 
          }}
        >
          No Record Found !
        </Typography>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)',
                }}
              >
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 80 }}>Year</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 80 }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>January</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>February</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>March</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>April</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>May</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>June</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>July</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>August</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>september</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>october</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>november</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>December</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={14} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No withdrawal records for this year
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default WithdrawalDatewiseSummary;
