import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  TrendingUp,
  Diamond,
  EmojiEvents,
  Info,
} from '@mui/icons-material';

const MLMPlans = () => {
  const plans = [
    {
      id: 1,
      name: 'INTRODUCTION PLAN',
      investment: '100 USDT',
      dailyEarn: '0.55 USDT',
      duration: 365,
      totalReturn: '200.75 USDT',
      icon: <Star sx={{ fontSize: 48, color: '#FFD700' }} />,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      popular: false,
      note: 'Minimum withdrawal: 10 USDT',
      features: [
        'Investment: 100 USDT',
        'Daily Earning: 0.55 USDT',
        'Duration: 365 Days',
        'Total Return: 200.75 USDT',
        'ROI: 200.75%',
      ],
      benefits: [
        'Perfect for beginners',
        'Low investment entry',
        'Daily passive income',
        'Long-term investment',
      ],
    },
    {
      id: 2,
      name: 'BASIC PLAN',
      investment: '250 USDT',
      dailyEarn: '1.25 USDT',
      duration: 400,
      totalReturn: '500 USDT',
      icon: <Star sx={{ fontSize: 48, color: '#C0C0C0' }} />,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      popular: false,
      note: 'Minimum withdrawal: 50 USDT',
      features: [
        'Investment: 250 USDT',
        'Daily Earning: 1.25 USDT',
        'Duration: 400 Days',
        'Total Return: 500 USDT',
        'ROI: 200%',
      ],
      benefits: [
        'Great starting point',
        'Consistent daily returns',
        'Higher earning potential',
        'Build your network',
      ],
    },
    {
      id: 3,
      name: 'BRONZE PLAN',
      investment: '500 USDT',
      dailyEarn: '2.5 USDT',
      duration: 400,
      totalReturn: '1000 USDT',
      icon: <Diamond sx={{ fontSize: 48, color: '#CD7F32' }} />,
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      popular: false,
      note: 'Minimum withdrawal: 50 USDT',
      features: [
        'Investment: 500 USDT',
        'Daily Earning: 2.5 USDT',
        'Duration: 400 Days',
        'Total Return: 1000 USDT',
        'ROI: 200%',
      ],
      benefits: [
        'Enhanced daily income',
        'Accelerated growth',
        'Premium support',
        'Team building tools',
      ],
    },
    {
      id: 4,
      name: 'SILVER PLAN',
      investment: '1000 USDT',
      dailyEarn: '5 USDT',
      duration: 400,
      totalReturn: '2000 USDT',
      icon: <Diamond sx={{ fontSize: 48, color: '#C0C0C0' }} />,
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      popular: true,
      note: 'Minimum withdrawal: 50 USDT',
      features: [
        'Investment: 1000 USDT',
        'Daily Earning: 5 USDT',
        'Duration: 400 Days',
        'Total Return: 2000 USDT',
        'ROI: 200%',
      ],
      benefits: [
        'Most popular choice',
        'Optimal ROI balance',
        'Priority customer service',
        'Advanced analytics',
      ],
    },
    {
      id: 5,
      name: 'GOLD PLAN',
      investment: '2000 USDT',
      dailyEarn: '10 USDT',
      duration: 400,
      totalReturn: '4000 USDT',
      icon: <EmojiEvents sx={{ fontSize: 48, color: '#FFD700' }} />,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      popular: false,
      note: 'Minimum withdrawal: 50 USDT',
      features: [
        'Investment: 2000 USDT',
        'Daily Earning: 10 USDT',
        'Duration: 400 Days',
        'Total Return: 4000 USDT',
        'ROI: 200%',
      ],
      benefits: [
        'Elite earning tier',
        'Maximum daily returns',
        'VIP support access',
        'Leadership bonuses',
      ],
    },
    {
      id: 6,
      name: 'PLATINUM PLAN',
      investment: '5000 USDT',
      dailyEarn: '40 USDT',
      duration: 400,
      totalReturn: '16000 USDT',
      icon: <EmojiEvents sx={{ fontSize: 48, color: '#E5E4E2' }} />,
      color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      popular: false,
      note: 'COMING SOON',
      features: [
        'Investment: 5000 USDT',
        'Daily Earning: 40 USDT',
        'Duration: 400 Days',
        'Total Return: 16000 USDT',
        'ROI: 320%',
      ],
      benefits: [
        'Highest earning potential',
        'Exclusive rewards',
        'Dedicated account manager',
        'Top-tier commission structure',
      ],
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>
          Investment Plans
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose the perfect plan to start your investment journey. Higher plans unlock more earning opportunities and benefits.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Note:</strong> All plans include daily ROI, binary income, and level income. Upgrade anytime to unlock higher earning potential.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={3} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                },
                border: plan.popular ? '3px solid #f5576c' : '1px solid #e0e0e0',
              }}
            >
              {plan.popular && (
                <Chip
                  label="MOST POPULAR"
                  color="error"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontWeight: 700,
                    zIndex: 1,
                  }}
                />
              )}

              <Box
                sx={{
                  background: plan.color,
                  p: 3,
                  textAlign: 'center',
                  color: 'white',
                }}
              >
                {plan.icon}
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
                  {plan.name}
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 800 }}>
                  {plan.investment}
                </Typography>
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ mb: 3, textAlign: 'center', bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {plan.dailyEarn}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Daily Earning
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    For {plan.duration} Days
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e', mt: 1 }}>
                    = {plan.totalReturn}
                  </Typography>
                </Box>

                {plan.note && (
                  <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {plan.note}
                    </Typography>
                  </Alert>
                )}

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#1a237e' }}>
                  KEY FEATURES
                </Typography>
                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 3, mb: 1, color: '#1a237e' }}>
                  BENEFITS
                </Typography>
                <List dense>
                  {plan.benefits.map((benefit, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <TrendingUp sx={{ fontSize: 18, color: '#2196f3' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={benefit}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Comparison Section */}
      <Box sx={{ mt: 6, p: 4, bgcolor: '#f5f5f5', borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Plan Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <Star sx={{ fontSize: 48, color: '#FFD700', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                6
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Investment Plans
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <TrendingUp sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                Up to 40 USDT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily Earning
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <Diamond sx={{ fontSize: 48, color: '#f5576c', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                365-400
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days Duration
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <EmojiEvents sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                Up to 320%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total ROI
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MLMPlans;
