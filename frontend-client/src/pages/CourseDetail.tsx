import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Grid,
  Avatar,
  Divider,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useCourse } from '../contexts/CourseContext';
import { useEnrollments } from '../contexts/EnrollmentContext';
import { ErrorMessage, LoadingSpinner } from '../components/common';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { currentCourse: course, loading: courseLoading, error: courseError }, getCourseById } = useCourse();
  const { enrollCourse, withdrawCourse, isEnrolled } = useEnrollments();
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const enrolled = course ? isEnrolled(course.id) : false;
  useEffect(() => {
    if (id) {
      // Kurs verisini yüklemek için timeout ekleyelim
      const loadCourse = async () => {
        try {
          await getCourseById(id);
        } catch (error) {
          console.error("Kurs yükleme hatası:", error);
        }
      };
      
      loadCourse();
    }
  }, [id, getCourseById]);

  const handleEnroll = async () => {
    if (!course) return;
    
    try {
      setEnrollmentLoading(true);
      await enrollCourse(course.id);
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!course) return;

    try {
      setEnrollmentLoading(true);
      await withdrawCourse(course.id);
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/courses');
  };

  // Interface tanımlayarak
  interface EnrollmentState {
    status: string;
    error?: string; // Optional property
  }

  const enrollmentState: EnrollmentState = {
    status: 'not_enrolled',
  };
  // Yükleme durumunu daha detaylı göster
  if (courseLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <LoadingSpinner message="Kurs bilgileri yükleniyor..." />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Bu işlem biraz zaman alabilir. Lütfen bekleyin...
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={handleBackClick}
          >
            Kurslara Dön
          </Button>
        </Paper>
      </Container>
    );
  }

  if (courseError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorMessage message={courseError} />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="outlined" onClick={handleBackClick} startIcon={<ArrowBackIcon />}>
            Kurslara Dön
          </Button>
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Kurs bulunamadı.
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="outlined" onClick={handleBackClick} startIcon={<ArrowBackIcon />}>
            Kurslara Dön
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={handleBackClick}
          sx={{ textDecoration: 'none' }}
        >
          Kurslar
        </Link>
        <Typography color="text.primary">{course.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBackClick}
        sx={{ mb: 3 }}
      >
        Kurslara Dön
      </Button>

      {/* Course Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
              }}
            >
              <SchoolIcon fontSize="large" />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom>
              {course.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              {course.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
              {enrolled && (
                <Chip
                  label="Kayıtlı"
                  color="success"
                  variant="filled"
                />
              )}
              <Chip
                label={`Kredi: ${course.credits}`}
                variant="outlined"
                icon={<SchoolIcon />}
              />
            </Box>
          </Grid>
          <Grid item>
            {!enrolled ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleEnroll}
                disabled={enrollmentLoading}
                sx={{ minWidth: 120 }}
              >
                {enrollmentLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                size="large"
                onClick={handleWithdraw}
                disabled={enrollmentLoading}
                sx={{ minWidth: 120 }}
              >
                {enrollmentLoading ? 'İşleniyor...' : 'Dersten Çık'}
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Course Details */}
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Kurs Detayları
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>Kredi:</strong> {course.credits}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>Eğitmen:</strong> {course?.instructor ?? 'Belirtilmemiş'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                <strong>Süre:</strong> {course?.duration ?? 'Belirtilmemiş'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Açıklama
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {course.description}
            </Typography>
          </Grid>
        </Grid>

        {/* Enrollment Status */}
        {enrollmentState.error && enrollmentState.error.length > 0 && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {enrollmentState.error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default CourseDetail;
