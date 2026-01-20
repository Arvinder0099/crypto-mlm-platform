import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
} from '@mui/material';

const ManagePopup = () => {
  const [popupSettings, setPopupSettings] = useState({
    enabled: true,
    title: 'Welcome to Crypto MLM Platform',
    message: 'Join our amazing community and start earning today! Register now to get exclusive bonuses.',
    buttonText: 'Get Started',
    buttonLink: '/register',
    showOnHomepage: true,
    showOnDashboard: false,
    displayDuration: '5',
    showCloseButton: true,
  });

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setPopupSettings({
      ...popupSettings,
      [field]: value,
    });
  };

  const handleSave = () => {
    console.log('Save popup settings:', popupSettings);
    // Add API call here
  };

  const handlePreview = () => {
    console.log('Preview popup');
    // Show popup preview
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          MANAGE POPUP
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Settings - Popup Configuration
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Popup Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Enable Popup */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={popupSettings.enabled}
                  onChange={handleChange('enabled')}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Enable Popup
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Popup Content */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Popup Content
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Popup Title
            </Typography>
            <TextField
              fullWidth
              value={popupSettings.title}
              onChange={handleChange('title')}
              size="small"
              placeholder="Enter popup title"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Popup Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={popupSettings.message}
              onChange={handleChange('message')}
              size="small"
              placeholder="Enter popup message"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Button Text
            </Typography>
            <TextField
              fullWidth
              value={popupSettings.buttonText}
              onChange={handleChange('buttonText')}
              size="small"
              placeholder="e.g., Get Started, Learn More"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Button Link
            </Typography>
            <TextField
              fullWidth
              value={popupSettings.buttonLink}
              onChange={handleChange('buttonLink')}
              size="small"
              placeholder="e.g., /register, /features"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Display Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Display Settings
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={popupSettings.showOnHomepage}
                  onChange={handleChange('showOnHomepage')}
                  color="primary"
                />
              }
              label="Show on Homepage"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={popupSettings.showOnDashboard}
                  onChange={handleChange('showOnDashboard')}
                  color="primary"
                />
              }
              label="Show on Dashboard"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Display Duration (seconds)
            </Typography>
            <TextField
              fullWidth
              value={popupSettings.displayDuration}
              onChange={handleChange('displayDuration')}
              size="small"
              type="number"
              placeholder="Auto-close after X seconds (0 = manual close)"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={popupSettings.showCloseButton}
                  onChange={handleChange('showCloseButton')}
                  color="primary"
                />
              }
              label="Show Close Button"
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                }}
              >
                Save Settings
              </Button>
              <Button
                variant="outlined"
                onClick={handlePreview}
                sx={{
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                }}
              >
                Preview Popup
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ManagePopup;
