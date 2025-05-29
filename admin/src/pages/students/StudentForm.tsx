import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,  FormControlLabel,
  Switch,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { studentValidationSchema } from '../../utils/validation';
import { studentService } from '../../services';
import { useNotification } from '../../hooks';
import { CreateStudentRequest, UpdateStudentRequest } from '../../types';

const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      birthDate: '', // Form içinde kullanılacak
      status: 'active' as 'active' | 'inactive' | 'graduated' | 'suspended',
      isActive: true,
    },
    validationSchema: studentValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setSubmitError(null);

      try {        if (isEdit && id) {          // ISO formatında tarih gönderiyoruz
          const birthDate = values.birthDate ? new Date(values.birthDate).toISOString().split('T')[0] : '';
          
          const updateData: UpdateStudentRequest = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            birthDate: birthDate,
            isActive: values.isActive
          };
          
          console.log('Update data being sent:', updateData); // Debug için
          const result = await studentService.updateStudent(id, updateData);
          console.log('Update result:', result); // Debug için
          
          showSuccess('Öğrenci başarıyla güncellendi');
          
          // Başarı mesajı görünsün diye kısa bir bekleme
          setTimeout(() => {
            navigate('/students');
          }, 1500);
        } else {
          // ISO formatında tarih gönderiyoruz
          const birthDate = values.birthDate ? new Date(values.birthDate).toISOString().split('T')[0] : '';
          
          const createData: CreateStudentRequest = {
            username: values.username,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            birthDate: birthDate // Backend birthDate bekliyor
          };
          await studentService.createStudent(createData);
          showSuccess('Öğrenci başarıyla eklendi');
          
          // Başarı mesajı görünsün diye kısa bir bekleme
          setTimeout(() => {
            navigate('/students');
          }, 1500);
        }
      } catch (error: any) {
        setSubmitError(error.message ?? 'Bir hata oluştu');
        showError(
          isEdit ? 'Öğrenci güncellenirken hata oluştu' : 'Öğrenci eklenirken hata oluştu'
        );
      } finally {
        setLoading(false);
      }
    },
  });  // Edit modunda öğrenci verilerini yükle
  React.useEffect(() => {
    if (isEdit && id) {
      const loadStudent = async () => {
        try {
          setInitialLoading(true);
          const student = (await studentService.getStudent(id)).data;
          console.log('Loaded student data:', student); // Debug için
            // Backend'den gelen veri yapısını kontrol et
          if (student) {
            formik.setValues({
              username: student.user.username || '', 
              password: '', // Güvenlik nedeniyle boş bırakılıyor
              firstName: student.user.firstName || '',
              lastName: student.user.lastName || '',
              email: student.user.email || '',
              birthDate: student.birthDate.split('T')[0],
              status: 'active',
              isActive: true,
            });
          } else {
            console.error('Student data structure is unexpected:', student);
            showError('Öğrenci verileri beklenmeyen formatta');
          }
        } catch (error) {
          console.error('Error loading student:', error);
          showError('Öğrenci verileri yüklenirken hata oluştu');
          // Hata durumunda otomatik yönlendirme yapmayalım, kullanıcı karar versin
        } finally {
          setInitialLoading(false);
        }
      };
      loadStudent();
    }
  }, [isEdit, id]);

  const handleBack = () => {
    navigate('/students');
  };

  return (    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
          disabled={loading || initialLoading}
        >
          Geri
        </Button>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
        </Typography>
      </Box>

      {initialLoading ? (
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Typography>Öğrenci verileri yükleniyor...</Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card elevation={3}>
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              {submitError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {submitError}
                </Alert>
              )}<Grid container spacing={3}>
              {!isEdit && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="username"
                      name="username"
                      label="Kullanıcı Adı *"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.username && Boolean(formik.errors.username)}
                      helperText={formik.touched.username && formik.errors.username}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="Şifre *"
                      type="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="Ad *"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Soyad *"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="E-posta *"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
                <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="birthDate"
                  name="birthDate"
                  label="Doğum Tarihi"
                  type="date"
                  value={formik.values.birthDate}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    // Tarihin geçerli olduğundan emin ol
                    if (e.target.value && !isNaN(Date.parse(e.target.value))) {
                      // Formik değerini değiştir - bu değer ISO formatında olacak
                      formik.setFieldValue('birthDate', e.target.value);
                    }
                  }}
                  error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                  helperText={formik.touched.birthDate && formik.errors.birthDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid><Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                  >
                    <MenuItem value="active">Aktif</MenuItem>
                    <MenuItem value="inactive">Pasif</MenuItem>
                    <MenuItem value="graduated">Mezun</MenuItem>
                    <MenuItem value="suspended">Askıda</MenuItem>
                  </Select>
                </FormControl>
              </Grid>              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isActive}
                      onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                      name="isActive"
                    />
                  }
                  label="Aktif"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    İptal
                  </Button>                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </Box>
              </Grid>            </Grid>
          </form>
        </CardContent>
      </Card>
      )}
    </Box>
  );
};

export default StudentForm;
