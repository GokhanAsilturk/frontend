import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard, Courses, CourseDetail, Profile, Login } from '../pages';
import MainLayout from '../components/layout/MainLayout';
import { LoadingSpinner } from '../components/common';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Yetkilendirme kontrol ediliyor..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  readonly children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Yetkilendirme kontrol ediliyor..." />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<Courses isEnrolledView={false} />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="enrolled-courses" element={<Courses isEnrolledView={true} />} />
        <Route path="enrollments" element={<Navigate to="/enrolled-courses" replace />} />
        
        <Route path="assignments" element={
          <div style={{ padding: '20px' }}>
            <h2>Ödevlerim</h2>
            <p>Bu sayfa yakında eklenecek.</p>
          </div>
        } />
        
        <Route path="grades" element={
          <div style={{ padding: '20px' }}>
            <h2>Notlarım</h2>
            <p>Bu sayfa yakında eklenecek.</p>
          </div>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;