import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  BookmarkBorder as BookmarkIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCourse } from '../contexts/CourseContext';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { LoadingSpinner, ErrorMessage, CourseCard } from '../components/common';
import { Course, Enrollment } from '../types';

function Dashboard() {
  const navigate = useNavigate();
  const { user, student } = useAuth();
  const { state: courseState, fetchCourses } = useCourse();
  const { courses, loading: coursesLoading, error: coursesError } = courseState;
  
  const { enrollments, loading: enrollmentsLoading, fetchStudentEnrollments } = useEnrollment();

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
    
  useEffect(() => {
    let isComponentMounted = true;
    
    const loadData = async () => {
      try {
        if (isComponentMounted && student?.id) {
          if (courses.length === 0) {
            await fetchCourses();
          }
          await fetchStudentEnrollments(student.id);
        }
      } catch (error) {
        if (isComponentMounted) {
          console.error('Veri yükleme hatası:', error);
        }
      }
    };
    
    if (student?.id) {
      loadData();
    }

    return () => {
      isComponentMounted = false;
    };
  }, [student, fetchCourses, fetchStudentEnrollments, courses.length]);
  
  useEffect(() => {
    if (courses.length > 0 && enrollments.length > 0) {
      const enrolledCourseIds = enrollments.map((e: Enrollment) => e.course?.id ?? e.courseId);
      const filteredEnrolledCourses = courses.filter((course: Course) => enrolledCourseIds.includes(course.id));
      
      setEnrolledCourses(filteredEnrolledCourses);
      setRecentCourses(filteredEnrolledCourses.slice(0, 3));
    }
  }, [courses, enrollments]);
  
  const getStats = () => {
    const totalCourses = enrolledCourses.length;
    const completedCourses = 0;
    const inProgressCourses = enrollments.length;
    const completionRate = 0;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      completionRate
    };
  };

  const stats = getStats();

  if (coursesLoading || enrollmentsLoading) {
    return <LoadingSpinner fullScreen message="Dashboard yükleniyor..." />;
  }

  if (coursesError) {
    return (
      <ErrorMessage
        title="Dashboard Yüklenemedi"
        message={coursesError}        onRetry={() => {
          fetchCourses();
          if(student?.id) fetchStudentEnrollments(student.id);
        }}
        fullWidth
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Hoş Geldin, {user?.firstName ?? 'Kullanıcı'}!
        </Typography>
        <Typography variant="subtitle1">
          Bugün neler başaracaksın?
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}><SchoolIcon /></Avatar>
              <Typography variant="h6">Kayıtlı Dersler</Typography>
              <Typography variant="h3">{stats.totalCourses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: 'success.main', mb: 1 }}><TrendingUpIcon /></Avatar>
              <Typography variant="h6">Devam Eden Dersler</Typography>
              <Typography variant="h3">{stats.inProgressCourses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: 'info.main', mb: 1 }}><AssignmentIcon /></Avatar>
              <Typography variant="h6">Tamamlanan Dersler</Typography>
              <Typography variant="h3">{stats.completedCourses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: 'warning.main', mb: 1 }}><ScheduleIcon /></Avatar>
              <Typography variant="h6">Tamamlama Oranı</Typography>
              <LinearProgress variant="determinate" value={stats.completionRate} sx={{ height: 10, borderRadius: 5, my: 1 }} />
              <Typography variant="h4">{stats.completionRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Son Kayıt Olunan Dersler</Typography>
            {recentCourses.length > 0 ? (
              <Grid container spacing={2}>
                {recentCourses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <CourseCard course={course} showEnrollmentActions={false} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>Henüz bir derse kayıt olmadınız.</Typography>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={() => navigate('/courses')}>Tüm Dersleri Gör</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Yaklaşan Etkinlikler</Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}><ScheduleIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText primary="Matematik Final Sınavı" secondary="25 Aralık 2023 - 10:00" />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.light' }}><BookmarkIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText primary="Proje Teslim Tarihi" secondary="30 Aralık 2023" />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="outlined" onClick={() => navigate('/calendar')}>Takvime Git</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;