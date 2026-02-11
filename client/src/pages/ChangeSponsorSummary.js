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
import { Search as SearchIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';

const ChangeSponsorSummary = () => {
  const [filters, setFilters] = useState({
    date: '',
    memberId: '',
    shows: '',
  });

  const [sponsorChanges, setSponsorChanges] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/sponsor-changes', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setSponsorChanges(data.data || []);
      })
      .catch(err => console.error('Failed to load sponsor changes', err));
  }, []);

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          SPONSOR CHANGE SUMMARY
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Reports - Sponsor Change Summary
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Search Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="dd/mm/yyyy"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            size="small"
            type="date"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <TextField
            placeholder="Member ID"
            value={filters.memberId}
            onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Old Sponsor ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>New Sponsor ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Changed On</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Changed By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sponsorChanges.map((row) => (
                <TableRow key={row.srNo} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.srNo}</TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.oldSponsorId}</TableCell>
                  <TableCell>{row.newSponsorId}</TableCell>
                  <TableCell>{row.changedOn}</TableCell>
                  <TableCell>{row.changedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            sx={{
              minWidth: 40,
              height: 40,
              borderRadius: '4px',
            }}
          >
            1
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangeSponsorSummary;
