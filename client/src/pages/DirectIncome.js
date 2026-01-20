import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, TablePagination, TableContainer, Chip, Alert, CircularProgress } from '@mui/material';

function toCSV(data) {
  const headers = ['S.No','User ID','Referral ID','Investment ($)','Level','Income %','Amount Earned ($)','Credit On','Wallet Type','Status'];
  const lines = data.map(r => [r.sNo, r.userId, r.referralId, r.investment, r.level, r.incomePct, r.amountEarned, r.creditOn, r.walletType, r.status].join(','));
  return [headers.join(','), ...lines].join('\n');
}

const DirectIncome = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [level, setLevel] = useState('All');
  const [status, setStatus] = useState('All');
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
    fetch('/api/reports/direct-income', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        setRows(items.map((item, idx) => ({
          sNo: idx + 1,
          userId: item.userId || '',
          referralId: item.referralId || item.childId || '',
          investment: item.investment || item.amount || 0,
          level: item.level || 1,
          incomePct: item.incomePct || item.percent || 0,
          amountEarned: item.amountEarned || item.amount || 0,
          creditOn: item.creditOn || item.date || '',
          walletType: item.walletType || 'Income Wallet',
          status: item.status || 'Pending'
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load direct income', err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchUser = searchUserId ? r.userId.toLowerCase().includes(searchUserId.toLowerCase()) : true;
      const matchLevel = level === 'All' ? true : r.level === Number(level);
      const matchStatus = status === 'All' ? true : r.status === status;
      const dateStr = r.creditOn ? r.creditOn.slice(0, 10) : '';
      const matchStart = startDate ? dateStr >= startDate : true;
      const matchEnd = endDate ? dateStr <= endDate : true;
      return matchUser && matchLevel && matchStatus && matchStart && matchEnd;
    });
  }, [searchUserId, level, status, startDate, endDate]);

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
    a.download = 'direct_income.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box className="page-container">
      <Typography variant="h5" gutterBottom>Direct Income</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : rows.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No direct income records found</Alert>
      ) : (
        <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField label="Search User ID" size="small" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="level-label">Level</InputLabel>
            <Select labelId="level-label" label="Level" value={level} onChange={(e) => setLevel(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Credited">Credited</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Start Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <TextField label="End Date" type="date" size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={handleExport}>Export CSV</Button>
        </Stack>
      </Paper>
      {/* Desktop Table (hidden on small screens) */}
      <Paper sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Referral ID</TableCell>
                <TableCell>Investment ($)</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Income %</TableCell>
                <TableCell>Amount Earned ($)</TableCell>
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
                  <TableCell>{r.referralId}</TableCell>
                  <TableCell>{r.investment}</TableCell>
                  <TableCell>{r.level}</TableCell>
                  <TableCell>{r.incomePct}%</TableCell>
                  <TableCell>{r.amountEarned}</TableCell>
                  <TableCell>{r.creditOn}</TableCell>
                  <TableCell>{r.walletType}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Mobile Card List (visible on xs/sm) */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Stack spacing={1.5}>
          {paginated.map((r, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" className="wrap-text">User: {r.userId}</Typography>
                <Chip label={r.status} size="small" color={r.status === 'Credited' ? 'success' : 'warning'} />
              </Box>
              <Typography variant="body2" color="text.secondary" className="wrap-text">Referral: {r.referralId}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
                <Chip size="small" variant="outlined" label={`Investment: $${r.investment}`} />
                <Chip size="small" variant="outlined" label={`Level: ${r.level}`} />
                <Chip size="small" variant="outlined" label={`Income: ${r.incomePct}%`} />
                <Chip size="small" variant="outlined" label={`Earned: $${r.amountEarned}`} />
                <Chip size="small" variant="outlined" label={r.walletType} />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Credited On: {r.creditOn}</Typography>
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* Shared Pagination */}
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25]}
      />
        </>
      )}
    </Box>
  );
};

export default DirectIncome;