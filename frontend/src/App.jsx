import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  ClerkLoaded,
  ClerkLoading,
  AuthenticateWithRedirectCallback,
} from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import ApiProvider from './components/ApiProvider';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

// ─── Loading Screen ─────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-brand-500/20 rounded-full animate-ping" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="text-brand-500 animate-spin" size={36} />
      </div>
    </div>
    <p className="mt-8 text-slate-500 font-black tracking-[0.25em] uppercase text-xs animate-pulse">
      Initializing FlowAI
    </p>
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

// ─── Routes with Clerk Auth Guards ──────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <ClerkLoading>
        <LoadingScreen />
      </ClerkLoading>

      <ClerkLoaded>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Auth pages — redirect to dashboard if already signed in */}
            <Route
              path="/login"
              element={
                <>
                  <SignedIn><Navigate to="/" replace /></SignedIn>
                  <SignedOut><PageWrapper><Login /></PageWrapper></SignedOut>
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <SignedIn><Navigate to="/" replace /></SignedIn>
                  <SignedOut><PageWrapper><Register /></PageWrapper></SignedOut>
                </>
              }
            />

            {/* SSO OAuth callback — required for Google/Apple login */}
            <Route
              path="/sso-callback"
              element={<AuthenticateWithRedirectCallback />}
            />

            {/* Protected app pages */}
            <Route
              path="/"
              element={
                <>
                  <SignedIn><PageWrapper><Dashboard /></PageWrapper></SignedIn>
                  <SignedOut><Navigate to="/login" replace /></SignedOut>
                </>
              }
            />
            <Route
              path="/transactions"
              element={
                <>
                  <SignedIn><PageWrapper><Transactions /></PageWrapper></SignedIn>
                  <SignedOut><Navigate to="/login" replace /></SignedOut>
                </>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </ClerkLoaded>
    </>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <ApiProvider>
        <AnimatedRoutes />
      </ApiProvider>
    </Router>
  );
}

export default App;
