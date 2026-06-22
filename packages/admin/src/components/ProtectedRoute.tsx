// packages/admin/src/components/ProtectedRoute.tsx
// Route wrapper to ensure only authenticated admins can access children pages

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Redirect to login page and keep the current path to redirect back later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
