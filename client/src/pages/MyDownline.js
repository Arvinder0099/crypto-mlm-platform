import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { Group, MonetizationOn } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 1 }}>
    <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: `${color}15`, color: color, mr: 2 }}>
      {icon}
    </Box>
    <CardContent sx={{ p: '16px !important', flexGrow: 1 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div" fontWeight="bold">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const MyDownline = () => {
  const [directs, setDirects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalInvestment: 0
  });

  useEffect(() => {
    const fetchDirects = async () => {
      const token = localStorage.getItem('authToken');
      setLoading(true);
      try {
        // Fetch direct referrals only
        const res = await fetch('/api/network/directs', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        
        if (data.success) {
          const directList = data.directs || [];
          setDirects(directList);
          
          // Calculate stats
          const totalInv = directList.reduce((sum, item) => sum + (item.totalInvested || 0), 0);
          setStats({
            totalMembers: directList.length,
            totalInvestment: totalInv
          });
        } else {
          setError(data.message || 'Failed to fetch direct referrals');
        }
      } catch (err) {
        console.error('Failed to load directs', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchDirects();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="page-container" sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>My Direct Downline</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard 
            title="Number of Members" 
            value={stats.totalMembers} 
            icon={<Group />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard 
            title="Investments" 
            value={`$${stats.totalInvestment.toLocaleString()}`} 
            icon={<MonetizationOn />}
            color="#3b82f6"
          />
        </Grid>
      </Grid>

      {/* Directs List Table */}
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 600, borderBottom: '1px solid #eee' }}>
          History
        </Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 500 }}>
            <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Investment Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date of Activation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {directs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No direct referrals found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                directs.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {member.id || member.userId || 'N/A'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} color={member.totalInvested > 0 ? "success.main" : "text.secondary"}>
                        ${(member.totalInvested || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MyDownline;
