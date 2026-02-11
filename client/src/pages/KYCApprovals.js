import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Tab,
  Tabs,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Person,
  Fingerprint,
  CheckCircle,
  Cancel,
  Pending,
  Visibility,
  Download,
  Upload,
  Search,
  FilterList,
  Refresh,
  Warning,
  Info,
  Error,
  VerifiedUser,
  CameraAlt,
  Description,
  Schedule,
  Assessment,
  TrendingUp,
  Group,
  PersonAdd,
  Block,
  ExpandMore,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kyc-tabpanel-${index}`}
      aria-labelledby={`kyc-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const KYCApprovals = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [kycRequests, setKycRequests] = useState([]);
  const [kycStats, setKycStats] = useState({
    totalSubmissions: 1247,
    pendingReview: 89,
    approved: 1098,
    rejected: 60,
    averageProcessingTime: '2.3 days',
    approvalRate: '94.8%'
  });

  // Load KYC requests from backend (fallback to mock on error)
useEffect(() => {
  async function loadKyc() {
    try {
      const res = await fetchWithAuth('/api/admin/kyc/pending');
      const users = res?.data?.users || [];
      const mapped = users.map(u => ({
        id: u._id,
        _id: u._id,
        userId: u._id,
        userName: u.fullName || u.username || u.email,
        email: u.email,
        phone: u.phone || '',
        submissionDate: u.createdAt || new Date().toISOString(),
        status: u.kycStatus === 'pending_approval' ? 'pending' : (u.kycStatus || 'under_review'),
        documentType: 'aadhaar_pan',
        documentNumber: u.aadhaarNumber || u.panNumber || '',
        country: u.country || '-',
        riskLevel: 'low',
        documents: [],
        notes: '',
        lastUpdate: u.updatedAt || u.createdAt || new Date().toISOString(),
      }));
      setKycRequests(mapped);
    } catch (err) {
      console.warn('Failed to load KYC from backend', err);
      // No mock data - show empty state
      setKycRequests([]);
    }
  }
  loadKyc();
}, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleApprove = async (userId) => {
    try {
      await fetchWithAuth(`/api/users/${userId}/approve-kyc`, { method: 'PATCH' });
      setKycRequests(prev => prev.map(req => 
        ((req._id || req.id || req.userId) === userId)
          ? { ...req, status: 'approved', approvedBy: 'Admin', approvalDate: new Date().toISOString() }
          : req
      ));
    } catch (err) {
      console.error('Approve KYC failed:', err);
      alert(`Failed to approve KYC: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleReject = async (userId, reason) => {
    try {
      await fetchWithAuth(`/api/users/${userId}/reject-kyc`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
      setKycRequests(prev => prev.map(req => 
        ((req._id || req.id || req.userId) === userId)
          ? { ...req, status: 'rejected', rejectedBy: 'Admin', rejectionReason: reason }
          : req
      ));
    } catch (err) {
      console.error('Reject KYC failed:', err);
      alert(`Failed to reject KYC: ${err?.message || 'Unknown error'}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'pending': return <Pending />;
      case 'under_review': return <Assessment />;
      default: return <Info />;
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const filteredRequests = kycRequests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.userId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        <Fingerprint sx={{ mr: 2, verticalAlign: 'middle' }} />
        KYC Approvals Management
      </Typography>

      {/* KYC Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {kycStats.totalSubmissions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Submissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {kycStats.pendingReview}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {kycStats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" gutterBottom>
                {kycStats.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main" gutterBottom>
                {kycStats.averageProcessingTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. Processing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                {kycStats.approvalRate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approval Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Requests" icon={<Group />} />
          <Tab label="Pending Review" icon={<Pending />} />
          <Tab label="Approved" icon={<CheckCircle />} />
          <Tab label="Rejected" icon={<Cancel />} />
        </Tabs>

        {/* Filters and Search */}
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KYC Requests Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {request.userName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{request.userName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.userId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.documentType.replace('_', ' ').toUpperCase()}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.submissionDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(request.submissionDate).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.riskLevel.toUpperCase()}
                        color={getRiskLevelColor(request.riskLevel)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{request.country}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(request)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprove(request._id || request.id || request.userId)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReject(request.userId, 'Manual rejection')}
                              >
                                <Cancel />
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
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              KYC Details - {selectedUser?.userName}
            </Typography>
            <Chip
              icon={getStatusIcon(selectedUser?.status)}
              label={selectedUser?.status?.replace('_', ' ').toUpperCase()}
              color={getStatusColor(selectedUser?.status)}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Personal Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Person /></ListItemIcon>
                        <ListItemText primary="Name" secondary={selectedUser.userName} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Email /></ListItemIcon>
                        <ListItemText primary="Email" secondary={selectedUser.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Phone /></ListItemIcon>
                        <ListItemText primary="Phone" secondary={selectedUser.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationOn /></ListItemIcon>
                        <ListItemText primary="Country" secondary={selectedUser.country} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarToday /></ListItemIcon>
                        <ListItemText 
                          primary="Submission Date" 
                          secondary={new Date(selectedUser.submissionDate).toLocaleString()} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Document Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Document Type" 
                          secondary={selectedUser.documentType.replace('_', ' ').toUpperCase()} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Document Number" secondary={selectedUser.documentNumber} />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Risk Level" 
                          secondary={
                            <Chip
                              label={selectedUser.riskLevel.toUpperCase()}
                              color={getRiskLevelColor(selectedUser.riskLevel)}
                              size="small"
                            />
                          } 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Upload sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Uploaded Documents
                    </Typography>
                    {selectedUser.documents.map((doc, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography sx={{ flexGrow: 1 }}>
                              {doc.type.replace('_', ' ').toUpperCase()}
                            </Typography>
                            <Chip
                              label={doc.status.toUpperCase()}
                              color={getStatusColor(doc.status)}
                              size="small"
                              sx={{ mr: 2 }}
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                              variant="outlined"
                              startIcon={<Visibility />}
                              size="small"
                            >
                              View Document
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Download />}
                              size="small"
                            >
                              Download
                            </Button>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              {selectedUser.notes && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="subtitle2">Notes:</Typography>
                    {selectedUser.notes}
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedUser?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => {
                  handleApprove(selectedUser.userId);
                  setDialogOpen(false);
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  handleReject(selectedUser.userId, 'Manual rejection');
                  setDialogOpen(false);
                }}
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KYCApprovals;