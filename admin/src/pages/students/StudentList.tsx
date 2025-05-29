import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
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
  const [page, setPage] = useState(0); // Material-UI TablePagination 0-based indexing kullanır
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { showError, showSuccess } = useNotification();
  const { confirmDelete } = useConfirmDialog();  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudents({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      });
      
      // Backend yanıtı: { success: true, data: [...], pagination: {...} }
      if (response.success && response.data) {
        setStudents(response.data);
        setTotalCount(response.pagination.total);
      } else {
        setStudents([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Öğrenci verilerini çekerken hata:', error);
      showError(getErrorMessage(error));
      setStudents([]);
      setTotalCount(0);
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
          console.log("Silme işlemi başlatılıyor:", studentId);
          
          // Silme işlemini gerçekleştir ve tamamlanmasını bekle
          await studentService.deleteStudent(studentId);
          
          console.log("Silme işlemi tamamlandı");
          showSuccess('Öğrenci başarıyla silindi');
          
          // Başarılı silme işleminden sonra listeyi yenile
          setTimeout(() => {
            fetchStudents();
          }, 500); // Kısa bir gecikme ekleyerek backend'in işlemi tamamlamasını sağla
        } catch (error) {
          console.error("Silme işlemi sırasında hata:", error);
          showError(getErrorMessage(error));
        }
      }
    );
  };  const handleViewDetail = (student: Student) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
  };
  
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
      id: 'username',
      label: 'Kullanıcı Adı',
      minWidth: 120,
      format: (value: any, row: Student) => row.user.username,
    },
    {
      id: 'firstName',
      label: 'Ad',
      minWidth: 100,
      format: (value: any, row: Student) => row.user.firstName,
    },
    {
      id: 'lastName',
      label: 'Soyad',
      minWidth: 100,
      format: (value: any, row: Student) => row.user.lastName,
    },
    {
      id: 'email',
      label: 'E-posta',
      minWidth: 200,
      format: (value: any, row: Student) => row.user.email,
    },
    {
      id: 'birthDate',
      label: 'Doğum Tarihi',
      minWidth: 120,
      format: (value: any, row: Student) => formatDate(row.birthDate),
    },
    {
      id: 'createdAt',
      label: 'Kayıt Tarihi',
      minWidth: 120,
      format: (value: any, row: Student) => formatDate(row.createdAt),    },
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
        <DialogContent>          {selectedStudent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography><strong>Kullanıcı Adı:</strong> {selectedStudent.user.username}</Typography>
              <Typography><strong>Ad Soyad:</strong> {selectedStudent.user.firstName} {selectedStudent.user.lastName}</Typography>
              <Typography><strong>E-posta:</strong> {selectedStudent.user.email}</Typography>
              {selectedStudent.birthDate && (
                <Typography><strong>Doğum Tarihi:</strong> {new Date(selectedStudent.birthDate).toLocaleDateString('tr-TR')}</Typography>
              )}
              <Typography><strong>Kayıt Tarihi:</strong> {formatDate(selectedStudent.createdAt)}</Typography>
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
