import React, { useContext, useEffect } from 'react';
import { Typography, Grid, CircularProgress, Alert, Box } from '@mui/material'; // Assuming Material-UI
import { EnrollmentContext } from '../contexts/EnrollmentContext';
import AuthContext from '../contexts/AuthContext'; // Düzeltildi: Default import
import CourseCard from '../components/common/CourseCard'; // Düzeltildi: Default import
import { Enrollment } from '../types'; // Ensure types are correctly defined

const EnrolledCourses: React.FC = () => {
  const authContext = useContext(AuthContext);
  const enrollmentContext = useContext(EnrollmentContext);

  // useEffect hook'u ve diğer hook çağrıları en üste taşındı
  useEffect(() => {
    // enrollmentContext ve authContext null kontrolü useEffect içinde veya öncesinde yapılmalı
    // Ancak hook'lar koşulsuz çağrılmalı
    // student nesnesinin ve student.id'nin varlığını kontrol et
    if (authContext?.student?.id && enrollmentContext?.fetchStudentEnrollments && typeof enrollmentContext.fetchStudentEnrollments === 'function') {
      enrollmentContext.fetchStudentEnrollments(authContext.student.id);
    } else {
      // student.id yoksa uyarı logla
      console.warn("EnrolledCourses.tsx: student.id bulunamadı, fetchStudentEnrollments çağrılamadı.");
    }
  }, [authContext?.student?.id, enrollmentContext?.fetchStudentEnrollments]); // authContext?.user?.id yerine authContext?.student?.id'ye bağımlı hale getirildi


  // Type guards or assertions for context values
  if (!authContext) {
    // Handle case where AuthContext is not provided
    return <Alert severity="error">Authentication context is not available.</Alert>;
  }
  if (!enrollmentContext) {
    // Handle case where EnrollmentContext is not provided
    return <Alert severity="error">Enrollment context is not available.</Alert>;
  }

  const {
    enrollments,
    loading,
    error,
  } = enrollmentContext; 


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load enrolled courses: {error}</Alert>;
  }

  if (!enrollments || enrollments.length === 0) {
    return <Typography>You are not currently enrolled in any courses.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="h1">
        My Enrolled Courses
      </Typography>
      <Grid container spacing={3}>
        {enrollments.map((enrollment: Enrollment) => (
          <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
            {/* Ensure enrollment.course exists and CourseCard expects a Course object */}
            {enrollment.course ? ( // Düzeltildi: enrollment.Course -> enrollment.course
              <CourseCard course={enrollment.course} /> // Düzeltildi: enrollment.Course -> enrollment.course
            ) : (
              <Alert severity="warning">Course data is missing for an enrollment.</Alert>
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EnrolledCourses;