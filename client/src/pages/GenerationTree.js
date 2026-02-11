import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Avatar, Chip, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';
import { Person } from '@mui/icons-material';

const GenerationTree = () => {
  const [flatList, setFlatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      
      // Fetch current user profile
      const profileRes = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      
      if (profileData.user) {
        setCurrentUser(profileData.user);
      }

      // Fetch downline tree
      const response = await fetch('/api/network/downline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.downline) {
        // Flatten the tree
        const flattened = [];
        const processNode = (node, level = 1) => {
          flattened.push({ ...node, level });
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => processNode(child, level + 1));
          }
        };
        
        data.downline.forEach(node => processNode(node)); // These are level 1
        setFlatList(flattened);
      }
    } catch (err) {
      console.error('Error fetching tree:', err);
      setError('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom>Generation History</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Top: Current User */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 2 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28 }}>
          {currentUser ? currentUser.firstName[0] : 'U'}
        </Avatar>
        <Box>
          <Typography variant="h6">{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}</Typography>
          <Typography variant="body2" color="text.secondary">ID: {currentUser?.userId}</Typography>
          <Box mt={1} display="flex" gap={1}>
             <Chip size="small" label={`Total Network: ${flatList.length}`} color="primary" variant="outlined" />
             <Button size="small" variant="outlined" onClick={fetchTreeData}>Refresh</Button>
          </Box>
        </Box>
      </Paper>

      {/* Bottom: History List */}
      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 600, borderBottom: '1px solid #eee' }}>Network History</Typography>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Member Name</TableCell>
                <TableCell>Investment</TableCell>
                <TableCell>Date of Activation</TableCell>
                <TableCell>Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flatList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No network members found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                flatList.map((node) => (
                  <TableRow key={node.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{node.name}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {node.referralCode || node.id || 'N/A'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={node.totalInvested > 0 ? "success.main" : "text.secondary"}>
                        ${(node.totalInvested || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {node.joinDate ? new Date(node.joinDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip label={`Lvl ${node.level}`} size="small" variant="outlined" />
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

export default GenerationTree;