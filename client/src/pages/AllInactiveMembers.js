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
  Checkbox,
  IconButton,
} from '@mui/material';
import { Description as ExcelIcon, Print as PrintIcon, Search as SearchIcon, AccountCircle } from '@mui/icons-material';
import { exportToExcel, printPage } from '../utils/exportUtils';

const AllInactiveMembers = () => {
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    email: '',
    mobile: '',
    shows: '',
  });

  // Inactive members - fetched from API
  const [inactiveMembers, setInactiveMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/admin/members?status=inactive', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setInactiveMembers(data.members || data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load inactive members', err);
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    const exportData = inactiveMembers.map(member => ({
      'User ID': member.userId || 'N/A',
      'Name': member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      'Email': member.email || 'N/A',
      'Mobile': member.mobile || member.phone || 'N/A',
      'Status': member.status || 'inactive',
      'Total Investment': member.totalInvested || 0,
      'Joined Date': member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'
    }));
    exportToExcel(exportData, 'inactive-members');
  };

  const handlePrint = () => {
    printPage();
  };

  const handleSearch = () => {
    console.log('Search with filters:', filters);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ALL IN-ACTIVE MEMBERS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Members - All In-Active Members
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {/* Export and Print Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ExcelIcon />}
            sx={{ color: '#4caf50', textTransform: 'none' }}
            onClick={handleExport}
          >
            Export Excel
          </Button>
          <Typography sx={{ mx: 1, color: 'text.secondary' }}>|</Typography>
          <Button
            startIcon={<PrintIcon />}
            sx={{ color: '#1976d2', textTransform: 'none' }}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>

        {/* Search Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="User Name"
            value={filters.userName}
            onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Email ID like"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            placeholder="Mobile Number like"
            value={filters.mobile}
            onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
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

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#4caf50', textTransform: 'none', '&:hover': { backgroundColor: '#45a049' } }}
          >
            Active
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#f44336', textTransform: 'none', '&:hover': { backgroundColor: '#da190b' } }}
          >
            Suspend
          </Button>
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
                <TableCell padding="checkbox" sx={{ color: 'white' }}>
                  <Checkbox sx={{ color: 'white' }} />
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sr No</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sponsor ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email Address</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Password</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mobile Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Country</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inactiveMembers.map((member, index) => (
                <TableRow key={member.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountCircle sx={{ color: '#1976d2' }} />
                      {member.id}
                    </Box>
                  </TableCell>
                  <TableCell>{member.userId}</TableCell>
                  <TableCell>{member.userName}</TableCell>
                  <TableCell>{member.sponsorId}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.password}</TableCell>
                  <TableCell>{member.mobile}</TableCell>
                  <TableCell>{member.country}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AllInactiveMembers;
