import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Course } from '../../types';
import { courseService } from '../../services';
import { DataTable, DataTableColumn } from '../../components/common';
import { useNotification, useConfirmDialog } from '../../hooks';
import { formatDate, getErrorMessage } from '../../utils';

const getStatusColor = (isActive: boolean): 'success' | 'default' => {
  if (isActive) return 'success';
  return 'default';
};

const getStatusLabel = (isActive: boolean): string => {
  if (isActive) return 'Aktif';
  return 'Pasif';
};

const StatusChip: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <Chip
    label={getStatusLabel(isActive)}
    color={getStatusColor(isActive) as any}
    size="small"
  />
);

const ActionsCell: React.FC<{
  course: Course;
  onView: (course: Course) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ course, onView, onEdit, onDelete }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    <Tooltip title="Görüntüle">
      <IconButton size="small" onClick={() => onView(course)}>
        <ViewIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Düzenle">
      <IconButton size="small" onClick={() => onEdit(course.id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Sil">
      <IconButton
        size="small"
        onClick={() => onDelete(course.id)}
        color="error"
      >
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  </Box>
);

const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { showError, showSuccess } = useNotification();
  const { confirmDelete } = useConfirmDialog();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses({
        search: searchTerm,
      }, {
        page: page + 1,
        limit: rowsPerPage,
      });
      setCourses(response.data ?? []);
      setTotalCount(response.pagination.total ?? 0);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage, searchTerm]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleDelete = async (courseId: string) => {
    confirmDelete(
      'Ders', 
      async () => {
        try {
          await courseService.deleteCourse(courseId);
          showSuccess('Ders başarıyla silindi');
          fetchCourses();
        } catch (error) {
          showError(getErrorMessage(error));
        }
      }
    );
  };

  const handleViewDetail = (course: Course) => {
    setSelectedCourse(course);
    setDetailDialogOpen(true);
  };

  const renderStatusChip = (isActive: boolean) => <StatusChip isActive={isActive} />;
  
  const renderActions = (row: Course) => (
    <ActionsCell
      course={row}
      onView={handleViewDetail}
      onEdit={(id) => navigate(`/courses/edit/${id}`)}
      onDelete={handleDelete}
    />
  );

  const columns: DataTableColumn<Course>[] = [
    {
      id: 'code',
      label: 'Ders Kodu',
      minWidth: 120,
    },
    {
      id: 'name',
      label: 'Ders Adı',
      minWidth: 200,
    },
    {
      id: 'instructorName',
      label: 'Öğretim Görevlisi',
      minWidth: 150,
    },
    {
      id: 'credits',
      label: 'Kredi',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'capacity',
      label: 'Kapasite',
      minWidth: 100,
      align: 'center',
    },
    {
      id: 'enrolledCount',
      label: 'Kayıtlı',
      minWidth: 100,
      align: 'center',
    },
    {
      id: 'isActive',
      label: 'Durum',
      minWidth: 100,
      format: renderStatusChip,
    },
    {
      id: 'startDate',
      label: 'Başlangıç Tarihi',
      minWidth: 120,
      format: (value: string) => formatDate(value),
    },
    {
      id: 'actions',
      label: 'İşlemler',
      minWidth: 150,
      align: 'center',
      format: (_, row: Course) => renderActions(row),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ders Listesi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/courses/add')}
        >
          Yeni Ders
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={courses}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSearch={handleSearch}
        onRefresh={fetchCourses}
        searchPlaceholder="Ders ara (ders adı, kodu, öğretim görevlisi)..."
        searchValue={searchTerm}
      />

      {/* Course Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ders Detayları</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography><strong>Ders Kodu:</strong> {selectedCourse.code}</Typography>
              <Typography><strong>Ders Adı:</strong> {selectedCourse.name}</Typography>
              <Typography><strong>Açıklama:</strong> {selectedCourse.description ?? 'Açıklama yok'}</Typography>
              <Typography><strong>Öğretim Görevlisi:</strong> {selectedCourse.instructorName ?? 'Belirtilmemiş'}</Typography>
              <Typography><strong>Kredi:</strong> {selectedCourse.credits}</Typography>
              <Typography><strong>Kapasite:</strong> {selectedCourse.capacity}</Typography>
              <Typography><strong>Kayıtlı Öğrenci:</strong> {selectedCourse.enrolledCount}</Typography>
              <Typography><strong>Başlangıç Tarihi:</strong> {formatDate(selectedCourse.startDate)}</Typography>
              <Typography><strong>Bitiş Tarihi:</strong> {formatDate(selectedCourse.endDate)}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong>Durum:</strong>
                <StatusChip isActive={selectedCourse.isActive} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
          {selectedCourse && (
            <Button
              variant="contained"
              onClick={() => {
                setDetailDialogOpen(false);
                navigate(`/courses/edit/${selectedCourse.id}`);
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

export default CourseList;
