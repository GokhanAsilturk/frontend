import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Stack,
  Avatar,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useNotification } from '../../hooks/useNotification';
import { enrollmentService } from '../../services/enrollmentService';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { 
  EnrollmentStatus, 
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
  Student,
  Course 
} from '../../types';
import { ROUTES } from '../../utils/constants';
import { formatDate } from '../../utils/dateUtils';

const validationSchema = Yup.object({
  studentId: Yup.string().required('Öğrenci seçimi zorunludur'),
  courseId: Yup.string().required('Ders seçimi zorunludur'),
  status: Yup.string().required('Durum seçimi zorunludur'),
  grade: Yup.number()
    .min(0, 'Not 0\'dan küçük olamaz')
    .max(100, 'Not 100\'den büyük olamaz')
    .nullable()
});

interface FormValues {
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  grade: number | '';
}

export const EnrollmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useNotification();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      studentId: '',
      courseId: '',
      status: EnrollmentStatus.PENDING,
      grade: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        
        const submitData = {
          ...values,
          grade: values.grade === '' ? undefined : Number(values.grade)
        };
        
        if (isEdit && id) {
          await enrollmentService.updateEnrollment(id, submitData as UpdateEnrollmentRequest);
          showSuccess('Kayıt başarıyla güncellendi');
          
          // Başarı mesajı görünsün diye kısa bir bekleme
          setTimeout(() => {
            navigate(ROUTES.ENROLLMENTS);
          }, 1500);
        } else {
          await enrollmentService.createEnrollment(submitData as CreateEnrollmentRequest);
          showSuccess('Kayıt başarıyla oluşturuldu');
          
          // Başarı mesajı görünsün diye kısa bir bekleme
          setTimeout(() => {
            navigate(ROUTES.ENROLLMENTS);
          }, 1500);
        }
      } catch (error: any) {
        const message = error?.response?.data?.message ?? 
          (isEdit ? 'Kayıt güncellenirken bir hata oluştu' : 'Kayıt oluşturulurken bir hata oluştu');
        showError(message);
      } finally {
        setLoading(false);
      }
    }
  });

  // Önce öğrenci ve kurs verilerini yükle
  useEffect(() => {
    const fetchStudentsAndCourses = async () => {
      try {
        setLoadingStudents(true);
        setLoadingCourses(true);
        
        const [studentsResponse, coursesResponse] = await Promise.all([
          studentService.getStudents({ page: 1, limit: 1000 }),
          courseService.getCourses({}, { page: 1, limit: 1000 })
        ]);
        
        if (studentsResponse.success && Array.isArray(studentsResponse.data)) {
          setStudents(studentsResponse.data);
          console.log('Öğrenciler yüklendi:', studentsResponse.data.length);
        } else {
          console.error('Öğrenci verilerinde hata:', studentsResponse);
          setStudents([]);
        }
        
        if (coursesResponse.success && Array.isArray(coursesResponse.data)) {
          setCourses(coursesResponse.data);
          console.log('Dersler yüklendi:', coursesResponse.data.length);
        } else {
          console.error('Ders verilerinde hata:', coursesResponse);
          setCourses([]);
        }
      } catch (error) {
        console.error('Öğrenci ve ders bilgileri yükleme hatası:', error);
        showError('Öğrenci ve ders bilgileri yüklenirken bir hata oluştu');
        setStudents([]);
        setCourses([]);
      } finally {
        setLoadingStudents(false);
        setLoadingCourses(false);
      }
    };

    fetchStudentsAndCourses();
  }, [showError]);

  // Sonra, eğer düzenleme modundaysa, kayıt verilerini yükle
  useEffect(() => {
    const fetchEnrollment = async () => {
      if (!isEdit || !id) {
        setInitialLoading(false);
        return;
      }
      
      try {
        const enrollment = (await enrollmentService.getEnrollment(id)).data;
        console.log('Yüklenen kayıt:', enrollment);
        setEnrollmentData(enrollment);
      } catch (error: any) {
        console.error('Kayıt yükleme hatası:', error);
        showError('Kayıt bilgileri yüklenirken bir hata oluştu');
        navigate(ROUTES.ENROLLMENTS);
      }
    };

    fetchEnrollment();
  }, [isEdit, id, navigate, showError]);

  // Öğrenci ve kurs verilerinin yüklenmesi tamamlandığında, form değerlerini ayarla
  useEffect(() => {
    if (isEdit && enrollmentData && !loadingStudents && !loadingCourses) {
      console.log('Form değerleri ayarlanıyor...', {
        studentId: enrollmentData.studentId,
        courseId: enrollmentData.courseId,
        studentsLength: students.length,
        coursesLength: courses.length
      });
      
      // Öğrenci ID'sinin öğrenci listesinde olup olmadığını kontrol et
      const studentExists = students.some(s => s.id === enrollmentData.studentId);
      if (!studentExists) {
        console.warn(`Öğrenci ID'si (${enrollmentData.studentId}) öğrenci listesinde bulunamadı!`);
      }
      
      // Kurs ID'sinin kurs listesinde olup olmadığını kontrol et
      const courseExists = courses.some(c => c.id === enrollmentData.courseId);
      if (!courseExists) {
        console.warn(`Kurs ID'si (${enrollmentData.courseId}) kurs listesinde bulunamadı!`);
      }
      
      formik.setValues({
        studentId: enrollmentData.studentId,
        courseId: enrollmentData.courseId,
        status: enrollmentData.status ?? EnrollmentStatus.PENDING,
        grade: enrollmentData.grade ?? ''
      });
      
      setInitialLoading(false);
    } else if (!isEdit && !loadingStudents && !loadingCourses) {
      setInitialLoading(false);
    }
  }, [enrollmentData, loadingStudents, loadingCourses, isEdit, students, courses]);

  // Update selected student when studentId changes
  useEffect(() => {
    const student = students.find(s => s.id === formik.values.studentId);
    setSelectedStudent(student || null);
  }, [formik.values.studentId, students]);

  // Update selected course when courseId changes
  useEffect(() => {
    const course = courses.find(c => c.id === formik.values.courseId);
    setSelectedCourse(course || null);
  }, [formik.values.courseId, courses]);

  // Check for enrollment conflicts
  useEffect(() => {
    const checkConflict = async () => {
      if (!formik.values.studentId || !formik.values.courseId || isEdit) {
        setConflictWarning('');
        return;
      }

      try {
        const result = await enrollmentService.checkEnrollmentConflict(
          formik.values.studentId,
          formik.values.courseId
        );
        
        if (result.data.hasConflict) {
          setConflictWarning(result.data.message ?? 'Bu öğrenci zaten bu derse kayıtlı');
        } else {
          setConflictWarning('');
        }
      } catch (error: any) {
        // Çakışma kontrolü hatalarını görmezden gel
        console.debug('Kayıt çakışması kontrolü hatası:', error);
      }
    };

    checkConflict();
  }, [formik.values.studentId, formik.values.courseId, isEdit]);

  const handleCancel = () => {
    navigate(ROUTES.ENROLLMENTS);
  };

  const getButtonLabel = () => {
    if (loading) {
      return 'Yükleniyor...';
    }
    return isEdit ? 'Güncelle' : 'Kaydet';
  };

  const getStatusLabel = (status: EnrollmentStatus): string => {
    switch (status) {
      case EnrollmentStatus.ENROLLED:
        return 'Kayıtlı';
      case EnrollmentStatus.COMPLETED:
        return 'Tamamlandı';
      case EnrollmentStatus.DROPPED:
        return 'Bırakıldı';
      case EnrollmentStatus.PENDING:
        return 'Beklemede';
      default:
        return status;
    }
  };

  const getStatusColor = (status: EnrollmentStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case EnrollmentStatus.ENROLLED:
        return 'info';
      case EnrollmentStatus.COMPLETED:
        return 'success';
      case EnrollmentStatus.DROPPED:
        return 'error';
      case EnrollmentStatus.PENDING:
        return 'warning';
      default:
        return 'info';
    }
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh" flexDirection="column" gap={2}>
        <CircularProgress />
        <Typography>Veriler yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {isEdit ? 'Kayıt Düzenle' : 'Yeni Kayıt'}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Kayıt Bilgileri
                </Typography>

                {conflictWarning && (
                  <Alert 
                    severity="warning" 
                    icon={<WarningIcon />}
                    sx={{ mb: 3 }}
                  >
                    {conflictWarning}
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      error={formik.touched.studentId && Boolean(formik.errors.studentId)}
                    >
                      <InputLabel>Öğrenci *</InputLabel>
                      <Select
                        name="studentId"
                        value={formik.values.studentId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Öğrenci *"
                        disabled={isEdit || loadingStudents}
                      >
                        {loadingStudents ? (
                          <MenuItem disabled>Öğrenciler yükleniyor...</MenuItem>
                        ) : students.length > 0 ? (
                          students.map((student) => (
                            <MenuItem key={student.id} value={student.id}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
                                  <PersonIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2">
                                    {student.user.firstName} {student.user.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {student.user.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>Öğrenci verisi bulunamadı</MenuItem>
                        )}
                      </Select>
                      {formik.touched.studentId && formik.errors.studentId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {formik.errors.studentId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      error={formik.touched.courseId && Boolean(formik.errors.courseId)}
                    >
                      <InputLabel>Ders *</InputLabel>
                      <Select
                        name="courseId"
                        value={formik.values.courseId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Ders *"
                        disabled={isEdit || loadingCourses}
                      >
                        {loadingCourses ? (
                          <MenuItem disabled>Dersler yükleniyor...</MenuItem>
                        ) : courses.length > 0 ? (
                          courses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 24, height: 24 }}>
                                  <SchoolIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2">
                                    {course.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {course.code} - {course.credits} Kredi
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>Ders verisi bulunamadı</MenuItem>
                        )}
                      </Select>
                      {formik.touched.courseId && formik.errors.courseId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {formik.errors.courseId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      error={formik.touched.status && Boolean(formik.errors.status)}
                    >
                      <InputLabel>Durum *</InputLabel>
                      <Select
                        name="status"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Durum *"
                      >
                        {EnrollmentStatus && Object.values(EnrollmentStatus).map((status) => (
                          <MenuItem key={status} value={status}>
                            <Chip
                              label={getStatusLabel(status)}
                              color={getStatusColor(status)}
                              size="small"
                              variant="outlined"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.status && formik.errors.status && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {formik.errors.status}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Not"
                      name="grade"
                      type="number"
                      value={formik.values.grade}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.grade && Boolean(formik.errors.grade)}
                      helperText={formik.touched.grade && formik.errors.grade}
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Selected Student Info */}
              {selectedStudent && (
                <Card>
                  <Box p={3}>
                    <Typography variant="h6" gutterBottom>
                      Seçilen Öğrenci
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {selectedStudent.user.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Öğrenci No: {'99'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Durum: {"Aktif"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>
                </Card>
              )}

              {/* Selected Course Info */}
              {selectedCourse && (
                <Card>
                  <Box p={3}>
                    <Typography variant="h6" gutterBottom>
                      Seçilen Ders
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <SchoolIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {selectedCourse.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {selectedCourse.code}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Kredi: {selectedCourse.credits}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Durum: {selectedCourse.isActive ? 'Aktif' : 'Pasif'}
                          </Typography>
                          {selectedCourse.startDate ? (
                            <Typography variant="body2" color="text.secondary">
                              Başlangıç: {formatDate(selectedCourse.startDate)}
                            </Typography>
                          ) : null}
                        </Box>
                      </Stack>
                    </Paper>
                  </Box>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <Box p={3}>
                  <Stack spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      startIcon={loading ? undefined : <SaveIcon />}
                      disabled={loading || !formik.isValid || Boolean(conflictWarning)}
                    >
                      {getButtonLabel()}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      İptal
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
