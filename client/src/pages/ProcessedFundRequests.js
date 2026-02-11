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
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_URL || '';

const ProcessedFundRequests = () => {
  const [filters, setFilters] = useState({
    memberId: '',
    username: '',
  });

  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActivations = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/activations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.data) {
        setActivations(data.data);
      } else {
        setActivations([]);
      }
    } catch (err) {
      console.error('Failed to load user activations', err);
      setError('Failed to load user activations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivations();
  }, []);

  const filteredActivations = activations.filter(row => {
    const matchId = !filters.memberId || (row.userId || '').toLowerCase().includes(filters.memberId.toLowerCase());
    const matchName = !filters.username || (row.userName || '').toLowerCase().includes(filters.username.toLowerCase());
    return matchId && matchName;
  });

  const getStatusChip = (status) => {
    const config = {
      active: { color: 'success', label: 'Active' },
      completed: { color: 'info', label: 'Completed' },
      expired: { color: 'default', label: 'Expired' },
      cancelled: { color: 'error', label: 'Cancelled' },
    };
    const c = config[status] || { color: 'default', label: status || 'Unknown' };
    return <Chip label={c.label} color={c.color} size="small" />;
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          USER ACTIVATION
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchActivations}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Search Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="User ID"
            value={filters.memberId}
            onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            placeholder="User Name"
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={() => {}}
            sx={{ textTransform: 'none' }}
          >
            Search
          </Button>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plan Selected</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Activated On</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Expires On</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reference ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActivations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No user activations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivations.map((row, index) => (
                  <TableRow key={row.referenceId || index} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.userId}</TableCell>
                    <TableCell>{row.userName}</TableCell>
                    <TableCell>
                      <Chip label={row.plan || 'N/A'} color="primary" variant="outlined" size="small" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>$ {(row.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell>{row.activatedOn ? new Date(row.activatedOn).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{row.expiresOn ? new Date(row.expiresOn).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{row.referenceId || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ProcessedFundRequests;
