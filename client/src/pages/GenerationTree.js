import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Chip, CircularProgress, Alert } from '@mui/material';

const NodeCard = ({ node, onClick }) => (
  <Paper elevation={3} sx={{ p: 2, minWidth: 180, textAlign: 'center', border: node.isActive ? '2px solid #4caf50' : '2px solid #f44336' }} onClick={() => onClick?.(node)}>
    <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: node.isActive ? '#4caf50' : '#9e9e9e' }}>
      {node.name ? node.name[0].toUpperCase() : 'U'}
    </Avatar>
    <Typography variant="subtitle2" fontWeight="bold">{node.name || node.username}</Typography>
    <Typography variant="caption" color="text.secondary">ID: {node.referralCode || node.id}</Typography>
    <Box mt={1}>
      <Chip size="small" label={node.rank || 'Member'} color="primary" sx={{ mr: 1 }} />
      <Chip size="small" label={node.isActive ? 'Active' : 'Inactive'} color={node.isActive ? 'success' : 'default'} />
    </Box>
  </Paper>
);

const Connector = ({ vertical = 20, horizontal = 220 }) => (
  <Box sx={{ mt: 2 }}>
    <Box sx={{ width: 2, height: vertical, backgroundColor: '#ccc', mx: 'auto' }} />
    <Box sx={{ height: 2, backgroundColor: '#ccc', width: `${horizontal}px`, mx: 'auto', position: 'relative' }} />
  </Box>
);

const GenerationTree = () => {
  const [searchId, setSearchId] = useState('');
  const [treeData, setTreeData] = useState(null);
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
        // Build tree with current user as root
        const tree = {
          id: profileData.user?._id,
          name: profileData.user?.name || profileData.user?.username,
          referralCode: profileData.user?.referralCode,
          rank: profileData.user?.rank || 'Member',
          isActive: profileData.user?.isActive !== false,
          children: data.downline.map(child => formatNode(child))
        };
        setTreeData(tree);
      } else {
        // No downline yet - show just the user
        if (profileData.user) {
          setTreeData({
            id: profileData.user._id,
            name: profileData.user.name || profileData.user.username,
            referralCode: profileData.user.referralCode,
            rank: profileData.user.rank || 'Member',
            isActive: profileData.user.isActive !== false,
            children: []
          });
        }
      }
    } catch (err) {
      console.error('Error fetching tree:', err);
      setError('Failed to load generation tree');
    } finally {
      setLoading(false);
    }
  };

  const formatNode = (node) => ({
    id: node._id || node.id,
    name: node.name || node.username,
    referralCode: node.referralCode,
    rank: node.rank || 'Member',
    isActive: node.isActive !== false,
    children: node.children ? node.children.map(c => formatNode(c)) : []
  });

  const onSearch = () => {
    // TODO: Implement search to highlight/focus specific member
    if (searchId) {
      alert(`Search for ${searchId} - feature coming soon`);
    }
  };

  const TreeNode = ({ node }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
      <NodeCard node={node} />
      {node.children?.length > 0 && (
        <>
          <Connector horizontal={(node.children.length - 1) * 220} />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {node.children.map((c) => (
              <TreeNode key={c.id || c.referralCode} node={c} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Generation Tree</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Search by Member ID" 
              value={searchId} 
              onChange={(e) => setSearchId(e.target.value)} 
              placeholder="Enter referral code..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={onSearch}>Search</Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="outlined" onClick={fetchTreeData}>Refresh Tree</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, overflow: 'auto', minHeight: 400 }}>
        {treeData ? (
          <TreeNode node={treeData} />
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No referral network yet. Share your referral link to build your team!
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GenerationTree;