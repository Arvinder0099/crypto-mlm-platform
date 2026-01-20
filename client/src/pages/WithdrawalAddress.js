import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper } from '@mui/material';

const WithdrawalAddress = () => {
  const [form, setForm] = useState({
    bitcoin: '',
    ethereum: '',
    usdt: '',
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
      setSnack({ open: true, message: 'Withdrawal addresses saved', severity: 'success' });
    }, 800);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Withdrawal Address</Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Bitcoin Address" name="bitcoin" value={form.bitcoin} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Ethereum Address" name="ethereum" value={form.ethereum} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="USDT Address" name="usdt" value={form.usdt} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSave} disabled={saving}>Save</Button>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default WithdrawalAddress;