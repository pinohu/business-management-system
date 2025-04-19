import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaxEstimation from './pages/TaxEstimation';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import Profile from './pages/Profile';
import Budgeting from './pages/Budgeting';
import RecurringTransactions from './pages/RecurringTransactions';
import BankIntegration from './pages/BankIntegration';
import CashFlowAI from './pages/CashFlowAI';
import ComplianceAutomation from './pages/ComplianceAutomation';
import DynamicPricing from './pages/DynamicPricing';
import NotFound from './pages/NotFound';

// Import Cloudscape Design System
import '@cloudscape-design/global-styles/index.css';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsInitialized(true);
    }
  }, [loading]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="tax-estimation" element={<TaxEstimation />} />
        <Route path="income" element={<Income />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="budgeting" element={<Budgeting />} />
        <Route path="recurring" element={<RecurringTransactions />} />
        <Route path="bank-integration" element={<BankIntegration />} />
        <Route path="cash-flow-ai" element={<CashFlowAI />} />
        <Route path="compliance" element={<ComplianceAutomation />} />
        <Route path="dynamic-pricing" element={<DynamicPricing />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
