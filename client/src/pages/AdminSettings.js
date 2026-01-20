import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Divider,
  Avatar,
  Tooltip,
  FormGroup,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  Settings,
  AccountBalance,
  Security,
  Delete,
  Edit,
  Add,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Notifications,
  TrendingUp,
  MonetizationOn,
  Group,
  Assessment,
  Timeline,
  ShowChart,
  Schedule,
  Refresh,
  AccountBalanceWallet,
  CheckCircle,
  AttachMoney,
  SwapHoriz,
  Shield,
  Download,
  Warning,
  Info,
  Dashboard,
  Storage,
  Memory,
  Speed,
  History,
  Block,
  Person,
  Email,
  Backup,
  BarChart,
} from '@mui/icons-material';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // ROI Settings State - initialized with defaults
  const [roiSettings, setRoiSettings] = useState({
    dailyROI: 0,
    weeklyROI: 0,
    monthlyROI: 0,
    minimumInvestment: 0,
    maximumInvestment: 0,
    roiEnabled: false,
    compoundingEnabled: false,
    maxCompoundDays: 0,
    autoCompoundEnabled: false,
    roiCalculationMethod: 'simple',
    weekendROI: false,
    holidayROI: false,
    bonusROIPercentage: 0,
    vipROIMultiplier: 1,
    earlyWithdrawalPenalty: 0,
    maturityBonus: 0,
  });

  // Deposit Addresses - initialized empty
  const [depositAddresses, setDepositAddresses] = useState([]);

  // Elimination Conditions - initialized empty
  const [eliminationConditions, setEliminationConditions] = useState([]);

  // Admin Config - initialized with defaults
  const [adminConfig, setAdminConfig] = useState({
    siteName: '',
    siteDescription: '',
    adminEmail: '',
    supportEmail: '',
    noreplyEmail: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    timezone: 'UTC',
    defaultLanguage: 'en',
    defaultCurrency: 'USD',
    maintenanceMode: false,
    registrationEnabled: true,
    withdrawalEnabled: true,
    depositEnabled: true,
    referralBonusEnabled: true,
    kycRequired: true,
    twoFactorRequired: false,
    emailVerificationRequired: true,
    phoneVerificationRequired: false,
    maxWithdrawalPerDay: 0,
    minWithdrawalAmount: 0,
    maxWithdrawalAmount: 0,
    withdrawalFeePercentage: 0,
    withdrawalFeeFixed: 0,
    minDepositAmount: 0,
    maxDepositAmount: 0,
    depositFeePercentage: 0,
    referralCommissionRate: 0,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    ipWhitelistEnabled: false,
    bruteForceProtection: true,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    pushNotificationsEnabled: true,
    adminNotificationsEnabled: true,
    cacheEnabled: true,
    compressionEnabled: true,
    cdnEnabled: false,
    databaseOptimization: true,
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    cloudBackupEnabled: false,
  });

  // Popups - initialized empty
  const [popups, setPopups] = useState([]);

  // Fetch settings from API
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);

    Promise.all([
      fetch('/api/admin/settings/roi', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: null })),
      fetch('/api/admin/settings/deposit-addresses', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: [] })),
      fetch('/api/admin/settings/elimination-conditions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: [] })),
      fetch('/api/admin/settings/config', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: null })),
      fetch('/api/admin/settings/popups', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: [] }))
    ])
      .then(([roiData, addressData, elimData, configData, popupsData]) => {
        if (roiData.data) setRoiSettings(prev => ({ ...prev, ...roiData.data }));
        if (addressData.data) setDepositAddresses(addressData.data);
        if (elimData.data) setEliminationConditions(elimData.data);
        if (configData.data) setAdminConfig(prev => ({ ...prev, ...configData.data }));
        if (popupsData.data) setPopups(popupsData.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load admin settings', err);
        setLoading(false);
      });
  }, []);

  // Statistics data - initialized with zeros
  const [roiStats] = useState({
    totalInvestments: 0,
    activeInvestors: 0,
    totalROIPaid: 0,
    averageROI: 0,
    topPerformer: '',
    monthlyGrowth: 0,
  });

  const [addressStats] = useState({
    totalAddresses: 0,
    activeAddresses: 0,
    totalBalance: 0,
    totalReceived: 0,
    totalTransactions: 0,
    averageConfirmations: 0,
  });

  const [conditionStats] = useState({
    totalConditions: 0,
    activeConditions: 0,
    totalAffectedUsers: 0,
    criticalAlerts: 0,
    autoActionsEnabled: 0,
    lastProcessed: null,
  });

  const [systemStats] = useState({
    uptime: 0,
    activeUsers: 0,
    totalTransactions: 0,
    systemLoad: 0,
    databaseSize: 0,
    cacheHitRate: 0,
  });

  const [popupStats] = useState({
    totalPopups: 0,
    activePopups: 0,
    totalDisplays: 0,
    totalClicks: 0,
    averageConversionRate: 0,
    topPerformer: '',
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSaveSettings = (settingsType) => {
    setSnackbarMessage(`${settingsType} settings saved successfully!`);
    setOpenSnackbar(true);
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const renderROISettings = () => (
    <Box>
      {/* ROI Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${(roiStats.totalInvestments / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Investments
                  </Typography>
                </Box>
                <MonetizationOn sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {roiStats.activeInvestors.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Active Investors
                  </Typography>
                </Box>
                <Group sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${(roiStats.totalROIPaid / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total ROI Paid
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {roiStats.averageROI}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Average ROI
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {roiStats.topPerformer}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Top Performer
                  </Typography>
                </Box>
                <Timeline sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {roiStats.monthlyGrowth}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Monthly Growth
                  </Typography>
                </Box>
                <ShowChart sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings color="primary" />
                ROI Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Daily ROI (%)"
                    type="number"
                    value={roiSettings.dailyROI}
                    onChange={(e) => setRoiSettings({ ...roiSettings, dailyROI: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.1, min: 0, max: 10 }}
                    helperText="Recommended: 1.5% - 3.5%"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Weekly ROI (%)"
                    type="number"
                    value={roiSettings.weeklyROI}
                    onChange={(e) => setRoiSettings({ ...roiSettings, weeklyROI: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.1, min: 0, max: 50 }}
                    helperText="Recommended: 10% - 25%"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly ROI (%)"
                    type="number"
                    value={roiSettings.monthlyROI}
                    onChange={(e) => setRoiSettings({ ...roiSettings, monthlyROI: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.1, min: 0, max: 100 }}
                    helperText="Recommended: 30% - 70%"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Compound Days"
                    type="number"
                    value={roiSettings.maxCompoundDays}
                    onChange={(e) => setRoiSettings({ ...roiSettings, maxCompoundDays: parseInt(e.target.value) })}
                    inputProps={{ min: 1, max: 1000 }}
                    helperText="Maximum days for compounding"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>ROI Calculation Method</InputLabel>
                    <Select
                      value={roiSettings.roiCalculationMethod}
                      onChange={(e) => setRoiSettings({ ...roiSettings, roiCalculationMethod: e.target.value })}
                    >
                      <MenuItem value="simple">Simple Interest</MenuItem>
                      <MenuItem value="compound">Compound Interest</MenuItem>
                      <MenuItem value="hybrid">Hybrid Method</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="VIP ROI Multiplier"
                    type="number"
                    value={roiSettings.vipROIMultiplier}
                    onChange={(e) => setRoiSettings({ ...roiSettings, vipROIMultiplier: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.1, min: 1, max: 5 }}
                    helperText="Multiplier for VIP users"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOn color="primary" />
                Investment Limits & Bonuses
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Minimum Investment ($)"
                    type="number"
                    value={roiSettings.minimumInvestment}
                    onChange={(e) => setRoiSettings({ ...roiSettings, minimumInvestment: parseFloat(e.target.value) })}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Investment ($)"
                    type="number"
                    value={roiSettings.maximumInvestment}
                    onChange={(e) => setRoiSettings({ ...roiSettings, maximumInvestment: parseFloat(e.target.value) })}
                    inputProps={{ min: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bonus ROI Percentage (%)"
                    type="number"
                    value={roiSettings.bonusROIPercentage}
                    onChange={(e) => setRoiSettings({ ...roiSettings, bonusROIPercentage: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.1, min: 0, max: 20 }}
                    helperText="Additional ROI for promotions"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Early Withdrawal Penalty (%)"
                    type="number"
                    value={roiSettings.earlyWithdrawalPenalty}
                    onChange={(e) => setRoiSettings({ ...roiSettings, earlyWithdrawalPenalty: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.1, min: 0, max: 50 }}
                    helperText="Penalty for early withdrawals"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maturity Bonus (%)"
                    type="number"
                    value={roiSettings.maturityBonus}
                    onChange={(e) => setRoiSettings({ ...roiSettings, maturityBonus: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.1, min: 0, max: 100 }}
                    helperText="Bonus at investment maturity"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule color="primary" />
                ROI System Controls
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={roiSettings.roiEnabled}
                        onChange={(e) => setRoiSettings({ ...roiSettings, roiEnabled: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Enable ROI System"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={roiSettings.compoundingEnabled}
                        onChange={(e) => setRoiSettings({ ...roiSettings, compoundingEnabled: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Enable Compounding"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={roiSettings.autoCompoundEnabled}
                        onChange={(e) => setRoiSettings({ ...roiSettings, autoCompoundEnabled: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Auto Compound"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={roiSettings.weekendROI}
                        onChange={(e) => setRoiSettings({ ...roiSettings, weekendROI: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Weekend ROI"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Reset to Default
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => handleSaveSettings('ROI')}
              size="large"
            >
              Save ROI Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderDepositAddresses = () => (
    <Box>
      {/* Address Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {addressStats.totalAddresses}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Addresses
                  </Typography>
                </Box>
                <AccountBalanceWallet sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {addressStats.activeAddresses}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Active Addresses
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${addressStats.totalBalance.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Balance
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ${(addressStats.totalReceived / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Received
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {addressStats.totalTransactions}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Total Transactions
                  </Typography>
                </Box>
                <SwapHoriz sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {addressStats.averageConfirmations}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Avg Confirmations
                  </Typography>
                </Box>
                <Shield sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet color="primary" />
          Deposit Addresses Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh Balances
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog('addAddress')}
          >
            Add New Address
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Currency</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Network</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Balance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Received</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Transactions</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {depositAddresses.map((address) => (
              <TableRow key={address.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {address.currency.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {address.currency}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {address.network}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={address.network} 
                    size="small" 
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.875rem',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {address.address}
                    </Typography>
                    <Tooltip title="Copy Address">
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(address.address)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {address.balance.toLocaleString()} {address.currency}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {address.totalReceived.toLocaleString()} {address.currency}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {address.transactionCount}
                    </Typography>
                    <Chip 
                      label={`${address.confirmationsRequired} conf`} 
                      size="small" 
                      color="info"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={address.status}
                    color={getStatusColor(address.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={address.isHot ? 'Hot Wallet' : 'Cold Wallet'}
                    color={address.isHot ? 'warning' : 'info'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog('viewAddress', address)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Address">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog('editAddress', address)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Address">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleOpenDialog('deleteAddress', address)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => handleSaveSettings('Export Address List')}
          >
            Export List
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => handleSaveSettings('Deposit Addresses')}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderEliminationConditions = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Elimination Conditions</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('addCondition')}
        >
          Add Condition
        </Button>
      </Box>

      <Grid container spacing={3}>
        {eliminationConditions.map((condition) => (
          <Grid item xs={12} md={6} key={condition.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {condition.condition}
                  </Typography>
                  <Switch
                    checked={condition.enabled}
                    onChange={(e) => {
                      const updated = eliminationConditions.map(c =>
                        c.id === condition.id ? { ...c, enabled: e.target.checked } : c
                      );
                      setEliminationConditions(updated);
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Action: {condition.action}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleOpenDialog('editCondition', condition)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleOpenDialog('deleteCondition', condition)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderAdminConfiguration = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Site Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={adminConfig.siteName}
                  onChange={(e) => setAdminConfig({ ...adminConfig, siteName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  type="email"
                  value={adminConfig.adminEmail}
                  onChange={(e) => setAdminConfig({ ...adminConfig, adminEmail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Support Email"
                  type="email"
                  value={adminConfig.supportEmail}
                  onChange={(e) => setAdminConfig({ ...adminConfig, supportEmail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={adminConfig.sessionTimeout}
                  onChange={(e) => setAdminConfig({ ...adminConfig, sessionTimeout: parseInt(e.target.value) })}
                  inputProps={{ min: 5, max: 120 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Controls
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={adminConfig.maintenanceMode}
                      onChange={(e) => setAdminConfig({ ...adminConfig, maintenanceMode: e.target.checked })}
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={adminConfig.registrationEnabled}
                      onChange={(e) => setAdminConfig({ ...adminConfig, registrationEnabled: e.target.checked })}
                    />
                  }
                  label="Enable Registration"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={adminConfig.withdrawalEnabled}
                      onChange={(e) => setAdminConfig({ ...adminConfig, withdrawalEnabled: e.target.checked })}
                    />
                  }
                  label="Enable Withdrawals"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={adminConfig.depositEnabled}
                      onChange={(e) => setAdminConfig({ ...adminConfig, depositEnabled: e.target.checked })}
                    />
                  }
                  label="Enable Deposits"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Financial Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Max Withdrawal Per Day ($)"
                  type="number"
                  value={adminConfig.maxWithdrawalPerDay}
                  onChange={(e) => setAdminConfig({ ...adminConfig, maxWithdrawalPerDay: parseFloat(e.target.value) })}
                  inputProps={{ min: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Min Withdrawal Amount ($)"
                  type="number"
                  value={adminConfig.minWithdrawalAmount}
                  onChange={(e) => setAdminConfig({ ...adminConfig, minWithdrawalAmount: parseFloat(e.target.value) })}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Withdrawal Fee (%)"
                  type="number"
                  value={adminConfig.withdrawalFeePercentage}
                  onChange={(e) => setAdminConfig({ ...adminConfig, withdrawalFeePercentage: parseFloat(e.target.value) })}
                  inputProps={{ step: 0.1, min: 0, max: 10 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => handleSaveSettings('Admin Configuration')}
          >
            Save Configuration
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  const renderPopupManagement = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Popup Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('addPopup')}
        >
          Add Popup
        </Button>
      </Box>

      <Grid container spacing={3}>
        {popups.map((popup) => (
          <Grid item xs={12} md={6} key={popup.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {popup.title}
                  </Typography>
                  <Switch
                    checked={popup.enabled}
                    onChange={(e) => {
                      const updated = popups.map(p =>
                        p.id === popup.id ? { ...p, enabled: e.target.checked } : p
                      );
                      setPopups(updated);
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {popup.content}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip label={popup.type} color="primary" size="small" />
                  <Typography variant="caption" color="text.secondary">
                    Duration: {popup.displayDuration / 1000}s
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleOpenDialog('editPopup', popup)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleOpenDialog('deletePopup', popup)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const tabContent = [
    renderROISettings(),
    renderDepositAddresses(),
    renderEliminationConditions(),
    renderAdminConfiguration(),
    renderPopupManagement(),
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Settings color="primary" />
        Admin Settings Dashboard
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 'bold',
              }
            }}
          >
            <Tab 
              label="ROI Setup" 
              icon={<MonetizationOn />}
              iconPosition="start"
            />
            <Tab 
              label="Deposit Addresses" 
              icon={<AccountBalanceWallet />}
              iconPosition="start"
            />
            <Tab 
              label="Elimination Conditions" 
              icon={<Security />}
              iconPosition="start"
            />
            <Tab 
              label="Admin Configuration" 
              icon={<Settings />}
              iconPosition="start"
            />
            <Tab 
              label="Popup Management" 
              icon={<Notifications />}
              iconPosition="start"
            />
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {tabContent[activeTab]}
        </CardContent>
      </Card>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Enhanced Dialog for Add/Edit/Delete operations */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          {dialogType.includes('add') && <Add color="primary" />}
          {dialogType.includes('edit') && <Edit color="primary" />}
          {dialogType.includes('delete') && <Delete color="error" />}
          {dialogType.includes('view') && <Visibility color="info" />}
          
          {dialogType.includes('add') ? 'Add New Item' : 
           dialogType.includes('edit') ? 'Edit Item' : 
           dialogType.includes('view') ? 'View Details' :
           'Confirm Delete'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {dialogType.includes('delete') ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Warning color="warning" sx={{ fontSize: 48 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Are you sure you want to delete this item?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This action cannot be undone. All associated data will be permanently removed.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Info color="info" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Feature Coming Soon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The detailed form for {dialogType} will be implemented in the next update.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color={dialogType.includes('delete') ? 'error' : 'primary'}
            onClick={handleCloseDialog}
            startIcon={dialogType.includes('delete') ? <Delete /> : <Save />}
          >
            {dialogType.includes('delete') ? 'Delete' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSettings;
