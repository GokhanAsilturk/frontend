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
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      studentNumber: '',
      status: 'active' as 'active' | 'inactive' | 'graduated' | 'suspended',
      isActive: true,
    },
    validationSchema: studentValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setSubmitError(null);

      try {        if (isEdit && id) {
          const updateData: UpdateStudentRequest = values;
          await studentService.updateStudent(id, updateData);
          showSuccess('Öğrenci başarıyla güncellendi');
        } else {
          const createData: CreateStudentRequest = values;
          await studentService.createStudent(createData);
          showSuccess('Öğrenci başarıyla eklendi');
        }
        navigate('/students');
      } catch (error: any) {
        setSubmitError(error.message ?? 'Bir hata oluştu');
        showError(
          isEdit ? 'Öğrenci güncellenirken hata oluştu' : 'Öğrenci eklenirken hata oluştu'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Edit modunda öğrenci verilerini yükle
  React.useEffect(() => {
    if (isEdit && id) {
      const loadStudent = async () => {
        try {
          const student = await studentService.getStudent(id);
          formik.setValues({            firstName: student.firstName ?? '',
            lastName: student.lastName ?? '',
            email: student.email ?? '',
            phone: student.phone ?? '',
            dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
            address: student.address ?? '',
            studentNumber: student.studentNumber ?? '',
            status: student.status ?? 'active',
            isActive: student.isActive,});        } catch (error) {
          console.error('Error loading student:', error);
          showError('Öğrenci verileri yüklenirken hata oluştu');
          navigate('/students');
        }
      };
      loadStudent();
    }
  }, [isEdit, id]);

  const handleBack = () => {
    navigate('/students');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
        </Typography>
      </Box>

      <Card elevation={3}>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <Grid container spacing={3}>
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
              </Grid>              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="studentNumber"
                  name="studentNumber"
                  label="Öğrenci Numarası *"
                  value={formik.values.studentNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.studentNumber && Boolean(formik.errors.studentNumber)}
                  helperText={formik.touched.studentNumber && formik.errors.studentNumber}
                  disabled={isEdit} // Can't change student number in edit mode
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
                  id="phone"
                  name="phone"
                  label="Telefon"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Doğum Tarihi"
                  type="date"
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                  helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>              <Grid item xs={12} md={6}>
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
              </Grid>

              <Grid item xs={12} md={6}>
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
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Adres"
                  multiline
                  rows={3}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
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
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentForm;
