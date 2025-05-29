import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { PrivateRoute } from './PrivateRoute';
import { Login } from '../pages/auth';
import { Dashboard } from '../pages/dashboard';
import { ErrorLogs } from '../pages/errorLogs';
import { StudentList, StudentForm } from '../pages/students';
import { CourseList, CourseForm } from '../pages/courses';
import { EnrollmentList, EnrollmentForm } from '../pages/enrollments';
import { Profile } from '../pages/Profile';
import AdminList from '../pages/admins/AdminList';
import AdminCreate from '../pages/admins/AdminCreate';
import AdminEdit from '../pages/admins/AdminEdit';
import { MainLayout } from '../components/layout';
import { ROUTES } from '../utils';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path={ROUTES.LOGIN} 
        element={
          isAuthenticated ? 
            <Navigate to={ROUTES.DASHBOARD} replace /> : 
            <Login />
        } 
      />      {/* Private Routes */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path={ROUTES.STUDENTS} 
        element={
          <PrivateRoute>
            <MainLayout>
              <StudentList />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/students/add" 
        element={
          <PrivateRoute>
            <MainLayout>
              <StudentForm />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/students/edit/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <StudentForm />
            </MainLayout>
          </PrivateRoute>
        } 
      />
        <Route 
        path={ROUTES.COURSES} 
        element={
          <PrivateRoute>
            <MainLayout>
              <CourseList />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/courses/add" 
        element={
          <PrivateRoute>
            <MainLayout>
              <CourseForm />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/courses/edit/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <CourseForm />
            </MainLayout>
          </PrivateRoute>
        } 
      />      <Route 
        path={ROUTES.ENROLLMENTS} 
        element={
          <PrivateRoute>
            <MainLayout>
              <EnrollmentList />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/enrollments/add" 
        element={
          <PrivateRoute>
            <MainLayout>
              <EnrollmentForm />
            </MainLayout>
          </PrivateRoute>
        } 
      />      <Route 
        path="/enrollments/edit/:id" 
        element={
          <PrivateRoute>
            <MainLayout>
              <EnrollmentForm />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admins" 
        element={
          <PrivateRoute>
            <MainLayout>
              <AdminList />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admins/create" 
        element={
          <PrivateRoute>
            <MainLayout>
              <AdminCreate />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admins/:id/edit" 
        element={
          <PrivateRoute>
            <MainLayout>
              <AdminEdit />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path={ROUTES.ERROR_LOGS}
        element={
          <PrivateRoute>
            <MainLayout>
              <ErrorLogs />
            </MainLayout>
          </PrivateRoute>
        } 
      />

      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} 
            replace 
          />
        } 
      />

      {/* Catch all - redirect to dashboard or login */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} 
            replace 
          />
        } 
      />
    </Routes>
  );
};
