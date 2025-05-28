import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts';
import { useNotification } from '../hooks';
import { authService } from '../services';

const passwordChangeSchema = Yup.object({
  currentPassword: Yup.string().required('Mevcut şifre gereklidir'),
  newPassword: Yup.string()
    .min(6, 'Yeni şifre en az 6 karakter olmalıdır')
    .required('Yeni şifre gereklidir'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Şifreler uyuşmuyor')
    .required('Şifre tekrarı gereklidir'),
});

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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
    },
  });

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
              <Typography variant="body2" color="text.secondary">
                Admin
              </Typography>
            </Box>
          </Card>
        </Grid>        <Grid item xs={12} md={8}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
          }}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Profil Bilgileri
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ad"
                    value={user?.firstName ?? ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Soyad"
                    value={user?.lastName ?? ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Kullanıcı Adı"
                    value={user?.username ?? ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    value={user?.email ?? ''}
                    disabled
                  />
                </Grid>
              </Grid>

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
