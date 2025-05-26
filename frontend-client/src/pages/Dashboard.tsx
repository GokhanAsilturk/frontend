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
  Chip,
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
import { useEnrollments } from '../contexts/EnrollmentContext';
import { LoadingSpinner, ErrorMessage, CourseCard } from '../components/common';
import { Course, Enrollment } from '../types';

/**
 * Dashboard sayfası - öğrencinin ana sayfası
 * Kayıtlı dersler, istatistikler ve yaklaşan etkinlikleri gösterir
 */
function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state: { courses, loading, error }, fetchCourses } = useCourse();
  const { enrollments, loading: enrollmentsLoading, fetchEnrolledCourses } = useEnrollments();

  // Aliases for loading and error
  const coursesLoading = loading;
  const coursesError = error;

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);  /**
   * Sayfa yüklendiğinde verileri getir - SADECE BİR KERE
   */  useEffect(() => {
    let isComponentMounted = true;
    
    const loadData = async () => {
      try {
        if (isComponentMounted && courses.length === 0) {
          await fetchCourses();
          await fetchEnrolledCourses();
        }
      } catch (error) {
        if (isComponentMounted) {
          console.error('Veri yükleme hatası:', error);
        }
      }
    };    // Sadece user varsa ve henüz yüklenmemişse çalıştır
    if (user) {
      loadData();
    }

    return () => {
      isComponentMounted = false;
    };
  }, []); // Empty dependency array - sadece mount/unmount
  /**
   * Kayıtlı dersleri filtrele
   */  
  useEffect(() => {
    if (courses.length > 0 && enrollments.length > 0) {
      const enrolledCourseIds = enrollments.map((e: Enrollment) => e.courseId);
      const enrolled = courses.filter((course: Course) => enrolledCourseIds.includes(course.id));
      setEnrolledCourses(enrolled);
      
      // Son 3 kayıtlı dersi al
      setRecentCourses(enrolled.slice(0, 3));
    }
  }, [courses, enrollments]);
  /**
   * İstatistikleri hesapla
   */
  const getStats = () => {
    const totalCourses = enrolledCourses.length;
    const completedCourses = 0; // Backend'de status field yok, şimdilik 0
    const inProgressCourses = enrollments.length; // Tüm enrollment'lar aktif sayılır
    const completionRate = 0; // Backend'de status field yok, şimdilik 0

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      completionRate
    };
  };

  const stats = getStats();

  if (coursesLoading ?? enrollmentsLoading) {
    return <LoadingSpinner fullScreen message="Dashboard yükleniyor..." />;
  }

  if (coursesError) {
    return (
      <ErrorMessage
        title="Dashboard Yüklenemedi"
        message={coursesError}        onRetry={() => {
          fetchCourses();
          fetchEnrolledCourses();
        }}
        fullWidth
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Hoş Geldin Bölümü */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mr: 2,
              bgcolor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {user?.username?.charAt(0).toUpperCase() ?? 'Ö'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Hoş Geldin, {user?.username ?? 'Öğrenci'}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Öğrenme yolculuğuna devam etmeye hazır mısın?
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* İstatistik Kartları */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Toplam Dersler</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {stats.totalCourses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Tamamlanan</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {stats.completedCourses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Devam Eden</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {stats.inProgressCourses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Tamamlama Oranı</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                %{Math.round(stats.completionRate)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.completionRate}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Son Kayıtlı Dersler */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Son Kayıtlı Derslerim</Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/enrolled-courses')}
                >
                  Tümünü Gör
                </Button>
              </Box>
              
              {recentCourses.length > 0 ? (
                <Grid container spacing={2}>
                  {recentCourses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <CourseCard 
                        course={course}
                        showEnrollmentActions={true}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BookmarkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />                  <Typography variant="body1" color="text.secondary">
                    Henüz hiçbir derse kayıt olmadınız.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/courses')}
                  >
                    Dersleri Keşfet
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Yaklaşan Etkinlikler */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Yaklaşan Etkinlikler
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="React Projesi Teslimi"
                    secondary="2 gün kaldı"
                  />
                  <Chip label="Önemli" color="error" size="small" />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="JavaScript Quiz"
                    secondary="1 hafta kaldı"
                  />
                  <Chip label="Quiz" color="info" size="small" />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <ScheduleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Canlı Ders: Node.js"
                    secondary="Yarın 14:00"
                  />
                  <Chip label="Canlı" color="warning" size="small" />
                </ListItem>
              </List>
              
              <Button fullWidth variant="outlined" sx={{ mt: 2 }}>
                Tüm Etkinlikleri Gör
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;