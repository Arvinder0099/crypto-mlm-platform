import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, keyframes, Chip } from '@mui/material';
import {
  PhoneAndroid,
  Language,
  CurrencyBitcoin,
  Security,
  Speed,
  Notifications,
  CloudDownload,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchJSON } from '../utils/api';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(3deg); }
  75% { transform: translateY(-10px) rotate(-3deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.4); }
  50% { box-shadow: 0 0 60px rgba(16,185,129,0.8), 0 0 100px rgba(16,185,129,0.3); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const slideUp = keyframes`
  0% { transform: translateY(40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const orbit = keyframes`
  0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
`;

const rise = keyframes`
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  50% { opacity: 0.8; }
  100% { transform: translateY(-100px) scale(1); opacity: 0; }
`;

const spin = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [appInfo, setAppInfo] = useState(null);
  const [particles, setParticles] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Fetch app info
    fetchJSON('/api/app/info')
      .then(data => setAppInfo(data))
      .catch(() => setAppInfo({ available: false }));

    // Generate particles
    setParticles(Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 18,
      size: 2 + Math.random() * 5,
    })));
  }, []);

  const handleDownloadApp = () => {
    setDownloading(true);
    const apiBase = process.env.REACT_APP_API_URL || '';
    // Use an anchor element with download attribute to prevent page navigation
    const link = document.createElement('a');
    link.href = `${apiBase}/api/download/app`;
    link.setAttribute('download', 'Hexanova.apk');
    link.setAttribute('target', '_blank');
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 3000);
  };

  const handleOpenWeb = () => {
    navigate('/login');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 30%, #0f2027 60%, #0a0a1a 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Animated gradient orbs */}
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        top: '-10%', left: '-5%', animation: `${pulse} 6s ease-in-out infinite`,
      }} />
      <Box sx={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        bottom: '-15%', right: '-10%', animation: `${pulse} 8s ease-in-out infinite`,
        animationDelay: '2s',
      }} />

      {/* Grid pattern */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Rising particles */}
      {particles.map(p => (
        <Box key={p.id} sx={{
          position: 'absolute', width: p.size, height: p.size, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.7), rgba(99,102,241,0.7))',
          left: `${p.left}%`, bottom: 0,
          animation: `${rise} ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}

      {/* Orbiting icons */}
      <Box sx={{
        position: 'absolute', width: 240, height: 240,
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', display: { xs: 'none', md: 'block' },
      }}>
        {['₿', 'Ξ', '₮', '◈'].map((icon, i) => (
          <Box key={i} sx={{
            position: 'absolute', top: '50%', left: '50%',
            width: 36, height: 36, borderRadius: '50%', ml: '-18px', mt: '-18px',
            background: i === 0 ? 'linear-gradient(135deg, #10b981, #34d399)' :
                       i === 1 ? 'linear-gradient(135deg, #627EEA, #8B9FEF)' :
                       i === 2 ? 'linear-gradient(135deg, #26A17B, #4ECDC4)' :
                                 'linear-gradient(135deg, #F3BA2F, #FFD93D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: `${orbit} ${10 + i * 3}s linear infinite`,
            animationDelay: `${i * -2.5}s`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            fontSize: 18, fontWeight: 900, color: 'white', fontFamily: 'monospace',
          }}>
            {icon}
          </Box>
        ))}
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        <Box sx={{
          textAlign: 'center',
          animation: `${slideUp} 0.8s ease-out`,
        }}>
          {/* Logo / 3D Coin */}
          <Box sx={{
            width: 100, height: 100, borderRadius: '50%', mx: 'auto', mb: 3,
            background: 'linear-gradient(135deg, #10b981, #34d399 50%, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: `${spin} 5s linear infinite, ${glow} 3s ease-in-out infinite`,
            boxShadow: '0 20px 60px rgba(16,185,129,0.5), inset 0 -3px 15px rgba(0,0,0,0.2)',
            perspective: 1000, transformStyle: 'preserve-3d',
            position: 'relative',
            '&::before': {
              content: '""', position: 'absolute', inset: 5, borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.3)',
            },
          }}>
            <CurrencyBitcoin sx={{ fontSize: 55, color: 'white', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }} />
          </Box>

          {/* Title */}
          <Typography variant="h2" sx={{
            fontWeight: 900, mb: 1, fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
            background: 'linear-gradient(135deg, #ffffff 0%, #10b981 40%, #34d399 60%, #ffffff 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: `${shimmer} 4s linear infinite`,
            letterSpacing: '-0.02em',
          }}>
            HEXANOVA
          </Typography>

          <Typography variant="h6" sx={{
            color: 'rgba(255,255,255,0.7)', mb: 1, fontWeight: 400,
            fontSize: { xs: '0.9rem', sm: '1.1rem' },
          }}>
            Your Gateway to Financial Freedom
          </Typography>

          {/* Trust badges */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4, flexWrap: 'wrap' }}>
            {['Secure', 'Fast', 'Trusted'].map((badge, i) => (
              <Chip key={i} size="small"
                icon={<CheckCircle sx={{ color: '#10b981 !important', fontSize: 16 }} />}
                label={badge}
                sx={{
                  bgcolor: 'rgba(16,185,129,0.1)', color: '#69F0AE',
                  border: '1px solid rgba(16,185,129,0.25)', fontWeight: 600, fontSize: '0.75rem',
                }}
              />
            ))}
          </Box>

          {/* Two big option cards */}
          <Box sx={{
            display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
            gap: 3, justifyContent: 'center', alignItems: 'stretch',
            animation: `${slideUp} 1s ease-out`,
            animationDelay: '0.2s', animationFillMode: 'both',
          }}>

            {/* === DOWNLOAD APP Card === */}
            <Box sx={{
              flex: 1, maxWidth: 380,
              background: 'linear-gradient(145deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 4, p: { xs: 3, sm: 4 }, cursor: 'pointer',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative', overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                border: '1px solid rgba(16,185,129,0.6)',
                boxShadow: '0 20px 60px rgba(16,185,129,0.25), 0 0 40px rgba(16,185,129,0.1)',
                '& .icon-bg': { transform: 'scale(1.1)', boxShadow: '0 15px 40px rgba(16,185,129,0.5)' },
                '& .arrow': { transform: 'translateX(5px)' },
              },
              '&::before': {
                content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #10b981, #34d399, #10b981)',
                backgroundSize: '200% 100%', animation: `${shimmer} 3s linear infinite`,
              },
            }}
            onClick={handleDownloadApp}
            >
              {/* Recommended badge */}
              <Box sx={{
                position: 'absolute', top: 16, right: 16,
                bgcolor: 'rgba(16,185,129,0.2)', color: '#10b981',
                px: 1.5, py: 0.3, borderRadius: 2, fontSize: '0.7rem',
                fontWeight: 700, letterSpacing: '0.05em', border: '1px solid rgba(16,185,129,0.3)',
              }}>
                RECOMMENDED
              </Box>

              <Box className="icon-bg" sx={{
                width: 72, height: 72, borderRadius: 3, mx: 'auto', mb: 2.5,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(16,185,129,0.35)',
                transition: 'all 0.4s ease',
              }}>
                <PhoneAndroid sx={{ fontSize: 36, color: 'white' }} />
              </Box>

              <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                Download App
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, lineHeight: 1.6 }}>
                Get the native Android app for the best experience with push notifications and offline access
              </Typography>

              {/* App features */}
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                {[
                  { icon: <Speed sx={{ fontSize: 18 }} />, text: 'Faster & smoother' },
                  { icon: <Notifications sx={{ fontSize: 18 }} />, text: 'Push notifications' },
                  { icon: <Security sx={{ fontSize: 18 }} />, text: 'Enhanced security' },
                ].map((feat, i) => (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, mb: 1,
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem',
                  }}>
                    <Box sx={{ color: '#10b981' }}>{feat.icon}</Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>{feat.text}</Typography>
                  </Box>
                ))}
              </Box>

              <Button fullWidth variant="contained" disabled={downloading}
                startIcon={<CloudDownload />}
                endIcon={<ArrowForward className="arrow" sx={{ transition: 'transform 0.3s' }} />}
                sx={{
                  py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
                  textTransform: 'none', letterSpacing: '0.02em',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 6px 30px rgba(16,185,129,0.6)',
                  },
                }}
              >
                {downloading ? 'Downloading...' : `Download APK${appInfo?.size ? ` (${appInfo.size})` : ''}`}
              </Button>

              {appInfo?.version && (
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1.5, color: 'rgba(255,255,255,0.4)' }}>
                  v{appInfo.version} • Android 7.0+
                </Typography>
              )}
            </Box>

            {/* === OPEN WEB Card === */}
            <Box sx={{
              flex: 1, maxWidth: 380,
              background: 'linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 4, p: { xs: 3, sm: 4 }, cursor: 'pointer',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative', overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                border: '1px solid rgba(99,102,241,0.6)',
                boxShadow: '0 20px 60px rgba(99,102,241,0.25), 0 0 40px rgba(99,102,241,0.1)',
                '& .icon-bg': { transform: 'scale(1.1)', boxShadow: '0 15px 40px rgba(99,102,241,0.5)' },
                '& .arrow': { transform: 'translateX(5px)' },
              },
              '&::before': {
                content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #6366f1, #818cf8, #6366f1)',
                backgroundSize: '200% 100%', animation: `${shimmer} 3s linear infinite`,
              },
            }}
            onClick={handleOpenWeb}
            >
              <Box className="icon-bg" sx={{
                width: 72, height: 72, borderRadius: 3, mx: 'auto', mb: 2.5, mt: { xs: 0, sm: 3.5 },
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(99,102,241,0.35)',
                transition: 'all 0.4s ease',
              }}>
                <Language sx={{ fontSize: 36, color: 'white' }} />
              </Box>

              <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                Open in Browser
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, lineHeight: 1.6 }}>
                Access Hexanova directly in your browser — no download needed, works on any device
              </Typography>

              {/* Web features */}
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                {[
                  { icon: <Language sx={{ fontSize: 18 }} />, text: 'Works on any device' },
                  { icon: <Speed sx={{ fontSize: 18 }} />, text: 'No installation required' },
                  { icon: <Security sx={{ fontSize: 18 }} />, text: 'Full-featured access' },
                ].map((feat, i) => (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, mb: 1,
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem',
                  }}>
                    <Box sx={{ color: '#818cf8' }}>{feat.icon}</Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>{feat.text}</Typography>
                  </Box>
                ))}
              </Box>

              <Button fullWidth variant="outlined"
                endIcon={<ArrowForward className="arrow" sx={{ transition: 'transform 0.3s' }} />}
                sx={{
                  py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2.5,
                  borderColor: 'rgba(99,102,241,0.5)', color: '#a5b4fc',
                  textTransform: 'none', letterSpacing: '0.02em',
                  '&:hover': {
                    borderColor: '#6366f1',
                    bgcolor: 'rgba(99,102,241,0.1)',
                    color: '#c7d2fe',
                  },
                }}
              >
                Continue to Web
              </Button>

              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1.5, color: 'rgba(255,255,255,0.4)' }}>
                Chrome, Safari, Firefox & more
              </Typography>
            </Box>
          </Box>

          {/* Install instructions */}
          <Box sx={{
            mt: 4, animation: `${slideUp} 1.2s ease-out`,
            animationDelay: '0.4s', animationFillMode: 'both',
          }}>
            <Box sx={{
              display: 'inline-flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)', px: 4, py: 2,
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}>
                  Step 1
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  📥 Download APK
                </Typography>
              </Box>
              <Box sx={{ color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center' }}>→</Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}>
                  Step 2
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  ⚙️ Allow Install
                </Typography>
              </Box>
              <Box sx={{ color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center' }}>→</Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 0.5 }}>
                  Step 3
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  🚀 Open & Enjoy
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Typography variant="caption" sx={{
            display: 'block', mt: 4, color: 'rgba(255,255,255,0.3)',
          }}>
            © 2026 Hexanova. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
