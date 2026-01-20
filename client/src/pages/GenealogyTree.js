import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  AccountTree,
  Person,
  Group,
  TrendingUp,
  MonetizationOn,
  Visibility,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  FilterList,
  Download,
  Share,
} from '@mui/icons-material';

const GenealogyTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState('binary');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterLevel, setFilterLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tree data from API
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    fetch('/api/network/genealogy', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setTreeData(data.data || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load genealogy tree', err);
        setError('Failed to load tree data');
        setLoading(false);
      });
  }, []);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNode(null);
  };

  const getRankColor = (rank) => {
    const colors = {
      'Diamond': '#E1BEE7',
      'Gold': '#FFD700',
      'Silver': '#C0C0C0',
      'Bronze': '#CD7F32'
    };
    return colors[rank] || '#f5f5f5';
  };

  const TreeNode = ({ node, level = 0 }) => {
    if (!node) return null;

    const hasChildren = node.children && node.children.length > 0;
    const shouldShowNode = filterLevel === 'all' || parseInt(filterLevel) >= node.level;

    if (!shouldShowNode) return null;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 2,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center'
        }}
      >
        {/* Node Card */}
        <Card
          elevation={3}
          sx={{
            minWidth: 200,
            cursor: 'pointer',
            border: node.isActive ? '2px solid #4caf50' : '2px solid #f44336',
            backgroundColor: getRankColor(node.rank),
            '&:hover': { transform: 'translateY(-2px)' },
            transition: 'transform 0.2s'
          }}
          onClick={() => handleNodeClick(node)}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar src={node.avatar} sx={{ width: 40, height: 40, mr: 1 }}>
                {node.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {node.name}
                </Typography>
                <Chip
                  label={node.rank}
                  size="small"
                  color="primary"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Level {node.level}
              </Typography>
              <Chip
                label={node.isActive ? 'Active' : 'Inactive'}
                size="small"
                color={node.isActive ? 'success' : 'error'}
                sx={{ fontSize: '0.6rem' }}
              />
            </Box>
            
            <Typography variant="body2" color="primary" fontWeight="bold">
              ${node.totalEarnings.toLocaleString()}
            </Typography>
            
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption">
                Team: {node.totalTeam}
              </Typography>
              <Typography variant="caption">
                Direct: {node.directReferrals}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Connection Lines and Children */}
        {hasChildren && (
          <Box sx={{ mt: 2 }}>
            {/* Vertical line */}
            <Box
              sx={{
                width: 2,
                height: 20,
                backgroundColor: '#ccc',
                mx: 'auto',
                mb: 1
              }}
            />
            
            {/* Horizontal line for multiple children */}
            {node.children.length > 1 && (
              <Box
                sx={{
                  height: 2,
                  backgroundColor: '#ccc',
                  width: `${(node.children.length - 1) * 220}px`,
                  mx: 'auto',
                  mb: 1,
                  position: 'relative'
                }}
              >
                {/* Vertical connectors */}
                {node.children.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      width: 2,
                      height: 20,
                      backgroundColor: '#ccc',
                      left: `${(index * 220) + (index === 0 ? 0 : -1)}px`,
                      top: 0
                    }}
                  />
                ))}
              </Box>
            )}
            
            {/* Children nodes */}
            <Box display="flex" justifyContent="center" gap={2}>
              {node.children.map((child) => (
                <TreeNode key={child.id} node={child} level={level + 1} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Network Genealogy Tree
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Visualize your MLM network structure and team performance.
      </Typography>

      {/* Controls */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                label="View Mode"
              >
                <MenuItem value="binary">Binary Tree</MenuItem>
                <MenuItem value="unilevel">Unilevel</MenuItem>
                <MenuItem value="matrix">Matrix</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter Level</InputLabel>
              <Select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                label="Filter Level"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="0">Level 0</MenuItem>
                <MenuItem value="1">Level 1</MenuItem>
                <MenuItem value="2">Level 2</MenuItem>
                <MenuItem value="3">Level 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>
                <ZoomOut />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </Typography>
              <IconButton onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}>
                <ZoomIn />
              </IconButton>
              <IconButton onClick={() => setZoomLevel(1)}>
                <CenterFocusStrong />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item sx={{ ml: 'auto' }}>
            <Box display="flex" gap={1}>
              <Button variant="outlined" startIcon={<Download />} size="small">
                Export
              </Button>
              <Button variant="outlined" startIcon={<Share />} size="small">
                Share
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tree Visualization */}
      <Paper elevation={2} sx={{ p: 3, overflow: 'auto', minHeight: 600 }}>
        {treeData ? (
          <TreeNode node={treeData} />
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              Loading network data...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Node Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedNode && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={selectedNode.avatar} sx={{ width: 50, height: 50 }}>
                  {selectedNode.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedNode.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedNode.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Rank</Typography>
                  <Chip label={selectedNode.rank} color="primary" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedNode.isActive ? 'Active' : 'Inactive'} 
                    color={selectedNode.isActive ? 'success' : 'error'} 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Level</Typography>
                  <Typography variant="h6">{selectedNode.level}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Join Date</Typography>
                  <Typography variant="body1">{selectedNode.joinDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Earnings</Typography>
                  <Typography variant="h6" color="primary">
                    ${selectedNode.totalEarnings.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Team Size</Typography>
                  <Typography variant="h6">{selectedNode.totalTeam}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Direct Referrals</Typography>
                  <Typography variant="h6">{selectedNode.directReferrals}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button variant="contained" startIcon={<Person />}>
                View Profile
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GenealogyTree;