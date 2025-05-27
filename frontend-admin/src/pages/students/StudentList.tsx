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
import { Student } from '../../types';
import { studentService } from '../../services';
import { DataTable, DataTableColumn } from '../../components/common';
import { useNotification, useConfirmDialog } from '../../hooks';
import { formatDate, getErrorMessage } from '../../utils';

// Helper functions for rendering
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    case 'graduated':
      return 'primary';
    case 'suspended':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Pasif';
    case 'graduated':
      return 'Mezun';
    case 'suspended':
      return 'Askıda';
    default:
      return status;
  }
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => (
  <Chip
    label={getStatusLabel(status)}
    color={getStatusColor(status) as any}
    size="small"
  />
);

const ActionsCell: React.FC<{
  student: Student;
  onView: (student: Student) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ student, onView, onEdit, onDelete }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    <Tooltip title="Görüntüle">
      <IconButton size="small" onClick={() => onView(student)}>
        <ViewIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Düzenle">
      <IconButton size="small" onClick={() => onEdit(student.id)}>
        <EditIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Sil">
      <IconButton
        size="small"
        onClick={() => onDelete(student.id)}
        color="error"
      >
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  </Box>
);

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { showError, showSuccess } = useNotification();
  const { confirmDelete } = useConfirmDialog();
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudents({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      });
      setStudents(response.students ?? []);
      setTotalCount(response.total ?? 0);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
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
  const handleDelete = async (studentId: string) => {
    confirmDelete(
      'Öğrenci', 
      async () => {
        try {
          await studentService.deleteStudent(studentId);
          showSuccess('Öğrenci başarıyla silindi');
          fetchStudents();
        } catch (error) {
          showError(getErrorMessage(error));
        }
      }
    );
  };  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
  };

  const renderStatusChip = (status: string) => <StatusChip status={status} />;
  
  const renderActions = (row: Student) => (
    <ActionsCell
      student={row}
      onView={handleViewDetail}
      onEdit={(id) => navigate(`/students/edit/${id}`)}
      onDelete={handleDelete}
    />
  );

  const columns: DataTableColumn<Student>[] = [
    {
      id: 'studentNumber',
      label: 'Öğrenci No',
      minWidth: 120,
    },
    {
      id: 'firstName',
      label: 'Ad',
      minWidth: 100,
    },
    {
      id: 'lastName',
      label: 'Soyad',
      minWidth: 100,
    },
    {
      id: 'email',
      label: 'E-posta',
      minWidth: 200,
    },
    {
      id: 'phone',
      label: 'Telefon',
      minWidth: 130,
    },    {
      id: 'status',
      label: 'Durum',
      minWidth: 100,
      format: renderStatusChip,
    },
    {
      id: 'enrollmentDate',
      label: 'Kayıt Tarihi',
      minWidth: 120,
      format: (value: string) => formatDate(value),
    },
    {
      id: 'actions',
      label: 'İşlemler',
      minWidth: 150,
      align: 'center',
      format: (_, row: Student) => renderActions(row),
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
          Öğrenci Listesi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/students/add')}
        >
          Yeni Öğrenci
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={students}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSearch={handleSearch}
        onRefresh={fetchStudents}
        searchPlaceholder="Öğrenci ara (ad, soyad, e-posta, öğrenci no)..."
        searchValue={searchTerm}
      />

      {/* Student Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Öğrenci Detayları</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography><strong>Öğrenci No:</strong> {selectedStudent.studentNumber}</Typography>
              <Typography><strong>Ad Soyad:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</Typography>
              <Typography><strong>E-posta:</strong> {selectedStudent.email}</Typography>
              <Typography><strong>Telefon:</strong> {selectedStudent.phone}</Typography>              <Typography><strong>Adres:</strong> {selectedStudent.address}</Typography>
              {selectedStudent.dateOfBirth && (
                <Typography><strong>Doğum Tarihi:</strong> {new Date(selectedStudent.dateOfBirth).toLocaleDateString('tr-TR')}</Typography>
              )}
              <Typography><strong>Kayıt Tarihi:</strong> {formatDate(selectedStudent.enrollmentDate)}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <strong>Durum:</strong>
                <StatusChip status={selectedStudent.status} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
          {selectedStudent && (
            <Button
              variant="contained"
              onClick={() => {
                setDetailDialogOpen(false);
                navigate(`/students/edit/${selectedStudent.id}`);
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

export default StudentList;
