import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { useCourse } from '../contexts/CourseContext';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { User, Course, Enrollment, Student, LoginCredentials } from '../types';
import AuthContext from '../contexts/AuthContext';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

function Profile() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { enrollments, loading: enrollmentsLoading, error: enrollmentsError, fetchStudentEnrollments, withdrawCourse } = useEnrollment();
  const { state: courseState } = useCourse();
  
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
  const [enrolledCoursesDetails, setEnrolledCoursesDetails] = useState<Course[]>([]);
  
  // Hook kuralları gereği her koşulda çağrılmalı
  const { user = null, student = null, loading: authLoading = false, error: authError = null, updateProfile = () => {}, logout = () => Promise.resolve() } = authContext || {};
  const { courses = [] } = courseState || { courses: [] };
  
  useEffect(() => {
    if (authContext && student) {
      console.log("Profile.tsx: student ile fetchStudentEnrollments çağrılıyor:", student);
      // StudentId kontrolü
      const studentIdToUse = student.id || student.studentId;
      if (studentIdToUse) {
        console.log("Profile.tsx: Kullanılan studentId:", studentIdToUse);
        fetchStudentEnrollments(studentIdToUse);
      } else {
        console.warn("Profile.tsx: Hem student.id hem de student.studentId bulunamadı");
      }
    } else {
      console.warn("Profile.tsx: student bulunamadı, fetchStudentEnrollments çağrılamadı.");
    }
  }, [authContext, student, fetchStudentEnrollments]);

  useEffect(() => {
    if (authContext && user) {
      setEditedUser({
        username: user.username,
        email: user.email
      });
    }
  }, [authContext, user, student]);

  useEffect(() => {
    console.log('Profil useEffect - enrollments değişti:', enrollments);
    
    if (enrollments && enrollments.length > 0) {
      // Öncelikle enrollment içindeki kurs bilgilerini kullan (eğer varsa)
      let coursesFromEnrollments: Course[] = [];
      
      // Her bir enrollment için course bilgisini kontrol et
      const coursesWithData = enrollments
        .filter(e => e.course && typeof e.course === 'object' && e.course.id)
        .map(e => e.course as Course);
      
      console.log('Course bilgisi içeren kayıtlar:', coursesWithData);
      
      if (coursesWithData.length > 0) {
        coursesFromEnrollments = coursesWithData;
      } 
      // Yoksa, global course listesinden filtrele
      else if (courses && courses.length > 0) {
        const enrolledIds = enrollments.map((e: Enrollment) => e.courseId);
        coursesFromEnrollments = courses.filter((c: Course) => enrolledIds.includes(c.id));
      }
      
      console.log('Profil sayfası - İşlenen kayıt bilgileri:', { 
        enrollments, 
        enrolledCourses: coursesFromEnrollments 
      });
      
      setEnrolledCoursesDetails(coursesFromEnrollments);
    } else {
      setEnrolledCoursesDetails([]);
      console.log('Profil sayfası - Kayıt bilgileri boş veya eksik:', { 
        courses: courses?.length || 0, 
        enrollments: enrollments?.length || 0 
      });
    }
  }, [courses, enrollments]);
  
  if (!authContext) {
    return <Alert severity="error">Authentication context is not available.</Alert>;
  }

  const handleEditStart = () => {
    setIsEditing(true);
    setProfileError('');
    setSuccess('');
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditedUser({
        username: user.username,
        email: user.email
      });
    }
    setProfileError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setProfileError('');
    try {
      if (user && editedUser.username && editedUser.email) {
        updateProfile({ id: user.id, ...editedUser });
        setIsEditing(false);
        setSuccess('Profil bilgileriniz başarıyla güncellendi.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setProfileError('Kullanıcı adı ve email boş bırakılamaz.');
      }
    } catch (error: any) {
      setProfileError(error.message ?? 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSave = async () => {
    console.log('Yeni şifre:', passwordData);
    setPasswordDialogOpen(false);
  };

  const handleWithdrawCourse = async (courseId: string) => {
    if (window.confirm('Bu dersten kaydınızı silmek istediğinize emin misiniz?')) {
      try {
        await withdrawCourse(courseId);
        setSuccess('Dersten başarıyla çıkış yapıldı.');
        if (student?.id) fetchStudentEnrollments(student.id);
      } catch (error: any) {
        setProfileError(error.message ?? 'Dersten çıkış yapılırken bir hata oluştu.');
      }
    }
  };
  
  if (authLoading || enrollmentsLoading) {
    return <LoadingSpinner fullScreen message="Profil bilgileri yükleniyor..." />;
  }

  if (authError) {
    return <ErrorMessage title="Profil Yüklenemedi" message={authError} />;
  }
  
  if (!user) {
    return <Alert severity="warning">Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Profilim
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
      {enrollmentsError && <Alert severity="error" sx={{ mb: 2 }}>Kayıtlı dersler yüklenirken hata: {enrollmentsError}</Alert>}

      <Grid container spacing={3}>
        {/* Profil Bilgileri Kartı */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}>
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5">{`${user?.firstName ?? ''} ${user?.lastName ?? user.username}`}</Typography>
                  <Typography color="text.secondary">{user.email}</Typography>
                  <Chip label={'Öğrenci'} size="small" color="secondary" sx={{ mt: 1 }} />
                </Box>
              </Box>

              {isEditing ? (
                <>
                  <TextField
                    label="Kullanıcı Adı"
                    fullWidth
                    margin="normal"
                    value={editedUser.username ?? ''}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                  <TextField
                    label="E-posta"
                    fullWidth
                    margin="normal"
                    value={editedUser.email ?? ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={handleEditCancel} startIcon={<CancelIcon />} disabled={loading}>
                      İptal
                    </Button>
                    <Button variant="contained" onClick={handleSave} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} disabled={loading}>
                      Kaydet
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={handleEditStart} startIcon={<EditIcon />}>
                    Profili Düzenle
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Hesap Ayarları Kartı */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Hesap Ayarları</Typography>
              <List dense>
                <ListItem onClick={() => setPasswordDialogOpen(true)}>
                  <ListItemIcon><SecurityIcon /></ListItemIcon>
                  <ListItemText primary="Şifre Değiştir" />
                </ListItem>
                <ListItem onClick={async () => { await logout(); navigate('/login');}}>
                  <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                  <ListItemText primary="Çıkış Yap" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Kayıtlı Dersler Kartı */}
        {user.role === 'student' && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Kayıtlı Derslerim</Typography>
                {enrollmentsLoading && <CircularProgress />}
                {enrollmentsError && <Alert severity="error">{enrollmentsError}</Alert>}
                {!enrollmentsLoading && !enrollmentsError && (
                  enrolledCoursesDetails.length > 0 ? (
                    <List dense>
                      {enrolledCoursesDetails.map(course => (
                        <ListItem 
                          key={course.id} 
                          secondaryAction={
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              onClick={() => handleWithdrawCourse(course.id)}
                            >
                              Kaydı Sil
                            </Button>
                          }
                        >
                          <ListItemIcon><SchoolIcon /></ListItemIcon>
                          <ListItemText 
                            primary={course.name} 
                            secondary={course.description?.substring(0,100) + (course.description && course.description.length > 100 ? '...' : '')}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>Henüz bir derse kayıt olmadınız.</Typography>
                  )
                )}
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button variant="contained" onClick={() => navigate('/courses')}>Yeni Derslere Göz At</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Şifre Değiştirme Dialogu */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Şifre Değiştir</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Mevcut Şifre"
            type="password"
            fullWidth
            variant="standard"
            value={passwordData.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Yeni Şifre"
            type="password"
            fullWidth
            variant="standard"
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Yeni Şifre (Tekrar)"
            type="password"
            fullWidth
            variant="standard"
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>İptal</Button>
          <Button onClick={handlePasswordSave}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;