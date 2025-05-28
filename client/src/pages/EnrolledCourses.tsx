import React, { useContext, useEffect } from 'react';
import { Typography, Grid, CircularProgress, Alert, Box } from '@mui/material';
import { EnrollmentContext } from '../contexts/EnrollmentContext';
import AuthContext from '../contexts/AuthContext';
import CourseCard from '../components/common/CourseCard';
import { Enrollment } from '../types';

const EnrolledCourses: React.FC = () => {
  const authContext = useContext(AuthContext);
  const enrollmentContext = useContext(EnrollmentContext);

  useEffect(() => {
    if (authContext?.student?.id && enrollmentContext?.fetchStudentEnrollments && typeof enrollmentContext.fetchStudentEnrollments === 'function') {
      enrollmentContext.fetchStudentEnrollments(authContext.student.id);
    } else {
      console.warn("EnrolledCourses.tsx: student.id bulunamadı, fetchStudentEnrollments çağrılamadı.");
    }
  }, [authContext?.student?.id, enrollmentContext?.fetchStudentEnrollments]);

  if (!authContext) {
    return <Alert severity="error">Authentication context is not available.</Alert>;
  }
  if (!enrollmentContext) {
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
            {enrollment.course ? (
              <CourseCard course={enrollment.course} />
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