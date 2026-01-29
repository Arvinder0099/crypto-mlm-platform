import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InvestmentPlans from './pages/InvestmentPlans';
import MLMNetwork from './pages/MLMNetwork';
import CommissionCalculator from './pages/CommissionCalculator';
import Wallet from './pages/Wallet';
import AdminPanel from './pages/AdminPanel';
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

// Import Referral Bonus System pages
import ReferralBonus from './pages/ReferralBonus';
import AdminNotifications from './pages/AdminNotifications';
import AdminReferralBonuses from './pages/AdminReferralBonuses';

// Import Admin Points Management
import AdminPointsManagement from './pages/AdminPointsManagement';

// Import components
import UnifiedLayout from './layouts/UnifiedLayout';
import SecurityProvider from './components/SecurityProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={{
          '*,*::before,*::after': { boxSizing: 'border-box' },
          html: { height: '100%' },
          body: { minWidth: 320, overflowX: 'hidden' },

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
             overflow: 'hidden',
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
             maxWidth: '200px',
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
        {/* Auth routes - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* All other routes use UnifiedLayout */}
        <Route path="/*" element={
          <ProtectedRoute>
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
                <Route path="/network" element={<MLMNetwork />} />
                <Route path="/commissions" element={<CommissionCalculator />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/support" element={<SupportHub />} />
                <Route path="/support/*" element={<SupportHub />} />
                <Route path="/genealogy" element={<GenealogyTree />} />
                <Route path="/team-management" element={<TeamManagement />} />
                <Route path="/products" element={<ProductCatalog />} />
                
                {/* Admin-accessible routes (also accessible to users but shown differently in sidebar) */}
                <Route path="/security" element={<SecuritySettings />} />
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

                {/* Admin-Only Routes */}
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/referral-bonuses" element={<AdminReferralBonuses />} />
                <Route path="/admin/points-management" element={<AdminPointsManagement />} />
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
                
                <Route path="*" element={<Navigate to="/mlm" replace />} />
              </Routes>
            </UnifiedLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
