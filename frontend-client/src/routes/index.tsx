import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard, Courses, CourseDetail, Profile, Login } from '../pages';
import MainLayout from '../components/layout/MainLayout';
import { LoadingSpinner } from '../components/common';

/**
 * Korumalı rota bileşeni - sadece giriş yapmış kullanıcılar erişebilir
 */
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
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    // Mevcut konumu state olarak kaydet ki giriş sonrası geri dönebilsin
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Genel erişim rotası - giriş yapmış kullanıcıları dashboard'a yönlendirir
 */
interface PublicRouteProps {
  readonly children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Yetkilendirme kontrol ediliyor..." />;
  }

  if (user) {
    // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Ana router bileşeni - tüm uygulama rotalarını yönetir
 */
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Genel erişim rotaları */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Ana layout ile korumalı rotalar */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Ana sayfa */}
        <Route index element={<Dashboard />} />        {/* Dersler sayfası */}
        <Route path="courses" element={<Courses isEnrolledView={false} />} />
        
        {/* Ders detay sayfası */}
        <Route path="courses/:id" element={<CourseDetail />} />
          {/* Profil sayfası */}
        <Route path="profile" element={<Profile />} />
        
        {/* Kayıtlı dersler sayfası */}
        <Route path="enrolled-courses" element={<Courses isEnrolledView={true} />} />
        
        {/* Eski path için yönlendirme */}
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
      
      {/* 404 ve bilinmeyen rotalar için yönlendirme */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;