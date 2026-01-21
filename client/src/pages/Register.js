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
} from '@mui/icons-material';
import { fetchJSON } from '../utils/api';

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

const steps = ['Personal Info', 'Verify & Security', 'Wallet Setup'];

const features = [
  { icon: <TrendingUp />, title: 'High Returns', desc: 'Earn up to 15% monthly ROI' },
  { icon: <Groups />, title: 'Team Bonus', desc: 'Up to 5 levels deep commissions' },
  { icon: <AttachMoney />, title: 'Instant Payouts', desc: 'Withdraw anytime, anywhere' },
  { icon: <Security />, title: '100% Secure', desc: 'Bank-grade security' },
];

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
    try {
      const response = await fetchJSON('/api/auth/send-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email }),
      });
      
      setEmailOtpSent(true);
      setEmailTimer(60); // 60 seconds cooldown
      
      // For demo purposes - show the OTP
      if (response.demoOtp) {
        setDemoEmailOtp(response.demoOtp);
        setDemoOtpType('email');
        setShowDemoDialog(true);
      }
      
      setSuccess('OTP sent to your email!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Demo mode - generate local OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoEmailOtp(otp);
      setEmailOtpSent(true);
      setEmailTimer(60);
      setDemoOtpType('email');
      setShowDemoDialog(true);
    } finally {
      setSendingEmailOtp(false);
    }
  };

  // Send Phone OTP
  const sendPhoneOtp = async () => {
    if (!formData.phone || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setFieldErrors(prev => ({ ...prev, phone: 'Enter a valid 10-digit phone number first' }));
      return;
    }

    setSendingPhoneOtp(true);
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
      
      setSuccess('OTP sent to your phone!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Demo mode - generate local OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoPhoneOtp(otp);
      setPhoneOtpSent(true);
      setPhoneTimer(60);
      setDemoOtpType('phone');
      setShowDemoDialog(true);
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
        body: JSON.stringify({ 
          email: formData.email,
          otp: emailOtp 
        }),
      });
      setEmailVerified(true);
      setSuccess('Email verified successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Demo mode - check against local OTP
      if (emailOtp === demoEmailOtp) {
        setEmailVerified(true);
        setSuccess('Email verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Invalid OTP. Please try again.');
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
      setSuccess('Phone verified successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Demo mode - check against local OTP
      if (phoneOtp === demoPhoneOtp) {
        setPhoneVerified(true);
        setSuccess('Phone verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Invalid OTP. Please try again.');
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
      else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) errors.phone = 'Enter 10 digit phone number';
    }
    
    if (step === 1) {
      if (!emailVerified) errors.emailOtp = 'Please verify your email';
      if (!phoneVerified) errors.phoneOtp = 'Please verify your phone';
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    
    if (step === 2) {
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
    if (!validateStep(2)) return;

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

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step, index) => {
    const isCompleted = index < activeStep;
    const isActive = index === activeStep;
    
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isCompleted 
            ? 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)'
            : isActive 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : alpha(theme.palette.text.primary, 0.1),
          color: isCompleted || isActive ? '#fff' : theme.palette.text.secondary,
          transition: 'all 0.3s ease',
          boxShadow: isActive ? '0 4px 20px rgba(102, 126, 234, 0.4)' : 'none',
        }}
      >
        {isCompleted ? <CheckCircle /> : index === 0 ? <Person /> : index === 1 ? <Security /> : <AccountBalanceWallet />}
      </Box>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Personal Information
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Let's start with your basic details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange('firstName')}
                    error={!!fieldErrors.firstName}
                    helperText={fieldErrors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
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
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={formData.country}
                      label="Country"
                      onChange={handleChange('country')}
                      sx={{ borderRadius: 2 }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <MenuItem key={c.code} value={c.code}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Verify & Security
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Verify your email & phone, then create password
              </Typography>

              <Grid container spacing={2}>
                {/* Email Verification */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: `2px solid ${emailVerified ? '#00C853' : alpha(theme.palette.primary.main, 0.2)}`,
                    bgcolor: emailVerified ? alpha('#00C853', 0.05) : 'transparent',
                  }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Email color={emailVerified ? 'success' : 'action'} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Email Verification
                        </Typography>
                        {emailVerified && (
                          <Chip 
                            icon={<Verified />} 
                            label="Verified" 
                            color="success" 
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {formData.email || 'No email entered'}
                    </Typography>

                    {!emailVerified && (
                      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                        {!emailOtpSent ? (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={sendingEmailOtp ? <CircularProgress size={16} /> : <Send />}
                            onClick={sendEmailOtp}
                            disabled={sendingEmailOtp || !formData.email}
                            sx={{ 
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                          >
                            Send OTP
                          </Button>
                        ) : (
                          <>
                            <TextField
                              size="small"
                              placeholder="Enter 6-digit OTP"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              onClick={verifyEmailOtp}
                              disabled={verifyingEmail || emailOtp.length !== 6}
                              sx={{ 
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                              }}
                            >
                              {verifyingEmail ? <CircularProgress size={16} /> : 'Verify'}
                            </Button>
                            {emailTimer > 0 ? (
                              <Chip 
                                icon={<Timer />} 
                                label={`${emailTimer}s`} 
                                size="small" 
                                variant="outlined"
                              />
                            ) : (
                              <Button size="small" onClick={sendEmailOtp}>
                                Resend
                              </Button>
                            )}
                          </>
                        )}
                      </Box>
                    )}
                    {fieldErrors.emailOtp && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {fieldErrors.emailOtp}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Phone Verification */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    border: `2px solid ${phoneVerified ? '#00C853' : alpha(theme.palette.primary.main, 0.2)}`,
                    bgcolor: phoneVerified ? alpha('#00C853', 0.05) : 'transparent',
                  }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Sms color={phoneVerified ? 'success' : 'action'} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Phone Verification
                        </Typography>
                        {phoneVerified && (
                          <Chip 
                            icon={<Verified />} 
                            label="Verified" 
                            color="success" 
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {formData.phone ? `${formData.countryCode} ${formData.phone}` : 'No phone entered'}
                    </Typography>

                    {!phoneVerified && (
                      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                        {!phoneOtpSent ? (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={sendingPhoneOtp ? <CircularProgress size={16} /> : <Sms />}
                            onClick={sendPhoneOtp}
                            disabled={sendingPhoneOtp || !formData.phone}
                            sx={{ 
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                          >
                            Send OTP
                          </Button>
                        ) : (
                          <>
                            <TextField
                              size="small"
                              placeholder="Enter 6-digit OTP"
                              value={phoneOtp}
                              onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              onClick={verifyPhoneOtp}
                              disabled={verifyingPhone || phoneOtp.length !== 6}
                              sx={{ 
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                              }}
                            >
                              {verifyingPhone ? <CircularProgress size={16} /> : 'Verify'}
                            </Button>
                            {phoneTimer > 0 ? (
                              <Chip 
                                icon={<Timer />} 
                                label={`${phoneTimer}s`} 
                                size="small" 
                                variant="outlined"
                              />
                            ) : (
                              <Button size="small" onClick={sendPhoneOtp}>
                                Resend
                              </Button>
                            )}
                          </>
                        )}
                      </Box>
                    )}
                    {fieldErrors.phoneOtp && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {fieldErrors.phoneOtp}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Password Fields */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
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
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
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
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Password Strength
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, formData.password.length * 10)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
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
                  </Box>
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
                      startAdornment: (
                        <InputAdornment position="start">
                          <Groups color="action" />
                        </InputAdornment>
                      ),
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

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Wallet Setup
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add your crypto wallet for withdrawals
              </Typography>

              <Grid container spacing={2}>
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
                    helperText={fieldErrors.walletAddress || 'Enter your TRC20 USDT wallet address for withdrawals'}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceWallet color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  }}>
                    <Typography variant="body2" color="warning.dark" fontWeight={600}>
                      ⚠️ Important:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Make sure your wallet address is correct. Withdrawals will be sent to this address. 
                      We recommend using TRC20 USDT for lower fees.
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreeTerms}
                        onChange={handleChange('agreeTerms')}
                        sx={{
                          color: theme.palette.primary.main,
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link to="/terms" style={{ color: theme.palette.primary.main }}>
                          Terms & Conditions
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" style={{ color: theme.palette.primary.main }}>
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                  />
                  {fieldErrors.agreeTerms && (
                    <Typography variant="caption" color="error">
                      {fieldErrors.agreeTerms}
                    </Typography>
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
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(180deg)' },
        },
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(118,75,162,0.3) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />

      {/* Left Side - Features (Hidden on mobile) */}
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
          <Box textAlign="center" mb={6}>
            <Typography variant="h2" fontWeight="800" gutterBottom sx={{
              background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CryptoMLM
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9 }}>
              Build Your Crypto Empire
            </Typography>
          </Box>
        </Zoom>

        <Grid container spacing={3} maxWidth={500}>
          {features.map((feature, index) => (
            <Grid item xs={6} key={index}>
              <Fade in timeout={500 + index * 200}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      bgcolor: 'rgba(255,255,255,0.15)',
                    },
                  }}
                >
                  <Box sx={{ 
                    color: '#a78bfa', 
                    mb: 1,
                    '& svg': { fontSize: 32 }
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {feature.desc}
                  </Typography>
                </Box>
              </Fade>
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
              backdropFilter: 'blur(20px)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Logo for mobile */}
            <Box sx={{ display: { xs: 'block', lg: 'none' }, textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" fontWeight="800" sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                CryptoMLM
              </Typography>
            </Box>

            {/* Stepper */}
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={() => getStepIcon(label, index)}>
                      <Typography 
                        variant="caption" 
                        fontWeight={index === activeStep ? 700 : 400}
                        color={index <= activeStep ? 'primary' : 'text.secondary'}
                      >
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Error/Success Messages */}
            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}
            {success && (
              <Fade in>
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  {success}
                </Alert>
              </Fade>
            )}

            {/* Step Content */}
            <Box sx={{ minHeight: 320 }}>
              {renderStepContent()}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 },
                  }}
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
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    },
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
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                    boxShadow: '0 4px 15px rgba(0, 200, 83, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00B248 0%, #5CE09E 100%)',
                      boxShadow: '0 6px 20px rgba(0, 200, 83, 0.5)',
                    },
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#667eea', 
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Card>
        </Zoom>
      </Box>

      {/* Demo OTP Dialog */}
      <Dialog open={showDemoDialog} onClose={() => setShowDemoDialog(false)}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        }}>
          📱 OTP Code (Demo Mode)
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Your {demoOtpType === 'email' ? 'Email' : 'Phone'} OTP Code:
          </Typography>
          <Box sx={{ 
            p: 3, 
            bgcolor: alpha('#667eea', 0.1), 
            borderRadius: 2, 
            textAlign: 'center',
            my: 2,
          }}>
            <Typography variant="h3" fontWeight="800" color="primary" letterSpacing={8}>
              {demoOtpType === 'email' ? demoEmailOtp : demoPhoneOtp}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            In production, this OTP will be sent to your actual {demoOtpType === 'email' ? 'email' : 'phone'}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDemoDialog(false)} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Register;
