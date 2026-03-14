import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  keyframes,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon, 
  Security,
  TrendingUp,
  Groups,
  CheckCircle,
  CurrencyBitcoin,
  PhoneAndroid,
  CloudDownload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchJSON } from '../utils/api';

// Keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(5deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(-5deg); }
`;

const spin = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8), 0 0 60px rgba(16, 185, 129, 0.4); }
`;

const rise = keyframes`
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100px) scale(1); opacity: 0; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Crypto coin SVG component
const CryptoCoin = ({ type, size = 60, delay = 0, duration = 8, left, top }) => {
  const coins = {
    bitcoin: {
      bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      icon: '₿',
      shadow: 'rgba(16, 185, 129, 0.5)',
    },
    ethereum: {
      bg: 'linear-gradient(135deg, #627EEA 0%, #8B9FEF 100%)',
      icon: 'Ξ',
      shadow: 'rgba(98, 126, 234, 0.5)',
    },
    usdt: {
      bg: 'linear-gradient(135deg, #26A17B 0%, #4ECDC4 100%)',
      icon: '₮',
      shadow: 'rgba(38, 161, 123, 0.5)',
    },
    bnb: {
      bg: 'linear-gradient(135deg, #F3BA2F 0%, #FFD93D 100%)',
      icon: 'B',
      shadow: 'rgba(243, 186, 47, 0.5)',
    },
  };

  const coin = coins[type] || coins.bitcoin;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: left,
        top: top,
        width: size,
        height: size,
        borderRadius: '50%',
        background: coin.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 10px 30px ${coin.shadow}`,
        animation: `${float} ${duration}s ease-in-out infinite, ${glow} 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 3,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.3)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: '30%',
          height: '20%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
          borderRadius: '50%',
          transform: 'rotate(-30deg)',
        },
      }}
    >
      <Typography
        sx={{
          fontSize: size * 0.45,
          fontWeight: 900,
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          fontFamily: 'monospace',
        }}
      >
        {coin.icon}
      </Typography>
    </Box>
  );
};

// 3D Spinning Bitcoin
const SpinningBitcoin = ({ size = 120 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      perspective: 1000,
      margin: '0 auto',
    }}
  >
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: `${spin} 4s linear infinite`,
        transformStyle: 'preserve-3d',
        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.6), inset 0 -5px 20px rgba(0,0,0,0.2)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 6,
          borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.4)',
        },
      }}
    >
      <CurrencyBitcoin sx={{ fontSize: size * 0.5, color: 'white', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }} />
    </Box>
  </Box>
);

// Animated chart lines
const AnimatedChart = () => (
  <Box sx={{ width: '100%', height: 80, position: 'relative', overflow: 'hidden', mt: 2, mb: 2 }}>
    <svg width="100%" height="100%" viewBox="0 0 400 80">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C853" />
          <stop offset="50%" stopColor="#69F0AE" />
          <stop offset="100%" stopColor="#00C853" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,200,83,0.4)" />
          <stop offset="100%" stopColor="rgba(0,200,83,0)" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d="M0,60 Q50,50 100,40 T200,30 T300,20 T400,10 L400,80 L0,80 Z"
        fill="url(#areaGradient)"
      >
        <animate
          attributeName="d"
          values="
            M0,60 Q50,50 100,40 T200,30 T300,20 T400,10 L400,80 L0,80 Z;
            M0,50 Q50,60 100,35 T200,45 T300,25 T400,15 L400,80 L0,80 Z;
            M0,60 Q50,50 100,40 T200,30 T300,20 T400,10 L400,80 L0,80 Z"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Line */}
      <path
        d="M0,60 Q50,50 100,40 T200,30 T300,20 T400,10"
        fill="none"
        stroke="url(#chartGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <animate
          attributeName="d"
          values="
            M0,60 Q50,50 100,40 T200,30 T300,20 T400,10;
            M0,50 Q50,60 100,35 T200,45 T300,25 T400,15;
            M0,60 Q50,50 100,40 T200,30 T300,20 T400,10"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Moving dot */}
      <circle r="6" fill="#00C853" filter="drop-shadow(0 0 8px #00C853)">
        <animateMotion
          path="M0,60 Q50,50 100,40 T200,30 T300,20 T400,10"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </Box>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [twoFAUserId, setTwoFAUserId] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const [particles, setParticles] = useState([]);
  
  // Forgot Password State
  const [forgotDialog, setForgotDialog] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState({ text: '', type: '' });
  
  const navigate = useNavigate();
  const { login, ROLES } = useAuth();

  // Generate floating particles effect
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 15,
      size: 2 + Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await fetchJSON('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (data.success) {
        const token = data?.data?.token || data.token;
        const user = data?.data?.user || data.user;
        login(user, token);
        if (data.requires2FA) {
          setTwoFARequired(true);
        } else {
          if (user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        const validationMsg = Array.isArray(data.errors) ? data.errors.map((e) => e.msg).join(', ') : '';
        setError(validationMsg || data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = typeof err?.message === 'string' ? err.message : '';
      if (msg.toLowerCase().includes('proxy error')) {
        setError('Service unavailable. Backend not reachable via proxy (port 3040).');
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchJSON('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: twoFAUserId,
          token: twoFAToken,
        }),
      });

      if (data.success) {
        const userData = {
          id: data.data.user.id,
          email: data.data.user.email,
          role: data.data.user.role,
          name: data.data.user.fullName || data.data.user.username,
          username: data.data.user.username,
          balance: data.data.user.balance,
          totalEarnings: data.data.user.totalEarnings,
        };
        login(userData, data.data.token);
        setTwoFARequired(false);
        setTwoFAUserId('');
        setTwoFAToken('');
        if (data.data.user.role === ROLES.ADMIN) {
          navigate('/admin');
        } else {
          navigate('/mlm');
        }
      } else {
        setError(data.message || 'Invalid 2FA code. Please try again.');
      }
    } catch (error) {
      console.error('2FA verify error:', error);
      const msg = typeof error?.message === 'string' ? error.message : '';
      if (msg.toLowerCase().includes('proxy error')) {
        setError('Service unavailable. Backend not reachable via proxy (port 3040).');
      } else {
        setError(msg || 'Failed to verify 2FA. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    if (!forgotData.email) {
      setForgotMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }
    setForgotLoading(true);
    try {
      const data = await fetchJSON('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotData.email })
      });
      setForgotMessage({ text: data.message || 'OTP sent to your email address', type: 'success' });
      setForgotStep(2);
    } catch (err) {
      setForgotMessage({ text: err.message || 'Failed to send OTP', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!forgotData.otp) {
      setForgotMessage({ text: 'Please enter the OTP', type: 'error' });
      return;
    }
    setForgotLoading(true);
    try {
      const data = await fetchJSON('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotData.email, otp: forgotData.otp })
      });
      setForgotData({ ...forgotData, resetToken: data.resetToken });
      setForgotMessage({ text: 'OTP verified successfully', type: 'success' });
      setForgotStep(3);
    } catch (err) {
      setForgotMessage({ text: 'Failed to verify OTP', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    if (forgotData.newPassword.length < 6) {
      setForgotMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    setForgotLoading(true);
    try {
      const data = await fetchJSON('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: forgotData.resetToken,
          newPassword: forgotData.newPassword,
          confirmPassword: forgotData.confirmPassword
        })
      });
      setForgotMessage({ text: 'Password reset successful! Please login.', type: 'success' });
      setTimeout(() => {
        setForgotDialog(false);
        setForgotStep(1);
        setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
        setForgotMessage({ text: '', type: '' });
      }, 2000);
    } catch (err) {
      setForgotMessage({ text: 'Failed to reset password', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotDialog = () => {
    setForgotStep(1);
    setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
    setForgotMessage({ text: '', type: '' });
    setForgotDialog(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(98, 126, 234, 0.15) 0%, transparent 50%)',
          animation: `${pulse} 8s ease-in-out infinite`,
        }}
      />

      {/* Floating Crypto Coins */}
      <CryptoCoin type="bitcoin" size={70} left="5%" top="15%" delay={0} duration={8} />
      <CryptoCoin type="ethereum" size={50} left="85%" top="20%" delay={1} duration={10} />
      <CryptoCoin type="usdt" size={45} left="10%" top="70%" delay={2} duration={9} />
      <CryptoCoin type="bnb" size={55} left="80%" top="65%" delay={1.5} duration={11} />
      <CryptoCoin type="bitcoin" size={35} left="25%" top="85%" delay={0.5} duration={7} />
      <CryptoCoin type="ethereum" size={40} left="70%" top="10%" delay={2.5} duration={12} />

      {/* Rising particles */}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.8) 0%, rgba(255,255,255,0.8) 100%)',
            left: `${particle.left}%`,
            bottom: 0,
            animation: `${rise} ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 0 }, px: { xs: 1, sm: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
        {/* Mobile Header */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <SpinningBitcoin size={80} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Hexanova
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Start Your Journey to Financial Freedom
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="center">
          {/* Left Side - Features with 3D Bitcoin */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ color: 'white', pr: 4 }}>
              {/* 3D Spinning Bitcoin */}
              <Box sx={{ mb: 4 }}>
                <SpinningBitcoin size={140} />
              </Box>

              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 900, 
                  mb: 2, 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(135deg, #fff 0%, #10b981 50%, #fff 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${shimmer} 3s linear infinite`,
                }}
              >
                Hexanova
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, color: 'rgba(255,255,255,0.9)' }}>
                Start Your Journey to Financial Freedom
              </Typography>

              {/* Animated Chart */}
              <AnimatedChart />

              <Grid container spacing={2}>
                {[
                  { icon: <TrendingUp />, title: 'Daily ROI', desc: 'Earn up to 320% returns' },
                  { icon: <Groups />, title: 'Team Building', desc: 'Build network & earn passive income' },
                  { icon: <Security />, title: 'Secure Platform', desc: 'Bank-level security with 2FA' },
                ].map((feature, index) => (
                  <Grid item xs={12} key={index}>
                    <Card 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.1) !important', 
                        backdropFilter: 'blur(10px)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        boxShadow: 'none',
                        backgroundImage: 'none',
                        '&:hover': {
                          transform: 'translateX(10px)',
                          backgroundColor: 'rgba(255,255,255,0.15) !important',
                          borderColor: 'rgba(16,185,129,0.5)',
                        },
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                        <Box 
                          sx={{ 
                            bgcolor: 'rgba(16,185,129,0.3)', 
                            p: 1.5, 
                            borderRadius: 2,
                            animation: `${pulse} 2s ease-in-out infinite`,
                            animationDelay: `${index * 0.3}s`,
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { fontSize: 28, color: '#10b981' } })}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {feature.desc}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {['6 Investment Plans', 'Real-time Tracking', '24/7 Support'].map((label, i) => (
                  <Chip 
                    key={i}
                    icon={<CheckCircle sx={{ color: '#00C853 !important' }} />} 
                    label={label} 
                    sx={{ 
                      bgcolor: 'rgba(0,200,83,0.15)', 
                      color: '#69F0AE', 
                      fontWeight: 600,
                      border: '1px solid rgba(0,200,83,0.3)',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={24} 
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 }, 
                borderRadius: { xs: 2, sm: 4 },
                backdropFilter: 'blur(20px)',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16,185,129,0.1)',
                mx: { xs: 0, sm: 0 },
                border: '1px solid rgba(255,255,255,0.2)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
                    animation: `${glow} 2s ease-in-out infinite`,
                  }}
                >
                  <CurrencyBitcoin sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                
                <Typography 
                  component="h1" 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    background: 'linear-gradient(135deg, #302b63 0%, #10b981 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                  Sign in to access your Hexanova portfolio
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address or User ID"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#10b981' },
                        '&.Mui-focused fieldset': { borderColor: '#10b981' },
                      },
                    }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': { borderColor: '#10b981' },
                        '&.Mui-focused fieldset': { borderColor: '#10b981' },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      mb: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        boxShadow: '0 6px 30px rgba(16, 185, 129, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                    disabled={loading || twoFARequired}
                  >
                    {loading ? 'Signing In...' : '🚀 Sign In'}
                  </Button>

                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/register')}
                      type="button"
                      sx={{ 
                        color: '#10b981',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Don't have an account? Sign Up
                    </Link>
                    <Box sx={{ mt: 1 }}>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={openForgotDialog}
                        type="button"
                        sx={{ 
                          color: '#10b981',
                          fontWeight: 500,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Forgot Password?
                      </Link>
                    </Box>
                  </Box>

                  {/* Trust badges */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {['🔒 SSL Secured', '⚡ Fast Payouts', '🛡️ 2FA Protected'].map((badge, i) => (
                      <Typography 
                        key={i} 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          bgcolor: 'rgba(0,0,0,0.05)',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {badge}
                      </Typography>
                    ))}
                  </Box>

                  {/* Download App Banner */}
                  <Box
                    onClick={() => {
                      const apiBase = process.env.REACT_APP_API_URL || '';
                      const link = document.createElement('a');
                      link.href = `${apiBase}/api/download/app`;
                      link.setAttribute('download', 'Hexanova.apk');
                      link.setAttribute('target', '_blank');
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    sx={{
                      mt: 2.5, p: 2, borderRadius: 2.5, cursor: 'pointer',
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 100%)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      display: 'flex', alignItems: 'center', gap: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.08) 100%)',
                        border: '1px solid rgba(16,185,129,0.4)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.15)',
                      },
                    }}
                  >
                    <Box sx={{
                      width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                    }}>
                      <PhoneAndroid sx={{ fontSize: 22, color: 'white' }} />
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669', lineHeight: 1.3 }}>
                        Download Android App
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Get faster access with the native app
                      </Typography>
                    </Box>
                    <CloudDownload sx={{ fontSize: 22, color: '#10b981' }} />
                  </Box>

                  {twoFARequired && (
                    <Box sx={{ 
                      mt: 3, 
                      p: 3, 
                      border: '2px solid #10b981',
                      borderRadius: 2,
                      bgcolor: 'rgba(16, 185, 129, 0.05)',
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
                        🔐 Two-Factor Authentication
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                        Enter the 6-digit code from your authenticator app
                      </Typography>
                      <TextField
                        fullWidth
                        label="2FA Code"
                        name="twoFAToken"
                        value={twoFAToken}
                        onChange={(e) => setTwoFAToken(e.target.value)}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleVerify2FA}
                        disabled={loading || !twoFAToken}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                          fontWeight: 700,
                        }}
                      >
                        Verify 2FA
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotDialog} onClose={() => setForgotDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#1e3a5f' }}>
          Forgot Password
          {forgotStep > 1 && (
            <Typography variant="caption" sx={{ ml: 2, color: '#10b981' }}>
              Step {forgotStep} of 3
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {forgotMessage.text && (
              <Alert severity={forgotMessage.type === 'error' ? 'error' : 'success'} sx={{ mb: 2 }}>
                {forgotMessage.text}
              </Alert>
            )}
            {forgotStep === 1 && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter your registered email address.
                </Typography>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={forgotData.email}
                  onChange={handleForgotChange}
                  placeholder="your@email.com"
                />
              </>
            )}
            {forgotStep === 2 && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter the 6-digit OTP sent to your email.
                </Typography>
                <TextField
                  fullWidth
                  label="OTP"
                  name="otp"
                  value={forgotData.otp}
                  onChange={handleForgotChange}
                  placeholder="Enter 6-digit OTP"
                  inputProps={{ maxLength: 6 }}
                />
              </>
            )}
            {forgotStep === 3 && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter your new password.
                </Typography>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={forgotData.newPassword}
                  onChange={handleForgotChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={forgotData.confirmPassword}
                  onChange={handleForgotChange}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setForgotDialog(false)} disabled={forgotLoading}>Cancel</Button>
          {forgotStep === 1 && (
            <Button variant="contained" onClick={handleSendOTP} disabled={forgotLoading}
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          )}
          {forgotStep === 2 && (
            <Button variant="contained" onClick={handleVerifyOTP} disabled={forgotLoading}
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>
          )}
          {forgotStep === 3 && (
            <Button variant="contained" onClick={handleResetPassword} disabled={forgotLoading}
              sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
