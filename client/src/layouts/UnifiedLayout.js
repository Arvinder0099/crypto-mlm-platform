import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Notifications,
  KeyboardArrowDown,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
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
    { label: 'My Investments', path: '/my-investments' },
    { label: 'Profile', type: 'dropdown', anchor: profileAnchor, setter: setProfileAnchor },
    { label: 'Deposit', path: '/deposit' },
    { label: 'Activation', path: '/activation' },
    { label: 'Genealogy', type: 'dropdown', anchor: genealogyAnchor, setter: setGenealogyAnchor },
    { label: 'Reports', type: 'dropdown', anchor: reportsAnchor, setter: setReportsAnchor },
    { label: 'Withdrawal', type: 'dropdown', anchor: withdrawalAnchor, setter: setWithdrawalAnchor },
    { label: 'Referral Bonus', path: '/referral-bonus' },
  ];

  // Admin Menu Items
  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Notifications', path: '/admin/notifications' },
    { label: 'Referral Bonuses', path: '/admin/referral-bonuses' },
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isAdmin() ? 'ADMIN PANEL' : 'MLM PLATFORM'}
        </Typography>
        <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      
      <List sx={{ px: 1 }}>
        {!isAdmin() ? (
          <>
            {/* User Dashboard */}
            <ListItemButton onClick={() => handleMobileNavigate('/dashboard')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Dashboard /></ListItemIcon>
              <ListItemText primary="Dashboard" />
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

            {/* Deposit */}
            <ListItemButton onClick={() => handleMobileNavigate('/deposit')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><AccountBalance /></ListItemIcon>
              <ListItemText primary="Deposit" />
            </ListItemButton>

            {/* Activation */}
            <ListItemButton onClick={() => handleMobileNavigate('/activation')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><ChevronRight /></ListItemIcon>
              <ListItemText primary="Activation" />
            </ListItemButton>

            {/* Genealogy Submenu */}
            <ListItemButton onClick={() => setGenealogyOpen(!genealogyOpen)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><People /></ListItemIcon>
              <ListItemText primary="Genealogy" />
              {genealogyOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={genealogyOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/my-direct')}>
                  <ListItemText primary="My Direct" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
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
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><MonetizationOn /></ListItemIcon>
              <ListItemText primary="Referral Bonus" />
            </ListItemButton>
          </>
        ) : (
          <>
            {/* Admin Dashboard */}
            <ListItemButton onClick={() => handleMobileNavigate('/admin')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Dashboard /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>

            {/* Admin Notifications */}
            <ListItemButton onClick={() => handleMobileNavigate('/admin/notifications')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Notifications /></ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItemButton>

            {/* Admin Referral Bonuses */}
            <ListItemButton onClick={() => handleMobileNavigate('/admin/referral-bonuses')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><MonetizationOn /></ListItemIcon>
              <ListItemText primary="Referral Bonuses" />
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
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/members-area/resend-mail')}>
                  <ListItemText primary="Resend Mail" primaryTypographyProps={{ fontSize: 14 }} />
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
                  <ListItemText primary="Processed Fund Requests" primaryTypographyProps={{ fontSize: 14 }} />
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
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/edit-plans')}>
                  <ListItemText primary="Edit Plans" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/roi-setup')}>
                  <ListItemText primary="ROI Setup" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/deposit-address-setup')}>
                  <ListItemText primary="💳 Edit Wallet Addresses" primaryTypographyProps={{ fontSize: 14, fontWeight: 'bold' }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/eliminate-specific-condition')}>
                  <ListItemText primary="Eliminate Specific Condition" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/admin-settings/manage-popup')}>
                  <ListItemText primary="Manage Popup" primaryTypographyProps={{ fontSize: 14 }} />
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
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/reports/direct-income-summary')}>
                  <ListItemText primary="Direct Income Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/reports/daily-level-income-summary')}>
                  <ListItemText primary="Daily Level Income Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/reports/rank-income-summary')}>
                  <ListItemText primary="Rank Income Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 6, borderRadius: 2 }} onClick={() => handleMobileNavigate('/reports/transaction-summary')}>
                  <ListItemText primary="Transaction Summary" primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
        
        {/* Logout */}
        <ListItemButton 
          onClick={() => { handleLogout(); setMobileDrawerOpen(false); }} 
          sx={{ 
            borderRadius: 2, 
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
            {isAdmin() ? 'ADMIN PANEL' : 'MLM PLATFORM'}
          </Typography>

          {/* Horizontal Menu - Desktop Only */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              <Badge badgeContent={4} color="error">
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
      >
        <MenuItem onClick={() => setNotificationAnchor(null)}>
          New member registered
        </MenuItem>
        <MenuItem onClick={() => setNotificationAnchor(null)}>
          Withdrawal request pending
        </MenuItem>
        <MenuItem onClick={() => setNotificationAnchor(null)}>
          New commission earned
        </MenuItem>
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
          <MenuItem onClick={handleNavigate('/my-direct', setGenealogyAnchor)}>
            My Direct
          </MenuItem>
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
          <MenuItem onClick={handleNavigate('/members-area/resend-mail', setMembersAnchor)}>
            Resend Mail
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
            Processed Fund Requests
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
          <MenuItem onClick={handleNavigate('/admin/points-management', setSettingsAnchor)} sx={{ fontWeight: 'bold', color: 'success.main' }}>
            💰 Add USDT Points
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/edit-plans', setSettingsAnchor)}>
            Edit Plans
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/roi-setup', setSettingsAnchor)}>
            ROI Setup
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/deposit-address-setup', setSettingsAnchor)} sx={{ fontWeight: 'bold' }}>
            💳 Edit Wallet Addresses
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/eliminate-specific-condition', setSettingsAnchor)}>
            Eliminate Specific Condition
          </MenuItem>
          <MenuItem onClick={handleNavigate('/admin-settings/manage-popup', setSettingsAnchor)}>
            Manage Popup
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
          <MenuItem onClick={handleNavigate('/reports/direct-income-summary', setAdminReportsAnchor)}>
            Direct Income Summary
          </MenuItem>
          <MenuItem onClick={handleNavigate('/reports/daily-level-income-summary', setAdminReportsAnchor)}>
            Daily Level Income Summary
          </MenuItem>
          <MenuItem onClick={handleNavigate('/reports/rank-income-summary', setAdminReportsAnchor)}>
            Rank Income Summary
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
          marginTop: { xs: '56px', sm: '64px' },
          minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: { xs: 2, sm: 3, md: 4 },
            padding: { xs: 1.5, sm: 2, md: 3 },
            minHeight: { xs: 'calc(100vh - 80px)', sm: 'calc(100vh - 100px)', md: 'calc(100vh - 112px)' },
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default UnifiedLayout;