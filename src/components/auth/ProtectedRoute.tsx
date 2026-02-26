// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, isAdmin, hasRole } from '../../utils/auth';
import React, { useState, useEffect } from 'react';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Perform auth checks
    const token = getToken();
    const isAuthenticatedFlag = localStorage.getItem('isAuthenticated') === 'true';
    const authStatus = !!token && isAuthenticatedFlag;
    
    setIsAuthenticated(authStatus);

    if (authStatus) {
      // Check for admin access if required
      if (adminOnly && !isAdmin()) {
        setIsAuthorized(false);
        return;
      }

      // Check for specific role if required
      if (requiredRole && !isAdmin() && !hasRole(requiredRole)) {
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [adminOnly, requiredRole]);

  // Show loading state while checking authentication
  if (isAuthenticated === null || isAuthorized === null) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If not authorized, redirect to unauthorized page
  if (!isAuthorized) {
    console.log('User is not authorized for this route');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;