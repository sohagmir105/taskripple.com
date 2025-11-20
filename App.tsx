import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Auth Pages
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';

// Public Pages
import { LandingPage } from './pages/LandingPage';

// User Pages
import { UserDashboard } from './pages/Dashboard/UserDashboard';
import { Tasks } from './pages/Dashboard/Tasks';
import { Wallet } from './pages/Dashboard/Wallet';
import { Activation } from './pages/Dashboard/Activation';
import { Referrals } from './pages/Dashboard/Referrals';

// Admin Pages
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { ManageDeposits } from './pages/Admin/ManageDeposits';
import { ManageTasks } from './pages/Admin/ManageTasks';
import { TaskApprovals } from './pages/Admin/TaskApprovals';
import { ManageUsers } from './pages/Admin/ManageUsers';
import { ManageWithdrawals } from './pages/Admin/ManageWithdrawals';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>...</div>;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/activation" element={<ProtectedRoute><Activation /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/deposits" element={<AdminRoute><ManageDeposits /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/tasks" element={<AdminRoute><ManageTasks /></AdminRoute>} />
          <Route path="/admin/approvals" element={<AdminRoute><TaskApprovals /></AdminRoute>} />
          <Route path="/admin/withdrawals" element={<AdminRoute><ManageWithdrawals /></AdminRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;