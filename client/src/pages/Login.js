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
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon, 
  Security,
  TrendingUp,
  Groups,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchJSON } from '../utils/api';

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
  
  const navigate = useNavigate();
  const { login, ROLES } = useAuth();

  // Generate floating particles effect
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            width: 3,
            height: 3,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            left: `${particle.left}%`,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(100vh) scale(0)',
                opacity: 0,
              },
              '50%': {
                opacity: 1,
              },
              '100%': {
                transform: 'translateY(-100px) scale(1)',
              },
            },
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 0 } }}>
        {/* Mobile Header - only shown on small screens */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            Crypto MLM Platform
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
            Start Your Journey to Financial Freedom
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="center">
          {/* Left Side - Features */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ color: 'white', pr: 4 }}>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                Crypto MLM Platform
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
                Start Your Journey to Financial Freedom
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.3)', p: 1.5, borderRadius: 2 }}>
                        <TrendingUp sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Daily ROI</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          Earn up to 320% returns on your investments
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.3)', p: 1.5, borderRadius: 2 }}>
                        <Groups sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Team Building</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          Build your network and earn passive income
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.3)', p: 1.5, borderRadius: 2 }}>
                        <Security sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>Secure Platform</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          Bank-level security with 2FA authentication
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<CheckCircle />} 
                  label="6 Investment Plans" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="Real-time Tracking" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                />
                <Chip 
                  icon={<CheckCircle />} 
                  label="24/7 Support" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={24} 
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 }, 
                borderRadius: { xs: 2, sm: 3, md: 4 },
                backdropFilter: 'blur(20px)',
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                mx: { xs: 1, sm: 0 },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: { xs: 48, sm: 64 },
                    height: { xs: 48, sm: 64 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
                  }}
                >
                  <LoginIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: 'white' }} />
                </Box>
                
                <Typography 
                  component="h1" 
                  variant="h4" 
                  sx={{ fontWeight: 700, mb: 1, color: '#1a237e', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                  Sign in to continue your journey
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                    disabled={loading || twoFARequired}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/register')}
                      type="button"
                      sx={{ 
                        color: '#667eea',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Don't have an account? Sign Up
                    </Link>
                  </Box>

                  {twoFARequired && (
                    <Box sx={{ 
                      mt: 3, 
                      p: 3, 
                      border: '2px solid #667eea',
                      borderRadius: 2,
                      bgcolor: 'rgba(102, 126, 234, 0.05)',
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                        Two-Factor Authentication
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
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    </Box>
  );
};

export default Login;
