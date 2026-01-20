import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper } from '@mui/material';

const EditProfile = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSnack({ open: true, message: 'Profile updated successfully', severity: 'success' });
    }, 800);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Edit Profile</Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} multiline minRows={3} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>Save Changes</Button>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProfile;