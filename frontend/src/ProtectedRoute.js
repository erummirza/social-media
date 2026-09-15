import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, loggedInUser }) {
  if (!loggedInUser) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

export default ProtectedRoute;