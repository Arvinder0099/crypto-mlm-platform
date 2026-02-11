import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Divider,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Tooltip,
  Fab,
  Drawer,
  AppBar,
  Toolbar,
  InputAdornment,
  LinearProgress,
  Rating,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Container,
} from '@mui/material';
import {
  Support,
  Message,
  Notifications,
  Help,
  Send,
  Add,
  ExpandMore,
  Email,
  Sms,
  CheckCircle,
  Schedule,
  Flag,
  Person,
  Reply,
  Search,
  FilterList,
  Refresh,
  Download,
  Close,
  Chat,
  Phone,
  VideoCall,
  AttachFile,
  EmojiEmotions,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  Bookmark,
  BookmarkBorder,
  Print,
  Share,
  Visibility,
  Edit,
  Delete,
  PriorityHigh,
  Assignment,
  AccessTime,
  Group,
  TrendingUp,
  Analytics,
  QuestionAnswer,
  LiveHelp,
  ContactSupport,
  Headset,
  Forum,
  School,
  MenuBook,
  PlayCircle,
  Article,
  Quiz,
  Assignment as AssignmentIcon,
  Timeline,
  Speed,
  Security,
  Payment,
  AccountBalance,
  Gavel,
  VerifiedUser,
  Warning,
  Info,
  Error as ErrorIcon,
  Pending,
  Done,
  HourglassEmpty,
  Cancel,
  Block,
  CheckCircleOutline,
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`support-tabpanel-${index}`}
      aria-labelledby={`support-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', minWidth: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SupportHub = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    attachments: [],
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineAgents, setOnlineAgents] = useState(3);
  const [avgResponseTime, setAvgResponseTime] = useState('2 minutes');

  // Tickets data - fetch from API
  const [tickets, setTickets] = useState([]);

  // FAQ data - fetch from API
  const [faqs, setFaqs] = useState([]);

  // Fetch tickets and FAQs from API
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    // Fetch tickets
    fetch('/api/support/tickets', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setTickets(data.data || []);
      })
      .catch(err => {
        console.error('Failed to load tickets', err);
      });

    // Fetch FAQs
    fetch('/api/support/faqs', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setFaqs(data.data || []);
      })
      .catch(err => {
        console.error('Failed to load FAQs', err);
      });
  }, []);

  // Knowledge base articles - fetch from API
  const [knowledgeBase, setKnowledgeBase] = useState([]);

  // Support metrics - initialized with zeros
  const [supportMetrics, setSupportMetrics] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedToday: 0,
    avgResolutionTime: '0 hours',
    customerSatisfaction: 0,
    firstResponseTime: '0 minutes',
  });

  // Fetch additional data
  useEffect(() => {
    const token = localStorage.getItem('authToken');

    // Fetch knowledge base
    fetch('/api/support/knowledge-base', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setKnowledgeBase(data.data || []);
      })
      .catch(err => {
        console.error('Failed to load knowledge base', err);
      });

    // Fetch support metrics
    fetch('/api/support/metrics', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setSupportMetrics(data.data);
        }
      })
      .catch(err => {
        console.error('Failed to load support metrics', err);
      });
  }, []);

  useEffect(() => {
    // Simulate real-time chat updates
    const interval = setInterval(() => {
      if (Math.random() > 0.95 && chatMessages.length > 0) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setChatMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'agent',
            message: 'Is there anything else I can help you with?',
            timestamp: new Date().toLocaleTimeString(),
          }]);
        }, 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatMessages]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.category || !newTicket.description) {
      return;
    }

    const ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      ...newTicket,
      status: 'open',
      createdDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      assignedAgent: 'Auto-assigned',
      estimatedResolution: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      satisfaction: null,
      messages: [{
        id: 1,
        sender: 'user',
        message: newTicket.description,
        timestamp: new Date().toISOString(),
        attachments: newTicket.attachments,
      }],
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ subject: '', category: '', priority: 'medium', description: '', attachments: [] });
    setShowNewTicketDialog(false);
  };

  const handleSendChatMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'agent',
          message: 'Thank you for your message. Let me help you with that.',
          timestamp: new Date().toLocaleTimeString(),
        }]);
      }, 1500);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'escalated': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <HourglassEmpty />;
      case 'in_progress': return <Pending />;
      case 'resolved': return <CheckCircleOutline />;
      case 'closed': return <Done />;
      case 'escalated': return <PriorityHigh />;
      default: return <Help />;
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Support & Help Center
      </Typography>

      {/* Support Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {supportMetrics.totalTickets}
                  </Typography>
                  <Typography variant="body2">
                    Total Tickets
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {supportMetrics.openTickets}
                  </Typography>
                  <Typography variant="body2">
                    Open Tickets
                  </Typography>
                </Box>
                <Support sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {supportMetrics.resolvedToday}
                  </Typography>
                  <Typography variant="body2">
                    Resolved Today
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {supportMetrics.avgResolutionTime}
                  </Typography>
                  <Typography variant="body2">
                    Avg Resolution
                  </Typography>
                </Box>
                <AccessTime sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: 'black' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {supportMetrics.customerSatisfaction}
                  </Typography>
                  <Typography variant="body2">
                    Satisfaction
                  </Typography>
                </Box>
                <Star sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: 'black' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {onlineAgents}
                  </Typography>
                  <Typography variant="body2">
                    Agents Online
                  </Typography>
                </Box>
                <Headset sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setShowNewTicketDialog(true)}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Add sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Create Support Ticket</Typography>
              <Typography variant="body2" color="text.secondary">
                Get help from our support team with any issues or questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setShowChatDrawer(true)}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Chat sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Live Chat</Typography>
              <Typography variant="body2" color="text.secondary">
                Chat with our agents instantly • {onlineAgents} agents online • Avg response: {avgResponseTime}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => setActiveTab(2)}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Help sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Browse FAQ</Typography>
              <Typography variant="body2" color="text.secondary">
                Find quick answers to common questions in our knowledge base
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="My Tickets" icon={<Assignment />} />
          <Tab label="Knowledge Base" icon={<MenuBook />} />
          <Tab label="FAQ" icon={<QuestionAnswer />} />
          <Tab label="Contact Options" icon={<ContactSupport />} />
          <Tab label="System Status" icon={<Timeline />} />
        </Tabs>

        {/* My Tickets Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowNewTicketDialog(true)}
            >
              New Ticket
            </Button>
            <TextField
              size="small"
              placeholder="Search tickets..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />
              }}
            />
            <Button variant="outlined" startIcon={<FilterList />}>
              Filter
            </Button>
            <Button variant="outlined" startIcon={<Refresh />}>
              Refresh
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ticket ID</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Agent</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {ticket.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticket.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={ticket.category} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(ticket.status)}
                        label={ticket.status.replace('_', ' ')}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                          {ticket.assignedAgent.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2">
                          {ticket.assignedAgent}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(ticket.createdDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setSelectedTicket(ticket)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Reply />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Knowledge Base Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
            Knowledge Base Articles
          </Typography>
          
          <Grid container spacing={3}>
            {knowledgeBase.map((article) => (
              <Grid item xs={12} md={6} key={article.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Chip label={article.category} color="primary" size="small" />
                      <Box display="flex" alignItems="center">
                        <Rating value={article.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          ({article.rating})
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {article.description}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Box display="flex" gap={2}>
                        <Typography variant="caption" color="text.secondary">
                          <AccessTime sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          {article.readTime}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <Visibility sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          {article.views.toLocaleString()} views
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Updated: {article.lastUpdated}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* FAQ Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Investment">Investment</MenuItem>
                <MenuItem value="KYC">KYC</MenuItem>
                <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                <MenuItem value="MLM">MLM</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
                <MenuItem value="Technical">Technical</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Showing {filteredFAQs.length} of {faqs.length} frequently asked questions
          </Typography>

          {filteredFAQs.map((faq) => (
            <Accordion key={faq.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {faq.question}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label={faq.category} size="small" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      {faq.views} views
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {faq.answer}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Was this helpful?
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton size="small" color="success">
                      <ThumbUp fontSize="small" />
                    </IconButton>
                    <Typography variant="caption">{faq.helpful}</Typography>
                    <IconButton size="small" color="error">
                      <ThumbDown fontSize="small" />
                    </IconButton>
                    <Typography variant="caption">{faq.notHelpful}</Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>

        {/* Contact Options Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
            Contact Our Support Team
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Chat sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Live Chat</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Get instant help from our support agents
                  </Typography>
                  <Typography variant="body2" color="success.main" gutterBottom>
                    • {onlineAgents} agents online
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    • Average response: {avgResponseTime}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setShowChatDrawer(true)}
                    sx={{ mt: 2 }}
                  >
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Email sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Email Support</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Send us an email for detailed inquiries
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    support@crypto-mlm.com
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    • Response within 4-6 hours
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Phone sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>Phone Support</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Call us for urgent matters
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    1 (555) 123-4567
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    • Available 24/7
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Support Hours & Response Times
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon><Chat /></ListItemIcon>
                    <ListItemText
                      primary="Live Chat"
                      secondary="24/7 availability • Average response: 2 minutes"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText
                      primary="Email Support"
                      secondary="24/7 availability • Response within 4-6 hours"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Phone /></ListItemIcon>
                    <ListItemText
                      primary="Phone Support"
                      secondary="24/7 availability • Immediate assistance"
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Priority Support:</strong> VIP members and high-value investors receive priority support with faster response times and dedicated agents.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* System Status Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
            System Status & Health
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                    All Systems Operational
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText primary="Website & Dashboard" secondary="Fully operational" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText primary="Investment Processing" secondary="Normal processing times" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText primary="Withdrawal System" secondary="Processing normally" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText primary="KYC Verification" secondary="Automated system active" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Performance Metrics
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">System Response Time</Typography>
                      <LinearProgress variant="determinate" value={95} color="success" />
                      <Typography variant="caption">95% - Excellent</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">Server Uptime</Typography>
                      <LinearProgress variant="determinate" value={99.9} color="success" />
                      <Typography variant="caption">99.9% - Outstanding</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">Database Performance</Typography>
                      <LinearProgress variant="determinate" value={87} color="success" />
                      <Typography variant="caption">87% - Good</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent System Updates
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><Info color="info" /></ListItemIcon>
                <ListItemText
                  primary="Security Enhancement"
                  secondary="Enhanced two-factor authentication system deployed - January 20, 2024"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText
                  primary="Performance Optimization"
                  secondary="Dashboard loading speed improved by 40% - January 18, 2024"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info color="info" /></ListItemIcon>
                <ListItemText
                  primary="New Feature Release"
                  secondary="Advanced analytics dashboard for MLM tracking - January 15, 2024"
                />
              </ListItem>
            </List>
          </Box>
        </TabPanel>
      </Paper>

      {/* Live Chat Drawer */}
      <Drawer
        anchor="right"
        open={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: 400 } }}
      >
        <AppBar position="static" color="primary">
          <Toolbar>
            <Avatar sx={{ mr: 2 }}>
              <Headset />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Live Support</Typography>
              <Typography variant="caption">
                {onlineAgents} agents online • Avg response: {avgResponseTime}
              </Typography>
            </Box>
            <IconButton color="inherit" onClick={() => setShowChatDrawer(false)}>
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
          {chatMessages.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Chat sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Welcome to Live Support!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                How can we help you today?
              </Typography>
            </Box>
          ) : (
            <List>
              {chatMessages.map((message) => (
                <ListItem key={message.id} sx={{ flexDirection: 'column', alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <Box
                    sx={{
                      maxWidth: '80%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.200',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body2">{message.message}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {message.timestamp}
                  </Typography>
                </ListItem>
              ))}
              {isTyping && (
                <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.200' }}>
                    <Typography variant="body2">Agent is typing...</Typography>
                  </Box>
                </ListItem>
              )}
            </List>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendChatMessage();
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSendChatMessage} disabled={!newMessage.trim()}>
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Drawer>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicketDialog} onClose={() => setShowNewTicketDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Support Ticket</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={newTicket.subject}
            onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
            margin="normal"
            required
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <MenuItem value="Investment">Investment</MenuItem>
                  <MenuItem value="KYC">KYC Verification</MenuItem>
                  <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                  <MenuItem value="MLM">MLM Network</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Technical">Technical Issue</MenuItem>
                  <MenuItem value="Account">Account Management</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Description"
            value={newTicket.description}
            onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
            multiline
            rows={4}
            required
            helperText="Please provide as much detail as possible to help us resolve your issue quickly"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewTicketDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTicket} variant="contained">
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Chat Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setShowChatDrawer(true)}
      >
        <Badge badgeContent={onlineAgents} color="success">
          <Chat />
        </Badge>
      </Fab>
    </Box>
  );
};

export default SupportHub;