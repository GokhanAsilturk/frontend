import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateCourseRequest, UpdateCourseRequest } from '../../types';
import { courseService } from '../../services';
import { useNotification } from '../../hooks';
import { getErrorMessage } from '../../utils';

const CourseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { showError, showSuccess } = useNotification();

  const getSubmitButtonText = () => {
    return isEdit ? 'Güncelle' : 'Kaydet';
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Ders adı zorunludur')
      .min(2, 'Ders adı en az 2 karakter olmalıdır'),
    code: Yup.string()
      .required('Ders kodu zorunludur')
      .min(2, 'Ders kodu en az 2 karakter olmalıdır')
      .max(10, 'Ders kodu en fazla 10 karakter olabilir'),
    description: Yup.string()
      .max(500, 'Açıklama en fazla 500 karakter olabilir'),
    credits: Yup.number()
      .required('Kredi sayısı zorunludur')
      .min(1, 'Kredi sayısı en az 1 olmalıdır')
      .max(10, 'Kredi sayısı en fazla 10 olabilir'),
    instructorName: Yup.string()
      .min(2, 'Öğretim görevlisi adı en az 2 karakter olmalıdır'),
    capacity: Yup.number()
      .required('Kapasite zorunludur')
      .min(1, 'Kapasite en az 1 olmalıdır')
      .max(200, 'Kapasite en fazla 200 olabilir'),
    startDate: Yup.date()
      .required('Başlangıç tarihi zorunludur')
      .min(new Date(), 'Başlangıç tarihi bugünden ileri olmalıdır'),
    endDate: Yup.date()
      .required('Bitiş tarihi zorunludur')
      .min(Yup.ref('startDate'), 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'),
  });

  const formik = useFormik<CreateCourseRequest & { isActive?: boolean }>({
    initialValues: {
      name: '',
      code: '',
      description: '',
      credits: 3,
      instructorName: '',
      capacity: 30,
      startDate: '',
      endDate: '',
      isActive: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setSubmitError(null);
        
        if (isEdit && id) {
          const updateData: UpdateCourseRequest = {
            name: values.name,
            code: values.code,
            description: values.description,
            credits: values.credits,
            instructorName: values.instructorName,
            capacity: values.capacity,
            startDate: values.startDate,
            endDate: values.endDate,
            isActive: values.isActive,
          };
            await courseService.updateCourse(id, updateData);
          showSuccess('Ders başarıyla güncellendi');
          
          setTimeout(() => {
            navigate('/courses');
          }, 1500);
        } else {
          const createData: CreateCourseRequest = {
            name: values.name,
            code: values.code,
            description: values.description,
            credits: values.credits,
            instructorName: values.instructorName,
            capacity: values.capacity,
            startDate: values.startDate,
            endDate: values.endDate,
          };
          
          await courseService.createCourse(createData);
          showSuccess('Ders başarıyla oluşturuldu');
          
          setTimeout(() => {
            navigate('/courses');
          }, 1500);
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setSubmitError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  const fetchCourse = async () => {
    if (!id) return;
    
    try {
      setInitialLoading(true);
      const course = (await courseService.getCourse(id)).data;
      
      formik.setValues({
        name: course.name,
        code: course.code,
        description: course.description ?? '',
        credits: course.credits,
        instructorName: course.instructorName ?? '',
        capacity: course.capacity,
        startDate: course.startDate ? course.startDate.split('T')[0] : '',
        endDate: course.endDate ? course.endDate.split('T')[0] : '',
        isActive: course.isActive,
      });
    } catch (error) {
      showError(getErrorMessage(error));
      navigate('/courses');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchCourse();
    }
  }, [isEdit, id]);

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Ders Düzenle' : 'Yeni Ders'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
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
                label="Ders Adı"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ders Kodu"
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                required
                disabled={isEdit} // Düzenleme modunda ders kodu değiştirilemez
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Öğretim Görevlisi"
                name="instructorName"
                value={formik.values.instructorName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.instructorName && Boolean(formik.errors.instructorName)}
                helperText={formik.touched.instructorName && formik.errors.instructorName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kredi"
                name="credits"
                type="number"
                value={formik.values.credits}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.credits && Boolean(formik.errors.credits)}
                helperText={formik.touched.credits && formik.errors.credits}
                required
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kapasite"
                name="capacity"
                type="number"
                value={formik.values.capacity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                helperText={formik.touched.capacity && formik.errors.capacity}
                required
                inputProps={{ min: 1, max: 200 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Başlangıç Tarihi"
                name="startDate"
                type="date"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bitiş Tarihi"
                name="endDate"
                type="date"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {isEdit && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    name="isActive"
                    value={formik.values.isActive}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.isActive && Boolean(formik.errors.isActive)}
                  >                    <MenuItem value="true">Aktif</MenuItem>
                    <MenuItem value="false">Pasif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                name="description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/courses')}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formik.isValid}
                >
                  {loading ? 'Kaydediliyor...' : getSubmitButtonText()}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CourseForm;
