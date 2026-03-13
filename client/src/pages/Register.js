import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Grid,
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
  alpha,
  Paper,
  keyframes,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  CheckCircle,
  Verified,
  Security,
  TrendingUp,
  Groups,
  AttachMoney,
  Send,
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
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.7); }
`;


function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralFromUrl = searchParams.get('ref') || '';

  const activeStep = 0;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP States
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    country: 'AE',
    password: '',
    confirmPassword: '',
    referralCode: referralFromUrl,
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
    // Reset verification if email changes
    if (field === 'email') {
      setEmailVerified(false);
      setEmailOtp('');
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
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setEmailTimer(60);
        setSuccess('\u2705 Verification code sent to your email! Check your inbox.');
        setTimeout(() => setSuccess(''), 8000);
      } else {
        throw new Error(data.message || 'Server error');
      }
    } catch (err) {
      setError('Failed to send code. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSendingEmailOtp(false);
    }
  };

  // Verify Email OTP
  const verifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setVerifyingEmail(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: emailOtp }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setEmailVerified(true);
        setSuccess('\u2705 Email verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.userId.trim()) errors.userId = 'User ID is required';
      else if (formData.userId.length < 4) errors.userId = 'User ID must be at least 4 characters';
      else if (!/^[a-zA-Z0-9_]+$/.test(formData.userId)) errors.userId = 'User ID can only contain letters, numbers, and underscores';
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
      if (!emailVerified) errors.emailOtp = 'Please verify your email with OTP';
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 12) errors.password = 'Password must be at least 12 characters';
      else if (formData.password.length > 16) errors.password = 'Password must not exceed 16 characters';
      else if (!/[a-z]/.test(formData.password)) errors.password = 'Must include a lowercase letter';
      else if (!/[A-Z]/.test(formData.password)) errors.password = 'Must include an uppercase letter';
      else if (!/\d/.test(formData.password)) errors.password = 'Must include a number';
      else if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~]/.test(formData.password)) errors.password = 'Must include a symbol (!@#$%^&* etc.)';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to terms';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(0)) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        userId: formData.userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase(),
        country: formData.country,
        password: formData.password,
        referralCode: formData.referralCode || undefined,
        emailVerified: true,
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

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h5" fontWeight="800" gutterBottom sx={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Create Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Enter your details and verify your email
              </Typography>

              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {/* User ID Field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="User ID (Your unique login ID)"
                    value={formData.userId}
                    onChange={handleChange('userId')}
                    error={!!fieldErrors.userId}
                    helperText={fieldErrors.userId || 'Choose a unique User ID (min 4 characters, letters, numbers, underscores only)'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    placeholder="e.g., john_doe123"
                  />
                </Grid>

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
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 3,
                      border: `2px solid ${emailVerified ? '#00C853' : '#10b981'}`,
                      bgcolor: emailVerified ? alpha('#00C853', 0.05) : alpha('#10b981', 0.05),
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Email sx={{ color: emailVerified ? '#00C853' : '#10b981' }} />
                        <Typography variant="subtitle1" fontWeight={700} color={emailVerified ? 'success.main' : 'warning.main'}>
                          Email Verification
                        </Typography>
                      </Box>
                      {emailVerified && (
                        <Chip icon={<Verified sx={{ fontSize: 16 }} />} label="VERIFIED" color="success" size="small" sx={{ fontWeight: 700 }} />
                      )}
                    </Box>

                    {!emailVerified && (
                      <Box>
                        <Box display="flex" flexDirection="column" mb={2}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={sendingEmailOtp ? <CircularProgress size={18} color="inherit" /> : <Send />}
                            onClick={sendEmailOtp}
                            disabled={sendingEmailOtp || emailTimer > 0}
                            sx={{
                              py: 1.2,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                              fontWeight: 700,
                            }}
                          >
                            {sendingEmailOtp ? 'Sending...' : (emailTimer > 0 ? `Resend in ${emailTimer}s` : 'Get Verification Code')}
                          </Button>
                        </Box>

                        <Box>
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Enter the 6-digit code sent to your email
                          </Typography>
                          <Box display="flex" gap={1} mb={1}>
                            <input
                              id="email-otp-input"
                              type="tel"
                              inputMode="numeric"
                              placeholder="000000"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                              maxLength={6}
                              autoComplete="off"
                              style={{ 
                                flex: 1,
                                minWidth: 0,
                                padding: '10px 8px',
                                fontSize: '18px',
                                fontWeight: 700,
                                textAlign: 'center',
                                letterSpacing: '6px',
                                border: '2px solid #10b981',
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                boxSizing: 'border-box',
                              }}
                            />
                            <Button
                              variant="contained"
                              onClick={verifyEmailOtp}
                              disabled={verifyingEmail || emailOtp.length !== 6}
                              sx={{
                                minWidth: 100,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                                fontWeight: 700,
                              }}
                            >
                              {verifyingEmail ? <CircularProgress size={20} color="inherit" /> : 'Verify'}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Paper>
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

                {/* Password Fields (Moved to Step 1) */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Create Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password || '12-16 chars: uppercase, lowercase, number & symbol'}
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
                    label="Confirm Your Password"
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
                  {(() => {
                    const p = formData.password;
                    const checks = [
                      p.length >= 12 && p.length <= 16,
                      /[a-z]/.test(p),
                      /[A-Z]/.test(p),
                      /\d/.test(p),
                      /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~]/.test(p),
                    ];
                    const passed = checks.filter(Boolean).length;
                    const pct = p.length === 0 ? 0 : (passed / 5) * 100;
                    const color = passed >= 5 ? '#00C853' : passed >= 3 ? '#FFC107' : '#FF5252';
                    const label = passed >= 5 ? '\ud83d\udcaa Strong' : passed >= 3 ? '\ud83d\udc4d Medium' : p.length > 0 ? '\u26a0\ufe0f Weak' : '';
                    return (
                      <>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha('#10b981', 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: color,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {label && `Password Strength: ${label}`}
                        </Typography>
                        {p.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            {[
                              ['12-16 characters', p.length >= 12 && p.length <= 16],
                              ['Lowercase letter', /[a-z]/.test(p)],
                              ['Uppercase letter', /[A-Z]/.test(p)],
                              ['Number', /\d/.test(p)],
                              ['Symbol (!@#$%^&*)', /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~]/.test(p)],
                            ].map(([text, ok]) => (
                              <Typography key={text} variant="caption" display="block" sx={{ color: ok ? '#00C853' : '#FF5252', fontSize: '0.7rem' }}>
                                {ok ? '\u2713' : '\u2717'} {text}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </>
                    );
                  })()}
                </Grid>

                {/* Terms & Conditions */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreeTerms}
                        onChange={handleChange('agreeTerms')}
                        sx={{ color: '#10b981', '&.Mui-checked': { color: '#10b981' } }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the <Link to="/terms" style={{ color: '#10b981' }}>Terms & Conditions</Link> and <Link to="/privacy" style={{ color: '#10b981' }}>Privacy Policy</Link>
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
        overflowX: 'hidden',
        overflowY: 'auto',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      {/* Floating Crypto Icons */}
      <Box sx={{
        position: 'absolute', top: '10%', left: '5%', width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: `${float} 6s ease-in-out infinite`, boxShadow: '0 10px 30px rgba(16,185,129,0.4)',
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
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `${glow} 2s ease-in-out infinite`,
            }}>
              <CurrencyBitcoin sx={{ fontSize: 70, color: 'white' }} />
            </Box>
            <Typography variant="h2" fontWeight="900" sx={{
              background: 'linear-gradient(135deg, #fff 0%, #10b981 50%, #fff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Hexanova
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 1, color: 'rgba(255,255,255,0.9)' }}>
              Build Your Investment Empire
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
              <Paper elevation={0} sx={{
                p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1) !important', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s', backgroundImage: 'none',
                '&:hover': { transform: 'translateY(-5px)', backgroundColor: 'rgba(255,255,255,0.15) !important' },
              }}>
                <Box sx={{ color: '#10b981', mb: 1 }}>{item.icon}</Box>
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
          p: { xs: 1, sm: 4 },
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        <Zoom in timeout={500}>
          <Card
            sx={{
              width: '100%',
              maxWidth: 520,
              p: { xs: 1.5, sm: 3, md: 4 },
              borderRadius: { xs: 2, sm: 4 },
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              background: 'rgba(255,255,255,0.98)',
              maxHeight: '90vh',
              overflowX: 'hidden',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Mobile Logo */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CurrencyBitcoin sx={{ fontSize: 35, color: 'white' }} />
              </Box>
            </Box>

            {/* Messages */}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

            {/* Step Content */}
            <Box sx={{ minHeight: 380 }}>
              {renderStepContent()}
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                fullWidth
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                sx={{
                  py: 1.5, borderRadius: 2, fontWeight: 700,
                  background: 'linear-gradient(135deg, #00C853 0%, #69F0AE 100%)',
                  boxShadow: '0 4px 15px rgba(0, 200, 83, 0.4)',
                  '&:hover': { background: 'linear-gradient(135deg, #00B248 0%, #5CE09E 100%)' },
                }}
              >
                {loading ? 'Creating...' : '🚀 Create Account'}
              </Button>
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Card>
        </Zoom>
      </Box>

    </Box>
  );
}

export default Register;
