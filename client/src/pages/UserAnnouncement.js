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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <CampaignIcon sx={{ fontSize: 40, color: '#ffb700', mr: { xs: 0, sm: 2 } }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1e293b', wordBreak: 'break-word', fontSize: { xs: '1.4rem', sm: '2rem' } }}>
            {announcement.title}
          </Typography>
        </Box>
        
        {announcement.imageUrl && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, bgcolor: '#f1f5f9', p: 2, borderRadius: 4 }}>
            <img 
              src={announcement.imageUrl.startsWith('http') ? announcement.imageUrl : (announcement.imageUrl.startsWith('/') ? announcement.imageUrl : `/${announcement.imageUrl}`)} 
              alt="Announcement" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                maxHeight: '800px',
                borderRadius: '12px', 
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Typography variant="body1" component="div" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, lineHeight: 1.8, color: '#334155', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {formattedContent}
            </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserAnnouncement;
