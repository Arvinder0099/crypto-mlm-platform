import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
} from '@mui/material';

const AdminActivation = () => {
  const [formData, setFormData] = useState({
    memberId: '',
    package: '',
    investmentAmount: '',
    paymentMode: '',
    referenceNo: '',
    returnType: 'Allow ROI',
    investmentType: 'Actual Investment',
  });

  const packages = [
    { value: 'plan-a', label: 'Plan A ( $ 100.00 - $ 1000000.00)' },
  ];

  const paymentModes = [
    { value: 'tether', label: 'Tether USDT(TRC20)' },
    { value: 'bitcoin', label: 'Bitcoin' },
    { value: 'ethereum', label: 'Ethereum' },
  ];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = () => {
    console.log('Admin Activation:', formData);
    // Add API call here
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ADMIN SUBSCRIPTION
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Subscription - Admin Subscription
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 4, fontWeight: 'bold' }}>
          Admin Subscription
        </Typography>

        <Grid container spacing={3}>
          {/* Member ID */}
          <Grid item xs={12} md={4}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Member ID <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={formData.memberId}
              onChange={handleChange('memberId')}
              placeholder="Enter Member ID"
              size="small"
            />
          </Grid>

          {/* Select Package */}
          <Grid item xs={12} md={4}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Select Package <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.package}
              onChange={handleChange('package')}
              size="small"
            >
              <MenuItem value="">Plan A ( $ 100.00 - $ 1000000.00)</MenuItem>
              {packages.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Investment Amount */}
          <Grid item xs={12} md={4}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Investment Amount <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={formData.investmentAmount}
              onChange={handleChange('investmentAmount')}
              placeholder="$100, $200 & $300, ..."
              size="small"
            />
          </Grid>

          {/* Select Payment Mode */}
          <Grid item xs={12} md={4}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Select Payment Mode <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.paymentMode}
              onChange={handleChange('paymentMode')}
              size="small"
            >
              <MenuItem value="">Select</MenuItem>
              {paymentModes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Reference No */}
          <Grid item xs={12} md={4}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Reference No <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={formData.referenceNo}
              onChange={handleChange('referenceNo')}
              placeholder="Enter Reference Number"
              size="small"
            />
          </Grid>

          {/* Return Type */}
          <Grid item xs={12} md={4}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Return Type <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.returnType}
              onChange={handleChange('returnType')}
              size="small"
            >
              <MenuItem value="Allow ROI">Allow ROI</MenuItem>
              <MenuItem value="No ROI">No ROI</MenuItem>
            </TextField>
          </Grid>

          {/* Investment Type */}
          <Grid item xs={12} md={4}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Investment Type <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.investmentType}
              onChange={handleChange('investmentType')}
              size="small"
            >
              <MenuItem value="Actual Investment">Actual Investment</MenuItem>
            </TextField>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1,
              }}
            >
              Invest Now
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminActivation;
