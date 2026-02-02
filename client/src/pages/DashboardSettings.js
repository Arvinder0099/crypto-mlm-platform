import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  Grid,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

const DashboardSettings = () => {
  const [widgets, setWidgets] = useState({
    dailyAllotted: true,
    referralBonus: true,
    totalMembers: true,
    activeMembers: true,
    investments: true,
    withdrawals: true,
    creditDebit: true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchWithAuth('/api/admin/dashboard-settings');
      if (data.widgets) {
        setWidgets(data.widgets);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleToggle = (key) => {
    setWidgets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await fetchWithAuth('/api/admin/dashboard-settings', {
        method: 'PUT',
        body: JSON.stringify({ widgets })
      });

      if (result.success) {
        setMessage('✅ Dashboard settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const widgetList = [
    { key: 'dailyAllotted', label: 'Daily Allotted', icon: '💰' },
    { key: 'referralBonus', label: 'Referral Bonus Allotted', icon: '👥' },
    { key: 'totalMembers', label: 'Total Members', icon: '👨‍👩‍👧‍👦' },
    { key: 'activeMembers', label: 'Active Members', icon: '✅' },
    { key: 'investments', label: 'Investment Summary', icon: '📊' },
    { key: 'withdrawals', label: 'Withdrawal Summary', icon: '💸' },
    { key: 'creditDebit', label: 'Credit/Debit Summary', icon: '📈' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          ⚙️ Dashboard Settings
        </Typography>

        {message && (
          <Alert severity={message.includes('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
          Select which widgets to display in your admin dashboard:
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {widgetList.map((widget) => (
            <Grid item xs={12} sm={6} md={4} key={widget.key}>
              <Card sx={{ 
                border: widgets[widget.key] ? '2px solid #667eea' : '1px solid #eee',
                backgroundColor: widgets[widget.key] ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                transition: 'all 0.3s ease'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {widget.icon} {widget.label}
                      </Typography>
                    </Box>
                    <Switch
                      checked={widgets[widget.key]}
                      onChange={() => handleToggle(widget.key)}
                      color="primary"
                      size="medium"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 700,
              py: 1.2,
              px: 3,
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardSettings;
