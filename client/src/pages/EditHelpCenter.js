import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { fetchWithAuth } from '../utils/api';

const EditHelpCenter = () => {
  const [formData, setFormData] = useState({
    whatsappNumber: '447402078220',
    email: 'help@hexanova.net',
    supportHours: '24/7',
    responseTime: 'Within 2 hours',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/help-config', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          whatsappNumber: data.whatsappNumber || '447402078220',
          email: data.email || 'help@hexanova.net',
          supportHours: data.supportHours || '24/7',
          responseTime: data.responseTime || 'Within 2 hours',
        });
      }
    } catch (error) {
      console.error('Error fetching help config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await fetchWithAuth('/api/admin/help-config', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setMessage({ type: 'success', text: 'Help Center settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating settings.' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Edit Help Center
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure the contact details shown on the Help Center page for users.
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="WhatsApp Number (no + sign, e.g. 447402078220)"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            margin="normal"
            required
            helperText="International format without + sign. This number will be used for wa.me link."
          />

          <TextField
            fullWidth
            label="Support Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Support Hours"
            name="supportHours"
            value={formData.supportHours}
            onChange={handleChange}
            margin="normal"
            helperText="e.g. 24/7, Mon-Fri 9AM-6PM"
          />

          <TextField
            fullWidth
            label="Response Time"
            name="responseTime"
            value={formData.responseTime}
            onChange={handleChange}
            margin="normal"
            helperText="e.g. Within 2 hours, Same day"
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditHelpCenter;
