import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3040';

const AdminActivation = () => {
  const [formData, setFormData] = useState({
    memberId: '',
    memberName: '',
    package: '',
    investmentAmount: '',
    paymentMode: 'tether',
    referenceNo: '',
    returnType: 'Allow ROI',
    investmentType: 'Actual Investment',
  });

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch members and plans on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch members
        const membersRes = await fetch(`${API_BASE}/api/admin/members`, { headers });
        const membersData = await membersRes.json();
        setMembers(membersData.members || membersData.data || []);

        // Fetch plans
        const plansRes = await fetch(`${API_BASE}/api/plans`, { headers });
        const plansData = await plansRes.json();
        setPlans(plansData.plans || plansData.data || plansData || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paymentModes = [
    { value: 'tether', label: 'Tether USDT (TRC20)' },
    { value: 'bitcoin', label: 'Bitcoin' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'usdt_erc20', label: 'USDT (ERC20)' },
    { value: 'admin_credit', label: 'Admin Credit' },
  ];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleMemberSelect = (event, value) => {
    setSelectedMember(value);
    if (value) {
      setFormData({
        ...formData,
        memberId: value.userId,
        memberName: value.userName || `${value.firstName || ''} ${value.lastName || ''}`,
      });
    } else {
      setFormData({ ...formData, memberId: '', memberName: '' });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.memberId) {
      setError('Please select a member');
      return;
    }
    if (!formData.investmentAmount || isNaN(formData.investmentAmount) || Number(formData.investmentAmount) <= 0) {
      setError('Please enter a valid investment amount');
      return;
    }
    if (!formData.paymentMode) {
      setError('Please select a payment mode');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      
      // Find the member by userId
      const member = members.find(m => m.userId === formData.memberId);
      if (!member) {
        setError('Member not found');
        setSubmitting(false);
        return;
      }

      // Create investment for the user
      const response = await fetch(`${API_BASE}/api/admin/activate-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: member._id,
          amount: Number(formData.investmentAmount),
          planId: formData.package || null,
          paymentMode: formData.paymentMode,
          referenceNo: formData.referenceNo,
          returnType: formData.returnType,
          investmentType: formData.investmentType
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Successfully activated ${formData.memberName} with $${formData.investmentAmount} investment!`);
        // Reset form
        setFormData({
          memberId: '',
          memberName: '',
          package: '',
          investmentAmount: '',
          paymentMode: 'tether',
          referenceNo: '',
          returnType: 'Allow ROI',
          investmentType: 'Actual Investment',
        });
        setSelectedMember(null);
      } else {
        setError(data.message || 'Failed to activate user');
      }
    } catch (err) {
      setError('Error activating user: ' + err.message);
    } finally {
      setSubmitting(false);
    }
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

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 4, fontWeight: 'bold' }}>
          Admin Subscription
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Member ID - Autocomplete */}
            <Grid item xs={12} md={4}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Member ID <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Autocomplete
                options={members}
                getOptionLabel={(option) => `${option.userId} - ${option.userName || option.firstName || 'N/A'}`}
                value={selectedMember}
                onChange={handleMemberSelect}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Search by User ID or Name" size="small" />
                )}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
              />
            </Grid>

            {/* Member Name (display only) */}
            <Grid item xs={12} md={4}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Member Name
              </Typography>
              <TextField
                fullWidth
                value={formData.memberName}
                size="small"
                disabled
                placeholder="Auto-filled"
              />
            </Grid>

            {/* Select Package */}
            <Grid item xs={12} md={4}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Select Package
              </Typography>
              <TextField
                fullWidth
                select
                value={formData.package}
                onChange={handleChange('package')}
                size="small"
              >
                <MenuItem value="">Default Plan</MenuItem>
                {plans.map((plan) => (
                  <MenuItem key={plan._id} value={plan._id}>
                    {plan.name} (${plan.minAmount} - ${plan.maxAmount})
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
                type="number"
                value={formData.investmentAmount}
                onChange={handleChange('investmentAmount')}
                placeholder="Enter amount (e.g., 100)"
                size="small"
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
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
                Reference No
              </Typography>
              <TextField
                fullWidth
                value={formData.referenceNo}
                onChange={handleChange('referenceNo')}
                placeholder="Enter Reference Number (optional)"
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
                <MenuItem value="Demo Investment">Demo Investment</MenuItem>
              </TextField>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                sx={{
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                  background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)',
                }}
              >
                {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Invest Now'}
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default AdminActivation;
