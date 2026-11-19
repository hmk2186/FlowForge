import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WorkflowBuilderProvider } from './context/WorkflowBuilderContext';

import LandingPage from './pages/public/LandingPage';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import WorkflowsListPage from './pages/workflows/WorkflowsListPage';
import WorkflowDetailPage from './pages/workflows/WorkflowDetailPage';
import WorkflowBuilderPage from './pages/builder/WorkflowBuilderPage';
import ExecutionsListPage from './pages/executions/ExecutionsListPage';
import ExecutionDetailPage from './pages/executions/ExecutionDetailPage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { Loader2 } from 'lucide-react';

// Protected Route Guard: Enforces authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Guard (redirects already logged-in users away from /login and /register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WorkflowBuilderProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. Public Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* 2. Public Guest Canvas Builder (No Login Required) */}
                <Route path="/builder" element={<WorkflowBuilderPage />} />

                {/* 3. Public Authentication Pages */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />

                {/* 4. Protected Application Workspace Routes inside AppLayout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/workflows" element={<WorkflowsListPage />} />
                  <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
                  <Route path="/executions" element={<ExecutionsListPage />} />
                  <Route path="/executions/:id" element={<ExecutionDetailPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* 5. Protected Full-Screen Workflow Builder for Authenticated Workflows */}
                <Route
                  path="/workflows/:id/builder"
                  element={
                    <ProtectedRoute>
                      <WorkflowBuilderPage />
                    </ProtectedRoute>
                  }
                />

                {/* 6. 404 Catch-All Page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </WorkflowBuilderProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
