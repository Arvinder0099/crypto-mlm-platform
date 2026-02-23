import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, TablePagination, TableContainer, Alert, CircularProgress } from '@mui/material';

function toCSV(data) {
  const headers = ['S.No','User ID','Rank','Income %','Amount Earned ($)','Credit On','Wallet Type','Status'];
  const lines = data.map(r => [r.sNo, r.userId, r.rank, r.incomePct, r.amountEarned, r.creditOn, r.walletType, r.status].join(','));
  return [headers.join(','), ...lines].join('\n');
}

const RankIncome = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [rank, setRank] = useState('All');
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
    fetch('/api/reports/rank-income', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        setRows(items.map((item, idx) => ({
          sNo: idx + 1,
          userId: item.userId || '',
          rank: item.rank || '',
          incomePct: item.incomePct || 0,
          amountEarned: item.amountEarned || item.rewardAmount || 0,
          creditOn: item.creditOn || item.acheivedOn || '',
          walletType: item.walletType || 'Income Wallet',
          status: item.status || 'Pending'
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load rank income', err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchUser = searchUserId ? r.userId.toLowerCase().includes(searchUserId.toLowerCase()) : true;
      const matchRank = rank === 'All' ? true : r.rank === rank;
      const matchStatus = status === 'All' ? true : r.status === status;
      const recordDate = r.creditOn.split(' ')[0];
      const matchStart = startDate ? recordDate >= startDate : true;
      const matchEnd = endDate ? recordDate <= endDate : true;
      return matchUser && matchRank && matchStatus && matchStart && matchEnd;
    });
  }, [searchUserId, rank, status, startDate, endDate]);

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
    a.download = 'rank_income.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom>Rank Income</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : rows.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No rank income records found</Alert>
      ) : (
        <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField label="Search User ID" size="small" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="rank-label">Rank</InputLabel>
            <Select labelId="rank-label" label="Rank" value={rank} onChange={(e) => setRank(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Bronze">Bronze</MenuItem>
              <MenuItem value="Silver">Silver</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
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
      <Paper>
        {/* Mobile-friendly cards (show on small screens) */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2 }}>
          <Stack spacing={2}>
            {paginated.map((r, i) => (
              <Paper variant="outlined" sx={{ p: 2 }} key={i}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
                  {r.userId} • {r.rank}
                </Typography>
                <Typography variant="body2">Income: {r.incomePct}% • Earned: ${r.amountEarned}</Typography>
                <Typography variant="body2">Credit On: {r.creditOn}</Typography>
                <Typography variant="body2">Wallet: {r.walletType} • Status: {r.status}</Typography>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* Original table (hide on small screens) */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <TableContainer component={Paper}>
            <Table size="small">
               <TableHead>
                 <TableRow>
                   <TableCell>S.No</TableCell>
                   <TableCell>User ID</TableCell>
                   <TableCell>Rank</TableCell>
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
                     <TableCell>{r.rank}</TableCell>
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
        </Box>
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
        </>
      )}
    </Box>
  );
};

export default RankIncome;