import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Avatar,
  Rating,
  Divider,
} from '@mui/material';
import {
  AccountTree,
  MonetizationOn,
  Security,
  Analytics,
  Group,
  TrendingUp,
  ShoppingCart,
  School,
  Support,
  CheckCircle,
  ExpandMore,
  Star,
  Verified,
  Speed,
  CloudDone,
  MobileFriendly,
  Language,
} from '@mui/icons-material';

const MLMFeatures = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const coreFeatures = [
    {
      title: 'Multi-Level Marketing Plans',
      description: 'Support for Binary, Matrix, Unilevel, and Hybrid compensation plans with real-time calculations',
      icon: <AccountTree color="primary" />,
      features: [
        'Binary Plan (2-leg structure)',
        'Matrix Plan (Fixed width/depth)',
        'Unilevel Plan (Unlimited width)',
        'Hybrid Plans (Custom combinations)',
        'Real-time commission calculations',
        'Spillover management'
      ],
      image: 'https://via.placeholder.com/400x250?text=MLM+Plans'
    },
    {
      title: 'Commission Management',
      description: 'Automated commission calculations with multiple payout options and detailed tracking',
      icon: <MonetizationOn color="secondary" />,
      features: [
        'Automated calculations',
        'Multiple payout methods',
        'Commission history tracking',
        'Tax reporting integration',
        'Bonus and incentive management',
        'Real-time earnings dashboard'
      ],
      image: 'https://via.placeholder.com/400x250?text=Commission+Management'
    },
    {
      title: 'Network Genealogy',
      description: 'Visual network tree with detailed member information and performance metrics',
      icon: <Group color="success" />,
      features: [
        'Interactive genealogy tree',
        'Member profile management',
        'Performance tracking',
        'Team analytics',
        'Rank progression tracking',
        'Spillover visualization'
      ],
      image: 'https://via.placeholder.com/400x250?text=Network+Tree'
    },
    {
      title: 'E-commerce Integration',
      description: 'Built-in product catalog with commission tracking and inventory management',
      icon: <ShoppingCart color="warning" />,
      features: [
        'Product catalog management',
        'Inventory tracking',
        'Order processing',
        'Commission on sales',
        'Digital product support',
        'Payment gateway integration'
      ],
      image: 'https://via.placeholder.com/400x250?text=E-commerce'
    }
  ];

  const advancedFeatures = [
    {
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and analytics for business insights',
      icon: <Analytics />,
      features: [
        'Sales performance reports',
        'Network growth analytics',
        'Commission reports',
        'Member activity tracking',
        'ROI calculations',
        'Predictive analytics'
      ]
    },
    {
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with compliance features',
      icon: <Security />,
      features: [
        'Two-factor authentication',
        'Data encryption',
        'Audit trails',
        'Compliance reporting',
        'KYC/AML integration',
        'GDPR compliance'
      ]
    },
    {
      title: 'Training & Support',
      description: 'Comprehensive training system and support tools',
      icon: <School />,
      features: [
        'Video training library',
        'Interactive courses',
        'Certification programs',
        'Live webinars',
        'Knowledge base',
        '24/7 support system'
      ]
    },
    {
      title: 'Mobile Optimization',
      description: 'Fully responsive design with mobile app support',
      icon: <MobileFriendly />,
      features: [
        'Responsive web design',
        'Mobile app available',
        'Offline functionality',
        'Push notifications',
        'Mobile payments',
        'Touch-optimized interface'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Network Leader',
      rating: 5,
      comment: 'This platform has revolutionized how we manage our MLM business. The genealogy tree and commission tracking are outstanding!',
      avatar: 'https://via.placeholder.com/50?text=SJ'
    },
    {
      name: 'Mike Chen',
      role: 'Business Owner',
      rating: 5,
      comment: 'The e-commerce integration and automated commission calculations have saved us countless hours. Highly recommended!',
      avatar: 'https://via.placeholder.com/50?text=MC'
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Team Manager',
      rating: 5,
      comment: 'The training system and analytics dashboard provide everything we need to grow our network effectively.',
      avatar: 'https://via.placeholder.com/50?text=LR'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 99,
      period: 'month',
      features: [
        'Up to 100 members',
        'Basic MLM plans',
        'Commission tracking',
        'Email support',
        'Mobile responsive'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: 299,
      period: 'month',
      features: [
        'Up to 1,000 members',
        'All MLM plans',
        'Advanced analytics',
        'E-commerce integration',
        'Priority support',
        'Custom branding'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 799,
      period: 'month',
      features: [
        'Unlimited members',
        'Custom features',
        'White-label solution',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ],
      popular: false
    }
  ];

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Complete Hexanova Features
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            Everything you need to build and manage a successful multi-level marketing business
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Chip icon={<Verified />} label="Trusted by 10,000+ businesses" color="primary" />
            <Chip icon={<Speed />} label="99.9% Uptime" color="success" />
            <Chip icon={<CloudDone />} label="Cloud-based" color="info" />
            <Chip icon={<Language />} label="Multi-language" color="warning" />
          </Box>
        </Box>

        {/* Feature Tabs */}
        <Paper elevation={2} sx={{ mb: 6 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Core Features" />
            <Tab label="Advanced Features" />
            <Tab label="Testimonials" />
            <Tab label="Pricing" />
          </Tabs>

          <TabPanel value={selectedTab} index={0}>
            <Grid container spacing={4}>
              {coreFeatures.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card elevation={3} sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={feature.image}
                      alt={feature.title}
                    />
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        {feature.icon}
                        <Typography variant="h6" ml={1}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {feature.description}
                      </Typography>
                      <List dense>
                        {feature.features.map((item, idx) => (
                          <ListItem key={idx} disablePadding>
                            <ListItemIcon>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
            <Grid container spacing={3}>
              {advancedFeatures.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center">
                        {feature.icon}
                        <Typography variant="h6" ml={2}>
                          {feature.title}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {feature.description}
                      </Typography>
                      <List dense>
                        {feature.features.map((item, idx) => (
                          <ListItem key={idx} disablePadding>
                            <ListItemIcon>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={selectedTab} index={2}>
            <Grid container spacing={3}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card elevation={3}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar src={testimonial.avatar} sx={{ mr: 2 }}>
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{testimonial.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                      <Typography variant="body2">
                        "{testimonial.comment}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={selectedTab} index={3}>
            <Grid container spacing={3} justifyContent="center">
              {pricingPlans.map((plan, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card 
                    elevation={plan.popular ? 6 : 3}
                    sx={{ 
                      position: 'relative',
                      border: plan.popular ? '2px solid #1976d2' : 'none'
                    }}
                  >
                    {plan.popular && (
                      <Chip
                        label="Most Popular"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: -10,
                          left: '50%',
                          transform: 'translateX(-50%)'
                        }}
                      />
                    )}
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="h5" gutterBottom>
                        {plan.name}
                      </Typography>
                      <Box mb={3}>
                        <Typography variant="h3" color="primary" component="span">
                          ${plan.price}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" component="span">
                          /{plan.period}
                        </Typography>
                      </Box>
                      <List>
                        {plan.features.map((feature, idx) => (
                          <ListItem key={idx} disablePadding>
                            <ListItemIcon>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                      <Button
                        variant={plan.popular ? "contained" : "outlined"}
                        fullWidth
                        size="large"
                        sx={{ mt: 3 }}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Paper>

        {/* CTA Section */}
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Ready to Transform Your MLM Business?
          </Typography>
          <Typography variant="h6" mb={3}>
            Join thousands of successful businesses using our platform
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Button variant="contained" color="secondary" size="large">
              Start Free Trial
            </Button>
            <Button variant="outlined" color="inherit" size="large">
              Schedule Demo
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MLMFeatures;