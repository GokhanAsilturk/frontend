import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataTable, DataTableColumn } from '../../components/common/DataTable';
import { useNotification } from '../../hooks/useNotification';
import { enrollmentService } from '../../services/enrollmentService';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { 
  EnrollmentWithDetails, 
  EnrollmentStatus, 
  EnrollmentFilters,
  Student,
  Course 
} from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { ROUTES } from '../../utils/constants';

const columns: DataTableColumn<EnrollmentWithDetails>[] = [
  {
    id: 'studentName',
    label: 'Öğrenci',
    width: '20%',
    format: (value: string, row?: EnrollmentWithDetails) => (
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <PersonIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row?.studentEmail}
          </Typography>
        </Box>
      </Stack>
    )
  },
  {
    id: 'courseName',
    label: 'Ders',
    width: '20%',
    format: (value: string, row?: EnrollmentWithDetails) => (
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
          <SchoolIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row?.courseCode}
          </Typography>
        </Box>
      </Stack>
    )
  },
  {
    id: 'enrollmentDate',
    label: 'Kayıt Tarihi',
    width: '15%',
    format: (value: string) => formatDate(value)
  },
  {
    id: 'status',
    label: 'Durum',
    width: '12%',
    align: 'center',
    format: (value: EnrollmentStatus) => {
      const getStatusColor = (): 'success' | 'warning' | 'error' | 'info' => {
        switch (value) {
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

      const getStatusLabel = (): string => {
        switch (value) {
          case EnrollmentStatus.ENROLLED:
            return 'Kayıtlı';
          case EnrollmentStatus.COMPLETED:
            return 'Tamamlandı';
          case EnrollmentStatus.DROPPED:
            return 'Bırakıldı';
          case EnrollmentStatus.PENDING:
            return 'Beklemede';
          default:
            return value;
        }
      };

      return (
        <Chip
          label={getStatusLabel()}
          color={getStatusColor()}
          size="small"
          variant="filled"
        />
      );
    }
  },
  {
    id: 'grade',
    label: 'Not',
    width: '10%',
    align: 'center',
    format: (value?: number) => value ? (
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
        <GradeIcon fontSize="small" color="primary" />
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      </Stack>
    ) : (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    )
  },
  {
    id: 'actions',
    label: 'İşlemler',
    width: '13%',
    align: 'center'
  }
];

export const EnrollmentList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EnrollmentFilters>({});
  
  // Detail Dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithDetails | null>(null);

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPage(0); // Arama yapıldığında ilk sayfaya dön
  };

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getEnrollmentsWithDetails(
        {
          ...filters,
          ...(searchTerm && { search: searchTerm })
        },
        {
          page: page + 1,
          limit: rowsPerPage
        }
      );
      setEnrollments(response.enrollments);
      setTotal(response.total);
    } catch (error) {
      showError('Kayıtlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, page, rowsPerPage, showError]);

  const fetchStudentsAndCourses = useCallback(async () => {
    try {      const [studentsResponse, coursesResponse] = await Promise.all([
        studentService.getStudents({ page: 1, limit: 1000 }),
        courseService.getCourses({}, { page: 1, limit: 1000 })
      ]);
      setStudents(studentsResponse.students);
      setCourses(coursesResponse.courses);
    } catch (error) {
      showError('Öğrenci ve ders bilgileri yüklenirken bir hata oluştu');
    }
  }, [showError]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    fetchStudentsAndCourses();
  }, [fetchStudentsAndCourses]);

  const handleFilterChange = (field: keyof EnrollmentFilters) => 
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      setFilters(prev => ({
        ...prev,
        [field]: value || undefined
      }));
      setPage(0);
    };

  const handleDelete = async (id: string) => {
    try {
      await enrollmentService.deleteEnrollment(id);
      showSuccess('Kayıt başarıyla silindi');
      fetchEnrollments();
    } catch (error) {
      showError('Kayıt silinirken bir hata oluştu');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await enrollmentService.exportEnrollments(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kayitlar_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Kayıtlar başarıyla dışa aktarıldı');
    } catch (error) {
      showError('Dışa aktarma sırasında bir hata oluştu');
    }
  };

  const handleViewDetails = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setDetailDialogOpen(true);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPage(0);
  };

  const actions = [
    {
      label: 'Görüntüle',
      onClick: handleViewDetails,
      color: 'primary' as const
    },
    {
      label: 'Düzenle',
      onClick: (enrollment: EnrollmentWithDetails) => 
        navigate(`${ROUTES.ENROLLMENTS}/edit/${enrollment.id}`),
      color: 'secondary' as const
    },
    {
      label: 'Sil',
      onClick: handleDelete,
      color: 'error' as const,
      requireConfirm: true,
      confirmTitle: 'Kayıt Silme',
      confirmMessage: 'Bu kaydı silmek istediğinizden emin misiniz?'
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Kayıt Yönetimi
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Dışa Aktar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`${ROUTES.ENROLLMENTS}/add`)}
          >
            Yeni Kayıt
          </Button>
        </Box>
      </Box>

      <Card>
        <Box p={3}>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Öğrenci</InputLabel>
                <Select
                  value={filters.studentId ?? ''}
                  onChange={handleFilterChange('studentId')}
                  label="Öğrenci"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Ders</InputLabel>
                <Select
                  value={filters.courseId ?? ''}
                  onChange={handleFilterChange('courseId')}
                  label="Ders"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filters.status ?? ''}
                  onChange={handleFilterChange('status')}
                  label="Durum"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value={EnrollmentStatus.ENROLLED}>Kayıtlı</MenuItem>
                  <MenuItem value={EnrollmentStatus.COMPLETED}>Tamamlandı</MenuItem>
                  <MenuItem value={EnrollmentStatus.DROPPED}>Bırakıldı</MenuItem>
                  <MenuItem value={EnrollmentStatus.PENDING}>Beklemede</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={clearFilters}
                disabled={Object.keys(filters).length === 0 && !searchTerm}
              >
                Filtreleri Temizle
              </Button>
            </Grid>
          </Grid>

          <DataTable<EnrollmentWithDetails>
            columns={columns}
            rows={enrollments}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={total}
            onPageChange={(event: unknown, newPage: number) => setPage(newPage)}
            onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0); // Sayfa başına satır sayısı değiştiğinde ilk sayfaya dön
            }}
            onSearch={handleSearch}
            onRefresh={fetchEnrollments}
            searchPlaceholder="Kayıtlarda Ara..."
            searchValue={searchTerm}
          />
        </Box>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Kayıt Detayları</DialogTitle>
        <DialogContent>
          {selectedEnrollment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Öğrenci"
                  value={selectedEnrollment.studentName}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="E-posta"
                  value={selectedEnrollment.studentEmail}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Ders"
                  value={selectedEnrollment.courseName}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Ders Kodu"
                  value={selectedEnrollment.courseCode}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Kayıt Tarihi"
                  value={formatDate(selectedEnrollment.enrollmentDate)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Durum"
                  value={selectedEnrollment.status}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              {selectedEnrollment.grade && (
                <Grid item xs={6}>
                  <TextField
                    label="Not"
                    value={selectedEnrollment.grade}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Kapat
          </Button>
          {selectedEnrollment && (
            <Button
              variant="contained"
              onClick={() => {
                setDetailDialogOpen(false);
                navigate(`${ROUTES.ENROLLMENTS}/edit/${selectedEnrollment.id}`);
              }}
            >
              Düzenle
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
