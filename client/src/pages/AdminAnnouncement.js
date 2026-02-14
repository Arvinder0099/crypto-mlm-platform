import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, TextField, Button, Switch, FormControlLabel, CircularProgress, Alert } from '@mui/material';
import { fetchJSON } from '../utils/api';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AdminAnnouncement = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isVisible: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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
        if (data.imageUrl) setImagePreview(data.imageUrl);
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
    // If user manually types imageUrl, update preview
    if (name === 'imageUrl') {
      setImagePreview(value);
      setImageFile(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL field when file selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      
      if (imageFile) {
        // Use FormData for file upload
        const fd = new FormData();
        fd.append('title', formData.title);
        fd.append('content', formData.content);
        fd.append('isVisible', formData.isVisible);
        fd.append('image', imageFile);
        
        const res = await fetch('/api/admin/announcement', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) throw new Error('Upload failed');
        const result = await res.json();
        if (result.announcement?.imageUrl) {
          setFormData(prev => ({ ...prev, imageUrl: result.announcement.imageUrl }));
          setImagePreview(result.announcement.imageUrl);
        }
      } else {
        // JSON body (URL-based image)
        const res = await fetch('/api/admin/announcement', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Update failed');
      }
      
      setMessage({ type: 'success', text: 'Announcement updated successfully!' });
      setImageFile(null);
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
            helperText="Paste an image link, or upload a file below"
            disabled={!!imageFile}
          />

          <Box sx={{ mt: 1, mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mr: 2 }}
            >
              Upload Image
              <input type="file" accept="image/*" hidden onChange={handleFileSelect} />
            </Button>
            {imageFile && (
              <Typography variant="caption" color="text.secondary">
                {imageFile.name}
              </Typography>
            )}
          </Box>

          {imagePreview && (
            <Box sx={{ my: 2, textAlign: 'center', bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </Box>
          )}

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
