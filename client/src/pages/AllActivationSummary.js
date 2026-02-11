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

const AllActivationSummary = () => {
  const [filters, setFilters] = useState({
    userId: '',
    roiStatus: '',
    investStatus: '',
    investType: '',
    shows: '',
  });

  const [activations, setActivations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/activations', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setActivations(data.data || []);
      })
      .catch(err => console.error('Failed to load activations', err));
  }, []);

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ALL SUBSCRIPTION SUMMARY
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Subscription - All Subscription Summary
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Search Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="ROI Status"
            value={filters.roiStatus}
            onChange={(e) => setFilters({ ...filters, roiStatus: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Invest Status"
            value={filters.investStatus}
            onChange={(e) => setFilters({ ...filters, investStatus: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Invest Type"
            value={filters.investType}
            onChange={(e) => setFilters({ ...filters, investType: e.target.value })}
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
            placeholder="Shows"
            value={filters.shows}
            onChange={(e) => setFilters({ ...filters, shows: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow
                sx={{
                  background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)',
                }}
              >
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plan</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Activated On</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reference ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No activations found
                  </TableCell>
                </TableRow>
              ) : activations.map((row, idx) => (
                <TableRow key={idx} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.userId || 'N/A'}</TableCell>
                  <TableCell>{row.userName || 'N/A'}</TableCell>
                  <TableCell>${(row.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.plan || 'N/A'}</TableCell>
                  <TableCell>{(row.status || 'N/A').toUpperCase()}</TableCell>
                  <TableCell>{row.activatedOn ? new Date(row.activatedOn).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{row.referenceId || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AllActivationSummary;
