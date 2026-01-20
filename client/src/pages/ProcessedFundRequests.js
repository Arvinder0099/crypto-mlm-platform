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

const ProcessedFundRequests = () => {
  const [filters, setFilters] = useState({
    memberId: '',
    username: '',
    shows: '',
  });

  const [processedRequests, setProcessedRequests] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/fund-requests/processed', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setProcessedRequests(data.data || []);
      })
      .catch(err => console.error('Failed to load processed fund requests', err));
  }, []);

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          PROCESSED FUND REQUEST SUMMARY
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Subscription - Processed Fund Request Summary
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Search Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Member ID"
            value={filters.memberId}
            onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            placeholder="Username Like"
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment mode</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Address</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedRequests.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{row.memberId}</TableCell>
                  <TableCell>{row.paymentMode}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{row.paymentAddress}</TableCell>
                  <TableCell>$ {row.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ProcessedFundRequests;
