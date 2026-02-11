import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert, FormControl, InputLabel, Select, MenuItem, Box, Typography, CircularProgress, Divider, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { Phone, Email, Lock, Send, CheckCircle, Close } from '@mui/icons-material';

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
  const [otpMethod, setOtpMethod] = useState('email'); // default to email (more reliable)
  const [userEmail, setUserEmail] = useState(email || '');
  const [status, setStatus] = useState({ sending: false, verifying: false, sent: false, message: '', severity: 'info' });
  const [timer, setTimer] = useState(0);
  const otpInputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Scroll to OTP input when it appears
  const scrollToOtpInput = useCallback(() => {
    setTimeout(() => {
      if (otpInputRef.current) {
        otpInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        otpInputRef.current.focus();
      }
    }, 300);
  }, []);

  // Auto-fetch user's phone/email from profile on open
  useEffect(() => {
    if (open) {
      const token = localStorage.getItem('authToken');
      if (token) {
        fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(data => {
            if (data?.user) {
              if (data.user.email && !email) setUserEmail(data.user.email);
              if (data.user.phone) {
                // Try to extract country code and phone number
                const p = data.user.phone;
                const matchedCountry = countryCodes.find(c => p.startsWith(c.code));
                if (matchedCountry) {
                  setSelectedCountry(matchedCountry);
                  setPhone(p.replace(matchedCountry.code, ''));
                } else {
                  setPhone(p.replace(/^\+\d{1,3}/, ''));
                }
              }
            }
          })
          .catch(() => {}); // Silently fail
      }
    }
  }, [open, email]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setOtp('');
      setStatus({ sending: false, verifying: false, sent: false, message: '', severity: 'info' });
      setTimer(0);
    }
    if (email) {
      setUserEmail(email);
    }
  }, [open, email]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendPhoneOtp = async () => {
    if (!phone) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Enter your phone number', severity: 'warning' });
      return;
    }
    
    setStatus({ sending: true, verifying: false, sent: false, message: 'Sending OTP...', severity: 'info' });
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
        setTimer(60);
        scrollToOtpInput();
      } else {
        setStatus({ sending: false, verifying: false, sent: false, message: data?.message || 'Failed to send OTP', severity: 'error' });
      }
    } catch (error) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Network error. Please try again.', severity: 'error' });
    }
  };

  const handleSendEmailOtp = async () => {
    if (!userEmail) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Enter your email address', severity: 'warning' });
      return;
    }
    
    setStatus({ sending: true, verifying: false, sent: false, message: 'Sending OTP...', severity: 'info' });
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
        setTimer(60);
        scrollToOtpInput();
      } else {
        setStatus({ sending: false, verifying: false, sent: false, message: data?.message || 'Failed to send OTP', severity: 'error' });
      }
    } catch (error) {
      setStatus({ sending: false, verifying: false, sent: false, message: 'Network error. Please try again.', severity: 'error' });
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setStatus((prev) => ({ ...prev, message: 'Enter the complete 6-digit OTP', severity: 'warning' }));
      return;
    }
    
    setStatus((prev) => ({ ...prev, verifying: true, message: 'Verifying...' }));
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
        setStatus({ sending: false, verifying: false, sent: true, message: 'OTP verified successfully!', severity: 'success' });
        onVerified?.(otp, target);
        setTimeout(() => onClose?.(), 800);
      } else {
        setStatus({ sending: false, verifying: false, sent: true, message: data?.message || 'Invalid OTP. Please try again.', severity: 'error' });
      }
    } catch (error) {
      setStatus({ sending: false, verifying: false, sent: true, message: 'Network error. Please try again.', severity: 'error' });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullScreen={isMobile}
      maxWidth="sm" 
      fullWidth
      scroll="body"
      sx={{ 
        zIndex: 9999,
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0,0,0,0.6)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        color: '#fff',
        fontWeight: 700,
        fontSize: { xs: '1rem', sm: '1.2rem' },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1.5,
        pr: 6,
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}>
        <Lock /> {title}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important', pb: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          {/* OTP Method Selection */}
          <FormControl fullWidth size="small">
            <InputLabel>Send OTP via</InputLabel>
            <Select
              value={otpMethod}
              label="Send OTP via"
              onChange={(e) => {
                setOtpMethod(e.target.value);
                setOtp('');
                setStatus({ sending: false, verifying: false, sent: false, message: '', severity: 'info' });
                setTimer(0);
              }}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="email">
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color="primary" /> Email (Recommended)
                </Box>
              </MenuItem>
              <MenuItem value="phone">
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color="success" /> Phone SMS
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Phone or Email input */}
          {otpMethod === 'phone' ? (
            <Stack spacing={1}>
              <FormControl size="small" fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry?.code || '+91'}
                  label="Country"
                  onChange={(e) => setSelectedCountry(countryCodes.find(c => c.code === e.target.value) || countryCodes[2])}
                  sx={{ borderRadius: 2 }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  {countryCodes.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.flag} {c.code} {c.country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Phone Number"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
              size="small"
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          )}

          {/* Send OTP Button */}
          <Button
            onClick={otpMethod === 'phone' ? handleSendPhoneOtp : handleSendEmailOtp}
            disabled={status.sending || timer > 0}
            variant="contained"
            fullWidth
            startIcon={status.sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
            sx={{
              py: 1.2,
              borderRadius: 2,
              background: status.sent ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              fontWeight: 700,
              fontSize: '0.95rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              },
            }}
          >
            {status.sending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : status.sent ? 'Resend OTP' : 'Send OTP'}
          </Button>

          {/* Status Alert */}
          {status.message && (
            <Alert severity={status.severity} variant="filled" sx={{ borderRadius: 2 }}>
              {status.message}
            </Alert>
          )}

          {/* OTP Input - Only show after OTP is sent */}
          {status.sent && (
            <>
              <Divider>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  ENTER VERIFICATION CODE
                </Typography>
              </Divider>
              <Box>
                <input
                  ref={otpInputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  style={{ 
                    width: '100%',
                    padding: '14px 12px',
                    fontSize: '24px',
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: '8px',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: '#f0fdf4',
                    color: '#065f46',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = 'none'; }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                  Enter the 6-digit code sent to your {otpMethod === 'phone' ? 'phone' : 'email'}
                </Typography>
              </Box>

              {/* Verify Button */}
              <Button
                onClick={handleVerify}
                disabled={status.verifying || otp.length !== 6}
                variant="contained"
                fullWidth
                startIcon={status.verifying ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                sx={{
                  py: 1.3,
                  borderRadius: 2,
                  background: otp.length === 6 ? 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)' : '#e0e0e0',
                  fontWeight: 700,
                  fontSize: '1rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00A846 0%, #00C853 100%)',
                  },
                  '&.Mui-disabled': {
                    background: '#e0e0e0',
                    color: '#999',
                  },
                }}
              >
                {status.verifying ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1, position: 'sticky', bottom: 0, bgcolor: 'background.paper' }}>
        <Button onClick={onClose} color="inherit" variant="outlined" fullWidth sx={{ fontWeight: 600, borderRadius: 2 }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpDialog;
