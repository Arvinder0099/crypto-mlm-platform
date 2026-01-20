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

const PendingFundRequests = () => {
  const [filters, setFilters] = useState({
    memberId: '',
    memberName: '',
    shows: '',
  });

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          PENDING FUND REQUESTS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Deposit Fund - Pending Fund Requests
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
            placeholder="Member Name like"
            value={filters.memberName}
            onChange={(e) => setFilters({ ...filters, memberName: e.target.value })}
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

        {/* No Records Message */}
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'red', 
            mb: 2, 
            fontWeight: 'bold' 
          }}
        >
          No Records Found!
        </Typography>

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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Transaction ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Request On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No pending fund requests
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PendingFundRequests;
