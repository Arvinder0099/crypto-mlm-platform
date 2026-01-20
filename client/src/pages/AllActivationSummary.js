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
    fetch('/api/admin/all-activations', {
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Package</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>InvestBy</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reference ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activations.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      sx={{
                        color: '#1976d2',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      View
                    </Link>
                  </TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>${row.amount.toFixed(2)}</TableCell>
                  <TableCell>{row.package}</TableCell>
                  <TableCell>{row.investBy}</TableCell>
                  <TableCell>{row.paymentType}</TableCell>
                  <TableCell>{row.referenceId}</TableCell>
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
