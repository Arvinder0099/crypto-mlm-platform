import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Box,
  Typography,
  Divider,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Dashboard as DashboardIcon,
  TrendingUp as InvestmentIcon,
  AccountTree as NetworkIcon,
  MonetizationOn as CommissionIcon,
  MonetizationOn,
  ShoppingCart,
  Assessment,
  AccountBalance as WalletIcon,
  AdminPanelSettings as AdminIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  School as LearningIcon,
  Analytics as AnalyticsIcon,
  Assignment as CompensationIcon,
  Store as ProductIcon,
  FamilyRestroom as GenealogyIcon,
  Star as FeaturesIcon,
  Group as TeamIcon,
  Assessment as ReportsIcon,
  VpnKey as MembersIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  AttachMoney as WithdrawalIcon,
  BarChart as FinancialIcon,
  VerifiedUser as ComplianceIcon,
  CheckCircle as ActivationIcon,
  PersonAdd as KYCIcon,
  MoreVert as MoreVertIcon,
  Campaign as AnnouncementIcon,
} from '@mui/icons-material';

function Sidebar({ open, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAdmin } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [disabledItems, setDisabledItems] = useState({});

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const toggleItemDisabled = (itemPath) => {
    setDisabledItems(prev => ({
      ...prev,
      [itemPath]: !prev[itemPath]
    }));
  };

  const handleItemClick = (path, hasSubItems = false) => {
    // Don't navigate if item is disabled
    if (disabledItems[path]) {
      return;
    }
    if (hasSubItems) {
      // Toggle submenu expansion
      setExpandedItems(prev => ({
        ...prev,
        [path]: !prev[path]
      }));
      // If sidebar is collapsed, open it to show submenu
      if (!open && onToggle) {
        onToggle();
      }
      return;
    }
    navigate(path);
    if (isMobile && open && onToggle) {
      onToggle();
    }
  };

  // User-specific menu items
  const userMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'Announcements',
      icon: <AnnouncementIcon />,
      path: '/announcements',
    },
    {
      text: 'Profile',
      icon: <SettingsIcon />,
      path: '/profile',
      submenu: [
        { text: 'Edit Profile', path: '/profile/edit' },
        { text: 'Withdrawal Address', path: '/profile/withdrawal-address' },
        { text: 'Change Password', path: '/profile/change-password' },
      ],
    },
    {
      text: 'Deposit',
      icon: <MonetizationOn />,
      path: '/deposit',
    },
    {
      text: 'Activation',
      icon: <ActivationIcon />,
      path: '/activation',
    },
    {
      text: 'MLM Network',
      icon: <NetworkIcon />,
      path: '/network',
      submenu: [
        { text: 'My Direct', path: '/my-direct' },
        { text: 'My Downline', path: '/my-downline' },
        { text: 'Generation Tree', path: '/generation-tree' },
      ]
    },
    {
      text: 'Support Hub',
      icon: <SupportIcon />,
      path: '/support',
      submenu: [
        { text: 'Messages & Tickets', path: '/support/messages' },
        { text: 'FAQs', path: '/support/faqs' },
      ]
    },
    {
      text: 'Security Settings',
      icon: <SecurityIcon />,
      path: '/security',
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/reports',
      submenu: [
        { text: 'Daily Income', path: '/reports/daily-income' },
        { text: 'Direct Income', path: '/reports/direct-income' },
        { text: 'Daily Level Income', path: '/reports/daily-level-income' },
        { text: 'Rank Income', path: '/reports/rank-income' },
        { text: 'All Transactions', path: '/reports/all-transactions' },
        { text: 'Deposit Report', path: '/reports/deposit-report' },
        { text: 'Activation Report', path: '/reports/activation-report' },
      ],
    },
    {
      text: 'Withdrawal',
      icon: <WithdrawalIcon />,
      path: '/withdrawal',
      submenu: [
        { text: 'Withdraw Request', path: '/withdrawal/request' },
        { text: 'Withdrawal Summary', path: '/withdrawal/summary' },
      ],
    },
  ];

  // Admin-specific menu items
  const adminMenuItems = [
    {
      text: 'Admin Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
    },
    {
      text: 'Edit Announcement',
      icon: <AnnouncementIcon />,
      path: '/admin/announcement',
    },
    {
      text: 'Members Management',
      icon: <MembersIcon />,
      path: '/members-area',
      submenu: [
        { text: 'Datewise Registrations', path: '/members-area/datewise-registrations' },
        { text: 'All Members', path: '/members-area/all-members' },
        { text: 'All Active Members', path: '/members-area/active-members' },
        { text: 'All In-Active Members', path: '/members-area/inactive-members' },
        { text: 'Wallet Statistics', path: '/members-area/wallet-statistics' },
        { text: 'Members Withdrawal Addresses', path: '/members-area/withdrawal-addresses' },
      ],
    },
    // KYC Approvals removed (KYC disabled)
    // {
    //   text: 'KYC Approvals',
    //   icon: <KYCIcon />,
    //   path: '/admin/kyc',
    // },
    {
      text: 'Activation',
      icon: <ActivationIcon />,
      path: '/activation-options',
      submenu: [
        { text: 'Pending Fund Requests', path: '/activation-options/pending-fund-requests' },
        { text: 'Processed Fund Requests', path: '/activation-options/processed-fund-requests' },
      ],
    },
    {
      text: 'Withdrawal Management',
      icon: <WithdrawalIcon />,
      path: '/withdrawal-management',
      submenu: [
        { text: 'Pending Requests', path: '/withdrawal-management/pending-requests' },
        { text: 'Requests Summary', path: '/withdrawal-management/requests-summary' },
        { text: 'Datewise Summary', path: '/withdrawal-management/datewise-summary' },
      ],
    },
    {
      text: 'Financial Reports',
      icon: <FinancialIcon />,
      path: '/financial-reports',
      submenu: [
        { text: 'Revenue', path: '/financial-reports?s=revenue' },
        { text: 'Expenses', path: '/financial-reports?s=expenses' },
        { text: 'Profit', path: '/financial-reports?s=profit' },
      ],
    },
    // Removed: { text: 'MLM Features', icon: <FeaturesIcon />, path: '/features' }
    {
      text: 'Admin Settings',
      icon: <SettingsIcon />,
      path: '/admin-settings',
      submenu: [
        { text: 'Edit Dashboard', path: '/dashboard-settings' },
        { text: 'ROI SETUP', path: '/admin-settings/roi-setup' },
        { text: 'Deposit Address Setup', path: '/admin-settings/deposit-address-setup' },
        { text: 'Eliminate Specific Condition', path: '/admin-settings/eliminate-specific-condition' },
        { text: 'Manage Popup', path: '/admin-settings/manage-popup' },
      ],
    },
    {
      text: 'Security & Compliance',
      icon: <SecurityIcon />,
      path: '/security-compliance',
      submenu: [
        { text: 'Security Settings', path: '/security' },
      ]
    },
    {
      text: 'Reports',
      icon: <Assessment />,
      path: '/reports',
      submenu: [
        { text: 'Daily Income Summary', path: '/reports/daily-income-summary' },
        { text: 'Direct Income Summary', path: '/reports/direct-income-summary' },
        { text: 'Daily Level Income Summary', path: '/reports/daily-level-income-summary' },
        { text: 'Rank Income Summary', path: '/reports/rank-income-summary' },
        { text: 'Transaction Summary', path: '/reports/transaction-summary' },
      ]
    },
  ];

  const adminItems = [
    // Removed - now integrated into adminMenuItems
  ];

  const supportItems = [
    // Removed - now integrated into userMenuItems and adminMenuItems
  ];

  const renderMenuItem = (item, isSubmenu = false) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems[item.path];

    return (
      <React.Fragment key={item.path}>
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
          <Tooltip title={!open ? item.text : ''} placement="right">
            <ListItemButton
              onClick={() => handleItemClick(item.path, hasSubmenu)}
              sx={{
                minHeight: 52,
                justifyContent: open ? 'initial' : 'center',
                px: 2,
                mx: 1.5,
                pl: isSubmenu ? 4 : 2,
                borderRadius: '12px',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                backdropFilter: isActive ? 'blur(10px)' : 'none',
                boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                  fontSize: 24,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  display: open ? 'block' : 'none',
                  '& .MuiListItemText-primary': {
                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.3px',
                  },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              />
              {hasSubmenu && open && (
                isExpanded ? <ExpandLess sx={{ color: 'rgba(255, 255, 255, 0.9)' }} /> : <ExpandMore sx={{ color: 'rgba(255, 255, 255, 0.9)' }} />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        
        {hasSubmenu && (
          <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', mx: 1.5, borderRadius: '12px', mb: 1 }}>
              {item.submenu.map((subItem) => renderMenuItem(subItem, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: open ? 240 : 60,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        zIndex: (theme) => theme.zIndex.drawer,
        '& .MuiDrawer-paper': {
          width: open ? 240 : 60,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          mt: '70px',
          background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.98) 0%, rgba(118, 75, 162, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* Role-based Navigation */}
        <List>
          {isAdmin()
            ? adminMenuItems.map((item) => renderMenuItem(item))
            : userMenuItems.map((item) => renderMenuItem(item))
          }
        </List>
      </Box>

      {/* Three-dot menu at bottom */}
      <Divider />
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title="Menu Options" placement="top">
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
              },
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Menu for enabling/disabling items */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem disabled sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Menu Options
        </MenuItem>
        <Divider />
        {(isAdmin() ? adminMenuItems : userMenuItems).map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => toggleItemDisabled(item.path)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Checkbox
              checked={!disabledItems[item.path]}
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2">{item.text}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Drawer>
  );
};

export default Sidebar;
