/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

import SidebarLayout from './layouts/SidebarLayout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import DashboardPage from './pages/Dashboard/Dashboard';
import AnalyzePage from './pages/Analyze/Analyze';
import ComparePage from './pages/Compare/Compare';
import HistoryPage from './pages/History/History';
import ReportsPage from './pages/Reports/Reports';
import SettingsPage from './pages/Settings/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (firebaseUser) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
            
            <Route path="/" element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="analyze" element={<AnalyzePage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}
