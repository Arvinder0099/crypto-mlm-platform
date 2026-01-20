import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, TablePagination, TableContainer, Alert, CircularProgress } from '@mui/material';

function toCSV(data) {
  const headers = ['S.No','User ID','Investment ($)','Date','Day','Income %','Daily Income ($)','Credit On','Wallet Type','Status'];
  const lines = data.map(r => [r.sNo, r.userId, r.investment, r.date, r.day, r.incomePct, r.dailyIncome, r.creditOn, r.walletType, r.status].join(','));
  return [headers.join(','), ...lines].join('\n');
}

const DailyIncome = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [status, setStatus] = useState('All');
  const [walletType, setWalletType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    fetch('/api/reports/daily-income', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        setRows(items.map((item, idx) => ({
          sNo: idx + 1,
          userId: item.userId || '',
          investment: item.investment || item.packageAmount || 0,
          date: item.date || item.roiDate || '',
          day: item.day || '',
          incomePct: item.incomePct || item.roiRate || 0,
          dailyIncome: item.dailyIncome || item.roiAmount || 0,
          creditOn: item.creditOn || item.roiDate || '',
          walletType: item.walletType || 'Income Wallet',
          status: item.status || 'Pending'
        })));
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
      const matchWallet = walletType === 'All' ? true : r.walletType === walletType;
      const matchStart = startDate ? r.date >= startDate : true;
      const matchEnd = endDate ? r.date <= endDate : true;
      return matchUser && matchStatus && matchWallet && matchStart && matchEnd;
    });
  }, [searchUserId, status, walletType, startDate, endDate]);

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
    <Box>
      <Typography variant="h5" gutterBottom>Daily Income</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : rows.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No daily income records found</Alert>
      ) : (
        <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField label="Search User ID" size="small" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Credited">Credited</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="wallet-type-label">Wallet Type</InputLabel>
            <Select labelId="wallet-type-label" label="Wallet Type" value={walletType} onChange={(e) => setWalletType(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Income Wallet">Income Wallet</MenuItem>
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
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Investment ($)</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Day</TableCell>
                <TableCell>Income %</TableCell>
                <TableCell>Daily Income ($)</TableCell>
                <TableCell>Credit On</TableCell>
                <TableCell>Wallet Type</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.sNo}</TableCell>
                  <TableCell>{r.userId}</TableCell>
                  <TableCell>{r.investment}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.day}</TableCell>
                  <TableCell>{r.incomePct}%</TableCell>
                  <TableCell>{r.dailyIncome}</TableCell>
                  <TableCell>{r.creditOn}</TableCell>
                  <TableCell>{r.walletType}</TableCell>
                  <TableCell>{r.status}</TableCell>
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