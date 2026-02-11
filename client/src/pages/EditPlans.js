import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Save,
  Cancel,
  Star,
} from '@mui/icons-material';

const EditPlans = () => {
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'INTRODUCTION PLAN',
      investment: '100',
      dailyEarn: '0.55',
      duration: 365,
      totalReturn: '200.75',
      note: 'Minimum withdrawal: 10 USDT',
      roi: '200.75',
    },
    {
      id: 2,
      name: 'BASIC PLAN',
      investment: '250',
      dailyEarn: '1.25',
      duration: 400,
      totalReturn: '500',
      note: 'Minimum withdrawal: 50 USDT',
      roi: '200',
    },
    {
      id: 3,
      name: 'BRONZE PLAN',
      investment: '500',
      dailyEarn: '2.5',
      duration: 400,
      totalReturn: '1000',
      note: 'Minimum withdrawal: 50 USDT',
      roi: '200',
    },
    {
      id: 4,
      name: 'SILVER PLAN',
      investment: '1000',
      dailyEarn: '5',
      duration: 400,
      totalReturn: '2000',
      note: 'Minimum withdrawal: 50 USDT',
      roi: '200',
    },
    {
      id: 5,
      name: 'GOLD PLAN',
      investment: '2000',
      dailyEarn: '10',
      duration: 400,
      totalReturn: '4000',
      note: 'Minimum withdrawal: 50 USDT',
      roi: '200',
    },
    {
      id: 6,
      name: 'PLATINUM PLAN',
      investment: '5000',
      dailyEarn: '40',
      duration: 400,
      totalReturn: '16000',
      note: 'COMING SOON',
      roi: '320',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    investment: '',
    dailyEarn: '',
    duration: '',
    totalReturn: '',
    note: '',
    roi: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      investment: plan.investment,
      dailyEarn: plan.dailyEarn,
      duration: plan.duration,
      totalReturn: plan.totalReturn,
      note: plan.note,
      roi: plan.roi,
    });
    setOpenDialog(true);
  };

  const handleDelete = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== planId));
      setSnackbar({ open: true, message: 'Plan deleted successfully', severity: 'success' });
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.investment || !formData.dailyEarn || !formData.duration) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    if (editingPlan) {
      // Update existing plan
      setPlans(plans.map(p => 
        p.id === editingPlan.id 
          ? { ...p, ...formData }
          : p
      ));
      setSnackbar({ open: true, message: 'Plan updated successfully', severity: 'success' });
    } else {
      // Add new plan
      const newPlan = {
        id: Math.max(...plans.map(p => p.id)) + 1,
        ...formData,
      };
      setPlans([...plans, newPlan]);
      setSnackbar({ open: true, message: 'Plan added successfully', severity: 'success' });
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      investment: '',
      dailyEarn: '',
      duration: '',
      totalReturn: '',
      note: '',
      roi: '',
    });
  };

  const handleAddNew = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      investment: '',
      dailyEarn: '',
      duration: '',
      totalReturn: '',
      note: '',
      roi: '',
    });
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>
            Edit Investment Plans
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all investment plans available to users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          Add New Plan
        </Button>
      </Box>

      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          sx={{ mb: 3 }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Plan Name</strong></TableCell>
              <TableCell align="right"><strong>Investment (USDT)</strong></TableCell>
              <TableCell align="right"><strong>Daily Earn (USDT)</strong></TableCell>
              <TableCell align="right"><strong>Duration (Days)</strong></TableCell>
              <TableCell align="right"><strong>Total Return (USDT)</strong></TableCell>
              <TableCell align="right"><strong>ROI %</strong></TableCell>
              <TableCell><strong>Note</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {plan.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">{plan.investment}</TableCell>
                <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  {plan.dailyEarn}
                </TableCell>
                <TableCell align="right">{plan.duration}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {plan.totalReturn}
                </TableCell>
                <TableCell align="right">
                  <Chip 
                    label={`${plan.roi}%`} 
                    size="small" 
                    sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {plan.note}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(plan)}
                      sx={{ color: '#1976d2' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(plan.id)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit/Add Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f5f5f5', fontWeight: 700 }}>
          {editingPlan ? 'Edit Plan' : 'Add New Plan'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plan Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Investment (USDT)"
                type="number"
                value={formData.investment}
                onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Daily Earning (USDT)"
                type="number"
                value={formData.dailyEarn}
                onChange={(e) => setFormData({ ...formData, dailyEarn: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (Days)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Return (USDT)"
                type="number"
                value={formData.totalReturn}
                onChange={(e) => setFormData({ ...formData, totalReturn: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ROI %"
                type="number"
                value={formData.roi}
                onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Note / Minimum Withdrawal"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="e.g., Minimum withdrawal: 50 USDT"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<Cancel />}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            startIcon={<Save />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 700,
            }}
          >
            Save Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditPlans;
