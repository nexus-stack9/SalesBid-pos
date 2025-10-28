// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, isAdmin, hasRole } from '../../utils/auth';
import React from 'react';

interface ProtectedRouteProps {
  redirectPath?: string;
  requiredRole?: string;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ 
  redirectPath = '/login',
  requiredRole,
  adminOnly = false
}: ProtectedRouteProps) => {
  const location = useLocation();
  
  // Perform auth checks
  const token = getToken();
  const isAuthenticatedFlag = localStorage.getItem('isAuthenticated') === 'true';
  const isAuthenticated = !!token && isAuthenticatedFlag;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (adminOnly && !isAdmin()) {
    console.log('Admin only route, user is not admin');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Check for specific role if required
  if (requiredRole && !isAdmin() && !hasRole(requiredRole)) {
    console.log(`Required role: ${requiredRole}, user doesn't have it`);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;