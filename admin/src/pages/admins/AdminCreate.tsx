import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services';
import { AdminCreateData } from '../../types';

const AdminCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminCreateData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
    title: '',
  });

  const handleInputChange = (field: keyof AdminCreateData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('Kullanıcı adı gereklidir');
      return false;
    }
    if (!formData.email.trim()) {
      setError('E-posta adresi gereklidir');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Şifre gereklidir');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (!formData.firstName.trim()) {
      setError('Ad gereklidir');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Soyad gereklidir');
      return false;
    }
    if (!formData.department.trim()) {
      setError('Departman gereklidir');
      return false;
    }
    if (!formData.title.trim()) {
      setError('Unvan gereklidir');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      
      await adminService.createAdmin(formData);
      setSuccess('Admin başarıyla oluşturuldu');
      
      // 2 saniye sonra liste sayfasına yönlendir
      setTimeout(() => {
        navigate('/admins');
      }, 2000);
    } catch (err: any) {
      setError(err.message ?? 'Admin oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admins')}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h4" component="h1">
          Yeni Admin Ekle
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ad"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Soyad"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kullanıcı Adı"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Şifre"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                  disabled={loading}
                  helperText="En az 6 karakter"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Departman"
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Unvan"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admins')}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminCreate;
