// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Get user from context

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the child components (the protected route content)
  return children;
};

export default ProtectedRoute;