import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  MonetizationOn,
  TrendingUp,
  Group,
  AccountBalance,
  SwapVert,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

const DashboardSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingField, setEditingField] = useState(null);
  
  // Dashboard values state
  const [dashboardValues, setDashboardValues] = useState({
    // Total Investment
    totalInvestment: 0,
    adminInvestment: 0,
    walletInvestment: 0,
    directInvestment: 0,
    
    // Income Summary
    dailyAllotted: 0,
    referralBonusAllotted: 0,
    
    // Member Count Statistics
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    suspendedMembers: 0,
    
    // Credit/Debit
    totalCredited: 0,
    todayCredited: 0,
    yesterdayCredited: 0,
    totalDebited: 0,
    todayDebited: 0,
    yesterdayDebited: 0,
    
    // Withdrawal Summary
    totalWithdrawal: 0,
    pendingWithdrawal: 0,
    approvedWithdrawal: 0,
    rejectedWithdrawal: 0,
  });

  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    loadDashboardValues();
  }, []);

  const loadDashboardValues = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/admin/dashboard-values');
      if (data.values) {
        setDashboardValues(data.values);
      }
    } catch (err) {
      console.error('Failed to load dashboard values:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue.toString());
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleSave = async (field) => {
    const newValue = parseFloat(tempValue) || 0;
    
    try {
      const result = await fetchWithAuth('/api/admin/dashboard-values', {
        method: 'PUT',
        body: JSON.stringify({ field, value: newValue })
      });

      if (result.success) {
        setDashboardValues(prev => ({
          ...prev,
          [field]: newValue
        }));
        setMessage(`✅ ${field} updated successfully!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ Failed to update: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage('❌ Failed to update value: ' + err.message);
    }
    
    setEditingField(null);
    setTempValue('');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const result = await fetchWithAuth('/api/admin/dashboard-values/all', {
        method: 'PUT',
        body: JSON.stringify({ values: dashboardValues })
      });

      if (result.success) {
        setMessage('✅ All dashboard values saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ Failed to save: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Save all error:', err);
      setMessage('❌ Failed to save values: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const EditableField = ({ label, field, icon, color = 'primary', isCurrency = true }) => {
    const isEditing = editingField === field;
    const value = dashboardValues[field] || 0;

    return (
      <Card sx={{ height: '100%', position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {label}
            </Typography>
            {icon}
          </Box>
          
          {isEditing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                size="small"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                type="number"
                autoFocus
                InputProps={isCurrency ? {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                } : {}}
                sx={{ flex: 1 }}
              />
              <IconButton 
                size="small" 
                color="success" 
                onClick={() => handleSave(field)}
                sx={{ bgcolor: 'success.light', '&:hover': { bgcolor: 'success.main', color: 'white' } }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="error" 
                onClick={handleCancel}
                sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: `${color}.main` }}>
                {isCurrency 
                  ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : value.toLocaleString()
                }
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleEdit(field, value)}
                sx={{ 
                  bgcolor: 'grey.100', 
                  '&:hover': { bgcolor: 'primary.main', color: 'white' } 
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            ⚙️ Edit Dashboard Values
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveAll}
            disabled={saving}
            size="large"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </Box>

        {message && (
          <Alert severity={message.includes('✅') ? 'success' : 'error'} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Click the <EditIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> icon next to any value to edit it. 
          Changes will be reflected immediately in the Admin Dashboard.
        </Typography>

        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<MonetizationOn />} label="Investment" iconPosition="start" />
          <Tab icon={<TrendingUp />} label="Income" iconPosition="start" />
          <Tab icon={<Group />} label="Members" iconPosition="start" />
          <Tab icon={<AccountBalance />} label="Credit/Debit" iconPosition="start" />
          <Tab icon={<SwapVert />} label="Withdrawals" iconPosition="start" />
        </Tabs>

        {/* Tab 0: Total Investment */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              💰 Total Investment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <EditableField 
                  label="Total Investment" 
                  field="totalInvestment" 
                  icon={<MonetizationOn sx={{ color: 'info.main' }} />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <EditableField 
                  label="Wallet Investment" 
                  field="walletInvestment" 
                  icon={<AccountBalance sx={{ color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Income Summary */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📊 Income Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <EditableField 
                  label="Daily Allotted" 
                  field="dailyAllotted" 
                  icon={<TrendingUp sx={{ color: 'info.main' }} />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EditableField 
                  label="Referral Bonus Allotted" 
                  field="referralBonusAllotted" 
                  icon={<Group sx={{ color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: Member Count Statistics */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              👥 Member Count Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {editingField === 'totalMembers' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                size="small"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                type="number"
                                autoFocus
                                sx={{ width: 150 }}
                              />
                              <IconButton size="small" color="success" onClick={() => handleSave('totalMembers')}>
                                <CheckIcon />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={handleCancel}>
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            (dashboardValues.totalMembers || 0).toLocaleString()
                          )}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          Total Member Count
                        </Typography>
                      </Box>
                      {editingField !== 'totalMembers' && (
                        <IconButton onClick={() => handleEdit('totalMembers', dashboardValues.totalMembers || 0)}>
                          <EditIcon />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <EditableField 
                  label="Active Members" 
                  field="activeMembers" 
                  icon={<Group sx={{ color: 'success.main' }} />}
                  color="success"
                  isCurrency={false}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <EditableField 
                  label="In-Active Members" 
                  field="inactiveMembers" 
                  icon={<Group sx={{ color: 'warning.main' }} />}
                  color="warning"
                  isCurrency={false}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <EditableField 
                  label="Suspended Members" 
                  field="suspendedMembers" 
                  icon={<Group sx={{ color: 'error.main' }} />}
                  color="error"
                  isCurrency={false}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 3: Credit/Debit */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              💳 Credit/Debit Summary
            </Typography>
            <Grid container spacing={3}>
              {/* Total Credited Section */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Total Credited
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <EditableField 
                        label="Total Credited" 
                        field="totalCredited" 
                        icon={<TrendingUp sx={{ color: 'info.main' }} />}
                        color="info"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <EditableField 
                        label="Today's Credited" 
                        field="todayCredited" 
                        icon={<TrendingUp sx={{ color: 'success.main' }} />}
                        color="success"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <EditableField 
                        label="Yesterday's Credited" 
                        field="yesterdayCredited" 
                        icon={<TrendingUp sx={{ color: 'grey.500' }} />}
                        color="grey"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Total Debited Section */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Total Debited
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <EditableField 
                        label="Total Debited" 
                        field="totalDebited" 
                        icon={<TrendingUp sx={{ color: 'error.main' }} />}
                        color="error"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <EditableField 
                        label="Today's Debited" 
                        field="todayDebited" 
                        icon={<TrendingUp sx={{ color: 'error.main' }} />}
                        color="error"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <EditableField 
                        label="Yesterday's Debited" 
                        field="yesterdayDebited" 
                        icon={<TrendingUp sx={{ color: 'grey.500' }} />}
                        color="grey"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 4: Withdrawal Summary */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              💸 Withdrawal Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <EditableField 
                  label="Total Withdrawal" 
                  field="totalWithdrawal" 
                  icon={<SwapVert sx={{ color: 'info.main' }} />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <EditableField 
                  label="Pending Withdrawal" 
                  field="pendingWithdrawal" 
                  icon={<SwapVert sx={{ color: 'warning.main' }} />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <EditableField 
                  label="Approved Withdrawal" 
                  field="approvedWithdrawal" 
                  icon={<SwapVert sx={{ color: 'success.main' }} />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <EditableField 
                  label="Rejected Withdrawal" 
                  field="rejectedWithdrawal" 
                  icon={<SwapVert sx={{ color: 'error.main' }} />}
                  color="error"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveAll}
            disabled={saving}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 700,
              py: 1.2,
              px: 3,
            }}
          >
            {saving ? 'Saving All...' : 'Save All Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardSettings;
