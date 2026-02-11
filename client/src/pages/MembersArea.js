import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
} from '@mui/material';
import {
  ContentCopy,
  Group,
  MonetizationOn,
  TrendingUp,
  Savings,
  EmojiEvents,
  Share,
  WhatsApp,
  Telegram,
  Facebook,
  Link as LinkIcon,
  NorthEast,
} from '@mui/icons-material';

const cardBorder = {
  border: '2px solid #f06292',
  borderRadius: 3,
};

const SectionCard = ({ children, sx }) => (
  <Card sx={{ ...cardBorder, ...sx }}>
    <CardContent>{children}</CardContent>
  </Card>
);

const StatMiniCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
  <SectionCard>
    <Box display="flex" alignItems="center" gap={2}>
      <Box color={`${color}.main`}>
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">{value}</Typography>
          {subtitle && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <NorthEast fontSize="small" color={color} />
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  </SectionCard>
);

function PlaceholderBars({ data }) {
  // Simple CSS bar chart placeholder (no external libs)
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box sx={{ height: 260, position: 'relative', p: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', left: 8, top: 8 }}>
        Amounts in USDT
      </Typography>
      <Box display="flex" alignItems="end" justifyContent="space-between" sx={{ height: '100%' }}>
        {data.map((d) => (
          <Box key={d.label} textAlign="center" sx={{ width: `${100 / data.length - 2}%` }}>
            <Box
              sx={{
                height: `${(d.value / max) * 160}px`,
                minHeight: 3,
                background: 'linear-gradient(180deg,#ff8ea1,#f06292)',
                borderRadius: 1,
                border: '1px solid #f48fb1',
                boxShadow: '0 2px 6px rgba(240,98,146,0.3)'
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-block', mt: 1 }}>
              {d.label}
            </Typography>
            <Typography variant="caption" display="block">${d.value.toLocaleString()}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

const MembersArea = () => {
  const [referral, setReferral] = useState('https://finofoce.com/SignUp?inviteCode=nr');
  const [copied, setCopied] = useState(false);

  const todayLabel = useMemo(() => {
    const d = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dayName = days[d.getDay()];
    const dayNum = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName} ${dayNum}${getOrdinal(dayNum)} ${month} ${year}`;
  }, []);

  const accountSummary = [
    { label: 'Total Invest', value: 0 },
    { label: 'Eligible For', value: 0 },
    { label: 'Total Earned', value: 0 },
    { label: 'Available Earning', value: 0 },
    { label: 'Total Withdrawals', value: 0 },
    { label: 'Pending Withdrawals', value: 0 },
  ];

  const recentReferrals = [
    { id: 'PCL045108', name: 'Crypto User', email: 'username3@gmail.com' },
    { id: 'PCL139688', name: 'Crypto User', email: 'username4@gmail.com' },
    { id: 'PCL691977', name: 'Crypto User', email: 'username65@gmail.com' },
    { id: 'PCL967127', name: 'Crypto User', email: 'username74@gmail.com' },
  ];

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referral);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h4" gutterBottom>Member Panel</Typography>

      {/* Top: Profile + Account Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardBorder, p: 0, borderRadius: 4, overflow: 'hidden' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg,#7F00FF 0%, #E100FF 100%)',
                color: '#fff',
                p: 3,
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar sx={{ width: 96, height: 96, mb: 2, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 40 }}>FF</Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Crypto User</Typography>
              <Box mt={2}>
                <InfoLine label="User ID" value="member" light />
                <InfoLine label="Email ID" value="member" light />
                <InfoLine label="Date of Registration" value="Wed Oct 13 2021" light />
                <InfoLine label="Date of Activation" value="N/A" light />
                <InfoLine label="Rank" value="N/A" light />
                <InfoLine label="Rank Achieved On" value="N/A" light />
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Account Summary</Typography>
            <PlaceholderBars data={accountSummary} />
          </SectionCard>
        </Grid>
      </Grid>

      {/* Wallet Overview, Team Summary, Income Breakdown */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Wallet Overview</Typography>
            <Typography variant="h4" sx={{ color: 'success.main', mb: 1 }}>$ 0</Typography>
            <Divider sx={{ mb: 2 }} />
            <KeyValue label="My Wallet" value="$ 0" />
            <KeyValue label="Fund Wallet" value="$ 0" />
            <KeyValue label="Utility Wallet" value="$ 0" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Team Summery Details</Typography>
            <KeyValue label="My Direct" value="4 Nos." icon={<Group fontSize="small" />} />
            <KeyValue label="My Downlines" value="586 Nos." />
            <KeyValue label="Total Active Downlines" value="411 Nos." />
            <KeyValue label="Total InActive Downlines" value="175 Nos." />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Income Breakdown ; Date : {todayLabel}</Typography>
            <BreakdownRow label="1. Daily Income" value="$ 0.00" />
            <BreakdownRow label="2. Direct Income" value="$ 0.00" />
            <BreakdownRow label="3. Daily Level Income" value="$ 0.00" />
            <BreakdownRow label="4. Rank Income" value="$ 0.00" />
            <Divider sx={{ my: 1 }} />
            <BreakdownRow label="Total Income" value="$ 0.00" strong />
          </SectionCard>
        </Grid>
      </Grid>

      {/* Rank Statistics */}
      <SectionCard sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Rank Statistics</Typography>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Next Rank Requirement</Typography>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px dashed #f48fb1', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Next Rank : Bronze ; Income : $ 200</Typography>
            </Box>
            <RequirementLine color="#42a5f5" label="Required Business From Leg A" current={0} target={4000} />
            <RequirementLine color="#ff7043" label="Required Business From Leg B" current={0} target={3000} />
            <RequirementLine color="#66bb6a" label="Required Business From Leg C" current={0} target={3000} />
            <Box mt={2}>
              <Chip size="small" color="default" label="Direct Members of Rank: 0 No / 0 No" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>Your Acheived Rank</Typography>
              <DonutPlaceholder />
              <Button variant="contained" sx={{ mt: 2 }} endIcon={<NorthEast />}>View more</Button>
            </Box>
          </Grid>
        </Grid>
      </SectionCard>

      {/* Referral link + small stats */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Share your Referral Link</Typography>
              <Button size="small" variant="contained">+ Join now</Button>
            </Box>
            <Box display="flex" gap={1}>
              <TextField fullWidth value={referral} onChange={(e) => setReferral(e.target.value)} InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1 }} /> }} />
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton color="primary" onClick={copyReferral}><ContentCopy /></IconButton>
              </Tooltip>
            </Box>
            <Box mt={1} display="flex" gap={1}>
              <Tooltip title="WhatsApp"><IconButton color="success"><WhatsApp /></IconButton></Tooltip>
              <Tooltip title="Telegram"><IconButton color="primary"><Telegram /></IconButton></Tooltip>
              <Tooltip title="Facebook"><IconButton color="primary"><Facebook /></IconButton></Tooltip>
              <Tooltip title="Share"><IconButton><Share /></IconButton></Tooltip>
            </Box>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <StatMiniCard
            title="Total Downline Business"
            value="$ 170,900.00"
            subtitle="Your Total Downline Business"
            icon={<TrendingUp />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatMiniCard
            title="Total Investment"
            value="$ 0"
            subtitle="Your Total Investment Till ..."
            icon={<Savings />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Transaction History + Recent Referrals */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>Transaction History</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No.</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Credit</TableCell>
                    <TableCell align="right">Debit</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="error">No Records Found</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>My Recent Referrals</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentReferrals.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

const InfoLine = ({ label, value, light }) => (
  <Box display="flex" justifyContent="space-between" gap={2} sx={{ opacity: light ? 0.95 : 1 }}>
    <Typography variant="body2" sx={{ color: light ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>{label}:</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: light ? '#fff' : 'text.primary' }}>{value}</Typography>
  </Box>
);

const KeyValue = ({ label, value, icon }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ py: 0.75 }}>
    <Box display="flex" alignItems="center" gap={1.25}>
      {icon}
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
  </Box>
);

const BreakdownRow = ({ label, value, strong }) => (
  <Box display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: strong ? 700 : 500 }}>{value}</Typography>
  </Box>
);

const RequirementLine = ({ color, label, current, target }) => {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2">$ {current.toFixed(2)} / $ {target.toFixed(0)}</Typography>
      </Box>
      <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'grey.200', overflow: 'hidden', mt: 0.5, border: '1px solid #f48fb1' }}>
        <Box sx={{ width: `${pct}%`, height: '100%', background: color }} />
      </Box>
    </Box>
  );
};

const DonutPlaceholder = () => (
  <Box display="flex" alignItems="center" justifyContent="center" sx={{ p: 1 }}>
    <Box
      sx={{
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: 'conic-gradient(#42a5f5 0 90deg, #ff7043 90deg 180deg, #66bb6a 180deg 270deg, #bdbdbd 270deg 360deg)',
        display: 'grid',
        placeItems: 'center',
        border: '2px solid #f48fb1',
        boxShadow: '0 4px 12px rgba(240,98,146,0.3)'
      }}
    >
      <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: 'background.paper' }} />
    </Box>
  </Box>
);

export default MembersArea;
