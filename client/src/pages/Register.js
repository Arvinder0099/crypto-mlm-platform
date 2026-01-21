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
  Avatar,
  IconButton,
  InputAdornment,
  Chip,
  Fade,
  Zoom,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
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
  RadioButtonUnchecked,
  ArrowForward,
  ArrowBack,
  Verified,
  Security,
  TrendingUp,
  Groups,
  AttachMoney,
  ContentCopy,
  Check,
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

const steps = ['Personal Info', 'Security', 'Wallet Setup'];

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
  const [copied, setCopied] = useState(false);

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
  };

  const detectWalletType = (address) => {
    const a = (address || '').trim();
    if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a)) return 'usdt_trc20';
    if (/^0x[a-fA-F0-9]{40}$/.test(a)) return 'usdt_erc20';
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(a)) return 'btc';
    return 'usdt_trc20';
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
        walletType: detectWalletType(formData.walletAddress),
      };

      const response = await fetchJSON('/api/auth/register', {
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
        {isCompleted ? <CheckCircle /> : index === 0 ? <Person /> : index === 1 ? <Lock /> : <AccountBalanceWallet />}
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
                Security Setup
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create a strong password and add referral code
              </Typography>

              <Grid container spacing={2}>
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

                {/* Password Strength Indicator */}
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
    </Box>
  );
}

export default Register;
