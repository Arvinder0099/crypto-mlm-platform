import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { fetchJSON } from '../utils/api';

const OtpDialog = ({ open, onClose, onVerified, title = 'Verify One Time Password', email = null }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState({ sending: false, verifying: false, sent: false, message: '', severity: 'info' });

  useEffect(() => {
    if (!open) {
      setPhone('');
      setCountryCode('+91');
      setOtp('');
      setStatus({ sending: false, verifying: false, sent: false, message: '', severity: 'info' });
    }
  }, [open]);

  const handleSend = async () => {
    if (!phone) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Enter your phone number to send OTP', severity: 'warning' });
      return;
    }
    
    setStatus({ sending: true, verifying: false, sent: false, message: '', severity: 'info' });
    try {
      const resp = await fetchJSON('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || 'temp@example.com' })
      });
      
      if (resp?.success) {
        setStatus({ sending: false, verifying: false, sent: true, message: `OTP sent to ${countryCode} ${phone}`, severity: 'success' });
      } else {
        setStatus({ sending: false, verifying: false, sent: false, message: resp?.message || 'Failed to send OTP', severity: 'error' });
      }
    } catch (error) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Error sending OTP: ' + (error?.message || 'Network error'), severity: 'error' });
    }
  };

  const handleVerify = async () => {
    if (!otp) {
      setStatus((prev) => ({ ...prev, message: 'Enter the OTP to verify', severity: 'warning' }));
      return;
    }
    
    setStatus((prev) => ({ ...prev, verifying: true, message: '' }));
    try {
      const resp = await fetchJSON('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || 'temp@example.com', code: otp })
      });
      
      if (resp?.success) {
        setStatus({ sending: false, verifying: false, sent: true, message: 'OTP verified successfully', severity: 'success' });
        onVerified?.(otp, `${countryCode} ${phone}`);
        onClose?.();
      } else {
        setStatus({ sending: false, verifying: false, sent: true, message: resp?.message || 'Verification failed', severity: 'error' });
      }
    } catch (error) {
      setStatus({ sending: false, verifying: false, sent: true, message: 'Error verifying OTP: ' + (error?.message || 'Network error'), severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1}>
            <FormControl sx={{ minWidth: 110 }}>
              <InputLabel id="otp-country-code-label">Code</InputLabel>
              <Select
                labelId="otp-country-code-label"
                label="Code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <MenuItem value="+91">+91 (India)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Phone Number"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
            />
          </Stack>
          <TextField
            label="One Time Password"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
          />
          {status.message && (
            <Alert severity={status.severity}>{status.message}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSend} disabled={status.sending} variant="outlined">
          {status.sending ? 'Sending...' : 'Send OTP'}
        </Button>
        <Button onClick={handleVerify} disabled={status.verifying || !otp || !status.sent} variant="contained">
          {status.verifying ? 'Verifying...' : 'Verify'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpDialog;
