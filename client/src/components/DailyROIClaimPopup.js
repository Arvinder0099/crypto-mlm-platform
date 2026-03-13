                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, CircularProgress, Chip,
  Table, TableBody, TableCell, TableRow, TableContainer, Paper,
  Alert, IconButton, Divider, Fade, Zoom, Slide,
} from '@mui/material';
import {
  MonetizationOn, CheckCircle, Warning, Close, TrendingUp,
  AccessTime, Cancel,
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_URL || '';

const DailyROIClaimPopup = () => {
  const [open, setOpen] = useState(false);
  const [claimData, setClaimData] = useState(null);
  const [history, setHistory] = useState([]);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);
  const intervalRef = useRef(null);

  // Track daily dismissal via localStorage so popup auto-shows once per day per login
  const getTodayKey = () => `roi_popup_dismissed_${new Date().toISOString().slice(0, 10)}`;

  const checkClaimStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/roi/claim-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;

      const data = await res.json();
      setHistory(data.history || []);

      if (data.hasClaimable && data.claimable) {
        setClaimData(data.claimable);
        // Auto-open popup if not already dismissed today
        const todayKey = `roi_popup_dismissed_${new Date().toISOString().slice(0, 10)}`;
        if (localStorage.getItem(todayKey) !== 'true') {
          setOpen(true);
        }
      } else {
        setClaimData(null);
      }
      setChecked(true);
    } catch (err) {
      console.warn('Failed to check ROI claim status:', err);
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    // Check on mount with a short delay to let the app load
    const timer = setTimeout(checkClaimStatus, 1500);
    
    // Re-check every 5 minutes so user sees ROI as soon as admin processes it
    intervalRef.current = setInterval(checkClaimStatus, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkClaimStatus]);

  const handleClaim = async () => {
    if (!claimData) return;
    setClaiming(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/roi/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ claimId: claimData.id })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setClaimSuccess(true);
        setClaimResult(result);
        setClaimData(null);
      } else {
        setError(result.message || 'Failed to claim ROI');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(getTodayKey(), 'true');
    // Reset success state for next time
    setTimeout(() => {
      setClaimSuccess(false);
      setClaimResult(null);
      setError('');
    }, 300);
  };

  // Don't render anything if not checked yet
  if (!checked) return null;

  // Show the notification bell indicator if there's a claimable ROI
  const hasClaimable = claimData && !claimSuccess;

  return (
    <>
      {/* Top Banner - always visible when ROI is claimable */}
      {hasClaimable && !open && (
        <Slide direction="down" in mountOnEnter unmountOnExit>
          <Box
            onClick={() => { setOpen(true); }}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1400,
              background: 'linear-gradient(135deg, #f5a623 0%, #e8960f 100%)',
              color: '#fff',
              py: 1.2,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245, 166, 35, 0.5)',
              '&:hover': { background: 'linear-gradient(135deg, #e8960f 0%, #d48500 100%)' },
            }}
          >
            <MonetizationOn sx={{ fontSize: 24, animation: 'spin 2s linear infinite', '@keyframes spin': { '0%': { transform: 'rotateY(0deg)' }, '100%': { transform: 'rotateY(360deg)' } } }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
              Daily ROI Available: ${claimData.amount.toFixed(2)} USDT
            </Typography>
            <Button
              size="small"
              variant="contained"
              sx={{
                ml: 1,
                background: '#fff',
                color: '#e8960f',
                fontWeight: 800,
                fontSize: '0.8rem',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                '&:hover': { background: '#f0f0f0' },
              }}
            >
              CLAIM NOW
            </Button>
          </Box>
        </Slide>
      )}

      {/* Floating Claim ROI Button - visible when there's unclaimed ROI */}
      {hasClaimable && !open && (
        <Zoom in>
          <Box
            onClick={() => { setOpen(true); }}
            sx={{
              position: 'fixed',
              bottom: { xs: 80, sm: 30 },
              right: { xs: 16, sm: 30 },
              zIndex: 1300,
              cursor: 'pointer',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f5a623 0%, #f7c948 50%, #f5a623 100%)',
                borderRadius: '16px',
                px: 3,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: '0 8px 32px rgba(245, 166, 35, 0.4)',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              <MonetizationOn sx={{ color: '#fff', fontSize: 28 }} />
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.2 }}>
                  Claim ROI
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.75rem' }}>
                  ${claimData.amount.toFixed(2)} available
                </Typography>
              </Box>
            </Box>
          </Box>
        </Zoom>
      )}

      {/* Main Claim Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            mt: hasClaimable ? 5 : 0,
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: claimSuccess
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #f5a623 0%, #e8960f 100%)',
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {claimSuccess ? (
              <CheckCircle sx={{ color: '#fff', fontSize: 32 }} />
            ) : (
              <MonetizationOn sx={{ color: '#fff', fontSize: 32 }} />
            )}
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
                {claimSuccess ? 'ROI Claimed Successfully!' : 'Daily ROI Available'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {claimSuccess
                  ? 'Your earnings have been credited'
                  : 'Claim your daily return on investment'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, py: 3 }}>
          {/* Success State */}
          {claimSuccess && claimResult && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}>
                <CheckCircle sx={{ color: '#fff', fontSize: 48 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mb: 1 }}>
                +${claimResult.amount.toFixed(2)} USDT
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Successfully credited to your Utility Wallet
              </Typography>
              <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Utility Wallet Balance:</strong> ${claimResult.newUtilityWallet?.toFixed(2) || '0.00'} USDT
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Claimable State */}
          {!claimSuccess && claimData && (
            <>
              <Box sx={{
                textAlign: 'center', py: 2, px: 2,
                background: 'linear-gradient(135deg, rgba(245,166,35,0.08) 0%, rgba(245,166,35,0.02) 100%)',
                borderRadius: 2, mb: 3,
              }}>
                <TrendingUp sx={{ fontSize: 48, color: '#f5a623', mb: 1 }} />
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#f5a623' }}>
                  ${claimData.amount.toFixed(2)}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  USDT Available to Claim
                </Typography>
              </Box>

              {/* Breakdown */}
              {claimData.details && claimData.details.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {claimData.details.map((detail, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {detail.planName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700 }}>
                              +${detail.amount.toFixed(2)} USDT
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Alert severity="warning" icon={<AccessTime />} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> You must claim your daily ROI before midnight. Unclaimed ROI will be marked as <strong>missed</strong> and cannot be recovered.
                </Typography>
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
            </>
          )}

          {/* No claimable & not success - show history */}
          {!claimSuccess && !claimData && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <AccessTime sx={{ fontSize: 48, color: '#999', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No ROI available to claim today.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ROI becomes available after admin processes daily returns.
              </Typography>
            </Box>
          )}

          {/* Recent History */}
          {history.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Recent ROI History (Last 7 Days)
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {history.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ${item.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={item.status.toUpperCase()}
                            icon={
                              item.status === 'claimed' ? <CheckCircle /> :
                              item.status === 'missed' ? <Cancel /> :
                              <AccessTime />
                            }
                            color={
                              item.status === 'claimed' ? 'success' :
                              item.status === 'missed' ? 'error' :
                              'warning'
                            }
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1, flexDirection: 'column' }}>
          {!claimSuccess && claimData && (
            <>
              <Button
                variant="contained"
                onClick={handleClaim}
                disabled={claiming}
                fullWidth
                startIcon={claiming ? <CircularProgress size={20} color="inherit" /> : <MonetizationOn />}
                sx={{
                  background: 'linear-gradient(135deg, #f5a623 0%, #e8960f 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  px: 4,
                  py: 2,
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e8960f 0%, #d48500 100%)',
                  },
                  '&.Mui-disabled': {
                    background: '#ccc',
                    color: '#666',
                  },
                }}
              >
                {claiming ? 'Claiming...' : `Claim $${claimData.amount.toFixed(2)} ROI`}
              </Button>
              <Button onClick={handleClose} color="inherit" size="small" sx={{ opacity: 0.6, fontSize: '0.75rem' }}>
                Remind me later
              </Button>
            </>
          )}
          {(claimSuccess || !claimData) && (
            <Button onClick={handleClose} variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DailyROIClaimPopup;
