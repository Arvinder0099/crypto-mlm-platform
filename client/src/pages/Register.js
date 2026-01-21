import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  IconButton,
  InputAdornment,
  Chip,
  Fade,
  Zoom,
  CircularProgress,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  keyframes,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  AccountBalanceWallet,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  Verified,
  Security,
  TrendingUp,
  Groups,
  AttachMoney,
  Send,
  Sms,
  Timer,
  CurrencyBitcoin,
} from '@mui/icons-material';
import { fetchJSON } from '../utils/api';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(3deg); }
  75% { transform: translateY(-8px) rotate(-3deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(247, 147, 26, 0.4); }
  50% { box-shadow: 0 0 40px rgba(247, 147, 26, 0.7); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Country codes
const COUNTRY_CODES = [
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'AE', name: 'UAE', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'CN', name: 'China', dial: '+86' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'RU', name: 'Russia', dial: '+7' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'PH', name: 'Philippines', dial: '+63' },
  { code: 'ID', name: 'Indonesia', dial: '+62' },
  { code: 'MY', name: 'Malaysia', dial: '+60' },
];

const steps = ['Account Details', 'Security & Wallet'];

function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralFromUrl = searchParams.get('ref') || '';

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP States
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  // For demo - store OTP codes
  const [demoEmailOtp, setDemoEmailOtp] = useState('');
  const [demoPhoneOtp, setDemoPhoneOtp] = useState('');
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [demoOtpType, setDemoOtpType] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    country: 'IN',
    password: '',
    confirmPassword: '',
    referralCode: referralFromUrl,
    walletAddress: '',
    walletType: 'usdt_trc20',
    agreeTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [referrerInfo, setReferrerInfo] = useState(null);

  // Email Timer
  useEffect(() => {
    let interval;
    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  // Phone Timer
  useEffect(() => {
    let interval;
    if (phoneTimer > 0) {
      interval = setInterval(() => {
        setPhoneTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneTimer]);

  // Check referral code
  useEffect(() => {
    if (formData.referralCode && formData.referralCode.length >= 6) {
      checkReferralCode(formData.referralCode);
    } else {
      setReferrerInfo(null);
    }
  }, [formData.referralCode]);

  const checkReferralCode = async (code) => {
    try {
      const data = await fetchJSON(`/api/auth/check-referral/${code}`);
      if (data.valid) {
        setReferrerInfo(data.referrer);
      } else {
        setReferrerInfo(null);
      }
    } catch (err) {
      setReferrerInfo(null);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Reset verification if email/phone changes
    if (field === 'email') {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp('');
    }
    if (field === 'phone') {
      setPhoneVerified(false);
      setPhoneOtpSent(false);
      setPhoneOtp('');
    }
  };

  // Send Email OTP
  const sendEmailOtp = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Enter a valid email first' }));
      return;
    }

    setSendingEmailOtp(true);
    setError('');
    try {
      const response = await fetchJSON('/api/auth/send-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email }),
      });
      
      setEmailOtpSent(true);
      setEmailTimer(60);
      
      if (response.demoOtp) {
        setDemoEmailOtp(response.demoOtp);
        setDemoOtpType('email');
        setShowDemoDialog(true);
      }
      
      setSuccess('✅ OTP sent to your email!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Demo mode - generate local OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoEmailOtp(otp);
      setEmailOtpSent(true);
      setEmailTimer(60);
      setDemoOtpType('email');
      setShowDemoDialog(true);
      setSuccess('✅ OTP sent! (Demo Mode)');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSendingEmailOtp(false);
    }
  };

  // Send Phone OTP
  const sendPhoneOtp = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setFieldErrors(prev => ({ ...prev, phone: 'Enter a valid phone number first' }));
      return;
    }

    setSendingPhoneOtp(true);
    setError('');
    try {
      const response = await fetchJSON('/api/auth/send-phone-otp', {
        method: 'POST',
        body: JSON.stringify({ 
          phone: formData.phone,
          countryCode: formData.countryCode 
        }),
      });
      
      setPhoneOtpSent(true);
      setPhoneTimer(60);
      
      if (response.demoOtp) {
        setDemoPhoneOtp(response.demoOtp);
        setDemoOtpType('phone');
        setShowDemoDialog(true);
      }
      
      setSuccess('✅ OTP sent to your phone!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Demo mode - generate local OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoPhoneOtp(otp);
      setPhoneOtpSent(true);
      setPhoneTimer(60);
      setDemoOtpType('phone');
      setShowDemoDialog(true);
      setSuccess('✅ OTP sent! (Demo Mode)');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  // Verify Email OTP
  const verifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setVerifyingEmail(true);
    try {
      await fetchJSON('/api/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email, otp: emailOtp }),
      });
      setEmailVerified(true);
      setSuccess('✅ Email verified successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Demo mode - check against local OTP
      if (emailOtp === demoEmailOtp) {
        setEmailVerified(true);
        setSuccess('✅ Email verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('❌ Invalid OTP. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Verify Phone OTP
  const verifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setVerifyingPhone(true);
    try {
      await fetchJSON('/api/auth/verify-phone-otp', {
        method: 'POST',
        body: JSON.stringify({ 
          phone: formData.phone,
          countryCode: formData.countryCode,
          otp: phoneOtp 
        }),
      });
      setPhoneVerified(true);
      setSuccess('✅ Phone verified successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Demo mode - check against local OTP
      if (phoneOtp === demoPhoneOtp) {
        setPhoneVerified(true);
        setSuccess('✅ Phone verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('❌ Invalid OTP. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    } finally {
      setVerifyingPhone(false);
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!emailVerified) errors.emailOtp = 'Please verify your email with OTP';
      if (!phoneVerified) errors.phoneOtp = 'Please verify your phone with OTP';
    }
    
    if (step === 1) {
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      if (!formData.walletAddress.trim()) errors.walletAddress = 'Wallet address is required';
      if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to terms';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase(),
        phone: `${formData.countryCode}${formData.phone}`,
        country: formData.country,
        password: formData.password,
        referralCode: formData.referralCode || undefined,
        walletAddress: formData.walletAddress,
        emailVerified: true,
        phoneVerified: true,
      };

      await fetchJSON('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccess('🎉 Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Box Component
  const OTPVerificationBox = ({ type, label, icon, verified, otpSent, otp, setOtp, timer, sending, verifying, onSendOtp, onVerifyOtp, fieldError }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: `2px solid ${verified ? '#00C853' : '#F7931A'}`,
        bgcolor: verified ? alpha('#00C853', 0.05) : alpha('#F7931A', 0.05),
        transition: 'all 0.3s ease',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Typography variant="subtitle1" fontWeight={700} color={verified ? 'success.main' : 'warning.main'}>
            {label} Verification
          </Typography>
        </Box>
        {verified && (
          <Chip 
            icon={<Verified sx={{ fontSize: 16 }} />} 
            label="VERIFIED" 
            color="success" 
            size="small"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      {!verified && (
        <Box>
          {!otpSent ? (
            <Button
              variant="contained"
              fullWidth
              startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
              onClick={onSendOtp}
              disabled={sending}
              sx={{
                py: 1.2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
                fontWeight: 700,
                '&:hover': {
                  background: 'linear-gradient(135deg, #E8820A 0%, #F7931A 100%)',
                },
              }}
            >
              {sending ? 'Sending...' : `Send ${type === 'email' ? 'Email' : 'SMS'} OTP`}
            </Button>
          ) : (
            <Box>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{ 
                    maxLength: 6,
                    style: { textAlign: 'center', letterSpacing: 8, fontWeight: 700, fontSize: 18 }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'white',
                    } 
                  }}
                />
                <Button
                  variant="contained"
                  onClick={onVerifyOtp}
                  disabled={verifying || otp.length !== 6}
                  sx={{
                    minWidth: 100,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                    fontWeight: 700,
                  }}
                >
                  {verifying ? <CircularProgress size={20} color="inherit" /> : 'Verify'}
                </Button>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Didn't receive OTP?
                </Typography>
                {timer > 0 ? (
                  <Chip 
                    icon={<Timer sx={{ fontSize: 14 }} />} 
                    label={`Resend in ${timer}s`} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: 11 }}
                  />
                ) : (
                  <Button size="small" onClick={onSendOtp} sx={{ fontWeight: 600 }}>
                    Resend OTP
                  </Button>
                )}
              </Box>
            </Box>
          )}
          {fieldError && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              ⚠️ {fieldError}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" fontWeight="800" gutterBottom sx={{ 
                background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Create Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Enter your details and verify with OTP
              </Typography>

              <Grid container spacing={2}>
                {/* Name Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    error={!!fieldErrors.firstName}
                    helperText={fieldErrors.firstName}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange('lastName')}
                    error={!!fieldErrors.lastName}
                    helperText={fieldErrors.lastName}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                {/* Email Field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                    disabled={emailVerified}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
                      endAdornment: emailVerified && (
                        <InputAdornment position="end">
                          <CheckCircle color="success" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                {/* EMAIL OTP VERIFICATION */}
                <Grid item xs={12}>
                  <OTPVerificationBox
                    type="email"
                    label="Email"
                    icon={<Email sx={{ color: emailVerified ? '#00C853' : '#F7931A' }} />}
                    verified={emailVerified}
                    otpSent={emailOtpSent}
                    otp={emailOtp}
                    setOtp={setEmailOtp}
                    timer={emailTimer}
                    sending={sendingEmailOtp}
                    verifying={verifyingEmail}
                    onSendOtp={sendEmailOtp}
                    onVerifyOtp={verifyEmailOtp}
                    fieldError={fieldErrors.emailOtp}
                  />
                </Grid>

                {/* Phone Fields */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Code</InputLabel>
                    <Select
                      value={formData.countryCode}
                      label="Code"
                      onChange={handleChange('countryCode')}
                      sx={{ borderRadius: 2 }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <MenuItem key={c.code} value={c.dial}>
                          {c.dial} ({c.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    error={!!fieldErrors.phone}
                    helperText={fieldErrors.phone}
                    disabled={phoneVerified}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment>,
                      endAdornment: phoneVerified && (
                        <InputAdornment position="end">
                          <CheckCircle color="success" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                {/* PHONE OTP VERIFICATION */}
                <Grid item xs={12}>
                  <OTPVerificationBox
                    type="phone"
                    label="Phone"
                    icon={<Sms sx={{ color: phoneVerified ? '#00C853' : '#F7931A' }} />}
                    verified={phoneVerified}
                    otpSent={phoneOtpSent}
                    otp={phoneOtp}
                    setOtp={setPhoneOtp}
                    timer={phoneTimer}
                    sending={sendingPhoneOtp}
                    verifying={verifyingPhone}
                    onSendOtp={sendPhoneOtp}
                    onVerifyOtp={verifyPhoneOtp}
                    fieldError={fieldErrors.phoneOtp}
                  />
                </Grid>

                {/* Referral Code */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Referral Code (Optional)"
                    value={formData.referralCode}
                    onChange={handleChange('referralCode')}
                    placeholder="Enter referral code if you have one"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Groups color="action" /></InputAdornment>,
                      endAdornment: referrerInfo && (
                        <InputAdornment position="end">
                          <Chip
                            icon={<Verified />}
                            label={referrerInfo.name}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" fontWeight="800" gutterBottom sx={{ 
                background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Security & Wallet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Set your password and add wallet for withdrawals
              </Typography>

              <Grid container spacing={2}>
                {/* Password Fields */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password || 'Minimum 6 characters'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    error={!!fieldErrors.confirmPassword}
                    helperText={fieldErrors.confirmPassword}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                {/* Password Strength */}
                <Grid item xs={12}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, formData.password.length * 12)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha('#F7931A', 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: formData.password.length >= 8 
                          ? 'linear-gradient(90deg, #00C853, #69F0AE)'
                          : formData.password.length >= 6 
                            ? 'linear-gradient(90deg, #FFC107, #FFD54F)'
                            : 'linear-gradient(90deg, #FF5252, #FF8A80)',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Password Strength: {formData.password.length >= 8 ? '💪 Strong' : formData.password.length >= 6 ? '👍 Good' : '⚠️ Weak'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Wallet Setup */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Wallet Type</InputLabel>
                    <Select
                      value={formData.walletType}
                      label="Wallet Type"
                      onChange={handleChange('walletType')}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="usdt_trc20">USDT (TRC20 - Recommended)</MenuItem>
                      <MenuItem value="usdt_erc20">USDT (ERC20)</MenuItem>
                      <MenuItem value="usdt_bep20">USDT (BEP20)</MenuItem>
                      <MenuItem value="btc">Bitcoin (BTC)</MenuItem>
                      <MenuItem value="eth">Ethereum (ETH)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Wallet Address"
                    value={formData.walletAddress}
                    onChange={handleChange('walletAddress')}
                    error={!!fieldErrors.walletAddress}
                    helperText={fieldErrors.walletAddress || 'Your crypto wallet address for withdrawals'}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><AccountBalanceWallet color="action" /></InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#FF9800', 0.1), border: '1px solid', borderColor: alpha('#FF9800', 0.3) }}>
                    <Typography variant="body2" color="warning.dark" fontWeight={600}>
                      ⚠️ Important: Make sure your wallet address is correct. Withdrawals will be sent to this address.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreeTerms}
                        onChange={handleChange('agreeTerms')}
                        sx={{ color: '#F7931A', '&.Mui-checked': { color: '#F7931A' } }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the <Link to="/terms" style={{ color: '#F7931A' }}>Terms & Conditions</Link> and <Link to="/privacy" style={{ color: '#F7931A' }}>Privacy Policy</Link>
                      </Typography>
                    }
                  />
                  {fieldErrors.agreeTerms && (
                    <Typography variant="caption" color="error">⚠️ {fieldErrors.agreeTerms}</Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Crypto Icons */}
      <Box sx={{
        position: 'absolute', top: '10%', left: '5%', width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: `${float} 6s ease-in-out infinite`, boxShadow: '0 10px 30px rgba(247,147,26,0.4)',
      }}>
        <Typography sx={{ fontSize: 28, fontWeight: 900, color: 'white' }}>₿</Typography>
      </Box>
      <Box sx={{
        position: 'absolute', bottom: '15%', right: '8%', width: 50, height: 50, borderRadius: '50%',
        background: 'linear-gradient(135deg, #627EEA 0%, #8B9FEF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: `${float} 8s ease-in-out infinite`, animationDelay: '1s', boxShadow: '0 10px 30px rgba(98,126,234,0.4)',
      }}>
        <Typography sx={{ fontSize: 24, fontWeight: 900, color: 'white' }}>Ξ</Typography>
      </Box>
      <Box sx={{
        position: 'absolute', top: '60%', left: '8%', width: 40, height: 40, borderRadius: '50%',
        background: 'linear-gradient(135deg, #26A17B 0%, #4ECDC4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: `${float} 7s ease-in-out infinite`, animationDelay: '2s', boxShadow: '0 10px 30px rgba(38,161,123,0.4)',
      }}>
        <Typography sx={{ fontSize: 20, fontWeight: 900, color: 'white' }}>₮</Typography>
      </Box>

      {/* Grid overlay */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Left Side - Branding (Hidden on mobile) */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          color: '#fff',
        }}
      >
        <Zoom in timeout={800}>
          <Box textAlign="center" mb={4}>
            <Box sx={{ 
              width: 120, height: 120, borderRadius: '50%', mx: 'auto', mb: 3,
              background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `${glow} 2s ease-in-out infinite`,
            }}>
              <CurrencyBitcoin sx={{ fontSize: 70, color: 'white' }} />
            </Box>
            <Typography variant="h2" fontWeight="900" sx={{
              background: 'linear-gradient(135deg, #fff 0%, #F7931A 50%, #fff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CryptoMLM
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
              Build Your Crypto Empire
            </Typography>
          </Box>
        </Zoom>

        <Grid container spacing={2} maxWidth={400}>
          {[
            { icon: <TrendingUp />, title: 'High Returns', desc: 'Up to 320% ROI' },
            { icon: <Groups />, title: 'Team Bonus', desc: '5 levels deep' },
            { icon: <Security />, title: 'Secure', desc: 'Bank-level security' },
            { icon: <AttachMoney />, title: 'Fast Payouts', desc: 'Instant withdrawals' },
          ].map((item, i) => (
            <Grid item xs={6} key={i}>
              <Paper sx={{
                p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-5px)', bgcolor: 'rgba(255,255,255,0.15)' },
              }}>
                <Box sx={{ color: '#F7931A', mb: 1 }}>{item.icon}</Box>
                <Typography variant="subtitle2" fontWeight={700} color="white">{item.title}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{item.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Right Side - Form */}
      <Box
        sx={{
          flex: { xs: 1, lg: 0.8 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Zoom in timeout={500}>
          <Card
            sx={{
              width: '100%',
              maxWidth: 520,
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              background: 'rgba(255,255,255,0.98)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Mobile Logo */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CurrencyBitcoin sx={{ fontSize: 35, color: 'white' }} />
              </Box>
            </Box>

            {/* Stepper */}
            <Box sx={{ mb: 3 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box sx={{
                          width: 36, height: 36, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: index < activeStep 
                            ? 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)'
                            : index === activeStep 
                              ? 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)'
                              : '#e0e0e0',
                          color: index <= activeStep ? '#fff' : '#999',
                          fontWeight: 700,
                          transition: 'all 0.3s',
                        }}>
                          {index < activeStep ? <CheckCircle sx={{ fontSize: 20 }} /> : index + 1}
                        </Box>
                      )}
                    >
                      <Typography variant="caption" fontWeight={index === activeStep ? 700 : 400}>
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Messages */}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

            {/* Step Content */}
            <Box sx={{ minHeight: 380 }}>
              {renderStepContent()}
            </Box>

            {/* Navigation */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  sx={{ flex: 1, py: 1.5, borderRadius: 2, borderWidth: 2, fontWeight: 700 }}
                >
                  Back
                </Button>
              )}
              
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  sx={{
                    flex: 1, py: 1.5, borderRadius: 2, fontWeight: 700,
                    background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
                    boxShadow: '0 4px 15px rgba(247, 147, 26, 0.4)',
                    '&:hover': { background: 'linear-gradient(135deg, #E8820A 0%, #F7931A 100%)' },
                  }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  sx={{
                    flex: 1, py: 1.5, borderRadius: 2, fontWeight: 700,
                    background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                    boxShadow: '0 4px 15px rgba(0, 200, 83, 0.4)',
                    '&:hover': { background: 'linear-gradient(135deg, #00B248 0%, #5CE09E 100%)' },
                  }}
                >
                  {loading ? 'Creating...' : '🚀 Create Account'}
                </Button>
              )}
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#F7931A', fontWeight: 600, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Card>
        </Zoom>
      </Box>

      {/* Demo OTP Dialog */}
      <Dialog open={showDemoDialog} onClose={() => setShowDemoDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
          color: '#fff', fontWeight: 700,
        }}>
          📱 OTP Code (Demo Mode)
        </DialogTitle>
        <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Your {demoOtpType === 'email' ? '📧 Email' : '📱 Phone'} OTP Code:
          </Typography>
          <Box sx={{ 
            p: 3, bgcolor: alpha('#F7931A', 0.1), borderRadius: 3, my: 2,
            border: '2px dashed #F7931A',
          }}>
            <Typography variant="h2" fontWeight="900" color="#F7931A" letterSpacing={8}>
              {demoOtpType === 'email' ? demoEmailOtp : demoPhoneOtp}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            ⚠️ In production, this OTP will be sent to your actual {demoOtpType === 'email' ? 'email inbox' : 'phone via SMS'}.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setShowDemoDialog(false)} 
            variant="contained"
            fullWidth
            sx={{ 
              py: 1.5, borderRadius: 2, fontWeight: 700,
              background: 'linear-gradient(135deg, #F7931A 0%, #FFB347 100%)',
            }}
          >
            Got it! ✓
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Register;
