import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  MonetizationOn as MoneyIcon,
  Pending as PendingIcon,
  CheckCircleOutline as CreditedIcon,
  DoNotDisturb as RejectedIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || '';

const PendingDepositRequests = () => {
  const { token } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  
  // Dialog states
  const [viewDialog, setViewDialog] = useState({ open: false, deposit: null });
  const [approveDialog, setApproveDialog] = useState({ open: false, deposit: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, deposit: null });
  const [slipDialog, setSlipDialog] = useState({ open: false, depositId: null });
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDeposits = useCallback(async (status = '') => {
    try {
      setLoading(true);
      const url = status 
        ? `${API_BASE}/api/admin/deposits?status=${status}`
        : `${API_BASE}/api/admin/deposits`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        setDeposits(data.data);
        
        // Calculate stats
        const all = data.data;
        setStats({
          total: all.length,
          pending: all.filter(d => d.status === 'pending').length,
          approved: all.filter(d => d.status === 'approved').length,
          rejected: all.filter(d => d.status === 'rejected').length,
          totalAmount: all.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0),
          pendingAmount: all.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0),
        });
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
      setSnackbar({ open: true, message: 'Error fetching deposits', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const statusMap = ['', 'pending', 'approved', 'rejected'];
    fetchDeposits(statusMap[newValue]);
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/deposits/${approveDialog.deposit._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNotes }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: data.message, severity: 'success' });
        setApproveDialog({ open: false, deposit: null });
        setAdminNotes('');
        fetchDeposits();
      } else {
        setSnackbar({ open: true, message: data.message, severity: 'error' });
      }
    } catch (error) {
      console.error('Error approving deposit:', error);
      setSnackbar({ open: true, message: 'Error approving deposit', severity: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/deposits/${rejectDialog.deposit._id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason, adminNotes }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: data.message, severity: 'success' });
        setRejectDialog({ open: false, deposit: null });
        setRejectReason('');
        setAdminNotes('');
        fetchDeposits();
      } else {
        setSnackbar({ open: true, message: data.message, severity: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      setSnackbar({ open: true, message: 'Error rejecting deposit', severity: 'error' });
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
      approved: { color: 'success', icon: <CreditedIcon fontSize="small" /> },
      rejected: { color: 'error', icon: <RejectedIcon fontSize="small" /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip 
        size="small" 
        label={status.toUpperCase()} 
        color={config.color}
        icon={config.icon}
      />
    );
  };

  const getNetworkChip = (network) => {
    const networkConfig = {
      usdt_trc20: { label: 'TRC20', color: '#26A17B' },
      bnb_bep20: { label: 'BEP20', color: '#F3BA2F' },
    };
    const config = networkConfig[network] || { label: network, color: '#666' };
    return (
      <Chip 
        size="small" 
        label={config.label}
        sx={{ bgcolor: config.color, color: 'white', fontWeight: 'bold' }}
      />
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          💰 Deposit Requests Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchDeposits()}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.dark' }}><PendingIcon /></Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.pending}</Typography>
                  <Typography variant="body2">Pending</Typography>
                  <Typography variant="caption">${stats.pendingAmount.toFixed(2)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.dark' }}><CreditedIcon /></Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.approved}</Typography>
                  <Typography variant="body2">Approved</Typography>
                  <Typography variant="caption">${stats.totalAmount.toFixed(2)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.dark' }}><RejectedIcon /></Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.rejected}</Typography>
                  <Typography variant="body2">Rejected</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.dark' }}><MoneyIcon /></Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                  <Typography variant="body2">Total Deposits</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Deposits" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : deposits.length === 0 ? (
          <Alert severity="info">No deposits found</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Network</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>TX Hash</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {deposit.userId?.firstName} {deposit.userId?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {deposit.userId?.userId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        ${deposit.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getNetworkChip(deposit.network)}</TableCell>
                    <TableCell>
                      <Tooltip title={deposit.transactionHash}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 120, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            fontFamily: 'monospace'
                          }}
                        >
                          {deposit.transactionHash}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{getStatusChip(deposit.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(deposit.createdAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => setViewDialog({ open: true, deposit })}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {deposit.paymentSlip && (
                          <Tooltip title="View Payment Slip">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => setSlipDialog({ open: true, depositId: deposit._id })}
                            >
                              <ImageIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {deposit.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => setApproveDialog({ open: true, deposit })}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => setRejectDialog({ open: true, deposit })}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, deposit: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit Details</DialogTitle>
        <DialogContent dividers>
          {viewDialog.deposit && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography color="text.secondary">User:</Typography></Grid>
              <Grid item xs={6}><Typography fontWeight="bold">{viewDialog.deposit.userId?.firstName} {viewDialog.deposit.userId?.lastName}</Typography></Grid>
              
              <Grid item xs={6}><Typography color="text.secondary">User ID:</Typography></Grid>
              <Grid item xs={6}><Typography>{viewDialog.deposit.userId?.userId}</Typography></Grid>
              
              <Grid item xs={6}><Typography color="text.secondary">Amount:</Typography></Grid>
              <Grid item xs={6}><Typography fontWeight="bold" color="success.main">${viewDialog.deposit.amount}</Typography></Grid>
              
              <Grid item xs={6}><Typography color="text.secondary">Network:</Typography></Grid>
              <Grid item xs={6}>{getNetworkChip(viewDialog.deposit.network)}</Grid>
              
              <Grid item xs={6}><Typography color="text.secondary">TX Hash:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>{viewDialog.deposit.transactionHash}</Typography></Grid>
              
              <Grid item xs={6}><Typography color="text.secondary">User Wallet:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 12 }}>{viewDialog.deposit.userWalletAddress}</Typography></Grid>
              
              <Grid item xs={6}><Typography color="text.secondary">Admin Address:</Typography></Grid>
              <Grid item xs={6}><Typography sx={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 12 }}>{viewDialog.deposit.adminAddress}</Typography></Grid>
              
              <Grid item xs={6}><Typography color="text.secondary">Status:</Typography></Grid>
              <Grid item xs={6}>{getStatusChip(viewDialog.deposit.status)}</Grid>
              
              <Grid item xs={6}><Typography color="text.secondary">Submitted:</Typography></Grid>
              <Grid item xs={6}><Typography>{formatDate(viewDialog.deposit.createdAt)}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, deposit: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, deposit: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
          ✅ Approve Deposit
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {approveDialog.deposit && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Approving deposit of <strong>${approveDialog.deposit.amount}</strong> for <strong>{approveDialog.deposit.userId?.firstName} {approveDialog.deposit.userId?.lastName}</strong>
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This will credit ${approveDialog.deposit.amount} to the user's wallet balance.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Admin Notes (Optional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog({ open: false, deposit: null })}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Approve & Credit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, deposit: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
          ❌ Reject Deposit
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {rejectDialog.deposit && (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Rejecting deposit of <strong>${rejectDialog.deposit.amount}</strong>
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Rejection Reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Admin Notes (Optional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, deposit: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Reject Deposit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Slip Dialog */}
      <Dialog open={slipDialog.open} onClose={() => setSlipDialog({ open: false, depositId: null })} maxWidth="md">
        <DialogTitle>Payment Slip</DialogTitle>
        <DialogContent>
          {slipDialog.depositId && (
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={`${API_BASE}/api/admin/deposits/${slipDialog.depositId}/slip`}
                alt="Payment Slip"
                style={{ maxWidth: '100%', maxHeight: '70vh' }}
                onError={(e) => {
                  e.target.src = '';
                  e.target.alt = 'Failed to load image';
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlipDialog({ open: false, depositId: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingDepositRequests;
