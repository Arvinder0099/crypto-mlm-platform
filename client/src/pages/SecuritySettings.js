import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Security,
  VpnKey,
  PhoneAndroid,
  History,
  Shield,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useSecurity } from '../components/SecurityProvider';

const SecuritySettings = () => {
  const { user, twoFactorEnabled, enableTwoFactor, disableTwoFactor, validatePasswordStrength, auditLogs } = useSecurity();
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

  const passwordStrength = validatePasswordStrength(newPassword);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: 'info', message: '' }), 5000);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showAlert('error', 'Passwords do not match');
      return;
    }

    if (!passwordStrength.isValid) {
      showAlert('error', 'Password does not meet security requirements');
      return;
    }

    // Simulate password change
    showAlert('success', 'Password changed successfully');
    setShowPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEnable2FA = async () => {
    const result = await enableTwoFactor();
    if (result.success) {
      setQrCode(result.qrCode);
      setBackupCodes(result.backupCodes);
      setShow2FADialog(true);
      showAlert('success', '2FA enabled successfully');
    } else {
      showAlert('error', result.message);
    }
  };

  const handleDisable2FA = async () => {
    const result = await disableTwoFactor(currentPassword);
    if (result.success) {
      setShowDisable2FADialog(false);
      setCurrentPassword('');
      showAlert('success', '2FA disabled successfully');
    } else {
      showAlert('error', result.message);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return 'error';
    if (score <= 3) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Medium';
    return 'Strong';
  };

  const recentActivities = auditLogs.slice(-10).reverse();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Security Settings
      </Typography>

      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Two-Factor Authentication */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PhoneAndroid color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Two-Factor Authentication</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add an extra layer of security to your account with 2FA.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={twoFactorEnabled}
                    onChange={twoFactorEnabled ? () => setShowDisable2FADialog(true) : handleEnable2FA}
                  />
                }
                label={twoFactorEnabled ? "Enabled" : "Disabled"}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Password Security */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <VpnKey color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Password Security</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Keep your account secure with a strong password.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => setShowPasswordDialog(true)}
              >
                Change Password
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Security Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Shield color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Security Overview</Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Lock fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Password"
                    secondary="Last changed 30 days ago"
                  />
                  <Chip label="Strong" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneAndroid fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary={twoFactorEnabled ? "Active" : "Inactive"}
                  />
                  <Chip
                    label={twoFactorEnabled ? "On" : "Off"}
                    color={twoFactorEnabled ? "success" : "error"}
                    size="small"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Status"
                    secondary="Verified and secure"
                  />
                  <Chip label="Verified" color="success" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <History color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Recent Activity</Typography>
              </Box>
              <List dense>
                {recentActivities.map((activity, index) => (
                  <ListItem key={activity.id}>
                    <ListItemText
                      primary={activity.action.replace(/_/g, ' ')}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type={showPasswords.current ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <Button onClick={() => togglePasswordVisibility('current')}>
                  {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                </Button>
              ),
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={showPasswords.new ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <Button onClick={() => togglePasswordVisibility('new')}>
                  {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                </Button>
              ),
            }}
          />
          {newPassword && (
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                Password Strength: {getPasswordStrengthText(passwordStrength.score)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(passwordStrength.score / 5) * 100}
                color={getPasswordStrengthColor(passwordStrength.score)}
                sx={{ mt: 0.5 }}
              />
            </Box>
          )}
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPasswords.confirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            error={confirmPassword && newPassword !== confirmPassword}
            helperText={confirmPassword && newPassword !== confirmPassword ? "Passwords do not match" : ""}
            InputProps={{
              endAdornment: (
                <Button onClick={() => togglePasswordVisibility('confirm')}>
                  {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                </Button>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onClose={() => setShow2FADialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Two-Factor Authentication Setup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Scan this QR code with your authenticator app:
          </Typography>
          {qrCode && (
            <Box display="flex" justifyContent="center" mb={2}>
              <img src={qrCode} alt="2FA QR Code" style={{ maxWidth: '200px' }} />
            </Box>
          )}
          <Typography variant="body2" paragraph>
            Backup codes (save these in a secure location):
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
            {backupCodes.map((code, index) => (
              <Typography key={index} variant="body2" fontFamily="monospace">
                {code}
              </Typography>
            ))}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow2FADialog(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onClose={() => setShowDisable2FADialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Enter your password to disable 2FA:
          </Typography>
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisable2FADialog(false)}>Cancel</Button>
          <Button onClick={handleDisable2FA} variant="contained" color="error">
            Disable 2FA
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SecuritySettings;