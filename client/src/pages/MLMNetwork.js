import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  AccountTree,
  Person,
  PersonAdd,
  TrendingUp,
  MonetizationOn,
  Share,
  ContentCopy,
  Visibility,
  ExpandMore,
  ExpandLess,
  Group,
  Star,
  Diamond,
  LocalAtm,
  EmojiEvents
} from '@mui/icons-material';
import { TreeView, TreeItem } from '@mui/x-tree-view';

const MLMNetwork = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(['1']);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User's referral data - initialized with zeros
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referralLink: '',
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissions: 0,
    thisMonthCommissions: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    networkRank: 'New',
    nextRankRequirement: 0,
    levels: {
      level1: { count: 0, commission: 0, volume: 0 },
      level2: { count: 0, commission: 0, volume: 0 },
      level3: { count: 0, commission: 0, volume: 0 },
      level4: { count: 0, commission: 0, volume: 0 },
      level5: { count: 0, commission: 0, volume: 0 }
    },
    achievements: []
  });

  // Network tree structure - initialized empty
  const [networkTree, setNetworkTree] = useState(null);

  // Commission history - initialized empty
  const [commissionHistory, setCommissionHistory] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setLoading(true);

    Promise.all([
      fetch('/api/network/referral-data', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: null })),
      fetch('/api/network/tree', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: null })),
      fetch('/api/network/commission-history', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(res => res.json()).catch(() => ({ data: [] }))
    ])
      .then(([refData, treeData, commData]) => {
        if (refData.data) {
          setReferralData(prev => ({ ...prev, ...refData.data }));
        }
        if (treeData.data) {
          setNetworkTree(treeData.data);
        }
        if (commData.data) {
          setCommissionHistory(commData.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load network data', err);
        setError('Failed to load network data');
        setLoading(false);
      });
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    // Show success message
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 0: return <EmojiEvents sx={{ color: '#FFD700' }} />;
      case 1: return <Diamond sx={{ color: '#00BCD4' }} />;
      case 2: return <Star sx={{ color: '#9C27B0' }} />;
      default: return <Person sx={{ color: '#757575' }} />;
    }
  };

  const renderTreeNode = (node) => (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: node.level === 0 ? 'primary.main' : 'secondary.main' }}>
            {node.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: node.level === 0 ? 'bold' : 'normal' }}>
              {node.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Level {node.level} • ${node.totalInvestment.toLocaleString()} • Team: {node.teamSize}
            </Typography>
          </Box>
          <Chip
            label={node.status}
            size="small"
            color={getStatusColor(node.status)}
            sx={{ ml: 1 }}
          />
        </Box>
      }
      onClick={() => setSelectedNode(node)}
    >
      {node.children && node.children.map(child => renderTreeNode(child))}
    </TreeItem>
  );

  const renderNetworkOverview = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary">
              {referralData.totalReferrals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Referrals
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main">
              {referralData.activeReferrals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Members
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <MonetizationOn sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" color="warning.main">
              ${referralData.totalCommissions.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Commissions
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <LocalAtm sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" color="info.main">
              ${referralData.thisMonthCommissions.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This Month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Referral Tools */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Referral Tools
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Your Referral Code
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={referralData.referralCode}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
                <IconButton onClick={copyReferralLink}>
                  <ContentCopy />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Referral Link
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  value={referralData.referralLink}
                  InputProps={{ readOnly: true }}
                  size="small"
                />
                <IconButton onClick={copyReferralLink}>
                  <ContentCopy />
                </IconButton>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Share />}
              onClick={() => setShowReferralDialog(true)}
              fullWidth
            >
              Share Referral Link
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Level Breakdown */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Commission by Level
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>1</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Level 1: ${referralData.levels.level1.count} members`}
                  secondary={`Commission: $${referralData.levels.level1.commission.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>2</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Level 2: ${referralData.levels.level2.count} members`}
                  secondary={`Commission: $${referralData.levels.level2.commission.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.main' }}>3</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Level 3: ${referralData.levels.level3.count} members`}
                  secondary={`Commission: $${referralData.levels.level3.commission.toLocaleString()}`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderGenealogyTree = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Network Genealogy Tree
            </Typography>
            <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
              <TreeView
                defaultCollapseIcon={<ExpandLess />}
                defaultExpandIcon={<ExpandMore />}
                expanded={expandedNodes}
                onNodeToggle={(event, nodeIds) => setExpandedNodes(nodeIds)}
              >
                {renderTreeNode(networkTree)}
              </TreeView>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        {selectedNode ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Member Details
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}>
                  {selectedNode.name.charAt(0)}
                </Avatar>
                <Typography variant="h6">{selectedNode.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedNode.email}
                </Typography>
                <Chip
                  label={selectedNode.status}
                  color={getStatusColor(selectedNode.status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Level"
                    secondary={selectedNode.level}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Join Date"
                    secondary={selectedNode.joinDate}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Investment"
                    secondary={`$${selectedNode.totalInvestment.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Direct Referrals"
                    secondary={selectedNode.directReferrals}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Team Size"
                    secondary={selectedNode.teamSize}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Team Volume"
                    secondary={`$${selectedNode.teamVolume.toLocaleString()}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Member Details
              </Typography>
              <Alert severity="info">
                Click on a member in the tree to view their details
              </Alert>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );

  const renderCommissionHistory = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Commission History
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissionHistory.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{commission.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={commission.type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{commission.referral}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getLevelIcon(commission.level)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {commission.level === 0 ? 'Team' : `Level ${commission.level}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      ${commission.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        MLM Network
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your network, track referrals, and monitor commission earnings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<TrendingUp />} label="Overview" />
          <Tab icon={<AccountTree />} label="Genealogy Tree" />
          <Tab icon={<MonetizationOn />} label="Commission History" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderNetworkOverview()}
      {activeTab === 1 && renderGenealogyTree()}
      {activeTab === 2 && renderCommissionHistory()}

      {/* Share Referral Dialog */}
      <Dialog open={showReferralDialog} onClose={() => setShowReferralDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Your Referral Link</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Share your referral link through various channels:
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Share via Email
            </Button>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Share on Social Media
            </Button>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Generate QR Code
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReferralDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MLMNetwork;
