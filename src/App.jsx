import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense, lazy } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import i18n from './i18n';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorFallback from './components/common/ErrorFallback';
import { AuthProvider } from './contexts/AuthContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider>
              <AuthProvider>
                <AnalyticsProvider>
                  <DataProvider>
                    <Router>
                      <Layout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </Layout>
                    </Router>
                  </DataProvider>
                </AnalyticsProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nextProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App; 