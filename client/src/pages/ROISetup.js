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
  Link,
} from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

const ROISetup = () => {
  const [filters, setFilters] = useState({
    percent: '',
    dateFrom: '',
    dateTo: '',
    shows: '',
  });

  const [roiData, setRoiData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/roi-setup', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setRoiData(data.data || []);
      })
      .catch(err => console.error('Failed to load ROI data', err));
  }, []);

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  const handleEdit = (srNo) => {
    console.log('Edit ROI entry:', srNo);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          SET YOUR DAILY ROI PERCENT
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Members - Set Your Daily ROI Percent
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Search Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Percent"
            value={filters.percent}
            onChange={(e) => setFilters({ ...filters, percent: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="dd/mm/yyyy"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            size="small"
            type="date"
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />,
            }}
          />
          <TextField
            placeholder="dd/mm/yyyy"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            size="small"
            type="date"
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />,
            }}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sr No</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ROI Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ROI Percent %</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Execution Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ROI Updated On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roiData.map((row) => (
                <TableRow key={row.srNo} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleEdit(row.srNo)}
                      sx={{
                        color: '#1976d2',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        mr: 2,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Edit
                    </Link>
                    {row.srNo}
                  </TableCell>
                  <TableCell>{row.roiDate}</TableCell>
                  <TableCell>{row.roiPercent}</TableCell>
                  <TableCell>{row.executionStatus}</TableCell>
                  <TableCell>{row.roiUpdatedOn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ROISetup;
