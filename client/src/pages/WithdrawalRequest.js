import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Snackbar, Alert } from '@mui/material';
import OtpDialog from '../components/OtpDialog';

const WithdrawalRequest = () => {
  const [form, setForm] = useState({ amount: '', walletAddress: '', otp: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleOtpVerified = (otpValue) => {
    setForm((prev) => ({ ...prev, otp: otpValue }));
    setSnack({ open: true, message: 'OTP verified', severity: 'success' });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setSnack({ open: true, message: 'Withdrawal request submitted', severity: 'success' });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Withdraw Request</Typography>
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Amount ($)" name="amount" value={form.amount} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Wallet Address" name="walletAddress" value={form.walletAddress} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="One Time Password"
                name="otp"
                value={form.otp}
                InputProps={{ readOnly: true }}
                helperText={form.otp ? 'OTP verified' : 'Send OTP to verify withdrawal'}
                required
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button size="small" variant="outlined" onClick={() => setOtpDialogOpen(true)}>
                  Send OTP
                </Button>
                {form.otp && (
                  <Typography variant="caption" color="success.main">Verified</Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained">Submit Request</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
      <OtpDialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        onVerified={(otp) => handleOtpVerified(otp)}
        title="Withdrawal OTP Verification"
      />
    </Box>
  );
};

export default WithdrawalRequest;