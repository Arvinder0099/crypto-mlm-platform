import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, Divider, CircularProgress } from '@mui/material';
import { fetchJSON } from '../utils/api';
import CampaignIcon from '@mui/icons-material/Campaign';

const UserAnnouncement = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      // Use fetchJSON instead of api.get
      const data = await fetchJSON('/api/announcement');
      setAnnouncement(data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!announcement || !announcement.isVisible) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CampaignIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
                No active announcements at the moment.
            </Typography>
        </Paper>
      </Container>
    );
  }

  // Pre-process text to handle newlines
  const formattedContent = announcement.content.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CampaignIcon sx={{ fontSize: 40, color: '#ffb700', mr: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
            {announcement.title}
          </Typography>
        </Box>
        
        {announcement.imageUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, bgcolor: '#f1f5f9', p: 2, borderRadius: 4 }}>
            <img 
              src={announcement.imageUrl} 
              alt="Announcement" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                maxHeight: '800px',
                borderRadius: '12px', 
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
              }} 
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="body1" component="div" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#334155' }}>
                {formattedContent}
            </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserAnnouncement;
