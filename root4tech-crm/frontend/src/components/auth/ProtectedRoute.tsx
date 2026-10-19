import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/crm';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admins always have access to all routes
  if (user.role === 'admin') {
    return children ? <>{children}</> : <Outlet />;
  }

  // If specific roles are required, ensure user has permission
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole =
      allowedRoles.includes(user.role) ||
      (allowedRoles.includes('admin') && user.role !== 'sales' && user.role !== 'marketing');

    if (!hasRole) {
      // Route user to their own role's home page
      if (user.role === 'sales') {
        return <Navigate to="/salesperson" replace />;
      }
      if (user.role === 'marketing') {
        return <Navigate to="/marketing" replace />;
      }
      return <Navigate to={user.defaultRoute || '/dashboard'} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
