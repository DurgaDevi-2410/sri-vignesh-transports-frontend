import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LocalBooking from './pages/LocalBooking';
import CompanyBooking from './pages/CompanyBooking';
import CompanyManagement from './pages/CompanyManagement';
import PaymentManagement from './pages/PaymentManagement';
import Reports from './pages/Reports';
import VehicleManagement from './pages/VehicleManagement';
import ExpenseManagement from './pages/ExpenseManagement';

import useLocalStorage from './hooks/useLocalStorage';

const ProtectedRoute = ({ children }) => {
  const [isAuth] = useLocalStorage('isAuth', false);
  return isAuth ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="local-booking" element={<LocalBooking />} />
          <Route path="company-booking" element={<CompanyBooking />} />
          <Route path="companies" element={<CompanyManagement />} />
          <Route path="vehicles" element={<VehicleManagement />} />
          <Route path="expenses" element={<ExpenseManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
