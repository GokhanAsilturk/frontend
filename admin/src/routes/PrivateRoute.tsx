import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { LoadingSpinner } from '../components/common';
import { ROUTES } from '../utils';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <LoadingSpinner 
        overlay 
        message="Kimlik doğrulanıyor..." 
        size={60}
      />
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return (
      <Navigate 
        to={ROUTES.LOGIN} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};
