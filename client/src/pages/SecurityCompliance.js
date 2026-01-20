import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
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
  LinearProgress,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Security,
  Shield,
  CheckCircle,
  Warning,
  VpnKey,
  Assessment,
  Download,
  Refresh,
  Search,
  FilterList,
  NotificationsActive,
  VerifiedUser,
  Block,
  History,
  Fingerprint,
  NetworkCheck,
  Error,
  Info,
  Visibility,
  Person,
  CameraAlt,
  Analytics,
  AdminPanelSettings,
  Verified,
  ReportProblem,
  Timeline,
  Memory,
  VpnLock,
  Backup,
  CloudSync,
  Storage,
  SystemUpdate,
  Policy,
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`security-tabpanel-${index}`}
      aria-labelledby={`security-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SecurityCompliance = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    emailNotifications: true,
    smsAlerts: false,
    loginAlerts: true,
    ipWhitelist: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [securityMetrics, setSecurityMetrics] = useState({
    totalUsers: 15420,
    verifiedUsers: 14890,
    pendingKYC: 530,
    suspiciousActivities: 12,
    blockedIPs: 45,
    activeSecurityAlerts: 3,
    complianceScore: 94,
    lastSecurityScan: '2024-01-15 10:30:00',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    // Simulate API calls
    setTimeout(() => {
      setAuditLogs([
        { id: 1, timestamp: '2024-01-15 14:30:00', user: 'admin@crypto-mlm.com', action: 'LOGIN_SUCCESS', ip: '192.168.1.100', severity: 'info' },
        { id: 2, timestamp: '2024-01-15 14:25:00', user: 'user123@email.com', action: 'FAILED_LOGIN_ATTEMPT', ip: '203.45.67.89', severity: 'warning' },
        { id: 3, timestamp: '2024-01-15 14:20:00', user: 'system', action: 'SECURITY_SCAN_COMPLETED', ip: 'localhost', severity: 'info' },
        { id: 4, timestamp: '2024-01-15 14:15:00', user: 'admin@crypto-mlm.com', action: 'USER_ACCOUNT_SUSPENDED', ip: '192.168.1.100', severity: 'error' },
        { id: 5, timestamp: '2024-01-15 14:10:00', user: 'compliance@crypto-mlm.com', action: 'KYC_DOCUMENT_APPROVED', ip: '192.168.1.101', severity: 'success' },
      ]);
      
      setComplianceReports([
        { id: 1, type: 'AML Report', date: '2024-01-15', status: 'Completed', score: 98, issues: 0 },
        { id: 2, type: 'KYC Compliance', date: '2024-01-14', status: 'Completed', score: 96, issues: 2 },
        { id: 3, type: 'Data Protection', date: '2024-01-13', status: 'In Progress', score: 92, issues: 1 },
        { id: 4, type: 'Financial Audit', date: '2024-01-12', status: 'Completed', score: 94, issues: 3 },
        { id: 5, type: 'Security Assessment', date: '2024-01-11', status: 'Completed', score: 97, issues: 1 },
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (setting) => (event) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      case 'success': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const getComplianceScoreColor = (score) => {
    if (score >= 95) return 'success';
    if (score >= 85) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Security & Compliance Center
      </Typography>

      {/* Security Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {securityMetrics.complianceScore}%
                  </Typography>
                  <Typography variant="body2">
                    Compliance Score
                  </Typography>
                </Box>
                <Shield sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {securityMetrics.activeSecurityAlerts}
                  </Typography>
                  <Typography variant="body2">
                    Active Alerts
                  </Typography>
                </Box>
                <NotificationsActive sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {securityMetrics.verifiedUsers.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Verified Users
                  </Typography>
                </Box>
                <VerifiedUser sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {securityMetrics.blockedIPs}
                  </Typography>
                  <Typography variant="body2">
                    Blocked IPs
                  </Typography>
                </Box>
                <Block sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Security Settings" icon={<Security />} />
          <Tab label="Audit Logs" icon={<History />} />
          <Tab label="Compliance Reports" icon={<Assessment />} />
          {/* KYC Management removed (KYC disabled) */}
          <Tab label="Risk Assessment" icon={<Warning />} />
          <Tab label="System Monitoring" icon={<NetworkCheck />} />
        </Tabs>

        {/* Security Settings Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <VpnKey sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Authentication Settings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Two-Factor Authentication" secondary="Require 2FA for all users" />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.twoFactorAuth}
                            onChange={handleSettingChange('twoFactorAuth')}
                          />
                        }
                        label=""
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Login Alerts" secondary="Send alerts for new login attempts" />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.loginAlerts}
                            onChange={handleSettingChange('loginAlerts')}
                          />
                        }
                        label=""
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="IP Whitelist" secondary="Restrict access to approved IPs only" />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.ipWhitelist}
                            onChange={handleSettingChange('ipWhitelist')}
                          />
                        }
                        label=""
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <NotificationsActive sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Notification Settings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Email Notifications" secondary="Security alerts via email" />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.emailNotifications}
                            onChange={handleSettingChange('emailNotifications')}
                          />
                        }
                        label=""
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="SMS Alerts" secondary="Critical alerts via SMS" />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.smsAlerts}
                            onChange={handleSettingChange('smsAlerts')}
                          />
                        }
                        label=""
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Policy sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Security Policies
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Session Timeout (minutes)"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({
                          ...prev,
                          sessionTimeout: parseInt(e.target.value)
                        }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Password Expiry (days)"
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => setSecuritySettings(prev => ({
                          ...prev,
                          passwordExpiry: parseInt(e.target.value)
                        }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Max Login Attempts"
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => setSecuritySettings(prev => ({
                          ...prev,
                          maxLoginAttempts: parseInt(e.target.value)
                        }))}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Audit Logs Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search audit logs..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />
              }}
            />
            <Button variant="outlined" startIcon={<FilterList />}>
              Filter
            </Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchSecurityData}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Export
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Severity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(log.severity)}
                        label={log.severity.toUpperCase()}
                        color={getSeverityColor(log.severity)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Compliance Reports Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Compliance Dashboard
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Report Type</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Compliance Score</TableCell>
                          <TableCell>Issues Found</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {complianceReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>{report.type}</TableCell>
                            <TableCell>{report.date}</TableCell>
                            <TableCell>
                              <Chip
                                label={report.status}
                                color={report.status === 'Completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <LinearProgress
                                  variant="determinate"
                                  value={report.score}
                                  color={getComplianceScoreColor(report.score)}
                                  sx={{ width: 100, mr: 1 }}
                                />
                                <Typography variant="body2">{report.score}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={report.issues}
                                color={report.issues === 0 ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                              <IconButton size="small">
                                <Download />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* KYC Management Tab removed (KYC disabled) */}

        {/* Risk Assessment Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ReportProblem sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Risk Indicators
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Suspicious Activities"
                        secondary={`${securityMetrics.suspiciousActivities} detected in last 24h`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Block color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Blocked IPs"
                        secondary={`${securityMetrics.blockedIPs} IPs currently blocked`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Security Score"
                        secondary={`${securityMetrics.complianceScore}% - Excellent`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Risk Mitigation Actions
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Automated IP Blocking"
                        secondary="Block suspicious IPs automatically"
                      />
                      <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Transaction Monitoring"
                        secondary="Monitor large transactions"
                      />
                      <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Behavioral Analysis"
                        secondary="AI-powered user behavior analysis"
                      />
                      <Switch defaultChecked />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Monitoring Tab */}
        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Memory sx={{ mr: 1, verticalAlign: 'middle' }} />
                    System Performance
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">CPU Usage</Typography>
                      <LinearProgress variant="determinate" value={45} color="success" />
                      <Typography variant="caption">45%</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">Memory Usage</Typography>
                      <LinearProgress variant="determinate" value={67} color="warning" />
                      <Typography variant="caption">67%</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">Disk Usage</Typography>
                      <LinearProgress variant="determinate" value={23} color="success" />
                      <Typography variant="caption">23%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <NetworkCheck sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Network Security
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <VpnLock color="success" />
                      </ListItemIcon>
                      <ListItemText primary="SSL Certificate" secondary="Valid until 2025-12-31" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Shield color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Firewall Status" secondary="Active and monitoring" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Security color="success" />
                      </ListItemIcon>
                      <ListItemText primary="DDoS Protection" secondary="CloudFlare enabled" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Backup sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Data Protection
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CloudSync color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Last Backup" secondary="2 hours ago" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Storage color="success" />
                      </ListItemIcon>
                      <ListItemText primary="Backup Size" secondary="2.4 GB" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SystemUpdate color="info" />
                      </ListItemIcon>
                      <ListItemText primary="System Updates" secondary="Up to date" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SecurityCompliance;
