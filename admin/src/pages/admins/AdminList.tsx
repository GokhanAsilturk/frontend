import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services';
import { Admin } from '../../types';

const AdminList: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    admin: Admin | null;
  }>({ open: false, admin: null });
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdmins();
      setAdmins(response.data);
      setTotalPages(response.pagination.pages);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Admin listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteDialog.admin) return;

    try {
      await adminService.deleteAdmin(deleteDialog.admin.id);
      setDeleteDialog({ open: false, admin: null });
      await fetchAdmins();
    } catch (err: any) {
      setError(err.message ?? 'Admin silinemedi');
    }
  };

  const openDeleteDialog = (admin: Admin) => {
    setDeleteDialog({ open: true, admin });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, admin: null });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Admin Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admins/create')}
        >
          Yeni Admin Ekle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>Departman</TableCell>
              <TableCell>Unvan</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  {admin.user?.firstName} {admin.user?.lastName}
                </TableCell>
                <TableCell>{admin.user?.email}</TableCell>
                <TableCell>{admin.user?.username}</TableCell>
                <TableCell>{admin.department}</TableCell>
                <TableCell>{admin.title}</TableCell>
                <TableCell>
                  <Chip
                    label="Aktif"
                    color="success"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => navigate(`/admins/${admin.id}`)}
                    title="Görüntüle"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => navigate(`/admins/${admin.id}/edit`)}
                    title="Düzenle"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => openDeleteDialog(admin)}
                    color="error"
                    title="Sil"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >        <DialogTitle>Admin Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteDialog.admin?.user?.firstName} {deleteDialog.admin?.user?.lastName} adlı 
            admini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>İptal</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminList;
