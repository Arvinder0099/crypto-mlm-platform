import React from 'react';
import { Paper, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MobileMenu = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const userItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Wallet', path: '/wallet' },
    { label: 'Invest', path: '/investments' },
    { label: 'Team', path: '/team-management' },
    { label: 'Reports', path: '/reports' },
    { label: 'Support', path: '/support' },
    { label: 'Profile', path: '/profile/edit' },
    { label: 'Deposit', path: '/deposit' },
    { label: 'Withdraw', path: '/withdrawal/request' },
    { label: 'Activation', path: '/activation' },
  ];

  const adminItems = [
    { label: 'Admin', path: '/admin' },
    { label: 'Members Management', path: '/members-area' },
    { label: 'Activation Options', path: '/activation-options' },
    { label: 'Withdrawal Management', path: '/withdrawal-management' },
    { label: 'Financial Reports', path: '/financial-reports' },
    { label: 'Admin Settings', path: '/admin-settings' },
    { label: 'Security & Compliance', path: '/security-compliance' },
    { label: 'KYC Approvals', path: '/admin/kyc' },
    { label: 'Analytics & Reports', path: '/analytics' },
    { label: 'Reports', path: '/reports' },
    // Removed: { label: 'MLM Features', path: '/features' },
    { label: 'Generation Plan', path: '/compensation-plans' },
  ];

  const items = isAdmin() ? adminItems : userItems;

  return (
    <Paper elevation={0} sx={{ p: 1, mb: 1, bgcolor: 'transparent' }}>
      <Grid container spacing={1}>
        {items.map((item) => (
          <Grid item xs={6} key={item.path}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={() => navigate(item.path)}
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default MobileMenu;