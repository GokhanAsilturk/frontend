import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useEnrollments } from '../contexts/EnrollmentContext'; // EnrollmentProvider -> useEnrollments
import { useCourse } from '../contexts/CourseContext';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { User } from '../types';

/**
 * Profile sayfası - kullanıcının profil bilgilerini görüntüler ve düzenleme imkanı sunar
 */
function Profile() {
  const { user, loading: authLoading, error: authError, updateProfile } = useAuth();
  const { enrollments, loading: enrollmentsLoading, fetchEnrolledCourses } = useEnrollments(); // EnrollmentProvider() -> useEnrollments
  const { state: { courses } } = useCourse();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [success, setSuccess] = useState<string>('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  /**
   * Sayfa yüklendiğinde verileri getir - SADECE BİR KERE
   */
  useEffect(() => {
    let isComponentMounted = true;
    
    const loadData = async () => {
      try {
        if (isComponentMounted && enrollments.length === 0) {
          // Remove the user?.id parameter since fetchEnrolledCourses doesn't expect arguments
          await fetchEnrolledCourses();
        }
      } catch (error) {
        if (isComponentMounted) {
          console.error('Kayıtlı dersler yükleme hatası:', error);
        }
      }
    };

    loadData();

    return () => {
      isComponentMounted = false;
    };
  }, [enrollments.length, fetchEnrolledCourses]);
  /**
   * Kullanıcı bilgileri değiştiğinde düzenleme formunu güncelle
   */
  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username,
        email: user.email
      });
    }
  }, [user]);

  /**
   * Kayıtlı dersleri al
   */
  const enrolledCourses = Array.isArray(courses) ? 
    courses.filter(course => 
      Array.isArray(enrollments) && enrollments.some(enrollment => enrollment.courseId === course.id)
    )
  : [];

  /**
   * Düzenleme modunu başlat
   */
  const handleEditStart = () => {
    setIsEditing(true);
    setProfileError(''); // setError -> setProfileError
    setSuccess('');
  };

  /**
   * Düzenleme modunu iptal et
   */
  const handleEditCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditedUser({
        username: user.username,
        email: user.email
      });
    }
    setProfileError(''); // setError -> setProfileError
  };

  /**
   * Profil bilgilerini kaydet
   */
  const handleSave = async () => {
    try {
      setLoading(true);
      setProfileError(''); // setError -> setProfileError
      
      updateProfile(editedUser);
      setIsEditing(false);
      setSuccess('Profil bilgileriniz başarıyla güncellendi.');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setProfileError(error.message ?? 'Profil güncellenirken bir hata oluştu.'); // setError -> setProfileError
    } finally {
      setLoading(false);
    }
  };

  /**
   * Form alanlarını güncelle
   */
  const handleInputChange = (field: string, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Şifre değiştirme dialogunu aç
   */
  const handlePasswordDialogOpen = () => {
    setPasswordDialogOpen(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  /**
   * Şifre değiştirme dialogunu kapat
   */
  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  /**
   * Şifre değiştir
   */
  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setProfileError('Yeni şifreler eşleşmiyor.'); // setError -> setProfileError
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setProfileError('Yeni şifre en az 6 karakter olmalıdır.'); // setError -> setProfileError
        return;
      }

      setLoading(true);
      // Şifre değiştirme API çağrısı burada yapılacak
      // await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setPasswordDialogOpen(false);
      setSuccess('Şifreniz başarıyla değiştirildi.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setProfileError(error.message ?? 'Şifre değiştirilirken bir hata oluştu.'); // setError -> setProfileError
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || enrollmentsLoading) {
    return <LoadingSpinner fullScreen message="Profil yükleniyor..." />;
  }

  if (!user) {
    return (
      <ErrorMessage
        title="Profil Bulunamadı"
        message="Kullanıcı bilgileri yüklenemedi."
        fullWidth
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profilim
      </Typography>

      {/* Başarı ve Hata Mesajları */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {authError && ( // Bu authError useAuth'dan geliyor, bu kalmalı
        <Alert severity="error" sx={{ mb: 2 }}>
          {authError}
        </Alert>
      )}
      {profileError && ( // Yeni eklenen profileError için Alert
        <Alert severity="error" sx={{ mb: 2 }}>
          {profileError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profil Bilgileri */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Kişisel Bilgiler</Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditStart}
                  >
                    Düzenle
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleEditCancel}
                      disabled={loading}
                    >
                      İptal
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kullanıcı Adı"
                    value={isEditing ? editedUser.username ?? '' : user.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    value={isEditing ? editedUser.email ?? '' : user.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    type="email"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rol"
                    value={user.role === 'student' ? 'Öğrenci' : 'Yönetici'}
                    disabled
                    variant="filled"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kayıt Tarihi"
                    value={user && (user as any).createdAt ? new Date((user as any).createdAt).toLocaleDateString('tr-TR') : ''}
                    disabled
                    variant="filled"
                  />
                </Grid>
                

              </Grid>
            </CardContent>
          </Card>

          {/* Güvenlik Ayarları */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Güvenlik Ayarları
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Şifre Değiştir"
                    secondary="Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin"
                  />
                  <Button
                    variant="outlined"
                    onClick={handlePasswordDialogOpen}
                  >
                    Değiştir
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Yan Panel */}
        <Grid item xs={12} md={4}>
          {/* Profil Özeti */}
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h6" gutterBottom>
                {user.username}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              <Chip
                label="Aktif Öğrenci"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>

          {/* İstatistikler */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                İstatistiklerim
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Kayıtlı Dersler"
                    secondary={`${enrolledCourses.length} ders`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tamamlanan Dersler"
                    secondary={`0 ders`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Son Kayıtlı Dersler */}
          {enrolledCourses.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Son Kayıtlı Dersler
                </Typography>
                
                <List dense>
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <ListItem key={course.id}>
                      <ListItemText
                        primary={course.name}
                        secondary={(() => {
                          if (!course.description) return 'Açıklama bulunmuyor';
                          return course.description.length > 50 
                            ? course.description.substring(0, 50) + '...' 
                            : course.description;
                        })()}
                      />
                    </ListItem>
                  ))}
                </List>
                
                {enrolledCourses.length > 3 && (
                  <Button size="small" fullWidth>
                    Tümünü Gör ({enrolledCourses.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Şifre Değiştirme Dialogu */}
      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Şifre Değiştir</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Mevcut Şifre"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Yeni Şifre"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Yeni Şifre (Tekrar)"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose}>İptal</Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Değiştir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;