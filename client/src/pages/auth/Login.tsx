import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common';

/**
 * Login sayfası - kullanıcı giriş formu
 */
function Login() {  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login } = useAuth();
    const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  /**
   * Form alanlarını güncelle
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Hata mesajını temizle
    if (error) setError('');
  };

  /**
   * Şifre görünürlüğünü değiştir
   */
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  /**
   * Form validasyonu
   */
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Kullanıcı adı gereklidir.');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Şifre gereklidir.');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return false;
    }
    
    return true;
  };
  /**
   * Giriş formunu gönder
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await login({ username: formData.username, password: formData.password });
    } catch (error: any) {
      setError(error.message ?? 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };
  /**
   * Demo hesabı ile giriş
   */
  const handleDemoLogin = () => {
    setFormData({
      username: 'gokhanasilturk',
      password: 'Student123!'
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Giriş kontrol ediliyor..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: (theme) => theme.shadows[10]
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo ve Başlık */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SchoolIcon
              sx={{
                fontSize: 48,
                color: 'primary.main',
                mb: 2
              }}
            />
            <Typography variant="h4" gutterBottom>
              Öğrenci Portalı
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hesabınıza giriş yapın
            </Typography>
          </Box>

          {/* Hata Mesajı */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Giriş Formu */}
          <Box component="form" onSubmit={handleSubmit}>            <TextField
              fullWidth
              label="Kullanıcı Adı"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={isSubmitting}
              sx={{ mb: 2 }}              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            >
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Box>

          {/* Demo Hesap */}
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              veya
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          >
            Demo Hesabı ile Giriş
          </Button>

          {/* Yardım Linkleri */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Şifrenizi mi unuttunuz?{' '}
              <Link href="#" underline="hover">
                Şifre Sıfırla
              </Link>
            </Typography>
            
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;