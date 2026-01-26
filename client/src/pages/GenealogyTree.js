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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AccountTree,
  Person,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  ExpandMore,
  ExpandLess,
  ContentCopy,
  CheckCircle,
  Cancel,
  PersonAdd,
  Groups,
  Timeline,
  Refresh,
} from '@mui/icons-material';

const GenealogyTree = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [directs, setDirects] = useState([]);
  const [downline, setDownline] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('authToken');

  // Fetch network stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/network/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch direct referrals
  const fetchDirects = async () => {
    try {
      const res = await fetch('/api/network/directs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDirects(data.directs);
      }
    } catch (err) {
      console.error('Failed to fetch directs:', err);
    }
  };

  // Fetch downline tree
  const fetchDownline = async () => {
    try {
      const res = await fetch('/api/network/downline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDownline(data.downline);
      }
    } catch (err) {
      console.error('Failed to fetch downline:', err);
    }
  };

  // Fetch genealogy tree
  const fetchTree = async () => {
    try {
      const res = await fetch('/api/network/genealogy', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTreeData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tree:', err);
    }
  };

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchStats(), fetchDirects(), fetchDownline(), fetchTree()]);
      } catch (err) {
        setError('Failed to load network data');
      }
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchDirects(), fetchDownline(), fetchTree()]);
    setLoading(false);
  };

  const handleCopyReferralCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/register?ref=${stats.referralCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNode(null);
  };

  const toggleExpand = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
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

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : status === 'suspended' ? 'error' : 'default';
  };

  // Tree Node Component for visualization
  const TreeNode = ({ node, level = 0 }) => {
    if (!node) return null;

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] !== false;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Card
          elevation={3}
          sx={{
            minWidth: 180,
            maxWidth: 220,
            cursor: 'pointer',
            border: node.isActive ? '2px solid #4caf50' : '2px solid #f44336',
            backgroundColor: getRankColor(node.rank),
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
            transition: 'all 0.2s'
          }}
          onClick={() => handleNodeClick(node)}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                {node.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ fontSize: '0.85rem' }}>
                  {node.name}
                </Typography>
                <Chip
                  label={`Level ${node.level}`}
                  size="small"
                  color="primary"
                  sx={{ fontSize: '0.65rem', height: 18 }}
                />
              </Box>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Team: {node.totalTeam || 0}
              </Typography>
              <Chip
                icon={node.isActive ? <CheckCircle sx={{ fontSize: 12 }} /> : <Cancel sx={{ fontSize: 12 }} />}
                label={node.isActive ? 'Active' : 'Inactive'}
                size="small"
                color={node.isActive ? 'success' : 'error'}
                sx={{ fontSize: '0.6rem', height: 18 }}
              />
            </Box>
            
            <Typography variant="body2" color="primary.dark" fontWeight="bold" sx={{ mt: 0.5 }}>
              ${(node.totalEarnings || 0).toLocaleString()}
            </Typography>
            
            {hasChildren && (
              <Box display="flex" justifyContent="center" mt={1}>
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                  sx={{ p: 0.5 }}
                >
                  {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  {node.children.length} direct{node.children.length > 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {hasChildren && isExpanded && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ width: 2, height: 15, backgroundColor: '#bdbdbd', mx: 'auto' }} />
            
            {node.children.length > 1 && (
              <Box sx={{ position: 'relative', height: 2, width: `${Math.min((node.children.length - 1) * 200, 800)}px`, backgroundColor: '#bdbdbd', mx: 'auto' }}>
                {node.children.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      width: 2,
                      height: 15,
                      backgroundColor: '#bdbdbd',
                      left: `${(index / (node.children.length - 1)) * 100}%`,
                      top: 0,
                      transform: 'translateX(-50%)'
                    }}
                  />
                ))}
              </Box>
            )}
            
            {node.children.length === 1 && (
              <Box sx={{ width: 2, height: 15, backgroundColor: '#bdbdbd', mx: 'auto' }} />
            )}
            
            <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {node.children.map((child) => (
                <TreeNode key={child.id} node={child} level={level + 1} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  // Downline Row Component
  const DownlineRow = ({ node, depth = 0 }) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <>
        <TableRow hover sx={{ backgroundColor: depth % 2 === 0 ? 'inherit' : 'action.hover' }}>
          <TableCell>
            <Box display="flex" alignItems="center" sx={{ pl: depth * 3 }}>
              {hasChildren && (
                <IconButton size="small" onClick={() => toggleExpand(node.id)}>
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
              {!hasChildren && <Box sx={{ width: 34 }} />}
              <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: 'primary.main', fontSize: '0.7rem' }}>
                {node.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </Avatar>
              <Typography variant="body2">{node.name}</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Chip label={`Level ${node.level}`} size="small" color="primary" sx={{ fontSize: '0.7rem' }} />
          </TableCell>
          <TableCell>
            <Chip 
              label={node.status} 
              size="small" 
              color={getStatusColor(node.status)}
              sx={{ fontSize: '0.7rem' }}
            />
          </TableCell>
          <TableCell align="right">${(node.totalInvested || 0).toLocaleString()}</TableCell>
          <TableCell align="right">${(node.totalEarned || 0).toLocaleString()}</TableCell>
          <TableCell align="center">{node.directCount || 0}</TableCell>
          <TableCell>{new Date(node.joinDate).toLocaleDateString()}</TableCell>
        </TableRow>
        {hasChildren && isExpanded && node.children.map(child => (
          <DownlineRow key={child.id} node={child} depth={depth + 1} />
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={400}>
        <CircularProgress size={50} />
        <Typography variant="body1" color="text.secondary" mt={2}>
          Loading your network data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" gutterBottom>
            My Network
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View your direct referrals and complete downline network
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Stats Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>My Direct Referrals</Typography>
                  <Typography variant="h3" fontWeight="bold">{stats?.directReferrals || 0}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Active: {stats?.activeDirects || 0}
                  </Typography>
                </Box>
                <PersonAdd sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Downline</Typography>
                  <Typography variant="h3" fontWeight="bold">{stats?.totalDownline || 0}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Complete Network
                  </Typography>
                </Box>
                <Groups sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Network</Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.totalDownline || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    All Levels Combined
                  </Typography>
                </Box>
                <AccountTree sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Your Referral Code</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ wordBreak: 'break-all' }}>
                    {stats?.referralCode || 'N/A'}
                  </Typography>
                  <Button 
                    size="small" 
                    startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                    onClick={handleCopyReferralCode}
                    sx={{ color: 'white', mt: 0.5, fontSize: '0.7rem' }}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </Box>
                <Timeline sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Level Breakdown */}
      {stats?.levelBreakdown && Object.keys(stats.levelBreakdown).length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Level-wise Breakdown</Typography>
          <Grid container spacing={2}>
            {Object.entries(stats.levelBreakdown).sort((a, b) => a[0] - b[0]).map(([level, count]) => (
              <Grid item xs={6} sm={4} md={2} key={level}>
                <Box textAlign="center" p={1} bgcolor="action.hover" borderRadius={1}>
                  <Typography variant="caption" color="text.secondary">Level {level}</Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">{count}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<PersonAdd />} 
            label={`My Direct (${directs.length})`}
            iconPosition="start"
          />
          <Tab 
            icon={<Groups />} 
            label={`My Downline (${stats?.totalDownline || 0})`}
            iconPosition="start"
          />
          <Tab 
            icon={<AccountTree />} 
            label="Tree View"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper elevation={2} sx={{ p: 0 }}>
          <Box p={2} bgcolor="primary.main" color="white">
            <Typography variant="h6">
              <PersonAdd sx={{ mr: 1, verticalAlign: 'middle' }} />
              My Direct Referrals (Level 1)
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              These are users YOU personally invited using your referral link
            </Typography>
          </Box>
          
          {directs.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Person sx={{ fontSize: 80, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary" mt={2}>
                No Direct Referrals Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Share your referral link to start building your network
              </Typography>
              <Button variant="contained" startIcon={<ContentCopy />} onClick={handleCopyReferralCode}>
                Copy Referral Link
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Invested</strong></TableCell>
                    <TableCell align="right"><strong>Earned</strong></TableCell>
                    <TableCell align="center"><strong>Their Directs</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {directs.map((direct) => (
                    <TableRow key={direct.id} hover onClick={() => handleNodeClick(direct)} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                            {direct.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </Avatar>
                          <Typography variant="body2">{direct.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{direct.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={direct.status} 
                          size="small" 
                          color={getStatusColor(direct.status)}
                        />
                      </TableCell>
                      <TableCell align="right">${(direct.totalInvested || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">${(direct.totalEarned || 0).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip label={direct.theirDirectCount} size="small" color="info" />
                      </TableCell>
                      <TableCell>{new Date(direct.joinDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper elevation={2} sx={{ p: 0 }}>
          <Box p={2} bgcolor="secondary.main" color="white">
            <Typography variant="h6">
              <Groups sx={{ mr: 1, verticalAlign: 'middle' }} />
              My Complete Downline Network
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              All members below you in your network (your directs + their directs + so on...)
            </Typography>
          </Box>
          
          {downline.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Groups sx={{ fontSize: 80, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary" mt={2}>
                No Downline Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your network will grow as your referrals invite others
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Level</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Invested</strong></TableCell>
                    <TableCell align="right"><strong>Earned</strong></TableCell>
                    <TableCell align="center"><strong>Their Directs</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {downline.map((node) => (
                    <DownlineRow key={node.id} node={node} depth={0} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              <AccountTree sx={{ mr: 1, verticalAlign: 'middle' }} />
              Network Tree Visualization
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>
                <ZoomOut />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </Typography>
              <IconButton onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}>
                <ZoomIn />
              </IconButton>
              <IconButton onClick={() => setZoomLevel(1)}>
                <CenterFocusStrong />
              </IconButton>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box 
            sx={{ 
              overflow: 'auto', 
              minHeight: 400,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            {treeData ? (
              <TreeNode node={treeData} />
            ) : (
              <Box textAlign="center" py={8}>
                <AccountTree sx={{ fontSize: 80, color: 'text.disabled' }} />
                <Typography variant="h6" color="text.secondary" mt={2}>
                  No network data available
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Info Section */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom color="info.main">
          📌 Understanding Your Network
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              My Direct (Direct Referrals)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These are users YOU personally invited/referred to join the system using your referral link. 
              They are at Level 1 in your network and typically give you higher commission percentages.
            </Typography>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <pre style={{ margin: 0 }}>
{`        YOU
       / | \\
      A  B  C   ← Your Directs (Level 1)`}
              </pre>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              My Downline (Complete Network)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This includes ALL members below you in your network (your directs + their directs + so on...). 
              Your complete "team" or "network" that shows total network strength.
            </Typography>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <pre style={{ margin: 0 }}>
{`       YOU
      / | \\
     A  B  C    ← Level 1
    /|    |\\
   D E    F G  ← Level 2
   |      |
   H      I    ← Level 3`}
              </pre>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Node Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedNode && (
          <>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'white', color: 'primary.main' }}>
                  {selectedNode.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedNode.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedNode.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Level</Typography>
                  <Chip label={`Level ${selectedNode.level}`} color="primary" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedNode.status || (selectedNode.isActive ? 'Active' : 'Inactive')} 
                    color={selectedNode.status === 'active' || selectedNode.isActive ? 'success' : 'error'} 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Invested</Typography>
                  <Typography variant="h6" color="primary">
                    ${(selectedNode.totalInvested || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Earned</Typography>
                  <Typography variant="h6" color="success.main">
                    ${(selectedNode.totalEarned || selectedNode.totalEarnings || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Join Date</Typography>
                  <Typography variant="body1">
                    {selectedNode.joinDate ? new Date(selectedNode.joinDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Their Direct Referrals</Typography>
                  <Typography variant="h6">{selectedNode.theirDirectCount || selectedNode.directCount || selectedNode.directReferrals || 0}</Typography>
                </Grid>
                {selectedNode.referralCode && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Referral Code</Typography>
                    <Typography variant="body1" fontFamily="monospace">{selectedNode.referralCode}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GenealogyTree;
