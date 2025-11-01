import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure auth state is fully loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Show loading state while authentication is being checked
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('=== PROTECTED ROUTE CHECK ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);
  console.log('requiredRole:', requiredRole);
  console.log('user?.role:', user?.role);
  console.log('isReady:', isReady);

  if (!isAuthenticated) {
    console.log('❌ User not authenticated - redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.log('❌ Role mismatch - user role:', user?.role, 'required:', requiredRole);
    console.log('Redirecting to home page');
    return <Navigate to="/" replace />;
  }

  console.log('✅ Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;