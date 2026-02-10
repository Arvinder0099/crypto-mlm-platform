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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Description as ExcelIcon, Print as PrintIcon, CheckCircle, Cancel } from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_URL || '';

const PendingWithdrawalRequests = () => {
  const [filters, setFilters] = useState({
    userId: '',
    userName: '',
    country: '',
    paymentMode: '',
  });

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [actionDialog, setActionDialog] = useState({ open: false, withdrawal: null, action: '' });
  const [transactionHash, setTransactionHash] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/withdrawals/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setPendingRequests(data.data || []);
    } catch (err) {
      console.error('Failed to load pending withdrawals', err);
      setError('Failed to load pending withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async () => {
    if (!actionDialog.withdrawal) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/withdrawals/${actionDialog.withdrawal.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ transactionHash })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess('Withdrawal approved successfully!');
        setActionDialog({ open: false, withdrawal: null, action: '' });
        setTransactionHash('');
        fetchPendingRequests();
      } else {
        setError(data.message || 'Failed to approve withdrawal');
      }
    } catch (err) {
      setError('Error approving withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!actionDialog.withdrawal) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/withdrawals/${actionDialog.withdrawal.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: rejectReason })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess('Withdrawal rejected successfully!');
        setActionDialog({ open: false, withdrawal: null, action: '' });
        setRejectReason('');
        fetchPendingRequests();
      } else {
        setError(data.message || 'Failed to reject withdrawal');
      }
    } catch (err) {
      setError('Error rejecting withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    // Export to CSV
    const headers = ['Order No', 'Name', 'User ID', 'Amount', 'Date', 'Payment Mode', 'Address'];
    const csvContent = [
      headers.join(','),
      ...pendingRequests.map(r => [
        r.orderNo, r.userName, r.userId, r.amount, 
        new Date(r.withdrawalDate).toLocaleDateString(),
        r.paymentMode, r.paymentAddress
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pending_withdrawals.csv';
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredRequests = pendingRequests.filter(r => {
    if (filters.userId && !r.userId?.toLowerCase().includes(filters.userId.toLowerCase())) return false;
    if (filters.userName && !r.userName?.toLowerCase().includes(filters.userName.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          PENDING PAYOUT REQUESTS
        </Typography>
        <Chip label={`${pendingRequests.length} Pending`} color="warning" />
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
          <Button variant="contained" onClick={fetchPendingRequests} sx={{ textTransform: 'none' }}>
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
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order No</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Mode</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary">No pending withdrawal requests</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((row) => (
                    <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => setActionDialog({ open: true, withdrawal: row, action: 'approve' })}
                            sx={{ textTransform: 'none' }}
                          >
                            Pay
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => setActionDialog({ open: true, withdrawal: row, action: 'reject' })}
                            sx={{ textTransform: 'none' }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>{row.orderNo}</TableCell>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.userId}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        ${row.amount?.toFixed(2)}
                      </TableCell>
                      <TableCell>{new Date(row.withdrawalDate).toLocaleDateString()}</TableCell>
                      <TableCell>{row.paymentMode}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.paymentAddress}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Approve Dialog */}
      <Dialog open={actionDialog.open && actionDialog.action === 'approve'} onClose={() => setActionDialog({ open: false, withdrawal: null, action: '' })}>
        <DialogTitle>Approve Withdrawal</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Approve withdrawal of <strong>${actionDialog.withdrawal?.amount?.toFixed(2)}</strong> for user <strong>{actionDialog.withdrawal?.userName}</strong>?
          </Typography>
          <TextField
            fullWidth
            label="Transaction Hash (optional)"
            value={transactionHash}
            onChange={(e) => setTransactionHash(e.target.value)}
            placeholder="Enter blockchain transaction hash"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, withdrawal: null, action: '' })}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success" disabled={processing}>
            {processing ? <CircularProgress size={20} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionDialog.open && actionDialog.action === 'reject'} onClose={() => setActionDialog({ open: false, withdrawal: null, action: '' })}>
        <DialogTitle>Reject Withdrawal</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Reject withdrawal of <strong>${actionDialog.withdrawal?.amount?.toFixed(2)}</strong> for user <strong>{actionDialog.withdrawal?.userName}</strong>?
          </Typography>
          <TextField
            fullWidth
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection"
            multiline
            rows={2}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, withdrawal: null, action: '' })}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={processing}>
            {processing ? <CircularProgress size={20} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingWithdrawalRequests;
