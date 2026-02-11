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
import { Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';

const MembersWithdrawalAddresses = () => {
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    shows: '',
  });

  const [withdrawalAddresses, setWithdrawalAddresses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/withdrawal-addresses', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setWithdrawalAddresses(data.data || []);
      })
      .catch(err => console.error('Failed to load withdrawal addresses', err));
  }, []);

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  const handleEdit = (memberId) => {
    console.log('Edit withdrawal address for:', memberId);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          MEMBERS WITHDRAWAL ADDRESSES
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Member's Area - Members Withdrawal Addresses
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Search Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            placeholder="User Name"
            value={filters.userName}
            onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Edit</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Mode</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Address</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Updated On</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawalAddresses.map((row) => (
                <TableRow key={row.srNo} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{row.srNo}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(row.memberId)}
                      sx={{ color: '#ff9800' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.memberId}</TableCell>
                  <TableCell>{row.memberName}</TableCell>
                  <TableCell>{row.paymentMode}</TableCell>
                  <TableCell>{row.paymentAddress}</TableCell>
                  <TableCell>{row.updatedOn}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MembersWithdrawalAddresses;
