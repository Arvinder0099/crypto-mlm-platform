import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';

const DepositAddressSetup = () => {
  const [formData, setFormData] = useState({
    paymentMode: '',
    depositAddress: '',
  });

  const paymentModes = [
    { value: 'usdt-trc20', label: 'Tether USDT(TRC20)' },
    { value: 'usdt-bep20', label: 'USDT BEP20' },
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
    console.log('Change deposit address:', formData);
    // Add API call here
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        DEPOSIT ADDRESS CONTROL
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 800 }}>
        <Typography variant="h6" sx={{ mb: 4, fontWeight: 'bold' }}>
          Deposit Address Control
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Payment Mode */}
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Payment Mode <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              select
              value={formData.paymentMode}
              onChange={handleChange('paymentMode')}
              size="small"
            >
              <MenuItem value="">Select Payment Mode</MenuItem>
              {paymentModes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Deposit Payment Address */}
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Deposit Payment Address <span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.depositAddress}
              onChange={handleChange('depositAddress')}
              placeholder="Enter deposit payment address"
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
              Change Address
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default DepositAddressSetup;
