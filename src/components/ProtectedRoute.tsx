// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../utils/usePermission';
import { PermissionKey } from '../utils/permissions';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PermissionKey;
}

const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { authUser } = useAuth();
  const { hasPermission, loading } = usePermission();

  // Show nothing or a loader while checking permissions
  if (loading) return null; // Or a spinner/loading screen

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />; // or show 403 page if you have one
  }

  return <>{children}</>;
};

export default ProtectedRoute;
