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
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { 
  Description as ExcelIcon, 
  Print as PrintIcon, 
  Search as SearchIcon, 
  AccountCircle,
  Visibility,
  Edit,
  Block,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3040';

const AllMembers = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    email: '',
    mobile: '',
    status: '',
  });

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [viewDialog, setViewDialog] = useState({ open: false, member: null });
  const [statusDialog, setStatusDialog] = useState({ open: false, member: null, newStatus: '' });
  const [processing, setProcessing] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/members`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setMembers(data.members || data.data || []);
    } catch (err) {
      console.error('Failed to load members', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleStatusChange = async () => {
    if (!statusDialog.member || !statusDialog.newStatus) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/users/${statusDialog.member._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusDialog.newStatus })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess(`User status changed to ${statusDialog.newStatus}`);
        setStatusDialog({ open: false, member: null, newStatus: '' });
        fetchMembers();
      } else {
        setError(data.message || 'Failed to change status');
      }
    } catch (err) {
      setError('Error changing user status');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Status', 'Sponsor', 'Registered'];
    const csvContent = [
      headers.join(','),
      ...members.map(m => [
        m.userId, 
        m.userName || `${m.firstName} ${m.lastName}`,
        m.email, 
        m.mobile || m.phone || 'N/A',
        m.status,
        m.sponsorId || 'N/A',
        new Date(m.registeredOn || m.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_members.csv';
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const filteredMembers = members.filter(m => {
    const name = m.userName || `${m.firstName || ''} ${m.lastName || ''}`;
    if (filters.userId && !m.userId?.toLowerCase().includes(filters.userId.toLowerCase())) return false;
    if (filters.userName && !name.toLowerCase().includes(filters.userName.toLowerCase())) return false;
    if (filters.email && !m.email?.toLowerCase().includes(filters.email.toLowerCase())) return false;
    if (filters.mobile && !(m.mobile || m.phone || '').includes(filters.mobile)) return false;
    if (filters.status && m.status !== filters.status) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ALL MEMBERS
        </Typography>
        <Box display="flex" gap={1}>
          <Chip label={`Total: ${members.length}`} color="primary" />
          <Chip label={`Active: ${members.filter(m => m.status === 'active').length}`} color="success" />
          <Chip label={`Inactive: ${members.filter(m => m.status === 'inactive').length}`} color="warning" />
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 3 }}>
        {/* Export and Print Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button startIcon={<ExcelIcon />} sx={{ color: '#4caf50', textTransform: 'none' }} onClick={handleExport}>
            Export Excel
          </Button>
          <Typography sx={{ mx: 1, color: 'text.secondary' }}>|</Typography>
          <Button startIcon={<PrintIcon />} sx={{ color: '#1976d2', textTransform: 'none' }} onClick={handlePrint}>
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
            placeholder="Email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <TextField
            placeholder="Mobile"
            value={filters.mobile}
            onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<SearchIcon />} onClick={fetchMembers} sx={{ textTransform: 'none' }}>
            Refresh
          </Button>
        </Box>

        {/* Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sponsor</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Registered</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography color="text.secondary">No members found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member, idx) => (
                    <TableRow key={member._id || idx} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                            {(member.firstName || member.userName || 'U')[0].toUpperCase()}
                          </Avatar>
                          {member.userName || `${member.firstName || ''} ${member.lastName || ''}`}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{member.userId}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.mobile || member.phone || 'N/A'}</TableCell>
                      <TableCell>{member.sponsorId || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={member.status} 
                          color={getStatusColor(member.status)} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(member.registeredOn || member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => setViewDialog({ open: true, member })}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Change Status">
                            <IconButton 
                              size="small" 
                              color={member.status === 'active' ? 'warning' : 'success'}
                              onClick={() => setStatusDialog({ 
                                open: true, 
                                member, 
                                newStatus: member.status === 'active' ? 'suspended' : 'active' 
                              })}
                            >
                              {member.status === 'active' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* View Details Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, member: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Member Details</DialogTitle>
        <DialogContent>
          {viewDialog.member && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: '#667eea' }}>
                  {(viewDialog.member.firstName || viewDialog.member.userName || 'U')[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {viewDialog.member.userName || `${viewDialog.member.firstName || ''} ${viewDialog.member.lastName || ''}`}
                  </Typography>
                  <Chip label={viewDialog.member.status} color={getStatusColor(viewDialog.member.status)} size="small" />
                </Box>
              </Box>
              
              <Box sx={{ '& > div': { display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' } }}>
                <Box><Typography color="text.secondary">User ID:</Typography><Typography fontWeight="bold">{viewDialog.member.userId}</Typography></Box>
                <Box><Typography color="text.secondary">Email:</Typography><Typography>{viewDialog.member.email}</Typography></Box>
                <Box><Typography color="text.secondary">Phone:</Typography><Typography>{viewDialog.member.mobile || viewDialog.member.phone || 'N/A'}</Typography></Box>
                <Box><Typography color="text.secondary">Country:</Typography><Typography>{viewDialog.member.country || 'N/A'}</Typography></Box>
                <Box><Typography color="text.secondary">Sponsor:</Typography><Typography>{viewDialog.member.sponsorId || 'N/A'}</Typography></Box>
                <Box><Typography color="text.secondary">Registered:</Typography><Typography>{new Date(viewDialog.member.registeredOn || viewDialog.member.createdAt).toLocaleString()}</Typography></Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, member: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, member: null, newStatus: '' })}>
        <DialogTitle>Change User Status</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Change status of <strong>{statusDialog.member?.userName || statusDialog.member?.userId}</strong> to <strong>{statusDialog.newStatus}</strong>?
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={statusDialog.newStatus}
              label="New Status"
              onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, member: null, newStatus: '' })}>Cancel</Button>
          <Button onClick={handleStatusChange} variant="contained" disabled={processing}>
            {processing ? <CircularProgress size={20} /> : 'Change Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllMembers;
