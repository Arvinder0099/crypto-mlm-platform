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
  IconButton,
} from '@mui/material';
import { Description as ExcelIcon, Print as PrintIcon, Search as SearchIcon } from '@mui/icons-material';

const DatewiseRegistrations = () => {
  const [searchYear, setSearchYear] = useState('2023');
  const [registrationData, setRegistrationData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/reports/registrations-datewise', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setRegistrationData(data.data || []);
      })
      .catch(err => console.error('Failed to load registration data', err));
  }, []);

  const handleExport = () => {
    console.log('Export to Excel');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearch = () => {
    console.log('Search for year:', searchYear);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          DATEWISE REGISTRATIONS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Member Area - Datewise Registrations
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

        {/* Search Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <TextField
            placeholder="2023"
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
            sx={{ width: 300 }}
            size="small"
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ textTransform: 'none' }}
          >
            Search
          </Button>
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Year</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Jan</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Feb</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mar</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Apr</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>May</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>June</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>July</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Aug</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sept</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Oct</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nov</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dec</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrationData.map((row, index) => (
                <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.jan}</TableCell>
                  <TableCell>{row.feb}</TableCell>
                  <TableCell>{row.mar}</TableCell>
                  <TableCell>{row.apr}</TableCell>
                  <TableCell>{row.may}</TableCell>
                  <TableCell>{row.june}</TableCell>
                  <TableCell>{row.july}</TableCell>
                  <TableCell>{row.aug}</TableCell>
                  <TableCell>{row.sept}</TableCell>
                  <TableCell>{row.oct}</TableCell>
                  <TableCell>{row.nov}</TableCell>
                  <TableCell>{row.dec}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DatewiseRegistrations;
