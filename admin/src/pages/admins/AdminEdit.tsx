import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services';
import { Admin, AdminUpdateData } from '../../types';

const AdminEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdminUpdateData>({
    firstName: '',
    lastName: '',
    department: '',
    title: '',
  });

  const fetchAdmin = async () => {
    if (!id) return;    try {
      setFetchLoading(true);
      const response = await adminService.getAdmin(id);
      setAdmin(response.data);
      setFormData({
        firstName: response.data.user?.firstName ?? '',
        lastName: response.data.user?.lastName ?? '',
        department: response.data.department,
        title: response.data.title,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Admin bilgileri yüklenemedi');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [id]);

  const handleInputChange = (field: keyof AdminUpdateData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = (): boolean => {
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
    
    if (!id || !validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      
      await adminService.updateAdmin(id, formData);
      setSuccess('Admin başarıyla güncellendi');
      
      // 2 saniye sonra liste sayfasına yönlendir
      setTimeout(() => {
        navigate('/admins');
      }, 2000);
    } catch (err: any) {
      setError(err.message ?? 'Admin güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  if (!admin) {
    return (
      <Box>
        <Alert severity="error">
          Admin bulunamadı
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admins')}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>        <Typography variant="h4" component="h1">
          Admin Düzenle - {admin.user?.firstName} {admin.user?.lastName}
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
                  label="Departman"
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  Not: Kullanıcı adı ve e-posta adresi değiştirilemez.
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Güncelleniyor...' : 'Güncelle'}
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

export default AdminEdit;
