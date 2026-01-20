import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Menu,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  PersonAdd,
  TrendingUp,
  TrendingDown,
  Group,
  Star,
  Email,
  Phone,
  MoreVert,
  Edit,
  Block,
  CheckCircle,
  Cancel,
  Timeline,
  EmojiEvents,
  MonetizationOn,
} from '@mui/icons-material';

const TeamManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rankFilter, setRankFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      rank: 'Diamond',
      status: 'Active',
      joinDate: '2023-01-15',
      totalEarnings: 15420,
      monthlyEarnings: 2340,
      teamSize: 45,
      directReferrals: 8,
      avatar: 'https://via.placeholder.com/40?text=JS',
      performance: 92,
      lastActivity: '2 hours ago',
      location: 'New York, USA'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0124',
      rank: 'Gold',
      status: 'Active',
      joinDate: '2023-02-20',
      totalEarnings: 8750,
      monthlyEarnings: 1250,
      teamSize: 28,
      directReferrals: 5,
      avatar: 'https://via.placeholder.com/40?text=SJ',
      performance: 85,
      lastActivity: '1 day ago',
      location: 'California, USA'
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+1-555-0125',
      rank: 'Silver',
      status: 'Inactive',
      joinDate: '2023-03-10',
      totalEarnings: 4200,
      monthlyEarnings: 0,
      teamSize: 12,
      directReferrals: 3,
      avatar: 'https://via.placeholder.com/40?text=MC',
      performance: 45,
      lastActivity: '2 weeks ago',
      location: 'Texas, USA'
    },
    {
      id: 4,
      name: 'Lisa Rodriguez',
      email: 'lisa.r@email.com',
      phone: '+1-555-0126',
      rank: 'Platinum',
      status: 'Active',
      joinDate: '2022-12-05',
      totalEarnings: 22100,
      monthlyEarnings: 3200,
      teamSize: 67,
      directReferrals: 12,
      avatar: 'https://via.placeholder.com/40?text=LR',
      performance: 96,
      lastActivity: '30 minutes ago',
      location: 'Florida, USA'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.w@email.com',
      phone: '+1-555-0127',
      rank: 'Bronze',
      status: 'Pending',
      joinDate: '2024-01-08',
      totalEarnings: 850,
      monthlyEarnings: 850,
      teamSize: 3,
      directReferrals: 1,
      avatar: 'https://via.placeholder.com/40?text=DW',
      performance: 68,
      lastActivity: '5 hours ago',
      location: 'Nevada, USA'
    }
  ];

  const teamStats = [
    { label: 'Total Members', value: 155, change: '+12%', icon: <Group /> },
    { label: 'Active Members', value: 142, change: '+8%', icon: <CheckCircle /> },
    { label: 'Monthly Revenue', value: '$45,230', change: '+15%', icon: <MonetizationOn /> },
    { label: 'Top Performers', value: 23, change: '+5%', icon: <EmojiEvents /> }
  ];

  const recentActivities = [
    { type: 'join', member: 'Alex Thompson', action: 'joined the team', time: '2 hours ago' },
    { type: 'rank', member: 'Sarah Johnson', action: 'achieved Gold rank', time: '1 day ago' },
    { type: 'sale', member: 'John Smith', action: 'made a $500 sale', time: '3 hours ago' },
    { type: 'referral', member: 'Lisa Rodriguez', action: 'referred 2 new members', time: '5 hours ago' },
    { type: 'achievement', member: 'Mike Chen', action: 'completed training module', time: '1 day ago' }
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  const handleMenuClick = (event) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRankColor = (rank) => {
    const colors = {
      'Diamond': 'primary',
      'Platinum': 'secondary',
      'Gold': 'warning',
      'Silver': 'info',
      'Bronze': 'success'
    };
    return colors[rank] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'success',
      'Inactive': 'error',
      'Pending': 'warning'
    };
    return colors[status] || 'default';
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status.toLowerCase() === statusFilter;
    const matchesRank = rankFilter === 'all' || member.rank.toLowerCase() === rankFilter;
    return matchesSearch && matchesStatus && matchesRank;
  });

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Team Management
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage your team members, track performance, and monitor growth
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {teamStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" color="primary">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.change.startsWith('+') ? 'success' : 'error'}
                      icon={stat.change.startsWith('+') ? <TrendingUp /> : <TrendingDown />}
                    />
                  </Box>
                  <Box color="primary.main">
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Team Members" />
          <Tab label="Performance" />
          <Tab label="Recent Activity" />
        </Tabs>

        <TabPanel value={selectedTab} index={0}>
          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Rank</InputLabel>
              <Select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                label="Rank"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="diamond">Diamond</MenuItem>
                <MenuItem value="platinum">Platinum</MenuItem>
                <MenuItem value="gold">Gold</MenuItem>
                <MenuItem value="silver">Silver</MenuItem>
                <MenuItem value="bronze">Bronze</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              sx={{ ml: 'auto' }}
            >
              Add Member
            </Button>
          </Box>

          {/* Members Table */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Rank</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Team Size</TableCell>
                  <TableCell>Monthly Earnings</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar src={member.avatar} sx={{ mr: 2 }}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{member.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.rank}
                        color={getRankColor(member.rank)}
                        size="small"
                        icon={<Star />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
                        color={getStatusColor(member.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{member.teamSize}</TableCell>
                    <TableCell>${member.monthlyEarnings.toLocaleString()}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LinearProgress
                          variant="determinate"
                          value={member.performance}
                          sx={{ width: 60, mr: 1 }}
                        />
                        <Typography variant="body2">{member.performance}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {member.lastActivity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleMemberClick(member)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    <IconButton onClick={handleMenuClick}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Row actions menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
            <MenuItem onClick={handleMenuClose}>Suspend</MenuItem>
            <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
          </Menu>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Performance Overview
                  </Typography>
                  <Box height={300} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="text.secondary">
                      Performance charts will be displayed here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Performers
                  </Typography>
                  <List>
                    {teamMembers
                      .sort((a, b) => b.performance - a.performance)
                      .slice(0, 5)
                      .map((member, index) => (
                        <ListItem key={member.id}>
                          <ListItemAvatar>
                            <Avatar src={member.avatar}>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={member.name}
                            secondary={`${member.performance}% performance`}
                          />
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            color="primary"
                          />
                        </ListItem>
                      ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Team Activity
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <Timeline />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${activity.member} ${activity.action}`}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Member Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedMember && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Avatar src={selectedMember.avatar} sx={{ mr: 2 }}>
                  {selectedMember.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMember.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMember.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Contact Information</Typography>
                  <Typography variant="body2">Email: {selectedMember.email}</Typography>
                  <Typography variant="body2">Phone: {selectedMember.phone}</Typography>
                  <Typography variant="body2">Location: {selectedMember.location}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
                  <Typography variant="body2">Rank: {selectedMember.rank}</Typography>
                  <Typography variant="body2">Team Size: {selectedMember.teamSize}</Typography>
                  <Typography variant="body2">Direct Referrals: {selectedMember.directReferrals}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Earnings</Typography>
                  <Typography variant="body2">Total: ${selectedMember.totalEarnings.toLocaleString()}</Typography>
                  <Typography variant="body2">Monthly: ${selectedMember.monthlyEarnings.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Activity</Typography>
                  <Typography variant="body2">Join Date: {selectedMember.joinDate}</Typography>
                  <Typography variant="body2">Last Activity: {selectedMember.lastActivity}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<Email />}>
                Send Message
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} /> Edit Member
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Block sx={{ mr: 1 }} /> Suspend Member
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Email sx={{ mr: 1 }} /> Send Message
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeamManagement;
