import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Loader from './components/common/Loader';

// Lazy Load Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

// Manager Pages
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const ManagerEmployees = lazy(() => import('./pages/manager/ManagerEmployees'));
const ManagerOwners = lazy(() => import('./pages/manager/ManagerOwners'));
const ManagerCars = lazy(() => import('./pages/manager/ManagerCars'));
const ManagerPolicies = lazy(() => import('./pages/manager/ManagerPolicies'));

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
            <Route path="/reset-password" element={<PasswordResetPage />} />

            <Route element={<ProtectedRoute role="manager" />}>
              <Route path="/manager" element={<DashboardLayout />}>
                <Route index element={<ManagerDashboard />} />
                <Route path="employees" element={<ManagerEmployees />} />
                <Route path="cars" element={<ManagerCars />} />
                <Route path="owners" element={<ManagerOwners />} />
                <Route path="policies" element={<ManagerPolicies />} />
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

  if (currentUser.role !== role) {
    return <Navigate to="/login" />;
  }

  if (role === 'employee' && !currentUser.passwordChanged) {
    return <Navigate to="/reset-password" />;
  }

  return <Outlet />;
};

export default App;