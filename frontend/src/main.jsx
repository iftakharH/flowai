import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('FlowAI 2026: Booting up...');
if (!PUBLISHABLE_KEY) {
  console.error("CRITICAL: Missing VITE_CLERK_PUBLISHABLE_KEY. Application will likely stall.");
} else {
  console.log('Clerk: Publishable key found. Initializing provider...');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CRITICAL: Failed to find #root element. DOM may be empty.");
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY || 'pk_test_Y29taWMtdG9hZC01Mi5jbGVyay5hY2NvdW50cy5kZXYk'}>
        <App />
        <Toaster position="top-right" />
      </ClerkProvider>
    </React.StrictMode>,
  );
}
