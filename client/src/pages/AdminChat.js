import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Chip,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Button,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  SupportAgent as SupportAgentIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

const AdminChat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const statusMap = ['all', 'open', 'in-progress', 'resolved', 'closed'];
      const status = statusMap[tabValue];
      
      const response = await fetchWithAuth(`/api/admin/chats?status=${status}`);
      if (response.success) {
        setChats(response.chats || []);
        setStats(response.stats || {});
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  }, [tabValue]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Poll for new chats
  useEffect(() => {
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  const fetchChatMessages = async (chatId) => {
    try {
      setLoadingMessages(true);
      const response = await fetchWithAuth(`/api/admin/chats/${chatId}`);
      if (response.success) {
        setSelectedChat(response.chat);
        setMessages(response.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectChat = (chat) => {
    fetchChatMessages(chat.id);
    // Update unread count locally
    setChats(prev => prev.map(c => 
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic update
    const tempMessage = {
      id: 'temp-' + Date.now(),
      message: messageText,
      senderType: 'admin',
      senderName: 'Admin',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetchWithAuth(`/api/admin/chats/${selectedChat.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: messageText }),
      });

      if (response.success) {
        setMessages(prev => prev.map(m => 
          m.id === tempMessage.id ? response.message : m
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedChat) return;
    
    try {
      const response = await fetchWithAuth(`/api/admin/chats/${selectedChat.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (response.success) {
        setSelectedChat(prev => ({ ...prev, status }));
        fetchChats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
    setMenuAnchor(null);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(dateString);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'warning',
      'in-progress': 'info',
      'resolved': 'success',
      'closed': 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <ErrorIcon fontSize="small" />;
      case 'in-progress': return <ScheduleIcon fontSize="small" />;
      case 'resolved': return <CheckCircleIcon fontSize="small" />;
      default: return null;
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Support Chat Inbox
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" color="warning.main">{stats.open || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Open</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" color="info.main">{stats.inProgress || 0}</Typography>
            <Typography variant="body2" color="text.secondary">In Progress</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" color="success.main">{stats.resolved || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Resolved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec' }}>
            <Typography variant="h4" color="error.main">{stats.unread || 0}</Typography>
            <Typography variant="body2" color="text.secondary">Unread</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Chat Area */}
      <Paper sx={{ flex: 1, display: 'flex', overflow: 'hidden', borderRadius: 2 }}>
        {/* Chat List */}
        <Box sx={{ 
          width: { xs: selectedChat ? 0 : '100%', md: 350 }, 
          borderRight: 1, 
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s',
          overflow: 'hidden',
        }}>
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All" />
            <Tab label="Open" />
            <Tab label="In Progress" />
            <Tab label="Resolved" />
            <Tab label="Closed" />
          </Tabs>

          {/* Search */}
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Chat List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredChats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>No chats found</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filteredChats.map((chat) => (
                  <React.Fragment key={chat.id}>
                    <ListItemButton
                      selected={selectedChat?.id === chat.id}
                      onClick={() => handleSelectChat(chat)}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={chat.unreadCount}
                          color="error"
                          invisible={!chat.unreadCount}
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
                              {chat.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(chat.lastMessageTime)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              noWrap
                              sx={{ fontSize: '0.75rem' }}
                            >
                              {chat.lastMessage}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Chip
                                size="small"
                                label={chat.status}
                                color={getStatusColor(chat.status)}
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {chat.ticketId}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>

          {/* Refresh Button */}
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={fetchChats}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Chat Messages */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: '#f5f7fb',
        }}>
          {!selectedChat ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              flexDirection: 'column',
              color: 'text.secondary',
            }}>
              <SupportAgentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6">Select a conversation</Typography>
              <Typography variant="body2">Choose a chat from the list to view messages</Typography>
            </Box>
          ) : (
            <>
              {/* Chat Header */}
              <Box sx={{ 
                p: 2, 
                bgcolor: 'white', 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedChat.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedChat.user.email} • {selectedChat.ticketId}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(selectedChat.status)}
                  label={selectedChat.status}
                  color={getStatusColor(selectedChat.status)}
                  size="small"
                />
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem onClick={() => handleUpdateStatus('open')}>Mark as Open</MenuItem>
                  <MenuItem onClick={() => handleUpdateStatus('in-progress')}>Mark as In Progress</MenuItem>
                  <MenuItem onClick={() => handleUpdateStatus('resolved')}>Mark as Resolved</MenuItem>
                  <MenuItem onClick={() => handleUpdateStatus('closed')}>Close Chat</MenuItem>
                </Menu>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {loadingMessages ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isAdmin = msg.senderType === 'admin';
                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-end',
                              gap: 1,
                              maxWidth: '70%',
                              flexDirection: isAdmin ? 'row-reverse' : 'row',
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: isAdmin ? '#667eea' : '#764ba2',
                              }}
                            >
                              {isAdmin ? (
                                <SupportAgentIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <PersonIcon sx={{ fontSize: 18 }} />
                              )}
                            </Avatar>
                            <Paper
                              sx={{
                                p: 1.5,
                                px: 2,
                                bgcolor: isAdmin ? '#667eea' : 'white',
                                color: isAdmin ? 'white' : 'text.primary',
                                borderRadius: 2,
                                borderBottomRightRadius: isAdmin ? 0 : 2,
                                borderBottomLeftRadius: isAdmin ? 2 : 0,
                              }}
                            >
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {msg.message}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  textAlign: 'right',
                                  mt: 0.5,
                                  opacity: 0.7,
                                }}
                              >
                                {formatTime(msg.createdAt)}
                              </Typography>
                            </Paper>
                          </Box>
                        </Box>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Box>

              {/* Reply Input */}
              <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending || selectedChat.status === 'closed'}
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending || selectedChat.status === 'closed'}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
                    }}
                  >
                    {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                  </IconButton>
                </Box>
                {selectedChat.status === 'closed' && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    This chat is closed. Reopen it to send messages.
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminChat;
