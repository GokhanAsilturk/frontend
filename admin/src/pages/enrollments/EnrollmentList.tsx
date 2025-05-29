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
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataTable, DataTableColumn } from '../../components/common/DataTable';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useNotification, useConfirmDialog } from '../../hooks';
import { enrollmentService, studentService, courseService } from '../../services';
import { EnrollmentWithDetails, EnrollmentStatus, EnrollmentFilters, Student, Course } from '../../types';
import { formatDate, getErrorMessage } from '../../utils';
import { ROUTES } from '../../utils/constants';

const ActionsCell: React.FC<{
  enrollment: EnrollmentWithDetails;
  onView: (enrollment: EnrollmentWithDetails) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ enrollment, onView, onEdit, onDelete }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    <Tooltip title="Görüntüle">
      <IconButton size="small" onClick={() => onView(enrollment)}>
        <ViewIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Düzenle">
      <IconButton size="small" onClick={() => onEdit(enrollment.id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Sil">
      <IconButton
        size="small"
        onClick={() => {
          console.log("Sil butonuna tıklandı, ID:", enrollment.id);
          onDelete(enrollment.id);
        }}
        color="error"
      >
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  </Box>
);

export const EnrollmentList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { 
    confirmDelete, 
    dialogState, 
    handleConfirm, 
    handleCancel 
  } = useConfirmDialog();
  
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EnrollmentFilters>({});
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithDetails | null>(null);

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPage(0); 
  };
  
  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getEnrollments(
        {
          ...filters,
          ...(searchTerm && { search: searchTerm })
        },
        {
          page: page + 1,
          limit: rowsPerPage
        }
      );
      
      if (response.success && Array.isArray(response.data)) {
        const enrichedData: EnrollmentWithDetails[] = await Promise.all(
          response.data.map(async enrollment => {
            let studentName = 'Bilinmeyen Öğrenci';
            let studentEmail = '';
            let courseName = enrollment.course?.name || 'Bilinmeyen Ders';
            let courseCode = enrollment.course?.code || '';
            
            if (enrollment.studentId) {
              try {
                const studentResponse = await studentService.getStudent(enrollment.studentId);
                if (studentResponse.success && studentResponse.data) {
                  const studentData = studentResponse.data;
                  if (studentData.user) {
                    studentName = `${studentData.user.firstName} ${studentData.user.lastName}`;
                    studentEmail = studentData.user.email;
                  }
                }
              } catch (error) {
                console.error(`Öğrenci bilgileri alınamadı (ID: ${enrollment.studentId})`, error);
              }
            }
            
            return {
              ...enrollment,
              studentName,
              studentEmail,
              courseName,
              courseCode
            };
          })
        );
        
        setEnrollments(enrichedData);
        setTotal(response.pagination.total);
      } else {
        console.error('Beklenmeyen API yanıtı:', response);
        setEnrollments([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Kayıt yükleme hatası:', error);
      showError('Kayıtlar yüklenirken bir hata oluştu');
      setEnrollments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, page, rowsPerPage, showError]);

  const fetchStudentsAndCourses = useCallback(async () => {
    try {      
      const [studentsResponse, coursesResponse] = await Promise.all([
        studentService.getStudents({ page: 1, limit: 1000 }),
        courseService.getCourses({}, { page: 1, limit: 1000 })
      ]);
      
      if (studentsResponse.success && Array.isArray(studentsResponse.data)) {
        setStudents(studentsResponse.data);
      } else {
        console.error('Öğrenci verilerinde hata:', studentsResponse);
        setStudents([]);
      }
      
      if (coursesResponse.success && Array.isArray(coursesResponse.data)) {
        setCourses(coursesResponse.data);
      } else {
        console.error('Ders verilerinde hata:', coursesResponse);
        setCourses([]);
      }
    } catch (error) {
      console.error('Öğrenci ve ders bilgileri yükleme hatası:', error);
      showError('Öğrenci ve ders bilgileri yüklenirken bir hata oluştu');
      setStudents([]);
      setCourses([]);
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
    console.log("handleDelete çağrıldı, ID:", id);
    confirmDelete(
      'Kayıt',
      async () => {
        try {
          console.log("Silme işlemi başlatılıyor:", id);
          
          await enrollmentService.deleteEnrollment(id);
          
          console.log("Silme işlemi tamamlandı");
          showSuccess('Kayıt başarıyla silindi');
          
          setTimeout(() => {
            fetchEnrollments();
          }, 500); // Backend'in işlemi tamamlaması için kısa bir gecikme ekleniyor
        } catch (error) {
          console.error("Silme işlemi sırasında hata:", error);
          showError(getErrorMessage(error));
        }
      }
    );
  };

  const handleViewDetail = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setDetailDialogOpen(true);
  };

  const renderActions = (row: EnrollmentWithDetails) => (
    <ActionsCell
      enrollment={row}
      onView={handleViewDetail}
      onEdit={(id) => {
        console.log("Düzenleme sayfasına yönlendiriliyor, ID:", id);
        navigate(`${ROUTES.ENROLLMENTS}/edit/${id}`);
      }}
      onDelete={handleDelete}
    />
  );

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
      console.error('Dışa aktarma hatası:', error);
      showError('Dışa aktarma sırasında bir hata oluştu');
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPage(0);
  };

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
      align: 'center',
      format: (_, row: EnrollmentWithDetails) => renderActions(row),
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
                  {Array.isArray(students) && students.length > 0 ? (
                    students.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.user.firstName} {student.user.lastName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Öğrenci verisi yükleniyor</MenuItem>
                  )}
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
                  {Array.isArray(courses) && courses.length > 0 ? (
                    courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Ders verisi yükleniyor</MenuItem>
                  )}
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
            rows={enrollments || []}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={total}
            onPageChange={(event: unknown, newPage: number) => setPage(newPage)}
            onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            onSearch={handleSearch}
            onRefresh={fetchEnrollments}
            searchPlaceholder="Kayıtlarda Ara..."
            searchValue={searchTerm}
          />
        </Box>
      </Card>

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
          )}        </DialogActions>
      </Dialog>

      <ConfirmDialog
        dialogState={dialogState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
};
