import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Notifications,
  KeyboardArrowDown,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Campaign,
  Dashboard,
  AccountCircle,
  MonetizationOn,
  Assessment,
  AccountBalance,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  ChevronRight,
  CheckCircle,
  CardGiftcard,
  AccountBalanceWallet,
  HelpOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FloatingChat from '../components/FloatingChat';
import DailyROIClaimPopup from '../components/DailyROIClaimPopup';

const API_BASE = process.env.REACT_APP_API_URL || '';

const UnifiedLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [genealogyAnchor, setGenealogyAnchor] = useState(null);
  const [reportsAnchor, setReportsAnchor] = useState(null);
  const [withdrawalAnchor, setWithdrawalAnchor] = useState(null);
  const [membersAnchor, setMembersAnchor] = useState(null);
  const [activationAnchor, setActivationAnchor] = useState(null);
  const [adminWithdrawalAnchor, setAdminWithdrawalAnchor] = useState(null);
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [adminReportsAnchor, setAdminReportsAnchor] = useState(null);
  
  // Real notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  
  // Mobile drawer submenu states
  const [profileOpen, setProfileOpen] = useState(false);
  const [genealogyOpen, setGenealogyOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [activationOpen, setActivationOpen] = useState(false);
  const [adminWithdrawalOpen, setAdminWithdrawalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminReportsOpen, setAdminReportsOpen] = useState(false);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const endpoint = isAdmin() ? `${API_BASE}/api/admin/notifications` : `${API_BASE}/api/user/notifications`;
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = isAdmin() 
        ? `${API_BASE}/api/admin/notifications/${notificationId}/read` 
        : `${API_BASE}/api/user/notifications/${notificationId}/read`;
      
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = isAdmin() 
        ? `${API_BASE}/api/admin/notifications/mark-all-read` 
        : `${API_BASE}/api/user/notifications/mark-all-read`;
      
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
    fetchNotifications(); // Refresh when opening
  };

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleMenuOpen = (setter) => (event) => {
    setter(event.currentTarget);
  };

  const handleMenuClose = (setter) => () => {
    setter(null);
  };

  const handleNavigate = (path, setter) => () => {
    navigate(path);
    if (setter) setter(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMobileNavigate = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // User Menu Items
  const userMenuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Deposit', path: '/deposit' },
    { label: 'My Wallet', path: '/my-wallet' },
    { label: 'Activation', path: '/activation' },
    { label: 'My Investments', path: '/my-investments' },
    { label: 'Profile', type: 'dropdown', anchor: profileAnchor, setter: setProfileAnchor },
    { label: 'Genealogy', type: 'dropdown', anchor: genealogyAnchor, setter: setGenealogyAnchor },
    { label: 'Reports', type: 'dropdown', anchor: reportsAnchor, setter: setReportsAnchor },
    { label: 'Withdrawal', type: 'dropdown', anchor: withdrawalAnchor, setter: setWithdrawalAnchor },
    { label: 'Referral Bonus', path: '/referral-bonus' },
    { label: 'Help', path: '/help' },
  ];

  // Admin Menu Items
  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Edit Announcement', path: '/admin/announcement' },
    { label: 'Referral Bonuses', path: '/admin/referral-bonuses' },
    { label: 'Support Chat', path: '/admin/support-chat' },
    { label: 'Members', type: 'dropdown', anchor: membersAnchor, setter: setMembersAnchor },
    { label: 'Activation', type: 'dropdown', anchor: activationAnchor, setter: setActivationAnchor },
    { label: 'Withdrawal', type: 'dropdown', anchor: adminWithdrawalAnchor, setter: setAdminWithdrawalAnchor },
    { label: 'Settings', type: 'dropdown', anchor: settingsAnchor, setter: setSettingsAnchor },
    { label: 'Reports', type: 'dropdown', anchor: adminReportsAnchor, setter: setAdminReportsAnchor },
  ];

  const menuItems = isAdmin() ? adminMenuItems : userMenuItems;

  // Mobile Drawer Content
  const renderMobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          maxHeight: '-webkit-fill-available',
          overflowX: 'hidden',
          overflowY: 'hidden',
          borderRadius: 0,
        },
      }}
    >
      {/* Fixed Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
          {isAdmin() ? 'ADMIN PANEL' : 'HEXANOVA'}
        </Typography>
        <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
      
      {/* Scrollable Menu Area */}
      <Box sx={{ 
        flex: '1 1 0%', 
        minHeight: 0,
        height: 0,
        overflowY: 'scroll', 
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        msOverflowStyle: 'auto',
        transform: 'translateZ(0)',
        willChange: 'scroll-position',
        position: 'relative',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.3)', borderRadius: 2 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
      }}>
      <List sx={{ px: 1, pb: 12 }}>
        {!isAdmin() ? (
          <>
            {/* User Dashboard */}
            <ListItemButton onClick={() => handleMobileNavigate('/dashboard')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Dashboard /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            {/* Announcements */}
            <ListItemButton onClick={() => handleMobileNavigate('/announcements')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Campaign /></ListItemIcon>
              <ListItemText primary="Announcements" />
            </ListItemButton>

            {/* Deposit */}
            <ListItemButton onClick={() => handleMobileNavigate('/deposit')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><AccountBalance /></ListItemIcon>
              <ListItemText primary="Deposit" />
            </ListItemButton>

            {/* My Wallet */}
            <ListItemButton onClick={() => handleMobileNavigate('/my-wallet')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><AccountBalance /></ListItemIcon>
              <ListItemText primary="My Wallet" />
            </ListItemButton>

            {/* Activation */}
            <ListItemButton onClick={() => handleMobileNavigate('/activation')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><ChevronRight /></ListItemIcon>
              <ListItemText primary="Activation" />
            </ListItemButton>

            {/* My Investments */}
            <ListItemButton onClick={() => handleMobileNavigate('/my-investments')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><MonetizationOn /></ListItemIcon>
              <ListItemText primary="My Investments" />
            </ListItemButton>

            {/* Profile Submenu */}
            <ListItemButton onClick={() => setProfileOpen(!profileOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><AccountCircle /></ListItemIcon>
              <ListItemText primary="Profile" />
              {profileOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={profileOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/profile/edit')}>
                  <ListItemText primary="Edit Profile" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/profile/change-password')}>
                  <ListItemText primary="Change Password" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/profile/withdrawal-address')}>
                  <ListItemText primary="Withdrawal Address" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Genealogy Submenu */}
            <ListItemButton onClick={() => setGenealogyOpen(!genealogyOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><People /></ListItemIcon>
              <ListItemText primary="Genealogy" />
              {genealogyOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={genealogyOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/my-downline')}>
                  <ListItemText primary="My Downline" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/generation-tree')}>
                  <ListItemText primary="Generation Tree" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Reports Submenu */}
            <ListItemButton onClick={() => setReportsOpen(!reportsOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Assessment /></ListItemIcon>
              <ListItemText primary="Reports" />
              {reportsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/reports/daily-income')}>
                  <ListItemText primary="Daily Income" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/reports/all-transactions')}>
                  <ListItemText primary="All Transactions" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Withdrawal Submenu */}
            <ListItemButton onClick={() => setWithdrawalOpen(!withdrawalOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><AccountBalance /></ListItemIcon>
              <ListItemText primary="Withdrawal" />
              {withdrawalOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={withdrawalOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/withdrawal/request')}>
                  <ListItemText primary="Withdraw Request" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/withdrawal/summary')}>
                  <ListItemText primary="Withdrawal Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Referral Bonus */}
            <ListItemButton onClick={() => handleMobileNavigate('/referral-bonus')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon className="glass-icon"><CardGiftcard /></ListItemIcon>
              <ListItemText primary="Referral Bonus" />
            </ListItemButton>

            {/* Help Center */}
            <ListItemButton onClick={() => handleMobileNavigate('/help')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><HelpOutline /></ListItemIcon>
              <ListItemText primary="Help Center" />
            </ListItemButton>
          </>
        ) : (
          <>
            {/* Admin Dashboard */}
            <ListItemButton onClick={() => handleMobileNavigate('/admin')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Dashboard /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            {/* Edit Announcement */}
            <ListItemButton onClick={() => handleMobileNavigate('/admin/announcement')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Campaign /></ListItemIcon>
              <ListItemText primary="Edit Announcement" />
            </ListItemButton>

            {/* Admin Referral Bonuses */}
            <ListItemButton onClick={() => handleMobileNavigate('/admin/referral-bonuses')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><MonetizationOn /></ListItemIcon>
              <ListItemText primary="Referral Bonuses" />
            </ListItemButton>

            {/* Admin Support Chat */}
            <ListItemButton onClick={() => handleMobileNavigate('/admin/support-chat')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><People /></ListItemIcon>
              <ListItemText primary="Support Chat" />
            </ListItemButton>

            {/* Members Submenu */}
            <ListItemButton onClick={() => setMembersOpen(!membersOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><People /></ListItemIcon>
              <ListItemText primary="Members" />
              {membersOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={membersOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/datewise-registrations')}>
                  <ListItemText primary="Datewise Registrations" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/all-members')}>
                  <ListItemText primary="All Members" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/active-members')}>
                  <ListItemText primary="Active Members" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/inactive-members')}>
                  <ListItemText primary="Inactive Members" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/wallet-statistics')}>
                  <ListItemText primary="Wallet Statistics" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/withdrawal-addresses')}>
                  <ListItemText primary="Withdrawal Addresses" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/change-sponsor')}>
                  <ListItemText primary="Change Sponsor" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/change-sponsor-summary')}>
                  <ListItemText primary="Change Sponsor Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Activation Submenu */}
            <ListItemButton onClick={() => setActivationOpen(!activationOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><ChevronRight /></ListItemIcon>
              <ListItemText primary="Activation" />
              {activationOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={activationOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/activation-options/pending-fund-requests')}>
                  <ListItemText primary="Pending Fund Requests" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/activation-options/processed-fund-requests')}>
                  <ListItemText primary="User Activation" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Admin Withdrawal Submenu */}
            <ListItemButton onClick={() => setAdminWithdrawalOpen(!adminWithdrawalOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><AccountBalance /></ListItemIcon>
              <ListItemText primary="Withdrawal" />
              {adminWithdrawalOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={adminWithdrawalOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/withdrawal-management/pending-requests')}>
                  <ListItemText primary="Pending Requests" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/withdrawal-management/requests-summary')}>
                  <ListItemText primary="Requests Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/withdrawal-management/datewise-summary')}>
                  <ListItemText primary="Datewise Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Settings Submenu */}
            <ListItemButton onClick={() => setSettingsOpen(!settingsOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Settings /></ListItemIcon>
              <ListItemText primary="Settings" />
              {settingsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/dashboard-settings')}>
                  <ListItemText primary="⚙️ Edit Dashboard" primaryTypographyProps={{ fontSize: 14, fontWeight: 'bold' }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/edit-plans')}>
                  <ListItemText primary="Edit Plans" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/deposit-address-setup')}>
                  <ListItemText primary="💳 Edit Wallet Addresses" primaryTypographyProps={{ fontSize: 14, fontWeight: 'bold' }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/eliminate-specific-condition')}>
                  <ListItemText primary="Eliminate Specific Condition" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/edit-transaction-summary')}>
                  <ListItemText primary="✏️ Edit Transaction Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/edit-help')}>
                  <ListItemText primary="📞 Edit Help Center" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Admin Reports Submenu */}
            <ListItemButton onClick={() => setAdminReportsOpen(!adminReportsOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Assessment /></ListItemIcon>
              <ListItemText primary="Reports" />
              {adminReportsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={adminReportsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/reports/daily-income-summary')}>
                  <ListItemText primary="Daily Income Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/reports/transaction-summary')}>
                  <ListItemText primary="Transaction Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

      </List>
      </Box>
      
      {/* Fixed Footer - Logout */}
      <Box sx={{ flexShrink: 0, p: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <ListItemButton 
          onClick={() => { handleLogout(); setMobileDrawerOpen(false); }} 
          sx={{ 
            borderRadius: 2, 
            bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            mx: 0.5,
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      {renderMobileDrawer()}
      
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          // Background handled by theme overrides (glassmorphism)
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              flexGrow: isMobile ? 1 : 0,
            }}
            onClick={() => navigate(isAdmin() ? '/admin' : '/dashboard')}
          >
            {isAdmin() ? 'ADMIN PANEL' : 'HEXANOVA'}
          </Typography>

          {/* Horizontal Menu - Desktop Only */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2, flexWrap: 'wrap' }}>
            {menuItems.map((item, index) => (
              item.type === 'dropdown' ? (
                <React.Fragment key={index}>
                  <Button
                    color="inherit"
                    endIcon={<KeyboardArrowDown />}
                    onClick={handleMenuOpen(item.setter)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                    px: 1,
                    py: 0.5,
                    fontSize: '0.8rem',
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </React.Fragment>
              ) : (
                <Button
                  key={index}
                  color="inherit"
                  onClick={handleNavigate(item.path)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 1,
                    py: 0.5,
                    fontSize: '0.8rem',
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              )
            ))}
            
            {/* Logout Button */}
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                px: 1.5,
                py: 0.5,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
          )}

          {/* Right Side Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Notifications />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 320,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
          {unreadCount > 0 && (
            <Typography 
              variant="caption" 
              sx={{ color: '#10b981', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={markAllAsRead}
            >
              Mark all as read
            </Typography>
          )}
        </Box>
        {notificationsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} sx={{ color: '#10b981' }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
          </Box>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem 
              key={notification._id}
              onClick={() => {
                markNotificationAsRead(notification._id);
                setNotificationAnchor(null);
              }}
              sx={{ 
                py: 1.5, 
                px: 2,
                backgroundColor: notification.isRead ? 'transparent' : 'rgba(16,185,129,0.08)',
                borderLeft: notification.isRead ? 'none' : '3px solid #10b981',
                '&:hover': { backgroundColor: 'rgba(16,185,129,0.15)' }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {!notification.isRead && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  )}
                  <Typography 
                    variant="body2" 
                    fontWeight={notification.isRead ? 400 : 600}
                    sx={{ flex: 1 }}
                  >
                    {notification.title}
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ display: 'block', whiteSpace: 'normal', lineHeight: 1.4 }}
                >
                  {notification.message}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}
                >
                  {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Profile Dropdown (User) */}
      {!isAdmin() && (
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleMenuClose(setProfileAnchor)}
        >
          <MenuItem onClick={handleNavigate('/profile/edit', setProfileAnchor)}>
            Edit Profile
          </MenuItem>
          <MenuItem onClick={handleNavigate('/profile/change-password', setProfileAnchor)}>
            Change Password
          </MenuItem>
          <MenuItem onClick={handleNavigate('/profile/withdrawal-address', setProfileAnchor)}>
            Withdrawal Address
          </MenuItem>
        </Menu>
      )}

      {/* Genealogy Dropdown (User) */}
      {!isAdmin() && (
        <Menu
          anchorEl={genealogyAnchor}
          open={Boolean(genealogyAnchor)}
          onClose={handleMenuClose(setGenealogyAnchor)}
        >
          <MenuItem onClick={handleNavigate('/my-downline', setGenealogyAnchor)}>
            My Downline
          </MenuItem>
          <MenuItem onClick={handleNavigate('/generation-tree', setGenealogyAnchor)}>
            Generation Tree
          </MenuItem>
        </Menu>
      )}

      {/* Reports Dropdown (User) */}
      {!isAdmin() && (
        <Menu
          anchorEl={reportsAnchor}
          open={Boolean(reportsAnchor)}
          onClose={handleMenuClose(setReportsAnchor)}
        >
          <MenuItem onClick={handleNavigate('/reports/daily-income', setReportsAnchor)}>
            Daily Income
          </MenuItem>
          <MenuItem onClick={handleNavigate('/reports/all-transactions', setReportsAnchor)}>
            All Transactions
          </MenuItem>
        </Menu>
      )}

      {/* Withdrawal Dropdown (User) */}
      {!isAdmin() && (
        <Menu
          anchorEl={withdrawalAnchor}
          open={Boolean(withdrawalAnchor)}
          onClose={handleMenuClose(setWithdrawalAnchor)}
        >
          <MenuItem onClick={handleNavigate('/withdrawal/request', setWithdrawalAnchor)}>
            Withdraw Request
          </MenuItem>
          <MenuItem onClick={handleNavigate('/withdrawal/summary', setWithdrawalAnchor)}>
            Withdrawal Summary
          </MenuItem>
        </Menu>
      )}

      {/* Members Dropdown (Admin) */}
      {isAdmin() && (
        <Menu
          anchorEl={membersAnchor}
          open={Boolean(membersAnchor)}
          onClose={handleMenuClose(setMembersAnchor)}
        >
          <MenuItem onClick={handleNavigate('/members-area/datewise-registrations', setMembersAnchor)}>
            Datewise Registrations
          </MenuItem>
          <MenuItem onClick={handleNavigate('/members-area/all-members', setMembersAnchor)}>
            All Members
          </MenuItem>
          <MenuItem onClick={handleNavigate('/members-area/active-members', setMembersAnchor)}>
            Active Members
          </MenuItem>
          <MenuItem onClick={handleNavigate('/members-area/inactive-members', setMembersAnchor)}>
            Inactive Members
          </MenuItem>
          <MenuItem onClick={handleNavigate('/members-area/wallet-statistics', setMembersAnchor)}>
            Wallet Statistics
          </MenuItem>
          <MenuItem onClick={handleNavigate('/members-area/withdrawal-addresses', setMembersAnchor)}>
            Withdrawal Addresses
          </MenuItem>
          <MenuItem onClick={handleNavigate('/members-area/change-sponsor', setMembersAnchor)}>
            Change Sponsor
          </MenuItem>
          <MenuItem onClick={handleNavigate('/members-area/change-sponsor-summary', setMembersAnchor)}>
            Change Sponsor Summary
          </MenuItem>
        </Menu>
      )}

      {/* Activation Dropdown (Admin) */}
      {isAdmin() && (
        <Menu
          anchorEl={activationAnchor}
          open={Boolean(activationAnchor)}
          onClose={handleMenuClose(setActivationAnchor)}
        >
          <MenuItem onClick={handleNavigate('/activation-options/pending-fund-requests', setActivationAnchor)}>
            Pending Fund Requests
          </MenuItem>
          <MenuItem onClick={handleNavigate('/activation-options/processed-fund-requests', setActivationAnchor)}>
            User Activation
          </MenuItem>
        </Menu>
      )}

      {/* Admin Withdrawal Dropdown */}
      {isAdmin() && (
        <Menu
          anchorEl={adminWithdrawalAnchor}
          open={Boolean(adminWithdrawalAnchor)}
          onClose={handleMenuClose(setAdminWithdrawalAnchor)}
        >
          <MenuItem onClick={handleNavigate('/withdrawal-management/pending-requests', setAdminWithdrawalAnchor)}>
            Pending Withdrawals
          </MenuItem>
          <MenuItem onClick={handleNavigate('/deposit-management/pending-deposits', setAdminWithdrawalAnchor)}>
            Pending Deposits
          </MenuItem>
          <MenuItem onClick={handleNavigate('/withdrawal-management/requests-summary', setAdminWithdrawalAnchor)}>
            Withdrawal Summary
          </MenuItem>
          <MenuItem onClick={handleNavigate('/withdrawal-management/datewise-summary', setAdminWithdrawalAnchor)}>
            Datewise Summary
          </MenuItem>
        </Menu>
      )}

      {/* Settings Dropdown (Admin) */}
      {isAdmin() && (
        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={handleMenuClose(setSettingsAnchor)}
        >
          <MenuItem onClick={handleNavigate('/dashboard-settings', setSettingsAnchor)} sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            ⚙️ Edit Dashboard
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin/points-management', setSettingsAnchor)} sx={{ fontWeight: 'bold', color: 'success.main' }}>
            💰 Add USDT Points
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/edit-plans', setSettingsAnchor)}>
            Edit Plans
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/deposit-address-setup', setSettingsAnchor)} sx={{ fontWeight: 'bold' }}>
            💳 Edit Wallet Addresses
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/eliminate-specific-condition', setSettingsAnchor)}>
            Eliminate Specific Condition
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/edit-transaction-summary', setSettingsAnchor)}>
            ✏️ Edit Transaction Summary
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/edit-help', setSettingsAnchor)}>
            📞 Edit Help Center
          </MenuItem>
        </Menu>
      )}

      {/* Admin Reports Dropdown */}
      {isAdmin() && (
        <Menu
          anchorEl={adminReportsAnchor}
          open={Boolean(adminReportsAnchor)}
          onClose={handleMenuClose(setAdminReportsAnchor)}
        >
          <MenuItem onClick={handleNavigate('/reports/daily-income-summary', setAdminReportsAnchor)}>
            Daily Income Summary
          </MenuItem>
          <MenuItem onClick={handleNavigate('/reports/transaction-summary', setAdminReportsAnchor)}>
            Transaction Summary
          </MenuItem>
        </Menu>
      )}

      {/* Main Content Area - Full Width */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minWidth: 0,
          maxWidth: '100vw',
          overflowX: 'hidden',
          marginTop: { xs: '56px', sm: '64px' },
          minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
          background: 'linear-gradient(145deg, #34d399 0%, #10b981 50%, #059669 100%)',
          padding: { xs: '6px', sm: 2, md: 3 },
          // Safe area support for notched phones
          paddingBottom: { xs: 'max(6px, env(safe-area-inset-bottom))', sm: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: { xs: 2, sm: 3, md: 4 },
            padding: { xs: '10px', sm: 2, md: 3 },
            minHeight: { xs: 'calc(100vh - 72px)', sm: 'calc(100vh - 100px)', md: 'calc(100vh - 112px)' },
            boxShadow: '10px 10px 30px rgba(16, 185, 129, 0.2), -5px -5px 15px rgba(255, 255, 255, 0.8)',
            width: '100%',
            minWidth: 0,
            overflowX: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Daily ROI Claim Popup for non-admin users */}
      {!isAdmin() && <DailyROIClaimPopup />}

      {/* Floating Chat for non-admin users */}
      {!isAdmin() && <FloatingChat />}
    </Box>
  );
};

export default UnifiedLayout;