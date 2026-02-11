import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
} from '@mui/material';

const ChangeSponsor = () => {
  const [formData, setFormData] = useState({
    memberId: '',
    currentSponsor: '',
    newSponsor: '',
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = () => {
    console.log('Change sponsor:', formData);
    // Add API call here to change sponsor
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        SPONSOR CHANGE
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 800 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Sponsor Change
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Enter Member ID */}
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Enter Member ID <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={formData.memberId}
              onChange={handleChange('memberId')}
              placeholder="Enter Member ID"
              size="small"
            />
          </Box>

          {/* Current Sponsor */}
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Current Sponsor <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={formData.currentSponsor}
              onChange={handleChange('currentSponsor')}
              placeholder="Current Sponsor ID"
              size="small"
              disabled
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Box>

          {/* New Sponsor */}
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              New Sponsor <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={formData.newSponsor}
              onChange={handleChange('newSponsor')}
              placeholder="Enter New Sponsor ID"
              size="small"
            />
          </Box>

          {/* Submit Button */}
          <Box>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1,
              }}
            >
              Change Sponsor
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangeSponsor;
