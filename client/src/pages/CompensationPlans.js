import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import {
  AccountTree,
  TrendingUp,
  MonetizationOn,
  CheckCircle,
  Star,
  Timeline,
  Group,
  Calculate,
} from '@mui/icons-material';

const CompensationPlans = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const plans = [
    {
      name: 'Generation Plan',
      icon: <Group color="primary" />,
      description: 'Generation-based commissions with level depth control and leadership bonuses',
      features: [
        'Level-based commission percentages across generations',
        'Unlimited width with controllable depth payouts',
        'Leadership and rank advancement bonuses',
        'Fast-start bonuses for new referrals',
        'Matching bonuses for team leaders',
        'Flexible generation configuration (e.g., Gen 1-7)'
      ],
      benefits: [
        'Simple, scalable structure',
        'Direct control over team growth',
        'Strong leadership incentives',
        'High earning potential across multiple generations'
      ],
      commission: 'Up to 25% across generations',
      minInvestment: '$25',
      maxEarning: 'Unlimited'
    }
  ];

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const PlanDetails = ({ plan }) => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              {plan.icon}
              <Typography variant="h5" ml={2}>
                {plan.name}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {plan.description}
            </Typography>
            
            <Box mb={3}>
              <Typography variant="h6" mb={2}>Key Features</Typography>
              <List dense>
                {plan.features.map((feature, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" mb={2}>Plan Benefits</Typography>
            <List dense>
              {plan.benefits.map((benefit, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemIcon>
                    <Star color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="text.secondary">
                Commission Rate:
              </Typography>
              <Chip label={plan.commission} color="primary" size="small" />
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2" color="text.secondary">
                Min Investment:
              </Typography>
              <Chip label={plan.minInvestment} color="secondary" size="small" />
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="body2" color="text.secondary">
                Max Earning:
              </Typography>
              <Chip label={plan.maxEarning} color="success" size="small" />
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<MonetizationOn />}
              size="large"
            >
              Choose This Plan
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generation Compensation Plan
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Configure and view the single Generation-based compensation plan for your organization.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This platform uses a Generation Plan for commissions. Contact support for custom generation configurations.
        </Typography>
      </Alert>

      <Paper elevation={2}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {plans.map((plan, index) => (
            <Tab
              key={index}
              label={plan.name}
              icon={plan.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {plans.map((plan, index) => (
          <TabPanel key={index} value={selectedTab} index={index}>
            <PlanDetails plan={plan} />
          </TabPanel>
        ))}
      </Paper>

      <Card sx={{ mt: 4 }} elevation={3}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Need Help Choosing?
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Our experts can help you select the best compensation plan for your business model.
          </Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Group />}>
              Schedule Consultation
            </Button>
            <Button variant="outlined" startIcon={<Calculate />}>
              Use Plan Calculator
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompensationPlans;