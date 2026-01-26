import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';

const AdminSettingPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Crypto MLM Platform',
    siteEmail: 'admin@cryptomlm.com',
    supportEmail: 'support@cryptomlm.com',
    contactPhone: '+1-234-567-8900',
    siteAddress: '123 Blockchain Street, Crypto City',
    maintenanceMode: false,
    registrationEnabled: true,
    withdrawalEnabled: true,
    depositEnabled: true,
    minWithdrawal: '10',
    maxWithdrawal: '10000',
    withdrawalFee: '10',
    referralBonus: '5',
    levelIncomeEnabled: true,
    rankIncomeEnabled: true,
  });

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/settings/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ADMIN SETTING
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Settings - Admin Configuration
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          General Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Site Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Site Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Site Name
            </Typography>
            <TextField
              fullWidth
              value={settings.siteName}
              onChange={handleChange('siteName')}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Site Email
            </Typography>
            <TextField
              fullWidth
              value={settings.siteEmail}
              onChange={handleChange('siteEmail')}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Support Email
            </Typography>
            <TextField
              fullWidth
              value={settings.supportEmail}
              onChange={handleChange('supportEmail')}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Contact Phone
            </Typography>
            <TextField
              fullWidth
              value={settings.contactPhone}
              onChange={handleChange('contactPhone')}
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Site Address
            </Typography>
            <TextField
              fullWidth
              value={settings.siteAddress}
              onChange={handleChange('siteAddress')}
              size="small"
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* System Controls */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              System Controls
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={handleChange('maintenanceMode')}
                  color="primary"
                />
              }
              label="Maintenance Mode"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.registrationEnabled}
                  onChange={handleChange('registrationEnabled')}
                  color="primary"
                />
              }
              label="Enable Registration"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.withdrawalEnabled}
                  onChange={handleChange('withdrawalEnabled')}
                  color="primary"
                />
              }
              label="Enable Withdrawal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.depositEnabled}
                  onChange={handleChange('depositEnabled')}
                  color="primary"
                />
              }
              label="Enable Deposit"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Financial Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Financial Settings
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Minimum Withdrawal ($)
            </Typography>
            <TextField
              fullWidth
              value={settings.minWithdrawal}
              onChange={handleChange('minWithdrawal')}
              size="small"
              type="number"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Maximum Withdrawal ($)
            </Typography>
            <TextField
              fullWidth
              value={settings.maxWithdrawal}
              onChange={handleChange('maxWithdrawal')}
              size="small"
              type="number"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Withdrawal Fee (%)
            </Typography>
            <TextField
              fullWidth
              value={settings.withdrawalFee}
              onChange={handleChange('withdrawalFee')}
              size="small"
              type="number"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Referral Bonus (%)
            </Typography>
            <TextField
              fullWidth
              value={settings.referralBonus}
              onChange={handleChange('referralBonus')}
              size="small"
              type="number"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Income Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Income Settings
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.levelIncomeEnabled}
                  onChange={handleChange('levelIncomeEnabled')}
                  color="primary"
                />
              }
              label="Enable Level Income"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.rankIncomeEnabled}
                  onChange={handleChange('rankIncomeEnabled')}
                  color="primary"
                />
              }
              label="Enable Rank Income"
            />
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1,
                mt: 2,
              }}
            >
              Save Settings
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminSettingPage;
