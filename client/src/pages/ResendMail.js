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
import { Search as SearchIcon } from '@mui/icons-material';

const ResendMail = () => {
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    shows: '',
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/members', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setMembers(data.data || []);
      })
      .catch(err => console.error('Failed to load members', err));
  }, []);

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  const handleResendMail = (memberId, email) => {
    console.log('Resending login details to:', memberId, email);
    // Add API call here to resend email
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          RESEND MAIL
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Member Area - Resend Mail
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Login Details Mail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell>{member.id}</TableCell>
                  <TableCell>{member.memberId}</TableCell>
                  <TableCell>{member.userName}</TableCell>
                  <TableCell>{member.emailId}</TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleResendMail(member.memberId, member.emailId)}
                      sx={{
                        color: '#1976d2',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Resend Login Details Mail
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ResendMail;
