import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import { Dashboard, Notes, Projects, ClientCharges, PartnerPayments, Partners, Logs } from './pages';
import Login from './pages/Login';
import { Box, CircularProgress } from '@mui/material';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function NotFound() {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <h2>404 - Página no encontrada</h2>
      <p>La página que buscas no existe.</p>
    </div>
  );
}

function AppContent() {
  const { validateToken, token } = useAuthStore();
  const [isValidating, setIsValidating] = React.useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await validateToken();
      }
      setIsValidating(false);
    };
    
    initAuth();
  }, [validateToken, token]);

  // Show loading while validating token
  if (isValidating) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes - no Layout */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        
        {/* Protected routes - with Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <PrivateRoute>
              <Layout>
                <Notes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Layout>
                <Projects />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/client-charges"
          element={
            <PrivateRoute>
              <Layout>
                <ClientCharges />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/partner-payments"
          element={
            <PrivateRoute>
              <Layout>
                <PartnerPayments />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <PrivateRoute>
              <Layout>
                <Partners />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <PrivateRoute>
              <Layout>
                <Logs />
              </Layout>
            </PrivateRoute>
          }
        />
        
        {/* Catch all for protected routes */}
        <Route
          path="*"
          element={
            <PrivateRoute>
              <Layout>
                <NotFound />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <AppContent />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
