import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3040';

const EditTransactionSummary = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [filters, setFilters] = useState({ userId: '', type: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const transactionTypes = [
    'deposit', 'withdrawal', 'investment', 'earning', 'commission',
    'refund', 'admin_credit', 'daily_return', 'bonus', 'referral_bonus'
  ];

  const statusOptions = ['pending', 'completed', 'failed', 'cancelled'];

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({ page, limit: 50 });
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.type) params.append('type', filters.type);

      const response = await fetch(`${API_BASE}/api/admin/transactions?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      } else {
        setTransactions([]);
        setError(data.message || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleEdit = (row) => {
    setEditRow(row._id);
    setEditData({
      amount: row.amount,
      status: row.status,
      description: row.description,
      adminNotes: row.adminNotes || '',
    });
  };

  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editData)
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Transaction updated successfully!', severity: 'success' });
        setEditRow(null);
        fetchTransactions(pagination.page);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to update', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating transaction', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    const id = deleteDialog.id;
    setDeleteDialog({ open: false, id: null });
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/admin/transactions/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Transaction deleted', severity: 'info' });
        fetchTransactions(pagination.page);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to delete', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting transaction', severity: 'error' });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      deposit: 'success', withdrawal: 'error', investment: 'primary',
      earning: 'info', commission: 'secondary', refund: 'warning',
      admin_credit: 'default', daily_return: 'info', bonus: 'success',
      referral_bonus: 'secondary',
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'warning', completed: 'success', failed: 'error', cancelled: 'default' };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          EDIT TRANSACTION SUMMARY
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchTransactions()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <MenuItem value="">All Types</MenuItem>
              {transactionTypes.map(t => (
                <MenuItem key={t} value={t}>{t.replace(/_/g, ' ').toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => fetchTransactions(1)}
            sx={{ textTransform: 'none' }}
          >
            Search
          </Button>
          <Typography variant="body2" color="text.secondary">
            Total: {pagination.total} transactions
          </Typography>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #7b2ff7 0%, #f107a3 100%)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Admin Notes</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((row, index) => (
                  <TableRow key={row._id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                    <TableCell>{(pagination.page - 1) * 50 + index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.userId}</TableCell>
                    <TableCell>{row.userName}</TableCell>
                    <TableCell>
                      <Chip label={row.type.replace(/_/g, ' ')} color={getTypeColor(row.type)} size="small" />
                    </TableCell>
                    <TableCell>
                      {editRow === row._id ? (
                        <TextField
                          type="number"
                          value={editData.amount}
                          onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                          size="small"
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: 'bold', color: row.amount >= 0 ? '#2e7d32' : '#d32f2f' }}>
                          $ {Math.abs(row.amount || 0).toFixed(2)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editRow === row._id ? (
                        <Select
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          {statusOptions.map(s => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      {editRow === row._id ? (
                        <TextField
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          size="small"
                          fullWidth
                        />
                      ) : (
                        <Typography variant="body2" noWrap>{row.description || '-'}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      {editRow === row._id ? (
                        <TextField
                          value={editData.adminNotes}
                          onChange={(e) => setEditData({ ...editData, adminNotes: e.target.value })}
                          size="small"
                          fullWidth
                          placeholder="Admin notes..."
                        />
                      ) : (
                        <Typography variant="body2" noWrap>{row.adminNotes || '-'}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {editRow === row._id ? (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Save">
                            <IconButton color="success" size="small" onClick={() => handleSave(row._id)}>
                              <SaveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton color="default" size="small" onClick={() => setEditRow(null)}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton color="primary" size="small" onClick={() => handleEdit(row)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton color="error" size="small" onClick={() => setDeleteDialog({ open: true, id: row._id })}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            <Button
              size="small"
              disabled={pagination.page <= 1}
              onClick={() => fetchTransactions(pagination.page - 1)}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Page {pagination.page} of {pagination.totalPages}
            </Typography>
            <Button
              size="small"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTransactions(pagination.page + 1)}
            >
              Next
            </Button>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this transaction? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditTransactionSummary;
