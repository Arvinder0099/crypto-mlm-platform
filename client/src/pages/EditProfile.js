import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper, CircularProgress } from '@mui/material';
import { fetchJSON } from '../utils/api';

const EditProfile = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await fetchJSON('/api/user/profile');
      if (data && data.user) {
        setForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          phone: data.user.phone || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setSnack({ open: true, message: 'Failed to load profile data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSnack({ open: true, message: 'Profile updated successfully', severity: 'success' });
        // Update local user data if needed
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data.user }));
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      setSnack({ open: true, message: error.message || 'Error updating profile', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
        Edit Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update your personal information and contact details
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="First Name" 
              name="firstName" 
              value={form.firstName} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Last Name" 
              name="lastName" 
              value={form.lastName} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Email" 
              name="email" 
              value={form.email} 
              InputProps={{ readOnly: true }}
              helperText="Email cannot be changed"
              disabled
              sx={{ bgcolor: '#f5f5f5' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Phone Number" 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleSave} 
                disabled={saving}
                sx={{ px: 4 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar 
        open={snack.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProfile;