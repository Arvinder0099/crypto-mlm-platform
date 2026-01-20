import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  AccountBalanceWallet,
  Schedule,
  CheckCircle,
  Info,
  Star,
  Diamond,
  LocalAtm,
  CalendarToday,
  ExpandMore,
  Visibility,
  Edit,
  Cancel,
  Payment,
  History
} from '@mui/icons-material';
import { fetchJSON, fetchWithAuth } from '../utils/api';

const InvestmentPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activeError, setActiveError] = useState(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [amountError, setAmountError] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Investment plans data
  const [investmentPlans, setInvestmentPlans] = useState([
    {
      id: 'starter',
      name: 'Starter Plan',
      icon: <Star sx={{ fontSize: 40, color: '#FFD700' }} />,
      minAmount: 100,
      maxAmount: 999,
      roiPercentage: 1.5,
      duration: 30,
      paymentFrequency: 'daily',
      totalReturn: 145,
      features: [
        'Daily ROI payments',
        '1.5% daily return',
        '30-day investment period',
        'Basic support',
        'Referral bonus: 5%'
      ],
      color: '#FFD700',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      icon: <Diamond sx={{ fontSize: 40, color: '#00BCD4' }} />,
      minAmount: 1000,
      maxAmount: 4999,
      roiPercentage: 2.0,
      duration: 45,
      paymentFrequency: 'daily',
      totalReturn: 190,
      features: [
        'Daily ROI payments',
        '2.0% daily return',
        '45-day investment period',
        'Priority support',
        'Referral bonus: 7%',
        'Weekly bonus rewards'
      ],
      color: '#00BCD4',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      icon: <LocalAtm sx={{ fontSize: 40, color: '#9C27B0' }} />,
      minAmount: 5000,
      maxAmount: 19999,
      roiPercentage: 2.5,
      duration: 60,
      paymentFrequency: 'daily',
      totalReturn: 250,
      features: [
        'Daily ROI payments',
        '2.5% daily return',
        '60-day investment period',
        'VIP support',
        'Referral bonus: 10%',
        'Weekly bonus rewards',
        'Monthly performance bonus'
      ],
      color: '#9C27B0',
      popular: false
    },
    {
      id: 'elite',
      name: 'Elite Plan',
      icon: <TrendingUp sx={{ fontSize: 40, color: '#FF5722' }} />,
      minAmount: 20000,
      maxAmount: 100000,
      roiPercentage: 3.0,
      duration: 90,
      paymentFrequency: 'daily',
      totalReturn: 370,
      features: [
        'Daily ROI payments',
        '3.0% daily return',
        '90-day investment period',
        'Dedicated account manager',
        'Referral bonus: 15%',
        'Weekly bonus rewards',
        'Monthly performance bonus',
        'Exclusive investment opportunities'
      ],
      color: '#FF5722',
      popular: false
    }
  ]);

  useEffect(() => {
    let mounted = true;

    const planIconForCategory = (category) => {
      switch (category) {
        case 'starter': return <Star sx={{ fontSize: 40, color: '#FFD700' }} />;
        case 'premium': return <LocalAtm sx={{ fontSize: 40, color: '#9C27B0' }} />;
        case 'vip': return <Diamond sx={{ fontSize: 40, color: '#00BCD4' }} />;
        case 'enterprise': return <TrendingUp sx={{ fontSize: 40, color: '#FF5722' }} />;
        default: return <TrendingUp sx={{ fontSize: 40, color: '#1976d2' }} />;
      }
    };

    const planColorForCategory = (category) => {
      switch (category) {
        case 'starter': return '#FFD700';
        case 'premium': return '#9C27B0';
        case 'vip': return '#00BCD4';
        case 'enterprise': return '#FF5722';
        default: return '#1976d2';
      }
    };

    fetchJSON('/api/investment-plans')
      .then((res) => {
        const plans = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!mounted || plans.length === 0) return;
        const mapped = plans.map((p) => ({
          id: p._id || p.id || p.name?.toLowerCase?.() || String(Math.random()),
          name: p.name,
          icon: planIconForCategory(p.category),
          minAmount: p.minAmount,
          maxAmount: p.maxAmount,
          roiPercentage: p.dailyROI,
          duration: p.duration,
          paymentFrequency: 'daily',
          totalReturn: p.totalROI,
          features: p.features || [],
          color: planColorForCategory(p.category),
          popular: (p.priority || 0) > 0
        }));
        setInvestmentPlans(mapped);
      })
      .catch((err) => {
        console.warn('Failed to load investment plans; using defaults.', err?.message || err);
      });

    return () => { mounted = false; };
  }, []);

  // User's active investments
  const [activeInvestments, setActiveInvestments] = useState([]);
  
  useEffect(() => {
    let mounted = true;
    setActiveLoading(true);
    setActiveError(null);

    fetchWithAuth('/api/user-plans/my-plans')
      .then((res) => {
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!mounted) return;
        const mapped = items.map((p) => {
          const start = p.startDate ? new Date(p.startDate) : null;
          const end = p.endDate ? new Date(p.endDate) : null;
          const remainingDays = typeof p.remainingDays === 'number'
            ? p.remainingDays
            : end ? Math.max(0, Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24))) : 0;
          const progress = typeof p.progress === 'number'
            ? p.progress
            : typeof p.progressPercentage === 'number' ? Math.round(p.progressPercentage) : 0;

          return {
            id: p.id || p._id || `INV-${Math.random().toString(36).slice(2, 7)}`,
            planName: p.planName || p.planId?.name || 'Unknown Plan',
            amount: Number(p.amount ?? p.investmentAmount ?? 0),
            startDate: start ? start.toISOString().slice(0, 10) : '',
            endDate: end ? end.toISOString().slice(0, 10) : '',
            dailyReturn: Number(p.dailyReturn ?? p.dailyROI ?? 0),
            totalEarned: Number(p.totalEarned ?? 0),
            remainingDays,
            status: p.status || 'active',
            progress
          };
        });
        setActiveInvestments(mapped);
        setActiveLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err?.message || 'Unable to load active investments';
        setActiveError(msg);
        setActiveLoading(false);
        console.warn('Failed to load active investments; keeping defaults.', msg);
      });

    return () => { mounted = false; };
  }, []);
  
  // Available wallets
  const wallets = [
    { type: 'Bitcoin', balance: 0.05432, symbol: 'BTC' },
    { type: 'Ethereum', balance: 1.2345, symbol: 'ETH' },
    { type: 'USDT', balance: 1000.00, symbol: 'USDT' }
  ];

  const validateAmount = (value, plan) => {
    if (value === '' || value === null || value === undefined) return 'Enter an amount';
    const num = Number(value);
    if (!Number.isFinite(num)) return 'Amount must be a number';
    if (num <= 0) return 'Amount must be greater than 0';
    if (plan) {
      if (num < Number(plan.minAmount)) return `Minimum amount is $${Number(plan.minAmount).toLocaleString()}`;
      if (num > Number(plan.maxAmount)) return `Maximum amount is $${Number(plan.maxAmount).toLocaleString()}`;
    }
    return '';
  };

  const handleInvestClick = (plan) => {
    setSelectedPlan(plan);
    setShowInvestDialog(true);
    // Reset validation state when opening dialog
    setAmountError('');
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setShowDetailsDialog(true);
  };

  const handleShowHistory = (investment) => {
      setSelectedInvestment(investment);
      setShowHistoryDialog(true);
      setHistoryLoading(true);
      setHistoryError(null);
      setPayouts([]);
  
      fetchWithAuth(`/api/user-plans/${investment.id}/payouts`)
          .then((res) => {
              const data = res?.data || res;
              const recent = Array.isArray(data?.recent) ? data.recent : [];
              setPayouts(recent);
              setHistoryLoading(false);
          })
          .catch((err) => {
              setHistoryError(err?.message || 'Unable to load payout history');
              setHistoryLoading(false);
          });
      };
  
  const handleInvestment = async () => {
      if (!investmentAmount || !selectedWallet || !selectedPlan?.id) {
          return;
      }
  
      setLoading(true);
      try {
          const payload = {
              planId: selectedPlan.id,
              amount: Number(investmentAmount),
              walletType: selectedWallet
          };
          const res = await fetchWithAuth('/api/user-plans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          const data = res?.data || res;

          if (data && data.success !== false) {
              const created = data?.data || data;
              const newInvestment = {
                  id: created.id || created._id || `INV${Date.now()}`,
                  planName: created.planName || selectedPlan.name,
                  amount: Number(created.amount ?? investmentAmount),
                  startDate: created.startDate || new Date().toISOString().split('T')[0],
                  endDate: created.endDate || new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  dailyReturn: Number(created.dailyReturn ?? (Number(investmentAmount) * selectedPlan.roiPercentage) / 100),
                  totalEarned: Number(created.totalEarned ?? 0),
                  remainingDays: Number(created.remainingDays ?? selectedPlan.duration),
                  status: created.status || 'active',
                  progress: Number(created.progress ?? 0)
              };
  
              setActiveInvestments([...activeInvestments, newInvestment]);
              setShowInvestDialog(false);
              setInvestmentAmount('');
              setSelectedWallet('');
          } else {
              throw new Error(data?.message || 'Investment creation failed');
          }
      } catch (error) {
          console.error('Investment failed:', error);
          alert(error?.message || 'Investment failed');
      } finally {
          setLoading(false);
      }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const calculateProjectedEarnings = (amount, plan) => {
    const dailyReturn = (amount * plan.roiPercentage) / 100;
    const totalReturn = dailyReturn * plan.duration;
    return {
      daily: dailyReturn,
      total: totalReturn,
      profit: totalReturn - amount
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Investment Plans
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose from our carefully designed investment plans to maximize your returns
      </Typography>

      {/* Investment Plans Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {investmentPlans.map((plan) => (
          <Grid item xs={12} md={6} lg={3} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: plan.popular ? `2px solid ${plan.color}` : 'none',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.3s ease-in-out'
                }
              }}
            >
              {plan.popular && (
                <Chip
                  label="Most Popular"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1
                  }}
                />
              )}
              
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {plan.icon}
                </Box>
                
                <Typography variant="h5" gutterBottom sx={{ color: plan.color }}>
                  {plan.name}
                </Typography>
                
                <Typography variant="h3" color="primary" gutterBottom>
                  {plan.roiPercentage}%
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Daily Return
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ textAlign: 'left', mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Investment Range:</strong> ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Duration:</strong> {plan.duration} days
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Total Return:</strong> {plan.totalReturn}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Payment:</strong> {plan.paymentFrequency}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleInvestClick(plan)}
                    sx={{ bgcolor: plan.color }}
                  >
                    Invest Now
                  </Button>
                  <IconButton
                    onClick={() => handleViewDetails(plan)}
                    color="primary"
                  >
                    <Visibility />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Active Investments */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            My Active Investments
          </Typography>
          
          {activeLoading ? (
            <Box sx={{ py: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>Loading active investments...</Typography>
            </Box>
          ) : activeError ? (
            <Alert severity="error">Failed to load active investments: {activeError}</Alert>
          ) : activeInvestments.length === 0 ? (
            <Alert severity="info">
              You don't have any active investments yet. Choose a plan above to get started!
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Investment ID</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Daily Return</TableCell>
                    <TableCell>Total Earned</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeInvestments.map((investment) => (
                    <TableRow key={investment.id}>
                      <TableCell>{investment.id}</TableCell>
                      <TableCell>{investment.planName}</TableCell>
                      <TableCell>${investment.amount.toLocaleString()}</TableCell>
                      <TableCell>${investment.dailyReturn.toFixed(2)}</TableCell>
                      <TableCell>${investment.totalEarned.toFixed(2)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={investment.progress}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption">
                            {investment.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={investment.status}
                          color={getStatusColor(investment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleShowHistory(investment)}>
                          <History />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Investment Dialog */}
      <Dialog open={showInvestDialog} onClose={() => setShowInvestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Invest in {selectedPlan?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Investment Amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setInvestmentAmount(val);
                  if (selectedPlan) setAmountError(validateAmount(val, selectedPlan));
                }}
                inputProps={{
                  min: selectedPlan?.minAmount,
                  max: selectedPlan?.maxAmount
                }}
                error={!!amountError}
                helperText={amountError || `Min: $${selectedPlan?.minAmount?.toLocaleString?.() ?? selectedPlan?.minAmount} - Max: $${selectedPlan?.maxAmount?.toLocaleString?.() ?? selectedPlan?.maxAmount}`}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Wallet</InputLabel>
                <Select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  label="Payment Wallet"
                >
                  {wallets.map((wallet) => (
                    <MenuItem key={wallet.type} value={wallet.type}>
                      {wallet.type} ({wallet.balance} {wallet.symbol})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {investmentAmount && selectedPlan && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Investment Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Investment Amount:</strong> ${parseFloat(investmentAmount || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Daily Return:</strong> ${calculateProjectedEarnings(parseFloat(investmentAmount || 0), selectedPlan).daily.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Total Return:</strong> ${calculateProjectedEarnings(parseFloat(investmentAmount || 0), selectedPlan).total.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="success.main">
                          <strong>Net Profit:</strong> ${calculateProjectedEarnings(parseFloat(investmentAmount || 0), selectedPlan).profit.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInvestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInvestment}
            disabled={loading || !investmentAmount || !selectedWallet || !!amountError}
          >
            {loading ? 'Processing...' : 'Confirm Investment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Plan Details Dialog */}
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPlan?.name} - Details
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Plan Features
              </Typography>
              <List>
                {selectedPlan?.features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Terms & Conditions
              </Typography>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Payment Schedule</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    Returns are calculated and paid daily at 00:00 UTC. Payments are automatically credited to your wallet balance.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Withdrawal Policy</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    Principal amount can be withdrawn after the investment period ends. Daily returns can be withdrawn anytime with no restrictions.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>Risk Disclosure</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    All investments carry risk. Past performance does not guarantee future results. Please invest responsibly.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowDetailsDialog(false);
              handleInvestClick(selectedPlan);
            }}
          >
            Invest Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Investment History Dialog */}
      <Dialog open={showHistoryDialog} onClose={() => setShowHistoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Investment History - {selectedInvestment?.id}
        </DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemText primary="Plan" secondary={selectedInvestment?.planName} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Amount" secondary={`$${(selectedInvestment?.amount || 0).toLocaleString()}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Daily Return" secondary={`$${Number(selectedInvestment?.dailyReturn || 0).toFixed(2)}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Total Earned" secondary={`$${Number(selectedInvestment?.totalEarned || 0).toFixed(2)}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Period" secondary={`${selectedInvestment?.startDate || ''} → ${selectedInvestment?.endDate || ''}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Status" secondary={selectedInvestment?.status} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Progress" secondary={`${selectedInvestment?.progress || 0}%`} />
            </ListItem>
          </List>
          <Alert severity="info">Detailed payout history coming soon.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvestmentPlans;
