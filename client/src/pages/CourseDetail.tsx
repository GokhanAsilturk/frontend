import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useCourse } from '../contexts/CourseContext';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { ErrorMessage, LoadingSpinner } from '../components/common';
import AuthContext from '../contexts/AuthContext';

const CourseDetail: React.FC = () => {
  const { id: courseIdFromParams } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const courseContext = useCourse();
  const enrollmentContext = useEnrollment();
  const authContext = useContext(AuthContext);
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = authContext || { user: null };

  const { state: courseState, getCourseById } = courseContext;
  const { currentCourse, loading: courseLoading, error: courseError } = courseState;

  const {
    loading: contextEnrollmentLoading,
    error: enrollmentError,
    enrollCourse,
    withdrawCourse,
    isEnrolled
  } = enrollmentContext;

  const enrolled = currentCourse ? isEnrolled(currentCourse.id) : false;
  
  useEffect(() => {
    if (courseIdFromParams) {
      getCourseById(courseIdFromParams);
    }
  }, [courseIdFromParams, getCourseById]);
  
  if (!authContext) {
    return <Alert severity="error">Authentication context is not available.</Alert>;
  }

  const handleEnroll = async () => {
    if (!currentCourse) return;
    setActionLoading(true);
    try {
      await enrollCourse(currentCourse.id);
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!currentCourse) return;
    setActionLoading(true);
    try {
      await withdrawCourse(currentCourse.id);
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/courses');
  };

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
            Derslere Dön
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
            Derslere Dön
          </Button>
        </Box>
      </Container>
    );
  }

  if (!currentCourse) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Kurs bulunamadı veya yüklenemedi.
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="outlined" onClick={handleBackClick} startIcon={<ArrowBackIcon />}>
            Derslere Dön
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          component="button"
          variant="body1"
          onClick={handleBackClick}
          sx={{ textDecoration: 'none' }}
        >
          Dersler
        </MuiLink>
        <Typography color="text.primary">{currentCourse.name}</Typography>
      </Breadcrumbs>

      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBackClick}
        sx={{ mb: 3 }}
      >
        Derslere Dön
      </Button>

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
              {currentCourse.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              {currentCourse.description}
            </Typography>
            
          </Grid>
          <Grid item>
            {user && (
              (() => {
                const loadingText = enrolled ? 'Çıkış Yapılıyor...' : 'Kayıt Olunuyor...';
                const actionText = enrolled ? 'Dersten Çık' : 'Derse Kayıt Ol';
                const buttonText = actionLoading ? loadingText : actionText;

                return (
                  <Button
                    variant={enrolled ? "outlined" : "contained"}
                    color={enrolled ? "error" : "primary"}
                    onClick={enrolled ? handleWithdraw : handleEnroll}
                    disabled={actionLoading || contextEnrollmentLoading} 
                    startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {buttonText}
                  </Button>
                );
              })()
            )}
          </Grid>
        </Grid>
      </Paper>

      {enrollmentError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          İşlem sırasında bir hata oluştu: {enrollmentError}
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>Ders İçeriği</Typography>
          <Typography paragraph>
            {currentCourse.description || 'Bu ders için detaylı içerik bilgisi henüz eklenmemiştir.'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Ders Bilgileri</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">Eğitmen: {'Belirtilmemiş'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">Süre: {'Belirtilmemiş'}</Typography>
            </Box>
            
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDetail;
