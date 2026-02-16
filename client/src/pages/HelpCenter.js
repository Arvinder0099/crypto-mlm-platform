import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Card, CardContent, CardActionArea,
  Avatar, Divider, Chip, useTheme, useMediaQuery, CircularProgress, Alert
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  SupportAgent as SupportIcon,
  AccessTime as ClockIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

const HelpCenter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [helpConfig, setHelpConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default config (used if no admin config exists)
  const defaultConfig = {
    whatsappNumber: '447402078220',
    email: 'help@hexanova.net',
    supportHours: '24/7',
    responseTime: 'Within 2 hours',
  };

  useEffect(() => {
    const fetchHelpConfig = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/help-config', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setHelpConfig(data);
        } else {
          setHelpConfig(defaultConfig);
        }
      } catch {
        setHelpConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };
    fetchHelpConfig();
  }, []);

  const config = helpConfig || defaultConfig;

  const handleWhatsApp = () => {
    const prefilledMessage = encodeURIComponent(
`Hello Hexanova Support! 👋

I need help with:

1️⃣ Deposit / Fund Wallet
2️⃣ Withdrawal Issue
3️⃣ Account / Profile Settings
4️⃣ Investment Plans & Returns
5️⃣ Referral & Bonus

Please reply with the number of your query and we'll assist you right away!`
    );
    const url = `https://wa.me/${config.whatsappNumber}?text=${prefilledMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${config.email}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 5 } }}>
        <Avatar
          sx={{
            width: 80, height: 80, mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.35)',
          }}
        >
          <SupportIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 1,
          }}
        >
          How can we help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Get in touch with our support team. We're here to assist you with any questions or concerns.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<ClockIcon sx={{ fontSize: 16 }} />}
            label={`Support: ${config.supportHours}`}
            size="small"
            sx={{
              bgcolor: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              fontWeight: 600,
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}
          />
          <Chip
            label={`Response: ${config.responseTime}`}
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              fontWeight: 600,
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          />
        </Box>
      </Box>

      {/* Contact Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 3,
        mb: 4,
      }}>
        {/* WhatsApp Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid rgba(37, 211, 102, 0.2)',
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.03) 0%, rgba(37, 211, 102, 0.08) 100%)',
            transition: 'all 0.3s ease',
            overflow: 'visible',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(37, 211, 102, 0.2)',
              border: '1px solid rgba(37, 211, 102, 0.4)',
            },
          }}
        >
          <CardActionArea onClick={handleWhatsApp} sx={{ p: 0 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 72, height: 72, mx: 'auto', mb: 2.5,
                  bgcolor: '#25D366',
                  boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
                }}
              >
                <WhatsAppIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Chat on WhatsApp
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quick responses for instant support. Tap to start a conversation with our team.
              </Typography>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                color: '#25D366', fontWeight: 600, fontSize: '0.9rem',
              }}>
                Open Chat <ArrowIcon sx={{ fontSize: 18 }} />
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Email Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid rgba(102, 126, 234, 0.2)',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.08) 100%)',
            transition: 'all 0.3s ease',
            overflow: 'visible',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
              border: '1px solid rgba(102, 126, 234, 0.4)',
            },
          }}
        >
          <CardActionArea onClick={handleEmail} sx={{ p: 0 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 72, height: 72, mx: 'auto', mb: 2.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
                }}
              >
                <EmailIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Email Support
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Send us a detailed message and our team will get back to you promptly.
              </Typography>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                color: '#667eea', fontWeight: 600, fontSize: '0.9rem',
              }}>
                {config.email} <ArrowIcon sx={{ fontSize: 18 }} />
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      {/* Info Footer */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 }, borderRadius: 3,
          bgcolor: 'rgba(248, 250, 252, 0.8)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Our support team is dedicated to helping you. For urgent matters, we recommend WhatsApp for the fastest response.
        </Typography>
      </Paper>
    </Container>
  );
};

export default HelpCenter;
