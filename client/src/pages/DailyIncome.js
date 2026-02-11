import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, TablePagination, TableContainer, Alert, CircularProgress, Card, CardContent, Grid, Chip } from '@mui/material';
import { TrendingUp, AccountBalanceWallet, CalendarToday } from '@mui/icons-material';

function toCSV(data) {
  const headers = ['S.No','User ID','Plan','Date','Daily Income ($)','Status'];
  const lines = data.map(r => [r.sNo, r.userId, r.plan, r.date, r.dailyIncome, r.status].join(','));
  return [headers.join(','), ...lines].join('\n');
}

const DailyIncome = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalEarnings: 0, todayEarnings: 0, activePlans: 0 });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    
    // Fetch daily income data
    fetch('/api/reports/daily-income', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        const today = new Date().toISOString().split('T')[0];
        let totalEarnings = 0;
        let todayEarnings = 0;
        
        const formattedRows = items.map((item, idx) => {
          const date = item.roiDate ? new Date(item.roiDate).toLocaleDateString() : '';
          const dateStr = item.roiDate ? new Date(item.roiDate).toISOString().split('T')[0] : '';
          const amount = item.dailyIncome || item.amount || 0;
          
          totalEarnings += amount;
          if (dateStr === today) todayEarnings += amount;
          
          return {
            sNo: idx + 1,
            userId: item.userId || '',
            plan: item.plan || 'Investment Plan',
            percentage: item.percentage || 0.5,
            date,
            dateStr,
            dailyIncome: amount,
            status: item.status || 'completed'
          };
        });
        
        setRows(formattedRows);
        setSummary({
          totalEarnings,
          todayEarnings,
          activePlans: new Set(items.filter(i => i.status === 'completed').map(i => i.plan)).size || 1
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load daily income', err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchUser = searchUserId ? r.userId.toLowerCase().includes(searchUserId.toLowerCase()) : true;
      const matchStatus = status === 'All' ? true : r.status === status;
      const matchStart = startDate ? r.dateStr >= startDate : true;
      const matchEnd = endDate ? r.dateStr <= endDate : true;
      return matchUser && matchStatus && matchStart && matchEnd;
    });
  }, [rows, searchUserId, status, startDate, endDate]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleExport = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_income.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>Daily Income Report</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Your daily earnings from active investment plans</Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                <Typography variant="body2">Total Earnings</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>${summary.totalEarnings.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday />
                <Typography variant="body2">Today's Earnings</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>${summary.todayEarnings.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceWallet />
                <Typography variant="body2">Active Plans</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>{summary.activePlans}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : rows.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No daily income records found. Activate an investment plan to start earning!</Alert>
      ) : (
        <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField label="Search User ID" size="small" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <TextField label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={handleExport}>Export CSV</Button>
        </Stack>
      </Paper>
      <Paper>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700 }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Daily Income ($)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell>{r.sNo}</TableCell>
                  <TableCell>{r.userId}</TableCell>
                  <TableCell>{r.plan}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell sx={{ color: '#4caf50', fontWeight: 600 }}>${r.dailyIncome.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={r.status} 
                      size="small" 
                      color={r.status === 'completed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableContainer>
          <Paper>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
          </Paper>
      </Paper>
        </>
      )}
    </Box>
  );
};

export default DailyIncome;