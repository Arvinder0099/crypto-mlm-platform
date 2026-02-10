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
  Tooltip,
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
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  MonetizationOn as MoneyIcon,
  People as PeopleIcon,
  Pending as PendingIcon,
  CheckCircleOutline as CreditedIcon,
  DoNotDisturb as RejectedIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || '';

const AdminReferralBonuses = () => {
  const { token } = useAuth();
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    credited: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  
  // Dialog states
  const [viewDialog, setViewDialog] = useState({ open: false, bonus: null });
  const [approveDialog, setApproveDialog] = useState({ open: false, bonus: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, bonus: null });
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchBonuses = useCallback(async (status = '') => {
    try {
      setLoading(true);
      const url = status 
        ? `${API_BASE}/api/admin/referral-bonuses?status=${status}`
        : `${API_BASE}/api/admin/referral-bonuses`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      if (data.success) {
        setBonuses(data.data);
        
        // Calculate stats
        const all = data.data;
        setStats({
          total: all.length,
          pending: all.filter(b => b.status === 'pending' && b.bonusAmount > 0).length,
          credited: all.filter(b => b.status === 'credited').length,
          rejected: all.filter(b => b.status === 'rejected').length,
          totalAmount: all.filter(b => b.status === 'credited').reduce((sum, b) => sum + b.bonusAmount, 0),
          pendingAmount: all.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.bonusAmount, 0),
        });
      }
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      setSnackbar({ open: true, message: 'Error fetching referral bonuses', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBonuses();
  }, [fetchBonuses]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const statusMap = ['', 'pending', 'credited'];
    fetchBonuses(statusMap[newValue]);
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/referral-bonuses/${approveDialog.bonus.id}/approve`, {
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
        setApproveDialog({ open: false, bonus: null });
        setAdminNotes('');
        fetchBonuses();
      } else {
        setSnackbar({ open: true, message: data.message, severity: 'error' });
      }
    } catch (error) {
      console.error('Error approving bonus:', error);
      setSnackbar({ open: true, message: 'Error approving bonus', severity: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/referral-bonuses/${rejectDialog.bonus.id}/reject`, {
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
        setRejectDialog({ open: false, bonus: null });
        setRejectReason('');
        setAdminNotes('');
        fetchBonuses();
      } else {
        setSnackbar({ open: true, message: data.message, severity: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting bonus:', error);
      setSnackbar({ open: true, message: 'Error rejecting bonus', severity: 'error' });
    }
  };

  const getStatusChip = (status, bonusAmount) => {
    if (status === 'pending' && bonusAmount === 0) {
      return <Chip label="Awaiting Investment" color="default" size="small" />;
    }
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending Approval', icon: <PendingIcon fontSize="small" /> },
      credited: { color: 'success', label: 'Credited', icon: <CreditedIcon fontSize="small" /> },
      rejected: { color: 'error', label: 'Rejected', icon: <RejectedIcon fontSize="small" /> },
      cancelled: { color: 'default', label: 'Cancelled' },
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  // Filter bonuses that can be approved (pending with amount > 0)
  const filteredBonuses = bonuses.filter(b => {
    if (tabValue === 1) return b.status === 'pending' && b.bonusAmount > 0;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Referral Bonus Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchBonuses()}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                  <Typography variant="body2">Total Referrals</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.dark' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.pending}</Typography>
                  <Typography variant="body2">Pending Approval</Typography>
                  <Typography variant="caption">{formatCurrency(stats.pendingAmount)}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.dark' }}>
                  <PendingIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.credited}</Typography>
                  <Typography variant="body2">Credited</Typography>
                  <Typography variant="caption">{formatCurrency(stats.totalAmount)}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.dark' }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Pending Approval (${stats.pending})`} />
          <Tab label={`Credited (${stats.credited})`} />
        </Tabs>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredBonuses.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No referral bonuses found</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID (Referrer)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Referrer Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Referral To Whom ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Referred User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Investment</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bonus Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBonuses.map((bonus, index) => (
                <TableRow key={bonus.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {bonus.referrer.oderId || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{bonus.referrer.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{bonus.referrer.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="secondary">
                      {bonus.referredUser.oderId || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{bonus.referredUser.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{bonus.referredUser.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {bonus.investmentAmount > 0 ? (
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{formatCurrency(bonus.investmentAmount)}</Typography>
                        {bonus.investment && (
                          <Typography variant="caption" color="text.secondary">{bonus.investment.planName}</Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">No investment yet</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color={bonus.bonusAmount > 0 ? 'success.main' : 'text.secondary'}>
                      {formatCurrency(bonus.bonusAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(bonus.status, bonus.bonusAmount)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDate(bonus.createdAt)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setViewDialog({ open: true, bonus })}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {bonus.status === 'pending' && bonus.bonusAmount > 0 && (
                        <>
                          <Tooltip title="Approve & Credit">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => setApproveDialog({ open: true, bonus })}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setRejectDialog({ open: true, bonus })}
                            >
                              <RejectIcon fontSize="small" />
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
        )}
      </TableContainer>

      {/* View Details Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, bonus: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Referral Bonus Details</DialogTitle>
        <DialogContent dividers>
          {viewDialog.bonus && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Referrer</Typography>
                <Typography fontWeight="bold">{viewDialog.bonus.referrer.name}</Typography>
                <Typography variant="body2">{viewDialog.bonus.referrer.email}</Typography>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Referred User</Typography>
                <Typography fontWeight="bold">{viewDialog.bonus.referredUser.name}</Typography>
                <Typography variant="body2">{viewDialog.bonus.referredUser.email}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Joined: {formatDate(viewDialog.bonus.referredUser.joinedAt)}
                </Typography>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Investment & Bonus</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2">Investment Amount:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(viewDialog.bonus.investmentAmount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Bonus Percentage:</Typography>
                  <Typography fontWeight="bold">{viewDialog.bonus.bonusPercentage}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Bonus Amount:</Typography>
                  <Typography fontWeight="bold" color="success.main">{formatCurrency(viewDialog.bonus.bonusAmount)}</Typography>
                </Box>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 1 }}>{getStatusChip(viewDialog.bonus.status, viewDialog.bonus.bonusAmount)}</Box>
                {viewDialog.bonus.approvedBy && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Approved by: {viewDialog.bonus.approvedBy} on {formatDate(viewDialog.bonus.approvedAt)}
                  </Typography>
                )}
                {viewDialog.bonus.rejectionReason && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    Rejection Reason: {viewDialog.bonus.rejectionReason}
                  </Alert>
                )}
                {viewDialog.bonus.adminNotes && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Admin Notes: {viewDialog.bonus.adminNotes}
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, bonus: null })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, bonus: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'success.light', color: 'white' }}>
          Approve Referral Bonus
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {approveDialog.bonus && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                You are about to credit <strong>{formatCurrency(approveDialog.bonus.bonusAmount)}</strong> to{' '}
                <strong>{approveDialog.bonus.referrer.name}</strong> for referring{' '}
                <strong>{approveDialog.bonus.referredUser.name}</strong>.
              </Alert>
              
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2"><strong>Investment Amount:</strong> {formatCurrency(approveDialog.bonus.investmentAmount)}</Typography>
                <Typography variant="body2"><strong>Bonus (10%):</strong> {formatCurrency(approveDialog.bonus.bonusAmount)}</Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Admin Notes (Optional)"
                multiline
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setApproveDialog({ open: false, bonus: null }); setAdminNotes(''); }}>
            Cancel
          </Button>
          <Button variant="contained" color="success" startIcon={<ApproveIcon />} onClick={handleApprove}>
            Approve & Credit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, bonus: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>
          Reject Referral Bonus
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {rejectDialog.bonus && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You are about to reject the referral bonus for <strong>{approveDialog.bonus?.referrer?.name || rejectDialog.bonus.referrer.name}</strong>.
                This action cannot be undone.
              </Alert>
              
              <TextField
                fullWidth
                required
                label="Rejection Reason"
                multiline
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Admin Notes (Optional)"
                multiline
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any additional notes..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRejectDialog({ open: false, bonus: null }); setRejectReason(''); setAdminNotes(''); }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<RejectIcon />} 
            onClick={handleReject}
            disabled={!rejectReason.trim()}
          >
            Reject Bonus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminReferralBonuses;
