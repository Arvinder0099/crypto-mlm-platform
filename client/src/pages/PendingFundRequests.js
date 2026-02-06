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
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3040';

const PendingFundRequests = () => {
  const [filters, setFilters] = useState({
    memberId: '',
    memberName: '',
  });

  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rejectDialog, setRejectDialog] = useState({ open: false, depositId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(null);

  const fetchPendingDeposits = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/deposits/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success && data.data) {
        setPendingDeposits(data.data);
      } else {
        setPendingDeposits([]);
      }
    } catch (err) {
      console.error('Failed to load pending deposits', err);
      setError('Failed to load pending deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  const handleApprove = async (depositId) => {
    setProcessing(depositId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/deposits/${depositId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ adminNotes: 'Approved by admin' })
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: data.message || 'Deposit approved successfully!', severity: 'success' });
        fetchPendingDeposits();
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to approve deposit', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error approving deposit', severity: 'error' });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    const depositId = rejectDialog.depositId;
    setProcessing(depositId);
    setRejectDialog({ open: false, depositId: null });
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason: rejectReason || 'Rejected by admin', adminNotes: rejectReason })
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Deposit rejected', severity: 'info' });
        fetchPendingDeposits();
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to reject deposit', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error rejecting deposit', severity: 'error' });
    } finally {
      setProcessing(null);
      setRejectReason('');
    }
  };

  const filteredDeposits = pendingDeposits.filter(row => {
    const user = row.userId || {};
    const matchId = !filters.memberId || (user.userId || '').toLowerCase().includes(filters.memberId.toLowerCase());
    const matchName = !filters.memberName || `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(filters.memberName.toLowerCase());
    return matchId && matchName;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          PENDING FUND REQUESTS
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPendingDeposits}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
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
            value={filters.memberName}
            onChange={(e) => setFilters({ ...filters, memberName: e.target.value })}
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

        {/* Summary */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`${filteredDeposits.length} Pending Deposits`}
            color={filteredDeposits.length > 0 ? 'warning' : 'default'}
            sx={{ fontWeight: 'bold' }}
          />
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Network</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Transaction Hash</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Requested On</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Slip</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No pending fund requests — all deposits have been processed
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeposits.map((row, index) => {
                  const user = row.userId || {};
                  return (
                    <TableRow key={row._id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{user.userId || 'N/A'}</TableCell>
                      <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>$ {(row.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip label={(row.network || 'N/A').toUpperCase()} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.transactionHash || 'N/A'}
                      </TableCell>
                      <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        {row.paymentSlip ? (
                          <Tooltip title="View Payment Slip">
                            <IconButton
                              size="small"
                              onClick={() => window.open(`${API_BASE}/api/admin/deposits/${row._id}/slip`, '_blank')}
                            >
                              <ImageIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">None</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Approve — Credit to user's Fund Wallet">
                            <span>
                              <IconButton
                                color="success"
                                onClick={() => handleApprove(row._id)}
                                disabled={processing === row._id}
                                sx={{
                                  border: '2px solid #2e7d32',
                                  borderRadius: 2,
                                  '&:hover': { backgroundColor: '#e8f5e9' }
                                }}
                              >
                                {processing === row._id ? <CircularProgress size={20} /> : <ApproveIcon />}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Reject — Deny this deposit">
                            <span>
                              <IconButton
                                color="error"
                                onClick={() => setRejectDialog({ open: true, depositId: row._id })}
                                disabled={processing === row._id}
                                sx={{
                                  border: '2px solid #d32f2f',
                                  borderRadius: 2,
                                  '&:hover': { backgroundColor: '#ffebee' }
                                }}
                              >
                                <RejectIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Paper>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, depositId: null })}>
        <DialogTitle>Reject Deposit</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this deposit:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRejectDialog({ open: false, depositId: null }); setRejectReason(''); }}>
            Cancel
          </Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingFundRequests;
