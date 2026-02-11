import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, TablePagination, CircularProgress, Alert, TableContainer } from '@mui/material';
import { fetchWithAuth } from '../utils/api';

// Sample rows removed; data is now fetched from backend

function toCSV(data) {
  const headers = ['S.No','User ID','Activation Type','Investment ($)','Date','Credit On','Wallet Type','Status'];
  const lines = data.map(r => [r.sNo, r.userId, r.activationType, r.investment, r.date, r.creditOn, r.walletType, r.status].join(','));
  return [headers.join(','), ...lines].join('\n');
}

const ActivationReport = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [activationType, setActivationType] = useState('All');
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
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        if (searchUserId) params.set('userId', searchUserId);
        if (status !== 'All') params.set('status', status);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        const qs = params.toString();
        const json = await fetchWithAuth(`/api/activations/report${qs ? `?${qs}` : ''}` , { signal: controller.signal });
        const data = (json.data || []).map((r, idx) => ({
          sNo: idx + 1,
          userId: r.userId ?? 'N/A',
          activationType: r.activationType ?? 'N/A',
          investment: r.investment ?? 0,
          date: (r.activatedAt || '').slice(0, 10),
          creditOn: r.activatedAt ?? new Date().toISOString(),
          walletType: r.walletType ?? 'Activation Wallet',
          status: r.status ?? 'N/A',
        }));
        if (isMounted) { setRows(data); setPage(0); }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        if (isMounted) setError(err.message || 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; controller.abort(); };
  }, [searchUserId, status, startDate, endDate]);
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchUser = searchUserId ? r.userId.toLowerCase().includes(searchUserId.toLowerCase()) : true;
      const matchType = activationType === 'All' ? true : r.activationType === activationType;
      const matchStatus = status === 'All' ? true : r.status === status;
      const matchStart = startDate ? r.date >= startDate : true;
      const matchEnd = endDate ? r.date <= endDate : true;
      return matchUser && matchType && matchStatus && matchStart && matchEnd;
    });
  }, [rows, searchUserId, activationType, status, startDate, endDate]);

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
    a.download = 'activation_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <Typography variant="h5" gutterBottom>Activation Report</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField label="Search User ID" size="small" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="activation-type-label">Activation Type</InputLabel>
            <Select labelId="activation-type-label" label="Activation Type" value={activationType} onChange={(e) => setActivationType(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Package A">Package A</MenuItem>
              <MenuItem value="Package B">Package B</MenuItem>
              <MenuItem value="Package C">Package C</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Activated">Activated</MenuItem>
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
              <TableCell>Activation Type</TableCell>
              <TableCell>Investment ($)</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Credit On</TableCell>
              <TableCell>Wallet Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row) => (
              <TableRow key={`${row.sNo}-${row.userId}`}>
                <TableCell>{row.sNo}</TableCell>
                <TableCell>{row.userId}</TableCell>
                <TableCell>{row.activationType}</TableCell>
                <TableCell>{row.investment}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.creditOn}</TableCell>
                <TableCell>{row.walletType}</TableCell>
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

export default ActivationReport;