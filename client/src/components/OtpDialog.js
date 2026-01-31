import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert, FormControl, InputLabel, Select, MenuItem, Autocomplete, Box, Typography } from '@mui/material';

// Comprehensive list of country codes
const countryCodes = [
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
];

const OtpDialog = ({ open, onClose, onVerified, title = 'Verify One Time Password', email = null }) => {
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes.find(c => c.code === '+91'));
  const [otp, setOtp] = useState('');
  const [otpMethod, setOtpMethod] = useState('phone'); // 'phone' or 'email'
  const [userEmail, setUserEmail] = useState(email || '');
  const [status, setStatus] = useState({ sending: false, verifying: false, sent: false, message: '', severity: 'info' });

  useEffect(() => {
    if (!open) {
      setPhone('');
      setOtp('');
      setStatus({ sending: false, verifying: false, sent: false, message: '', severity: 'info' });
    }
    if (email) {
      setUserEmail(email);
    }
  }, [open, email]);

  const handleSendPhoneOtp = async () => {
    if (!phone) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Enter your phone number', severity: 'warning' });
      return;
    }
    
    setStatus({ sending: true, verifying: false, sent: false, message: '', severity: 'info' });
    try {
      const token = localStorage.getItem('authToken');
      const fullPhone = `${selectedCountry.code}${phone.replace(/^0+/, '')}`;
      
      const resp = await fetch('/api/otp/send-phone', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          phone: phone.replace(/^0+/, ''),
          countryCode: selectedCountry.code
        })
      });
      
      const data = await resp.json();
      
      if (data?.success) {
        setStatus({ sending: false, verifying: false, sent: true, message: `OTP sent to ${fullPhone}`, severity: 'success' });
      } else {
        setStatus({ sending: false, verifying: false, sent: false, message: data?.message || 'Failed to send OTP', severity: 'error' });
      }
    } catch (error) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Error sending OTP', severity: 'error' });
    }
  };

  const handleSendEmailOtp = async () => {
    if (!userEmail) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Enter your email address', severity: 'warning' });
      return;
    }
    
    setStatus({ sending: true, verifying: false, sent: false, message: '', severity: 'info' });
    try {
      const token = localStorage.getItem('authToken');
      
      const resp = await fetch('/api/otp/send-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      const data = await resp.json();
      
      if (data?.success) {
        setStatus({ sending: false, verifying: false, sent: true, message: `OTP sent to ${userEmail}`, severity: 'success' });
      } else {
        setStatus({ sending: false, verifying: false, sent: false, message: data?.message || 'Failed to send OTP', severity: 'error' });
      }
    } catch (error) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Error sending OTP', severity: 'error' });
    }
  };

  const handleVerify = async () => {
    if (!otp) {
      setStatus((prev) => ({ ...prev, message: 'Enter the OTP to verify', severity: 'warning' }));
      return;
    }
    
    setStatus((prev) => ({ ...prev, verifying: true, message: '' }));
    try {
      const token = localStorage.getItem('authToken');
      const target = otpMethod === 'phone' ? `${selectedCountry.code}${phone.replace(/^0+/, '')}` : userEmail;
      
      const resp = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          target,
          otp,
          type: otpMethod
        })
      });
      
      const data = await resp.json();
      
      if (data?.success) {
        setStatus({ sending: false, verifying: false, sent: true, message: 'OTP verified successfully', severity: 'success' });
        onVerified?.(otp, target);
        setTimeout(() => onClose?.(), 500);
      } else {
        setStatus({ sending: false, verifying: false, sent: true, message: data?.message || 'Verification failed', severity: 'error' });
      }
    } catch (error) {
      setStatus({ sending: false, verifying: false, sent: true, message: 'Error verifying OTP', severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* OTP Method Selection */}
          <FormControl fullWidth>
            <InputLabel>Send OTP via</InputLabel>
            <Select
              value={otpMethod}
              label="Send OTP via"
              onChange={(e) => {
                setOtpMethod(e.target.value);
                setStatus({ sending: false, verifying: false, sent: false, message: '', severity: 'info' });
              }}
            >
              <MenuItem value="phone">📱 Phone SMS</MenuItem>
              <MenuItem value="email">📧 Email</MenuItem>
            </Select>
          </FormControl>

          {otpMethod === 'phone' ? (
            <Stack direction="row" spacing={1}>
              <Autocomplete
                sx={{ minWidth: 180 }}
                options={countryCodes}
                value={selectedCountry}
                onChange={(e, newValue) => setSelectedCountry(newValue || countryCodes[2])}
                getOptionLabel={(option) => `${option.flag} ${option.code} ${option.country}`}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Typography sx={{ mr: 1 }}>{option.flag}</Typography>
                    <Typography sx={{ fontWeight: 600, mr: 1 }}>{option.code}</Typography>
                    <Typography variant="body2" color="text.secondary">{option.country}</Typography>
                  </Box>
                )}
                renderInput={(params) => <TextField {...params} label="Country" />}
                disableClearable
              />
              <TextField
                label="Phone Number"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                fullWidth
              />
            </Stack>
          ) : (
            <TextField
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              fullWidth
            />
          )}

          <TextField
            label="One Time Password"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            fullWidth
            inputProps={{ maxLength: 6 }}
          />
          
          {status.message && (
            <Alert severity={status.severity}>{status.message}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={otpMethod === 'phone' ? handleSendPhoneOtp : handleSendEmailOtp} 
          disabled={status.sending} 
          variant="outlined"
        >
          {status.sending ? 'Sending...' : 'Send OTP'}
        </Button>
        <Button 
          onClick={handleVerify} 
          disabled={status.verifying || !otp || !status.sent} 
          variant="contained"
        >
          {status.verifying ? 'Verifying...' : 'Verify'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpDialog;
