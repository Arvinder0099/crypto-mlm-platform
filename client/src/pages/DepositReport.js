import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, TablePagination, CircularProgress, Alert, TableContainer } from '@mui/material';
import { fetchWithAuth } from '../utils/api';

// rows will be fetched from backend within component state

function toCSV(data) {
  const headers = ['S.No','User ID','Payment Address','Amount ($)','Date','Credit On','Wallet Type','Transaction #','Status'];
  const lines = data.map(r => [r.sNo, r.userId, r.paymentAddress, r.amount, r.date, r.creditOn, r.walletType, r.txn, r.status].join(','));
  return [headers.join(','), ...lines].join('\n');
}

const DepositReport = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [walletType, setWalletType] = useState('All');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const loadDeposits = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        if (status !== 'All') {
          const serverStatus = status === 'Credited' ? 'completed' : status.toLowerCase();
          params.set('status', serverStatus);
        }
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        const qs = params.toString();
        const json = await fetchWithAuth(`/api/deposits/report${qs ? `?${qs}` : ''}`, { signal: controller.signal });
        const raw = Array.isArray(json?.data) ? json.data : [];
        const mapped = raw.map((d, idx) => ({
          sNo: idx + 1,
          userId: d.userId || 'N/A',
          paymentAddress: d.paymentAddress || '—',
          amount: d.amount,
          date: (d.date || '').slice(0, 10),
          creditOn: d.date || '',
          walletType: 'Deposit Wallet',
          txn: d.txHash || '—',
          status: d.status === 'completed' ? 'Credited' : (d.status === 'pending' ? 'Pending' : (d.status || 'Pending')),
        }));
        if (isMounted) {
          setRows(mapped);
          setPage(0);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Fetch deposits error:', err);
        if (isMounted) {
          setError('Failed to load deposit transactions');
          setLoading(false);
        }
      }
    };
    loadDeposits();
    return () => { isMounted = false; controller.abort(); };
  }, [status, startDate, endDate]);
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchUser = searchUserId ? r.userId.toLowerCase().includes(searchUserId.toLowerCase()) : true;
      const matchWallet = walletType === 'All' ? true : r.walletType === walletType;
      const matchStatus = status === 'All' ? true : r.status === status;
      const matchStart = startDate ? r.date >= startDate : true;
      const matchEnd = endDate ? r.date <= endDate : true;
      return matchUser && matchWallet && matchStatus && matchStart && matchEnd;
    });
  }, [rows, searchUserId, walletType, status, startDate, endDate]);

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
    a.download = 'deposit_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <Typography variant="h5" gutterBottom>Deposit Report</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField label="Search User ID" size="small" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="wallet-type-label">Wallet Type</InputLabel>
            <Select labelId="wallet-type-label" label="Wallet Type" value={walletType} onChange={(e) => setWalletType(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Deposit Wallet">Deposit Wallet</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Credited">Credited</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <TextField label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button variant="contained" onClick={handleExport}>Export CSV</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Payment Address</TableCell>
              <TableCell>Amount ($)</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Credit On</TableCell>
              <TableCell>Wallet Type</TableCell>
              <TableCell>Transaction #</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row) => (
              <TableRow key={`${row.sNo}-${row.userId}`}>
                <TableCell>{row.sNo}</TableCell>
                <TableCell>{row.userId}</TableCell>
                <TableCell>{row.paymentAddress}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.creditOn}</TableCell>
                <TableCell>{row.walletType}</TableCell>
                <TableCell>{row.txn}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    </Box>
  );
};

export default DepositReport;