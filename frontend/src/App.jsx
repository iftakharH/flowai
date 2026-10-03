import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import ApiProvider from './components/ApiProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Admin from './pages/Admin';
import Accounts from './pages/Accounts';
import useAuthContext from './context/useAuthContext';
import { SettingsProvider } from './context/SettingsContext';

// ─── Loading Screen ─────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="loading-mark"><Loader2 className="animate-spin" size={20} /></div>
      <p className="m-0 text-sm font-medium text-[var(--muted)]">Opening your overview</p>
    </div>
  </div>
);

// ─── Page Transition Wrapper ─────────────────────────────────────────────────
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

// ─── Routes with Auth Guards ────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  const { loading, isSignedIn } = useAuthContext();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={isSignedIn ? <Navigate to="/" replace /> : <PageWrapper><Login /></PageWrapper>}
        />
        <Route
          path="/register"
          element={isSignedIn ? <Navigate to="/" replace /> : <PageWrapper><Register /></PageWrapper>}
        />

        <Route path="/" element={isSignedIn ? <ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute> : <PageWrapper><Landing /></PageWrapper>} />
        <Route
          path="/transactions"
          element={<ProtectedRoute><PageWrapper><Transactions /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/budget"
          element={<ProtectedRoute><PageWrapper><Budget /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><PageWrapper><Settings /></PageWrapper></ProtectedRoute>}
        />
        <Route path="/reports" element={<ProtectedRoute><PageWrapper><Reports /></PageWrapper></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><PageWrapper><Goals /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><PageWrapper><Admin /></PageWrapper></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><PageWrapper><Accounts /></PageWrapper></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ApiProvider>
          <SettingsProvider>
            <AnimatedRoutes />
          </SettingsProvider>
        </ApiProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
