import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthContext from '../context/useAuthContext';

const ProtectedRoute = ({ children }) => {
  const { loading, isSignedIn } = useAuthContext();
  
  if (loading) {
    return null;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
