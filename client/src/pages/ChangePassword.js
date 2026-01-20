import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper } from '@mui/material';

const ChangePassword = () => {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (form.next !== form.confirm) {
      setSnack({ open: true, message: 'New password and confirmation do not match', severity: 'error' });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSnack({ open: true, message: 'Password changed successfully', severity: 'success' });
    }, 800);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Change Password</Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Current Password" name="current" type="password" value={form.current} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="New Password" name="next" type="password" value={form.next} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>Update Password</Button>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ChangePassword;