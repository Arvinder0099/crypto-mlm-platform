import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Alert, LinearProgress, Divider, Table, TableHead, TableRow, TableCell, TableBody, Link as MuiLink, TableContainer, Paper, Stack } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../utils/api';

const StatCard = ({ title, value, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Typography variant="h5" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </CardContent>
  </Card>
);

const MLMDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const json = await fetchWithAuth('/api/mlm/summary', { signal: controller.signal });
        setData(json.data);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
    return () => controller.abort();
  }, []);

  const levels = useMemo(() => data?.levels || [], [data]);
  const recentActivations = useMemo(() => data?.recentActivations || [], [data]);
  const recentDeposits = useMemo(() => data?.recentDeposits || [], [data]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Overview of your network, referrals, and recent activity
      </Typography>


      {/* User-only info banner */}
      {auth.isUser && auth.isUser() && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Note: This section shows user-specific information only. Admin-only panels have been removed.
        </Alert>
      )}

      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {data && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <StatCard title="Total Balance" value={`$${Number(data.totalBalance).toLocaleString()}`} color="success" />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard title="Current Plan" value={data.currentPlan} />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard title="Total Referrals" value={data.totalReferrals} />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard title="Active Referrals" value={data.activeReferrals} color="info" />
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Referral Link
                </Typography>
                <Alert icon={false} severity="info">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label={`Code: ${data.referralCode}`} color="primary" variant="outlined" />
                    <MuiLink href={data.referralLink} target="_blank" rel="noopener noreferrer" className="wrap-text">
                      {data.referralLink}
                    </MuiLink>
                  </Box>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Team Stats
                </Typography>
                {/* Desktop table */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><StatCard title="Team Size" value={data.teamSize} /></Grid>
                    <Grid item xs={6}><StatCard title="Team Volume" value={`$${Number(data.teamVolume).toLocaleString()}`} /></Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>Levels</Typography>
                   <TableContainer component={Paper}>
                     <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Level</TableCell>
                          <TableCell>Members</TableCell>
                          <TableCell>Commission</TableCell>
                          <TableCell>Volume</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {levels.map((lv) => (
                          <TableRow key={lv.level}>
                            <TableCell>{lv.level}</TableCell>
                            <TableCell>{lv.members}</TableCell>
                            <TableCell>${lv.commission.toLocaleString()}</TableCell>
                            <TableCell>${lv.volume.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                {/* Mobile cards */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><StatCard title="Team Size" value={data.teamSize} /></Grid>
                    <Grid item xs={6}><StatCard title="Team Volume" value={`$${Number(data.teamVolume).toLocaleString()}`} /></Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>Levels</Typography>
                  <Stack spacing={2}>
                    {levels.map((lv) => (
                      <Paper key={lv.level} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Level {lv.level}</Typography>
                        <Typography variant="body2" className="wrap-text">Members: {lv.members}</Typography>
                        <Typography variant="body2" className="wrap-text">Commission: ${lv.commission.toLocaleString()}</Typography>
                        <Typography variant="body2" className="wrap-text">Volume: ${lv.volume.toLocaleString()}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activations
                </Typography>
                {/* Desktop table */}
                 <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                   <TableContainer component={Paper}>
                      <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Plan</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentActivations.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{a.id}</TableCell>
                            <TableCell>{a.userName} ({a.userId})</TableCell>
                            <TableCell>{a.plan}</TableCell>
                            <TableCell>
                              <Chip label={a.status} size="small" color={a.status === 'active' ? 'success' : 'warning'} variant="outlined" />
                            </TableCell>
                            <TableCell>{a.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                {/* Mobile cards */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Stack spacing={2}>
                    {recentActivations.map((a) => (
                      <Paper key={a.id} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" className="wrap-text">{a.userName} ({a.userId})</Typography>
                        <Typography variant="body2" className="wrap-text">Activation ID: {a.id}</Typography>
                        <Typography variant="body2" className="wrap-text">Plan: {a.plan}</Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip label={a.status} size="small" color={a.status === 'active' ? 'success' : 'warning'} variant="outlined" />
                          <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Deposits
                </Typography>
                {/* Desktop table */}
                 <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                   <TableContainer component={Paper}>
                      <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Currency</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentDeposits.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>{d.id}</TableCell>
                            <TableCell>{d.userId}</TableCell>
                            <TableCell>${d.amount.toLocaleString()}</TableCell>
                            <TableCell>{d.currency}</TableCell>
                            <TableCell>
                              <Chip label={d.status} size="small" color={d.status === 'completed' ? 'success' : 'warning'} variant="outlined" />
                            </TableCell>
                            <TableCell>{d.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                {/* Mobile cards */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Stack spacing={2}>
                    {recentDeposits.map((d) => (
                      <Paper key={d.id} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" className="wrap-text">Deposit #{d.id}</Typography>
                        <Typography variant="body2" className="wrap-text">User: {d.userId}</Typography>
                        <Typography variant="body2" className="wrap-text">Amount: ${d.amount.toLocaleString()} {d.currency}</Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip label={d.status} size="small" color={d.status === 'completed' ? 'success' : 'warning'} variant="outlined" />
                          <Typography variant="caption" color="text.secondary">{d.date}</Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MLMDashboard;