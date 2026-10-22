import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import ApiProvider from './components/ApiProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import useAuthContext from './context/useAuthContext';
import useSettings from './context/useSettings';
import { SettingsProvider } from './context/SettingsContext';

// Authenticated pages are split so the public landing page and login stay light.
// Dashboard is the biggest win because it pulls in Recharts.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Budget = lazy(() => import('./pages/Budget'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));
const Goals = lazy(() => import('./pages/Goals'));
const Admin = lazy(() => import('./pages/Admin'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

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
  <div className="page-transition w-full h-full">
    {children}
  </div>
);

// ─── Routes with Auth Guards ────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  const { loading, isSignedIn } = useAuthContext();
  const { settings } = useSettings();

  if (loading) {
    return <LoadingScreen />;
  }

  if (
    isSignedIn
    && settings.onboardingCompleted === false
    && location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={isSignedIn ? <Navigate to="/" replace /> : <PageWrapper><Login /></PageWrapper>}
        />
        <Route
          path="/register"
          element={isSignedIn ? <Navigate to="/" replace /> : <PageWrapper><Register /></PageWrapper>}
        />

        <Route path="/onboarding" element={<ProtectedRoute><PageWrapper><Onboarding /></PageWrapper></ProtectedRoute>} />

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
        <Route path="/subscriptions" element={<ProtectedRoute><PageWrapper><Subscriptions /></PageWrapper></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><PageWrapper><Goals /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><PageWrapper><Admin /></PageWrapper></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><PageWrapper><Accounts /></PageWrapper></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
