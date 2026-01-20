import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  CheckCircle,
  Schedule,
  Star,
} from '@mui/icons-material';

const MyInvestments = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('/api/user/investments', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setInvestments(data.data || []);
      })
      .catch(err => console.error('Failed to load investments', err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateProgress = (daysElapsed, duration) => {
    return (daysElapsed / duration) * 100;
  };

  const calculateTimeUntilNextEarning = (nextEarningDate) => {
    const now = new Date();
    const next = new Date(nextEarningDate);
    const diff = next - now;

    if (diff <= 0) return 'Earning in progress...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investment, 0);
  const totalEarned = investments.reduce((sum, inv) => sum + inv.totalEarned, 0);
  const dailyEarning = investments.reduce((sum, inv) => sum + inv.dailyEarn, 0);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>
          My Investments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time monitoring of your investment plans and daily earnings
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ mr: 1 }} />
                <Typography variant="body2">Total Invested</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {totalInvested} USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="body2">Total Earned</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {totalEarned.toFixed(2)} USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="body2">Daily Earning</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {dailyEarning.toFixed(2)} USDT
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Time Display */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2">
            <strong>Server Time:</strong> {currentTime.toLocaleString()}
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> Real-time monitoring active
          </Typography>
        </Box>
      </Alert>

      {/* Active Investments */}
      {investments.map((investment) => (
        <Card key={investment.id} sx={{ mb: 3, border: '2px solid #667eea' }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            p: 2, 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Star sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {investment.planName}
              </Typography>
            </Box>
            <Chip 
              label={investment.status} 
              color="success" 
              icon={<CheckCircle />}
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <CardContent>
            <Grid container spacing={3}>
              {/* Investment Details */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Investment Details
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Investment Amount:</strong></TableCell>
                          <TableCell align="right">{investment.investment} USDT</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Daily Earning:</strong></TableCell>
                          <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 700 }}>
                            {investment.dailyEarn} USDT
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Duration:</strong></TableCell>
                          <TableCell align="right">{investment.duration} Days</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Purchase Date:</strong></TableCell>
                          <TableCell align="right">{investment.purchaseDate}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>

              {/* Earning Progress */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Earning Progress
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Days Elapsed:</strong></TableCell>
                          <TableCell align="right">
                            {investment.daysElapsed} / {investment.duration} Days
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Total Earned:</strong></TableCell>
                          <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 700 }}>
                            {investment.totalEarned.toFixed(2)} USDT
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Expected Total:</strong></TableCell>
                          <TableCell align="right">
                            {(investment.dailyEarn * investment.duration).toFixed(2)} USDT
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Remaining Days:</strong></TableCell>
                          <TableCell align="right">
                            {investment.duration - investment.daysElapsed} Days
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>

              {/* Progress Bar */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Investment Progress
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                      {calculateProgress(investment.daysElapsed, investment.duration).toFixed(2)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress(investment.daysElapsed, investment.duration)} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      }
                    }}
                  />
                </Box>
              </Grid>

              {/* Next Earning Countdown */}
              <Grid item xs={12}>
                <Alert 
                  severity="success" 
                  icon={<Schedule />}
                  sx={{ 
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                    border: '2px solid #4caf50',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Next Earning In:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#4caf50' }}>
                      {calculateTimeUntilNextEarning(investment.nextEarning)}
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {investments.length === 0 && (
        <Card sx={{ textAlign: 'center', p: 6 }}>
          <AccountBalance sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Active Investments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Purchase a plan to start earning daily returns
          </Typography>
        </Card>
      )}

      {/* Earning History Table */}
      {investments.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a237e' }}>
            Recent Earnings History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Plan</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>2024-12-02</TableCell>
                  <TableCell>INTRODUCTION PLAN</TableCell>
                  <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 700 }}>
                    0.55 USDT
                  </TableCell>
                  <TableCell align="center">
                    <Chip label="Credited" color="success" size="small" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-12-01</TableCell>
                  <TableCell>INTRODUCTION PLAN</TableCell>
                  <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 700 }}>
                    0.55 USDT
                  </TableCell>
                  <TableCell align="center">
                    <Chip label="Credited" color="success" size="small" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default MyInvestments;
