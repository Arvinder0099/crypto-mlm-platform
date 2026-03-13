import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper, Link, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import axios from 'axios';

const ChangePassword = () => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  
  // Forgot Password State
  const [forgotDialog, setForgotDialog] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
  const [forgotData, setForgotData] = useState({ phone: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (form.next !== form.confirm) {
      setSnack({ open: true, message: 'New password and confirmation do not match', severity: 'error' });
      return;
    }
    if (form.next.length < 6) {
      setSnack({ open: true, message: 'Password must be at least 6 characters', severity: 'error' });
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('/api/user/change-password', {
        oldPassword: form.current,
        newPassword: form.next,
        confirmPassword: form.confirm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnack({ open: true, message: response.data.message || 'Password changed successfully', severity: 'success' });
      setForm({ current: '', next: '', confirm: '' });
    } catch (error) {
      setSnack({ open: true, message: error.response?.data?.message || 'Failed to change password', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Forgot Password - Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!forgotData.phone) {
      setSnack({ open: true, message: 'Please enter your phone number', severity: 'error' });
      return;
    }
    
    setForgotLoading(true);
    try {
      const response = await axios.post('/api/auth/forgot-password/send-otp', {
        phone: forgotData.phone
      });
      
      setSnack({ open: true, message: response.data?.emailFallback 
        ? 'SMS limited in your region. OTP sent to your registered email instead!' 
        : 'OTP sent to your phone number', severity: 'success' });
      setForgotStep(2);
      
      // OTP sent successfully
      if (response.data) {
      }
    } catch (error) {
      setSnack({ open: true, message: error.response?.data?.message || 'Failed to send OTP', severity: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!forgotData.otp) {
      setSnack({ open: true, message: 'Please enter the OTP', severity: 'error' });
      return;
    }
    
    setForgotLoading(true);
    try {
      const response = await axios.post('/api/auth/forgot-password/verify-otp', {
        phone: forgotData.phone,
        otp: forgotData.otp
      });
      
      setForgotData(prev => ({ ...prev, resetToken: response.data.resetToken }));
      setSnack({ open: true, message: 'OTP verified successfully', severity: 'success' });
      setForgotStep(3);
    } catch (error) {
      setSnack({ open: true, message: error.response?.data?.message || 'Invalid OTP', severity: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password - Step 3: Reset Password
  const handleResetPassword = async () => {
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setSnack({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    if (forgotData.newPassword.length < 6) {
      setSnack({ open: true, message: 'Password must be at least 6 characters', severity: 'error' });
      return;
    }
    
    setForgotLoading(true);
    try {
      await axios.post('/api/auth/forgot-password/reset', {
        resetToken: forgotData.resetToken,
        newPassword: forgotData.newPassword,
        confirmPassword: forgotData.confirmPassword
      });
      
      setSnack({ open: true, message: 'Password reset successful! Please login with your new password.', severity: 'success' });
      setForgotDialog(false);
      setForgotStep(1);
      setForgotData({ phone: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
      
      // Logout user and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      setSnack({ open: true, message: error.response?.data?.message || 'Failed to reset password', severity: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotDialog = () => {
    setForgotStep(1);
    setForgotData({ phone: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
    setForgotDialog(true);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e3a5f' }}>Change Password</Typography>
      <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Current Password" 
              name="current" 
              type="password" 
              value={form.current} 
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#10b981' },
                  '&:hover fieldset': { borderColor: '#059669' },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="New Password" 
              name="next" 
              type="password" 
              value={form.next} 
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#10b981' },
                  '&:hover fieldset': { borderColor: '#059669' },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Confirm Password" 
              name="confirm" 
              type="password" 
              value={form.confirm} 
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#10b981' },
                  '&:hover fieldset': { borderColor: '#059669' },
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleSave} 
                disabled={saving}
                sx={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
              <Link 
                component="button"
                variant="body2"
                onClick={openForgotDialog}
                sx={{ 
                  color: '#10b981', 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Forgot Password?
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotDialog} onClose={() => setForgotDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#1e3a5f' }}>
          Forgot Password
          {forgotStep > 1 && (
            <Typography variant="caption" sx={{ ml: 2, color: '#10b981' }}>
              Step {forgotStep} of 3
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Step 1: Enter Phone */}
            {forgotStep === 1 && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter your registered phone number with country code.
                </Typography>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={forgotData.phone}
                  onChange={handleForgotChange}
                  placeholder="+1234567890"
                  sx={{ mb: 2 }}
                />
              </>
            )}
            
            {/* Step 2: Enter OTP */}
            {forgotStep === 2 && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter the 6-digit OTP sent to your phone.
                </Typography>
                <TextField
                  fullWidth
                  label="OTP"
                  name="otp"
                  value={forgotData.otp}
                  onChange={handleForgotChange}
                  placeholder="Enter 6-digit OTP"
                  inputProps={{ maxLength: 6 }}
                  sx={{ mb: 2 }}
                />
              </>
            )}
            
            {/* Step 3: New Password */}
            {forgotStep === 3 && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter your new password.
                </Typography>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={forgotData.newPassword}
                  onChange={handleForgotChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={forgotData.confirmPassword}
                  onChange={handleForgotChange}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setForgotDialog(false)} disabled={forgotLoading}>
            Cancel
          </Button>
          {forgotStep === 1 && (
            <Button 
              variant="contained" 
              onClick={handleSendOTP}
              disabled={forgotLoading}
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          )}
          {forgotStep === 2 && (
            <Button 
              variant="contained" 
              onClick={handleVerifyOTP}
              disabled={forgotLoading}
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>
          )}
          {forgotStep === 3 && (
            <Button 
              variant="contained" 
              onClick={handleResetPassword}
              disabled={forgotLoading}
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snack.open} 
        autoHideDuration={5000} 
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ChangePassword;