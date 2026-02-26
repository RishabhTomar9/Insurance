import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Loader from './components/common/Loader';

// Lazy Load Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SuperAdminLoginPage = lazy(() => import('./pages/SuperAdminLoginPage'));
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage'));
const CompanyRegistrationPage = lazy(() => import('./pages/CompanyRegistrationPage'));
const SuperAdminInitPage = lazy(() => import('./pages/SuperAdminInitPage'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const ManagerEmployees = lazy(() => import('./pages/manager/ManagerEmployees'));
const SuperAdminSettings = lazy(() => import('./pages/SuperAdminSettings'));

// Manager Pages
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const ManagerOwners = lazy(() => import('./pages/manager/ManagerOwners'));
const ManagerCars = lazy(() => import('./pages/manager/ManagerCars'));
const ManagerPolicies = lazy(() => import('./pages/manager/ManagerPolicies'));
const ManagerBanks = lazy(() => import('./pages/manager/ManagerBanks'));
const ManagerAgents = lazy(() => import('./pages/manager/ManagerAgents'));

// Employee Pages
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));

import { ToastProvider } from './contexts/ToastContext';
import { DialogProvider } from './contexts/DialogContext';

const App = () => {
  return (
    <ToastProvider>
      <DialogProvider>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-superadmin" element={<SuperAdminLoginPage />} />
            <Route path="/register-company" element={<CompanyRegistrationPage />} />
            <Route path="/reset-password" element={<PasswordResetPage />} />
            <Route path="/superadmin-init" element={<SuperAdminInitPage />} />

            <Route element={<ProtectedRoute role="manager" />}>
              <Route path="/manager" element={<DashboardLayout />}>
                <Route index element={<ManagerDashboard />} />
                <Route path="employees" element={<ManagerEmployees />} />
                <Route path="cars" element={<ManagerCars />} />
                <Route path="owners" element={<ManagerOwners />} />
                <Route path="policies" element={<ManagerPolicies />} />
                <Route path="banks" element={<ManagerBanks />} />
                <Route path="agents" element={<ManagerAgents />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="super-admin" />}>
              <Route path="/super-admin" element={<DashboardLayout />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="managers" element={<ManagerEmployees />} />
                <Route path="cars" element={<ManagerCars />} />
                <Route path="owners" element={<ManagerOwners />} />
                <Route path="policies" element={<ManagerPolicies />} />
                <Route path="banks" element={<ManagerBanks />} />
                <Route path="agents" element={<ManagerAgents />} />
                <Route path="settings" element={<SuperAdminSettings />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="employee" />}>
              <Route path="/employee" element={<DashboardLayout />}>
                <Route index element={<EmployeeDashboard />} />
                <Route path="cars" element={<ManagerCars />} />
                <Route path="owners" element={<ManagerOwners />} />
                <Route path="policies" element={<ManagerPolicies />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </DialogProvider>
    </ToastProvider>
  );
};

const ProtectedRoute = ({ role }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Super Admin can access everything
  if (currentUser.role === 'super-admin') {
    return <Outlet />;
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" />;
  }

  // Mandatory password reset for employees
  if (currentUser.role === 'employee' && !currentUser.passwordChanged) {
    return <Navigate to="/reset-password" />;
  }

  return <Outlet />;
};

export default App;