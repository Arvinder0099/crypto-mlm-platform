import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Fab,
  Badge,
  Paper,
  Typography,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
  Zoom,
  Slide,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Tooltip,
  Collapse,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SupportAgent as SupportAgentIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  QuestionAnswer as FAQIcon,
  AccountBalance as WalletIcon,
  MonetizationOn as MoneyIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  ArrowBack as ArrowBackIcon,
  Headset as HeadsetIcon,
  AutoAwesome as AutoAwesomeIcon,
  TipsAndUpdates as TipsIcon,
  EmojiEmotions as EmojiIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { fetchWithAuth } from '../utils/api';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'chat', 'faq'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const messagesEndRef = useRef(null);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // FAQ Data
  const faqData = [
    {
      question: 'How do I deposit funds?',
      answer: 'Go to Dashboard → Deposit → Select your preferred cryptocurrency network → Copy the deposit address → Send funds from your wallet. Deposits are usually confirmed within 10-30 minutes.',
      icon: <WalletIcon />,
    },
    {
      question: 'How do I withdraw my earnings?',
      answer: 'Navigate to Withdrawal → Request Withdrawal → Enter amount and your wallet address → Submit request. Withdrawals are processed within 24-48 hours after admin approval.',
      icon: <MoneyIcon />,
    },
    {
      question: 'How does the referral system work?',
      answer: 'Share your unique referral link with friends. When they register and invest, you earn commission based on your level. Check the Referral Bonus page for your current earnings.',
      icon: <SpeedIcon />,
    },
    {
      question: 'How can I increase my earnings?',
      answer: 'You can increase earnings by: 1) Upgrading your investment plan, 2) Referring more active members, 3) Achieving higher ranks for bonus rewards.',
      icon: <TipsIcon />,
    },
    {
      question: 'Is my investment secure?',
      answer: 'Yes! We use bank-grade encryption, 2FA authentication, and secure wallet systems. Your funds are protected with multiple security layers.',
      icon: <SecurityIcon />,
    },
  ];

  // Quick action messages
  const quickReplies = [
    { label: '💰 Deposit Help', message: 'I need help with making a deposit' },
    { label: '💸 Withdrawal Issue', message: 'I have an issue with my withdrawal' },
    { label: '👥 Referral Question', message: 'I have a question about referrals' },
    { label: '🔐 Account Security', message: 'I need help with account security' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch unread count periodically
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetchWithAuth('/api/chat/unread-count');
        if (response.success) {
          setUnreadCount(response.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(messages.length === 0);
      const response = await fetchWithAuth('/api/chat/messages');
      if (response.success) {
        setChatInfo(response.chat);
        setMessages(response.messages || []);
        setUnreadCount(0);
        if (response.messages && response.messages.length > 0) {
          setShowQuickReplies(false);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      fetchMessages();
    }
  }, [isOpen, activeTab, fetchMessages]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'chat') return;
    
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab, fetchMessages]);

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || newMessage.trim();
    if (!text || sending) return;

    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      showSnackbar('Please login to chat with support', 'warning');
      return;
    }

    setNewMessage('');
    setSending(true);
    setShowQuickReplies(false);

    const tempMessage = {
      id: 'temp-' + Date.now(),
      message: text,
      senderType: 'user',
      senderName: 'You',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      console.log('📨 Sending message:', { chatId: chatInfo?.id, message: text });
      
      // Direct fetch with explicit headers to ensure proper JSON request
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${apiUrl}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: chatInfo?.id,
          message: text,
        }),
      });
      
      const response = await res.json();
      console.log('📬 Response:', response);

      if (response.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? response.message : m))
        );
        if (!chatInfo && response.chatId) {
          setChatInfo({ id: response.chatId, ticketId: response.ticketId });
        }
        showSnackbar('Message sent!', 'success');
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setNewMessage(text);
      showSnackbar(error.message || 'Failed to send message. Please try again.', 'error');
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

  const handleQuickReply = (reply) => {
    handleSendMessage(reply.message);
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
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Render Help Menu
  const renderHelpMenu = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 3, pt: 2 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <HeadsetIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          How can we help you? 🎯
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Get instant answers or chat with our support team
        </Typography>
      </Box>

      <List sx={{ px: 0 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => setActiveTab('chat')}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              <Badge badgeContent={unreadCount} color="error">
                <ChatIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary="💬 Live Chat Support"
              secondary="Chat with our team"
              secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
            />
            <AutoAwesomeIcon sx={{ opacity: 0.8 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => setActiveTab('faq')}
            sx={{
              borderRadius: 3,
              bgcolor: '#f0f7ff',
              py: 2,
              '&:hover': {
                bgcolor: '#e3f0ff',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#667eea' }}>
              <FAQIcon />
            </ListItemIcon>
            <ListItemText
              primary="❓ Quick FAQ"
              secondary="Find instant answers"
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, px: 1 }}>
        🔥 Popular Topics
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {['Deposits', 'Withdrawals', 'Referrals', 'ROI', 'KYC'].map((topic) => (
          <Chip
            key={topic}
            label={topic}
            size="small"
            onClick={() => {
              setActiveTab('chat');
              setTimeout(() => handleSendMessage(`I need help with ${topic}`), 500);
            }}
            sx={{
              bgcolor: '#f5f5f5',
              '&:hover': { bgcolor: '#eeeeee' },
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiIcon color="warning" />
          <span>Average response time: <strong>under 2 hours</strong></span>
        </Typography>
      </Box>
    </Box>
  );

  // Render FAQ Section
  const renderFAQ = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setActiveTab('menu')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight="bold">
            Frequently Asked Questions
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {faqData.map((faq, index) => (
          <Paper
            key={index}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: '#f8fafc',
              '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#667eea', width: 36, height: 36 }}>
                {faq.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {faq.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </Box>
            </Box>
          </Paper>
        ))}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ChatIcon />}
          onClick={() => setActiveTab('chat')}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Still need help? Chat with us
        </Button>
      </Box>
    </Box>
  );

  // Render Chat Section
  const renderChat = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Header */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'white',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton size="small" onClick={() => setActiveTab('menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: '#667eea', width: 36, height: 36 }}>
          <SupportAgentIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Support Team
          </Typography>
          <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
            Online
          </Typography>
        </Box>
        {chatInfo?.ticketId && (
          <Chip label={chatInfo.ticketId} size="small" variant="outlined" />
        )}
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: '#f5f7fb',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={32} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mb: 2,
                bgcolor: 'rgba(102, 126, 234, 0.1)',
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 32, color: '#667eea' }} />
            </Avatar>
            <Typography variant="body1" fontWeight="medium">
              👋 Hey there!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, maxWidth: 250 }}>
              Send us a message and we'll respond as soon as possible!
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isUser = msg.senderType === 'user';
              const showDate =
                index === 0 ||
                formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <Typography
                      variant="caption"
                      sx={{ textAlign: 'center', color: 'text.secondary', my: 1 }}
                    >
                      {formatDate(msg.createdAt)}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 1,
                        maxWidth: '80%',
                        flexDirection: isUser ? 'row-reverse' : 'row',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: isUser ? '#667eea' : '#764ba2',
                        }}
                      >
                        {isUser ? (
                          <PersonIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <SupportAgentIcon sx={{ fontSize: 16 }} />
                        )}
                      </Avatar>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 1.5,
                          px: 2,
                          backgroundColor: isUser ? '#e3e8ff !important' : '#e8e8e8 !important',
                          borderRadius: 2,
                          borderBottomRightRadius: isUser ? 0 : 2,
                          borderBottomLeftRadius: isUser ? 2 : 0,
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-wrap', 
                            fontWeight: 500,
                            color: '#000000 !important',
                          }}
                        >
                          {msg.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ 
                            display: 'block', 
                            textAlign: 'right', 
                            mt: 0.5, 
                            color: 'rgba(0,0,0,0.6) !important',
                          }}
                        >
                          {formatTime(msg.createdAt)}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Quick Replies */}
        <Collapse in={showQuickReplies && messages.length === 0}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Quick actions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickReplies.map((reply, index) => (
                <Chip
                  key={index}
                  label={reply.label}
                  size="small"
                  onClick={() => handleQuickReply(reply)}
                  sx={{
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Input */}
      <Divider />
      <Box sx={{ p: 2, bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f5f7fb',
              },
            }}
          />
          <Tooltip title="Send message">
            <IconButton
              color="primary"
              onClick={() => handleSendMessage()}
              disabled={!newMessage.trim() || sending}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled',
                },
              }}
            >
              {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Floating Help Button */}
      <Zoom in={!isOpen}>
        <Fab
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <HelpIcon sx={{ fontSize: 28 }} />
          </Badge>
        </Fab>
      </Zoom>

      {/* Floating Label */}
      <Zoom in={!isOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            zIndex: 1299,
            bgcolor: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            Need Help? 👋
          </Typography>
        </Box>
      </Zoom>

      {/* Chat Window */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100% - 32px)', sm: 400 },
            maxWidth: 400,
            height: { xs: 'calc(100vh - 120px)', sm: 550 },
            maxHeight: 550,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1300,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 44,
                  height: 44,
                }}
              >
                <HeadsetIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Help & Support
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  We're here to help 24/7
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'menu' && renderHelpMenu()}
            {activeTab === 'faq' && renderFAQ()}
            {activeTab === 'chat' && renderChat()}
          </Box>
        </Paper>
      </Slide>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FloatingChat;
