import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  adminOnly = false, 
  redirectTo = '/mlm' 
}) => {
  const { isAuthenticated, loading, isAdmin, hasRole } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        flexDirection="column"
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enforce admin-only access when specified
  if (adminOnly && !isAdmin()) {
    return <Navigate to={redirectTo} replace />;
  }

  // Enforce specific required role when provided
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;