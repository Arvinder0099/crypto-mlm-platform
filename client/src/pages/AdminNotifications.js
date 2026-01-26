import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Badge,
  Tabs,
  Tab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Notifications,
  PersonAdd,
  CheckCircle,
  Delete,
  Visibility,
  MarkEmailRead,
  Refresh,
  MonetizationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tabValue, setTabValue] = useState(0); // 0 = all, 1 = unread, 2 = referral_registration
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/admin/notifications?limit=100';
      
      if (tabValue === 1) {
        url += '&isRead=false';
      } else if (tabValue === 2) {
        url += '&type=referral_registration';
      }
      
      if (typeFilter) {
        url += `&type=${typeFilter}`;
      }
      
      const response = await fetchWithAuth(url);
      if (response.success) {
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [tabValue, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await fetchWithAuth(`/api/admin/notifications/${id}/read`, {
        method: 'PUT'
      });
      fetchNotifications();
      setSuccess('Notification marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetchWithAuth('/api/admin/notifications/mark-all-read', {
        method: 'PUT'
      });
      fetchNotifications();
      setSuccess('All notifications marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetchWithAuth(`/api/admin/notifications/${id}`, {
        method: 'DELETE'
      });
      fetchNotifications();
      setSuccess('Notification deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      referral_registration: <PersonAdd sx={{ color: '#1976d2' }} />,
      referral_bonus_pending: <MonetizationOn sx={{ color: '#ff9800' }} />,
      withdrawal_request: <CheckCircle sx={{ color: '#f57c00' }} />,
      deposit: <CheckCircle sx={{ color: '#388e3c' }} />,
      kyc_submission: <Visibility sx={{ color: '#7b1fa2' }} />,
      system_alert: <Notifications sx={{ color: '#d32f2f' }} />,
    };
    return icons[type] || <Notifications />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      referral_registration: 'New Referral',
      referral_bonus_pending: 'Bonus Pending',
      withdrawal_request: 'Withdrawal Request',
      deposit: 'Deposit',
      kyc_submission: 'KYC Submission',
      system_alert: 'System Alert',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getPriorityChip = (priority) => {
    const colors = {
      low: 'default',
      normal: 'info',
      high: 'warning',
      urgent: 'error'
    };
    return <Chip size="small" label={priority} color={colors[priority] || 'default'} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) {
        const minutes = Math.floor(diff / 60000);
        return minutes < 1 ? 'Just now' : `${minutes} min ago`;
      }
      return `${hours}h ago`;
    }
    
    // Less than 7 days ago
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications fontSize="large" />
            </Badge>
            Admin Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Stay updated with referral registrations and system alerts
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchNotifications}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<MarkEmailRead />}
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e3f2fd', borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications sx={{ fontSize: 40, color: '#1976d2' }} />
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{notifications.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Notifications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e9', borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PersonAdd sx={{ fontSize: 40, color: '#388e3c' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {notifications.filter(n => n.type === 'referral_registration').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Referral Registrations</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0', borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircle sx={{ fontSize: 40, color: '#f57c00' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">{unreadCount}</Typography>
                  <Typography variant="body2" color="text.secondary">Unread Notifications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Filter */}
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="All" />
              <Tab label={`Unread (${unreadCount})`} />
              <Tab label="Referral Registrations" />
            </Tabs>
            <FormControl size="small" sx={{ minWidth: 150, my: 1 }}>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={typeFilter}
                label="Filter Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="referral_registration">Referral Registration</MenuItem>
                <MenuItem value="withdrawal_request">Withdrawal Request</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="kyc_submission">KYC Submission</MenuItem>
                <MenuItem value="system_alert">System Alert</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No notifications found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((notification) => (
                      <TableRow 
                        key={notification._id} 
                        hover
                        sx={{ 
                          bgcolor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleViewDetails(notification)}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getTypeIcon(notification.type)}
                            <Chip 
                              size="small" 
                              label={getTypeLabel(notification.type)}
                              variant={notification.isRead ? 'outlined' : 'filled'}
                              color="primary"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            fontWeight={notification.isRead ? 400 : 600}
                          >
                            {notification.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              maxWidth: 300, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {notification.message}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {getPriorityChip(notification.priority)}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); handleViewDetails(notification); }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {!notification.isRead && (
                              <Tooltip title="Mark as Read">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id); }}
                                >
                                  <MarkEmailRead fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }}
                              >
                                <Delete fontSize="small" />
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
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedNotification && getTypeIcon(selectedNotification.type)}
            {selectedNotification?.title}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedNotification && (
            <Box>
              <Typography variant="body1" gutterBottom>
                {selectedNotification.message}
              </Typography>
              
              {selectedNotification.data && (
                <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={2}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Details
                  </Typography>
                  {selectedNotification.data.referrerName && (
                    <Typography variant="body2">
                      <strong>Referrer:</strong> {selectedNotification.data.referrerName}
                    </Typography>
                  )}
                  {selectedNotification.data.referrerEmail && (
                    <Typography variant="body2">
                      <strong>Referrer Email:</strong> {selectedNotification.data.referrerEmail}
                    </Typography>
                  )}
                  {selectedNotification.data.referralCode && (
                    <Typography variant="body2">
                      <strong>Referral Code:</strong> {selectedNotification.data.referralCode}
                    </Typography>
                  )}
                  {selectedNotification.data.newUserName && (
                    <Typography variant="body2">
                      <strong>New User:</strong> {selectedNotification.data.newUserName}
                    </Typography>
                  )}
                  {selectedNotification.data.newUserEmail && (
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedNotification.data.newUserEmail}
                    </Typography>
                  )}
                  {selectedNotification.data.investmentAmount && (
                    <Typography variant="body2">
                      <strong>Investment Amount:</strong> ${selectedNotification.data.investmentAmount.toFixed(2)}
                    </Typography>
                  )}
                  {selectedNotification.data.bonusAmount && (
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold', mt: 1 }}>
                      <strong>Bonus Amount (10%):</strong> ${selectedNotification.data.bonusAmount.toFixed(2)}
                    </Typography>
                  )}
                </Box>
              )}
              
              {/* Show Pending Approval Alert for bonus notifications */}
              {selectedNotification.type === 'referral_bonus_pending' && selectedNotification.data?.bonusAmount && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    This referral bonus of <strong>${selectedNotification.data.bonusAmount.toFixed(2)}</strong> is pending your approval.
                    Go to Referral Bonuses page to approve or reject.
                  </Typography>
                </Alert>
              )}
              
              <Box mt={3}>
                <Typography variant="caption" color="text.secondary">
                  Received: {new Date(selectedNotification.createdAt).toLocaleString()}
                </Typography>
                {selectedNotification.isRead && selectedNotification.readAt && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Read: {new Date(selectedNotification.readAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedNotification && selectedNotification.type === 'referral_bonus_pending' && (
            <Button 
              variant="contained" 
              color="success"
              startIcon={<MonetizationOn />}
              onClick={() => { 
                setDetailDialogOpen(false); 
                navigate('/admin/referral-bonuses'); 
              }}
            >
              Go to Referral Bonuses
            </Button>
          )}
          {selectedNotification && !selectedNotification.isRead && (
            <Button 
              variant="contained" 
              onClick={() => { handleMarkAsRead(selectedNotification._id); setDetailDialogOpen(false); }}
            >
              Mark as Read
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotifications;
