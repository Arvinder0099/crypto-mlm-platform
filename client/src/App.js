import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';

// Import pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InvestmentPlans from './pages/InvestmentPlans';
import MLMNetwork from './pages/MLMNetwork';
import CommissionCalculator from './pages/CommissionCalculator';
import Wallet from './pages/Wallet';
import AdminPanel from './pages/AdminPanel';
import DashboardSettings from './pages/DashboardSettings';
import SupportHub from './pages/SupportHub';
import SecuritySettings from './pages/SecuritySettings';
import LearningCenter from './pages/LearningCenter';
import Analytics from './pages/Analytics';
import CompensationPlans from './pages/CompensationPlans';
import ProductCatalog from './pages/ProductCatalog';
import GenealogyTree from './pages/GenealogyTree';
import MLMFeatures from './pages/MLMFeatures';
import TeamManagement from './pages/TeamManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import MembersArea from './pages/MembersArea';
import MLMDashboard from './pages/MLMDashboard';
import MLMPlans from './pages/MLMPlans';
import MyInvestments from './pages/MyInvestments';

// Import new admin feature pages
import ActivationOptions from './pages/ActivationOptions';
import WithdrawalManagement from './pages/WithdrawalManagement';
import FinancialReports from './pages/FinancialReports';
import AdminSettings from './pages/AdminSettings';
import EditPlans from './pages/EditPlans';
import SecurityCompliance from './pages/SecurityCompliance';
// import TestSecurityCompliance from './TestSecurityCompliance';
// KYCApprovals import removed (KYC disabled)
import EditProfile from './pages/EditProfile';
import WithdrawalAddress from './pages/WithdrawalAddress';
import ChangePassword from './pages/ChangePassword';
import Deposit from './pages/Deposit';
import Activation from './pages/Activation';
import MyDirect from './pages/MyDirect';
import MyDownline from './pages/MyDownline';
import GenerationTree from './pages/GenerationTree';
import DailyIncome from './pages/DailyIncome';
import UserAnnouncement from './pages/UserAnnouncement';
import AdminAnnouncement from './pages/AdminAnnouncement';
import DirectIncome from './pages/DirectIncome';
import DailyLevelIncome from './pages/DailyLevelIncome';
import RankIncome from './pages/RankIncome';
import AllTransactions from './pages/AllTransactions';
import DepositReport from './pages/DepositReport';
import ActivationReport from './pages/ActivationReport';
import WithdrawalRequest from './pages/WithdrawalRequest';
import WithdrawalSummary from './pages/WithdrawalSummary';
import RoleRedirect from './pages/RoleRedirect';

// Import Members Management pages
import DatewiseRegistrations from './pages/DatewiseRegistrations';
import AllMembers from './pages/AllMembers';
import AllActiveMembers from './pages/AllActiveMembers';
import AllInactiveMembers from './pages/AllInactiveMembers';
import WalletStatistics from './pages/WalletStatistics';
import MembersWithdrawalAddresses from './pages/MembersWithdrawalAddresses';
import ResendMail from './pages/ResendMail';
import ChangeSponsor from './pages/ChangeSponsor';
import ChangeSponsorSummary from './pages/ChangeSponsorSummary';

// Import Activation pages
import AdminActivation from './pages/AdminActivation';
import AdminActivationSummary from './pages/AdminActivationSummary';
import AllActivationSummary from './pages/AllActivationSummary';
import PendingFundRequests from './pages/PendingFundRequests';
import ProcessedFundRequests from './pages/ProcessedFundRequests';

// Import Admin Chat
import AdminChat from './pages/AdminChat';

// Import Withdrawal Management pages
import PendingWithdrawalRequests from './pages/PendingWithdrawalRequests';
import WithdrawalRequestsSummary from './pages/WithdrawalRequestsSummary';
import WithdrawalDatewiseSummary from './pages/WithdrawalDatewiseSummary';

// Import Deposit Management pages
import PendingDepositRequests from './pages/PendingDepositRequests';

// Import Admin Settings pages
import ROISetup from './pages/ROISetup';
import DepositAddressSetup from './pages/DepositAddressSetup';
import EliminateSpecificCondition from './pages/EliminateSpecificCondition';
import AdminSettingPage from './pages/AdminSettingPage';
import ManagePopup from './pages/ManagePopup';

// Import Reports pages
import DailyIncomeSummary from './pages/DailyIncomeSummary';
import DirectIncomeSummary from './pages/DirectIncomeSummary';
import DailyLevelIncomeSummary from './pages/DailyLevelIncomeSummary';
import RankIncomeSummary from './pages/RankIncomeSummary';
import TransactionSummary from './pages/TransactionSummary';
import EditTransactionSummary from './pages/EditTransactionSummary';

// Import Referral Bonus System pages
import ReferralBonus from './pages/ReferralBonus';
import AdminNotifications from './pages/AdminNotifications';
import AdminReferralBonuses from './pages/AdminReferralBonuses';

// Import Admin Points Management
import AdminPointsManagement from './pages/AdminPointsManagement';

// Import My Wallet page
import MyWallet from './pages/MyWallet';

// Import Help Center pages
import HelpCenter from './pages/HelpCenter';
import EditHelpCenter from './pages/EditHelpCenter';

// Import components
import UnifiedLayout from './layouts/UnifiedLayout';
import SecurityProvider from './components/SecurityProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationPermission from './components/NotificationPermission';
import notificationService from './services/notificationService';
import { Capacitor } from '@capacitor/core';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10b981', // Emerald Green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6', // Blue accent
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#e8f5f0', // Soft green-tinted background
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, color: '#1e293b' },
    h2: { fontWeight: 600, color: '#1e293b' },
    h3: { fontWeight: 600, color: '#1e293b' },
    h4: { fontWeight: 600, color: '#1e293b' },
    h5: { fontWeight: 600, color: '#1e293b' },
    h6: { fontWeight: 600, color: '#1e293b' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#e8f5f0',
          backgroundImage: 'linear-gradient(145deg, #e8f5f0 0%, #d1fae5 50%, #a7f3d0 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          scrollbarColor: '#10b981 #e2e8f0',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#10b981',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(145deg, #ffffff 0%, #f8fafb 100%)',
          border: 'none',
          boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.08), -4px -4px 12px rgba(255, 255, 255, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          fontWeight: 600,
          boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.8)',
          transition: 'all 0.25s ease-in-out',
          '@media (max-width: 600px)': {
            padding: '8px 16px',
            fontSize: '0.85rem',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.15), -3px -3px 8px rgba(255, 255, 255, 0.9)',
          },
          '&:active': {
            transform: 'translateY(0px) scale(0.98)',
            boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.5)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(145deg, #34d399 0%, #10b981 50%, #059669 100%)',
          boxShadow: '4px 4px 10px rgba(16, 185, 129, 0.3), -2px -2px 6px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
            boxShadow: '6px 6px 14px rgba(16, 185, 129, 0.4), -3px -3px 8px rgba(255, 255, 255, 0.6)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(145deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
          boxShadow: '4px 4px 10px rgba(59, 130, 246, 0.3), -2px -2px 6px rgba(255, 255, 255, 0.5)',
          '&:hover': {
            background: 'linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
          border: 'none',
          borderRadius: 20,
          boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.08), -5px -5px 15px rgba(255, 255, 255, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '@media (min-width: 600px)': {
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '15px 15px 30px rgba(0, 0, 0, 0.12), -8px -8px 20px rgba(255, 255, 255, 1), 0 20px 40px rgba(16, 185, 129, 0.15)',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
        },
        head: {
          color: '#1e293b',
          fontWeight: 700,
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #34d399 0%, #10b981 50%, #059669 100%)',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%)',
          boxShadow: '4px 0 20px rgba(16, 185, 129, 0.3)',
          borderRight: 'none',
          borderRadius: 0,
          backgroundImage: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '3px 8px',
          padding: '8px 12px',
          color: '#ffffff',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateX(3px)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#ffffff',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            borderRadius: 12,
            boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.8)',
            '& fieldset': {
              borderColor: 'rgba(16, 185, 129, 0.2)',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#10b981',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#059669',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.15)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.08), -1px -1px 3px rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.06), -3px -3px 8px rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: 'auto',
          width: '100%',
          maxWidth: '100%',
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={{
          '*,*::before,*::after': { boxSizing: 'border-box' },
          html: { height: '100%', WebkitTextSizeAdjust: '100%' },
          body: { 
            minWidth: 320, 
            overflowX: 'hidden', 
            width: '100%', 
            maxWidth: '100vw',
            WebkitOverflowScrolling: 'touch',
            // Safe area for notched phones
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          },

          // Stabilize text layout and wrapping
          'body *': { wordBreak: 'normal', overflowWrap: 'break-word' },
           '#root': { minHeight: '100%' },
           'img, video': { maxWidth: '100%', height: 'auto' },
           '.MuiTableContainer-root': { 
             overflowX: 'auto',
             width: '100%',
             maxWidth: '100%',
           },
           '.MuiTable-root': {
             minWidth: '100%',
             width: '100%',
           },
           '.page-container': {
             padding: '8px',
             '@media (min-width:900px)': { padding: '16px' },
             width: '100%',
             minWidth: 0,
             maxWidth: '100%',
             margin: 0,
             overflowX: 'auto',
             overflowY: 'visible',
           },
           '.wrap-text': { wordBreak: 'break-word', overflowWrap: 'anywhere' },
           // Force wrapping for all descendants in page and admin containers
           '.page-container *, .admin-container *': { wordBreak: 'normal', overflowWrap: 'break-word' },
           // Also ensure table cells can wrap instead of overflowing
           '.page-container .MuiTableCell-root, .admin-container .MuiTableCell-root': { 
             whiteSpace: 'normal',
             wordBreak: 'break-word',
           },
           // Global MUI components wrapping so even non-container pages behave well
           '.MuiTableCell-root': { 
             whiteSpace: 'normal',
             wordBreak: 'break-word',
           },
          // Normalize heading and paragraph margins to reduce jumpiness
          'h1, h2, h3, h4, h5, h6, p': { margin: '8px 0' },
         }} />

        <SecurityProvider>
          <AppContent />
        </SecurityProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Initialize notification service on mount
  React.useEffect(() => {
    notificationService.initialize().catch(console.error);
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Landing page - only shown on web; native app goes straight to login */}
        <Route path="/" element={Capacitor.isNativePlatform() ? <Navigate to="/login" replace /> : <LandingPage />} />
        
        {/* Auth routes - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* All other routes use UnifiedLayout */}
        <Route path="/*" element={
          <ProtectedRoute>
            {/* Notification permission prompt - shows once after login on mobile */}
            <NotificationPermission />
            <UnifiedLayout>
              <Routes>
                {/* Root: role-based redirect */}
                <Route path="/" element={<RoleRedirect />} />
                
                {/* User dashboard route */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* MLM Plans */}
                <Route path="/mlm-plans" element={<MLMPlans />} />
                
                {/* My Investments */}
                <Route path="/my-investments" element={<MyInvestments />} />
                
                {/* User-accessible routes */}
                <Route path="/investments" element={<InvestmentPlans />} />
                <Route path="/network" element={<MLMNetwork />} />                  <Route path="/announcements" element={<UserAnnouncement />} />                <Route path="/commissions" element={<CommissionCalculator />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/support" element={<SupportHub />} />
                <Route path="/support/*" element={<SupportHub />} />
                <Route path="/genealogy" element={<GenealogyTree />} />
                <Route path="/team-management" element={<TeamManagement />} />
                <Route path="/products" element={<ProductCatalog />} />
                
                {/* Admin-accessible routes (also accessible to users but shown differently in sidebar) */}                  <Route path="/admin/announcement" element={<AdminAnnouncement />} />                <Route path="/security" element={<SecuritySettings />} />
                <Route path="/learning" element={<LearningCenter />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/compensation-plans" element={<CompensationPlans />} />
                <Route path="/features" element={<MLMFeatures />} />
                <Route path="/reports" element={<ReportsAnalytics />} />
                <Route path="/members-area" element={<MembersArea />} />

                {/* Members Management Routes */}
                <Route path="/members-area/datewise-registrations" element={<DatewiseRegistrations />} />
                <Route path="/members-area/all-members" element={<AllMembers />} />
                <Route path="/members-area/active-members" element={<AllActiveMembers />} />
                <Route path="/members-area/inactive-members" element={<AllInactiveMembers />} />
                <Route path="/members-area/wallet-statistics" element={<WalletStatistics />} />
                <Route path="/members-area/withdrawal-addresses" element={<MembersWithdrawalAddresses />} />
                <Route path="/members-area/resend-mail" element={<ResendMail />} />
                <Route path="/members-area/change-sponsor" element={<ChangeSponsor />} />
                <Route path="/members-area/change-sponsor-summary" element={<ChangeSponsorSummary />} />

                {/* User profile routes */}
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/withdrawal-address" element={<WithdrawalAddress />} />
                <Route path="/profile/change-password" element={<ChangePassword />} />
                <Route path="/my-wallet" element={<MyWallet />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/activation" element={<Activation />} />
                <Route path="/my-direct" element={<MyDirect />} />
                <Route path="/my-downline" element={<MyDownline />} />
                <Route path="/generation-tree" element={<GenerationTree />} />
                
                {/* User reports routes */}
                <Route path="/reports/daily-income" element={<DailyIncome />} />
                <Route path="/reports/direct-income" element={<DirectIncome />} />
                <Route path="/reports/daily-level-income" element={<DailyLevelIncome />} />
                <Route path="/reports/rank-income" element={<RankIncome />} />
                <Route path="/reports/all-transactions" element={<AllTransactions />} />
                <Route path="/reports/deposit-report" element={<DepositReport />} />
                <Route path="/reports/activation-report" element={<ActivationReport />} />
                
                {/* Withdrawal routes */}
                <Route path="/withdrawal/request" element={<WithdrawalRequest />} />
                <Route path="/withdrawal/summary" element={<WithdrawalSummary />} />
                
                {/* Referral Bonus System */}
                <Route path="/referral-bonus" element={<ReferralBonus />} />
                
                {/* Help Center */}
                <Route path="/help" element={<HelpCenter />} />

                {/* Admin-Only Routes */}
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/dashboard-settings" element={<DashboardSettings />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/referral-bonuses" element={<AdminReferralBonuses />} />
                <Route path="/admin/points-management" element={<AdminPointsManagement />} />
                <Route path="/admin/support-chat" element={<AdminChat />} />
                <Route path="/activation-options" element={<ActivationOptions />} />
                
                {/* Activation Routes */}
                <Route path="/activation-options/admin-activation" element={<AdminActivation />} />
                <Route path="/activation-options/admin-activation-summary" element={<AdminActivationSummary />} />
                <Route path="/activation-options/all-activation-summary" element={<AllActivationSummary />} />
                <Route path="/activation-options/pending-fund-requests" element={<PendingFundRequests />} />
                <Route path="/activation-options/processed-fund-requests" element={<ProcessedFundRequests />} />
                <Route path="/withdrawal-management" element={<WithdrawalManagement />} />
                
                {/* Withdrawal Management Routes */}
                <Route path="/withdrawal-management/pending-requests" element={<PendingWithdrawalRequests />} />
                <Route path="/withdrawal-management/requests-summary" element={<WithdrawalRequestsSummary />} />
                <Route path="/withdrawal-management/datewise-summary" element={<WithdrawalDatewiseSummary />} />
                
                {/* Deposit Management Routes */}
                <Route path="/deposit-management/pending-deposits" element={<PendingDepositRequests />} />
                
                <Route path="/financial-reports" element={<FinancialReports />} />
                <Route path="/admin-settings" element={<AdminSettings />} />
                
                {/* Admin Settings Routes */}
                <Route path="/admin-settings/edit-plans" element={<EditPlans />} />
                <Route path="/admin-settings/roi-setup" element={<ROISetup />} />
                <Route path="/admin-settings/deposit-address-setup" element={<DepositAddressSetup />} />
                <Route path="/admin-settings/eliminate-specific-condition" element={<EliminateSpecificCondition />} />
                <Route path="/admin-settings/admin-setting" element={<AdminSettingPage />} />
                <Route path="/admin-settings/manage-popup" element={<ManagePopup />} />
                <Route path="/admin-settings/edit-help" element={<EditHelpCenter />} />
                <Route path="/admin-settings/edit-transaction-summary" element={<EditTransactionSummary />} />

                {/* Admin Reports Routes */}
                <Route path="/reports/daily-income-summary" element={<DailyIncomeSummary />} />
                <Route path="/reports/direct-income-summary" element={<DirectIncomeSummary />} />
                <Route path="/reports/daily-level-income-summary" element={<DailyLevelIncomeSummary />} />
                <Route path="/reports/rank-income-summary" element={<RankIncomeSummary />} />
                <Route path="/reports/transaction-summary" element={<TransactionSummary />} />

                <Route path="/security-compliance" element={<SecurityCompliance />} />
                {/* <Route path="/test-security" element={<TestSecurityCompliance />} /> */}
                {/* KYC admin route removed (KYC disabled) */}
                <Route path="/mlm" element={<MLMDashboard />} />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </UnifiedLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
