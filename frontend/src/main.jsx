import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CRITICAL: Failed to find #root element. DOM may be empty.");
} else {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch((error) => console.error('FlowAI: service worker failed', error)));
  }
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </React.StrictMode>,
  );
}
