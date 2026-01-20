import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Snackbar, Alert, Paper } from '@mui/material';
import OtpDialog from '../components/OtpDialog';

const Deposit = () => {
  const [form, setForm] = useState({
    paymentAddress: '0xABCDEF1234567890',
    amount: '',
    transactionNumber: '',
    otp: '',
    slip: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'slip') {
      setForm(prev => ({ ...prev, slip: files?.[0] || null }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOtpVerified = (otpValue) => {
    setForm(prev => ({ ...prev, otp: otpValue }));
    setSnack({ open: true, message: 'OTP verified', severity: 'success' });
  };

  const handleSubmit = () => {
    if (!form.amount || !form.transactionNumber || !form.otp) {
      setSnack({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSnack({ open: true, message: 'Deposit submitted successfully', severity: 'success' });
    }, 1000);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Fund Wallet Deposit</Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Deposit by Payment Address" name="paymentAddress" value={form.paymentAddress} InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Deposit Amount" name="amount" value={form.amount} onChange={handleChange} type="number" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Transaction Number" name="transactionNumber" value={form.transactionNumber} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="One Time Password"
              name="otp"
              value={form.otp}
              InputProps={{ readOnly: true }}
              helperText={form.otp ? 'OTP verified' : 'Click Send OTP to receive code'}
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
          <Grid item xs={12} md={6}>
            <Button variant="outlined" component="label">
              Upload Payment Slip
              <input hidden type="file" name="slip" accept="image/*,.pdf" onChange={handleChange} />
            </Button>
            {form.slip && (
              <Typography variant="body2" sx={{ mt: 1 }}>Selected: {form.slip.name}</Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting}>Submit Deposit</Button>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
      <OtpDialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        onVerified={(otp) => handleOtpVerified(otp)}
        title="Deposit OTP Verification"
      />
    </Box>
  );
};

export default Deposit;