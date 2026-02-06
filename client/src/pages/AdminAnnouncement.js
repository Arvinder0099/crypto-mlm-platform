import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, TextField, Button, Switch, FormControlLabel, CircularProgress, Alert } from '@mui/material';
import { fetchJSON, fetchWithAuth } from '../utils/api';
import SaveIcon from '@mui/icons-material/Save';

const AdminAnnouncement = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isVisible: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const data = await fetchJSON('/api/announcement');
      if (data) {
        setFormData({
            title: data.title || '',
            content: data.content || '',
            imageUrl: data.imageUrl || '',
            isVisible: data.isVisible ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isVisible' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await fetchWithAuth('/api/admin/announcement', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setMessage({ type: 'success', text: 'Announcement updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating announcement.' });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Edit Announcement
        </Typography>
        
        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Image URL"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            margin="normal"
            helperText="Link to an image (optional)"
          />

          <TextField
            fullWidth
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            required
            multiline
            minRows={10}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isVisible}
                onChange={handleChange}
                name="isVisible"
                color="primary"
              />
            }
            label="Visible to Users"
            sx={{ mt: 2 }}
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
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AdminAnnouncement;
