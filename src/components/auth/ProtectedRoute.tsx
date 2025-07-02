import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAdmin, getToken, hasRole } from '@/utils/auth';

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
  const token = getToken();
  const isAuthenticated = !!token && localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for specific role if required
  if (requiredRole && !isAdmin() && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
