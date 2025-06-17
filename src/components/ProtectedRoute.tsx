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

interface ProtectedRouteNoPermProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { authUser, authLoading } = useAuth();
  const { hasPermission, loading } = usePermission();

  // Show nothing or a loader while checking permissions
  if (loading) return null; // Or a spinner/loading screen
  if (authLoading) return <div>Loading...</div>

  if (!authUser) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />; // or show 403 page if you have one
  }

  return <>{children}</>;
};


export const ProtectedRouteNoPerm = ({ children }: ProtectedRouteNoPermProps) => {
  const { authUser, authLoading } = useAuth();

  // Show nothing or a loader while checking permissions
  if (authLoading) return <div>Loading...</div>

  if (!authUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

