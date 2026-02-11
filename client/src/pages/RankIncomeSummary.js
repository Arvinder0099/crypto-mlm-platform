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
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

const RankIncomeSummary = () => {
  const [filters, setFilters] = useState({
    date: '',
    memberId: '',
    shows: '',
  });

  const [rankIncomeData, setRankIncomeData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/reports/rank-income', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setRankIncomeData(data.data || []);
      })
      .catch(err => console.error('Failed to load rank income data', err));
  }, []);

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          RANK INCOME SUMMARY
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reports - Rank Income Summary
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ overflowX: 'auto' }}>
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
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)',
                }}
              >
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reward Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acheived On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rankIncomeData.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{row.rankId}</TableCell>
                  <TableCell>{row.rank}</TableCell>
                  <TableCell>$ {(row.rewardAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.acheivedOn}</TableCell>
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

export default RankIncomeSummary;
