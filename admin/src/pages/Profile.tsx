import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts';
import { useNotification } from '../hooks';
import { authService, adminService } from '../services';

const passwordChangeSchema = Yup.object({
  currentPassword: Yup.string().required('Mevcut şifre gereklidir'),
  newPassword: Yup.string()
    .min(6, 'Yeni şifre en az 6 karakter olmalıdır')
    .required('Yeni şifre gereklidir'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Şifreler uyuşmuyor')
    .required('Şifre tekrarı gereklidir'),
});

const profileUpdateSchema = Yup.object({
  firstName: Yup.string().required('Ad gereklidir'),
  lastName: Yup.string().required('Soyad gereklidir'),
  department: Yup.string().required('Departman gereklidir'),
  title: Yup.string().required('Unvan gereklidir'),
  username: Yup.string().required('Kullanıcı adı gereklidir'),
  email: Yup.string().email('Geçerli bir e-posta adresi girin').required('E-posta gereklidir'),
});

// Helper function to get error message
const getErrorMessage = (error: any): string => {
  return typeof error === 'string' ? error : 'Geçersiz değer';
};

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);  useEffect(() => {
    // Admin bilgilerini yükle
    const fetchAdminData = async () => {
      if (user?.id) {
        try {
          // Önce tüm admin'leri getir ve user ID'ye göre filtrele
          const response = await adminService.getAdmins();
          const currentAdmin = response.data.find(admin => admin.userId === user.id);
            if (currentAdmin) {
            setAdminData({
              firstName: currentAdmin.user?.firstName ?? '',
              lastName: currentAdmin.user?.lastName ?? '',
              department: currentAdmin.department,
              title: currentAdmin.title,
              adminId: currentAdmin.id // Admin ID'yi saklayalım
            });
          } else {
            // Admin kaydı bulunamadıysa varsayılan değerler
            setAdminData({
              firstName: user.firstName ?? '',
              lastName: user.lastName ?? '',
              department: '', 
              title: '',
              adminId: null
            });
          }
        } catch (error) {
          console.error('Admin bilgileri yüklenemedi:', error);          // Eğer backend'den alınamıyorsa user bilgilerini kullan
          setAdminData({
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            department: '', 
            title: '',
            adminId: null
          });
        }
      }
    };
    fetchAdminData();
  }, [user]);  const profileFormik = useFormik({
    initialValues: {
      firstName: adminData?.firstName ?? '',
      lastName: adminData?.lastName ?? '',
      department: adminData?.department ?? '',
      title: adminData?.title ?? '',
      username: user?.username ?? '',
      email: user?.email ?? '',
    },
    enableReinitialize: true,
    validationSchema: profileUpdateSchema,    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        if (user?.id && adminData?.adminId) {
          // Admin bilgilerini güncelle
          await adminService.updateAdmin(adminData.adminId, {
            firstName: values.firstName,
            lastName: values.lastName,
            department: values.department,
            title: values.title
          });
          
          // Kullanıcı adı ve e-posta güncellemesi
          if (values.username !== user.username || values.email !== user.email) {
            await authService.updateUserProfile({
              username: values.username,
              email: values.email
            });
          }
          
          // Local state'i güncelle
          setAdminData({ ...adminData, ...values });
          
          // Auth context'teki user bilgilerini güncelle
          updateProfile({
            firstName: values.firstName,
            lastName: values.lastName,
            username: values.username,
            email: values.email
          });
          
          showSuccess('Profil başarıyla güncellendi');
          setIsEditMode(false);
        } else {
          showError('Admin bilgileri bulunamadı');
        }
      } catch (error: any) {
        console.error('Profile update error:', error);
        showError(error.message ?? 'Profil güncellenirken bir hata oluştu');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordChangeSchema,    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        await authService.changePassword(values.currentPassword, values.newPassword);
        showSuccess('Şifre başarıyla değiştirildi');
        setPasswordDialogOpen(false);
        resetForm();      } catch (error: any) {
        console.error('Password change error:', error);
        showError(error.message ?? 'Şifre değiştirilirken bir hata oluştu');
      } finally {
        setSubmitting(false);
      }
    },  });

  // Helper fonksiyon - hata mesajlarını güvenli şekilde almak için
  const getFieldError = (fieldName: keyof typeof profileFormik.values): string => {
    const touched = profileFormik.touched[fieldName];
    const error = profileFormik.errors[fieldName];
    
    if (touched && error) {
      return typeof error === 'string' ? error : 'Geçersiz değer';
    }
    return '';
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    passwordFormik.resetForm();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={3}>
        Profil
      </Typography>

      <Grid container spacing={3}>        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
          }}>
            <Box p={3} textAlign="center">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.15)',
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.username}
              </Typography>
            </Box>
          </Card>
        </Grid>        <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
          }}>            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Profil Bilgileri
                </Typography>
                {!isEditMode && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditMode(true)}
                    size="small"
                  >
                    Düzenle
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />

              <form onSubmit={profileFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ad"
                      name="firstName"
                      value={profileFormik.values.firstName}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      disabled={!isEditMode}                      error={profileFormik.touched.firstName && Boolean(profileFormik.errors.firstName)}
                      helperText={
                        profileFormik.touched.firstName && profileFormik.errors.firstName
                          ? getErrorMessage(profileFormik.errors.firstName)
                          : ''
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Soyad"
                      name="lastName"
                      value={profileFormik.values.lastName}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      disabled={!isEditMode}                      error={profileFormik.touched.lastName && Boolean(profileFormik.errors.lastName)}
                      helperText={
                        profileFormik.touched.lastName && profileFormik.errors.lastName
                          ? getErrorMessage(profileFormik.errors.lastName)
                          : ''
                      }
                    />
                  </Grid>                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Departman"
                      name="department"
                      value={profileFormik.values.department}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      disabled={!isEditMode}                      error={profileFormik.touched.department && Boolean(profileFormik.errors.department)}
                      helperText={
                        profileFormik.touched.department && profileFormik.errors.department
                          ? getErrorMessage(profileFormik.errors.department)
                          : ''
                      }
                    />                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Unvan"
                      name="title"
                      value={profileFormik.values.title}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      disabled={!isEditMode}                      error={profileFormik.touched.title && Boolean(profileFormik.errors.title)}
                      helperText={
                        profileFormik.touched.title && profileFormik.errors.title
                          ? getErrorMessage(profileFormik.errors.title)
                          : ''
                      }
                    />
                  </Grid>                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Kullanıcı Adı"
                      name="username"
                      value={profileFormik.values.username}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      disabled={!isEditMode}
                      error={profileFormik.touched.username && Boolean(profileFormik.errors.username)}
                      helperText={getFieldError('username')}
                    />
                  </Grid>                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      name="email"
                      value={profileFormik.values.email}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      disabled={!isEditMode}
                      error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                      helperText={getFieldError('email')}
                    />
                  </Grid>
                </Grid>

                {isEditMode && (
                  <Box mt={3} display="flex" gap={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={profileFormik.isSubmitting}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsEditMode(false);
                        profileFormik.resetForm();
                      }}
                    >
                      İptal
                    </Button>
                  </Box>
                )}
              </form>

              <Box mt={4}>
                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Şifre Değiştir
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Şifre Değiştirme Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Şifre Değiştir</DialogTitle>
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mevcut Şifre"
                  name="currentPassword"
                  type="password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yeni Şifre"
                  name="newPassword"
                  type="password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Yeni Şifre Tekrar"
                  name="confirmPassword"
                  type="password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePasswordDialogClose}>İptal</Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={passwordFormik.isSubmitting}
            >
              Kaydet
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
