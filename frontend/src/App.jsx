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
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import useAuthContext from './context/useAuthContext';

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

        <Route
          path="/"
          element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>}
        />
        <Route
          path="/transactions"
          element={<ProtectedRoute><PageWrapper><Transactions /></PageWrapper></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
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
