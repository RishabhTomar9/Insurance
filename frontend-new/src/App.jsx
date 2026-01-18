import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PasswordResetPage from './pages/PasswordResetPage';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<PasswordResetPage />} />
      <Route element={<ProtectedRoute role="manager" />}>
        <Route path="/manager" element={<ManagerDashboard />} />
      </Route>
      <Route element={<ProtectedRoute role="employee" />}>
        <Route path="/employee" element={<EmployeeDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
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