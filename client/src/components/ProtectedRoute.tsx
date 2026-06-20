import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while validating token
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-m3-surface">
        <div className="text-m3-on-surface text-center">
          <div className="animate-spin w-12 h-12 border-4 border-m3-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
