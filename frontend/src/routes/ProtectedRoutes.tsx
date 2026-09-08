import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-height-[60svh] flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-teranga-gold-450 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-teranga-gray-650 font-medium font-sans">Chargement de votre session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('CLIENT' | 'RECEPTIONIST' | 'ADMIN')[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-height-[60svh] flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-teranga-gold-450 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-teranga-gray-650 font-medium">Validation des droits d'accès...</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect to standard dashboard according to role
    if (currentUser.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentUser.role === 'RECEPTIONIST') {
      return <Navigate to="/reception/dashboard" replace />;
    } else {
      return <Navigate to="/client/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
