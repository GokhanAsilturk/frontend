import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { ErrorLog } from '../../types';
import { errorLogService } from '../../services';
import { LoadingSpinner } from '../../components/common';
import { useNotification } from '../../hooks';
import { getErrorMessage } from '../../utils';

export const ErrorLogs: React.FC = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { showError } = useNotification(); // showError kullanıldı

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      const response = await errorLogService.getErrorLogs(page + 1, rowsPerPage);
      setErrorLogs(response.data);
      setTotalCount(response.pagination.total);
    } catch (error) {
      showError(getErrorMessage(error)); // showError kullanıldı
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorLogs();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetail = (errorLog: ErrorLog) => {
    setSelectedError(errorLog);
    setDetailDialogOpen(true);
  };

  const getErrorTypeColor = (errorType: string) => {
    switch (errorType) {
      case 'NOT_FOUND':
        return 'warning';
      case 'UNAUTHORIZED':
        return 'error';
      case 'FORBIDDEN':
        return 'error';
      case 'VALIDATION_ERROR':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hata Logları
      </Typography>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Kullanıcı ID</TableCell>
                <TableCell>Hata Tipi</TableCell>
                <TableCell>Hata Kodu</TableCell>
                <TableCell>İstek Yolu</TableCell>
                <TableCell>Metod</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorLogs.map((errorLog) => (
                <TableRow key={errorLog.id} hover>
                  <TableCell>
                    {new Date(errorLog.createdAt).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>{errorLog.userId}</TableCell>
                  <TableCell>
                    <Chip
                      label={errorLog.errorType}
                      color={getErrorTypeColor(errorLog.errorType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{errorLog.errorCode}</TableCell>
                  <TableCell>{errorLog.requestPath}</TableCell>
                  <TableCell>
                    <Chip
                      label={errorLog.requestMethod}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Detayları Görüntüle">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(errorLog)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : to} arası`
          }
        />
      </Paper>

      {/* Error Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorIcon color="error" />
            Hata Detayları
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedError && (
            <Box>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Genel Bilgiler</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Typography><strong>ID:</strong> {selectedError.id}</Typography>
                    <Typography><strong>Kullanıcı ID:</strong> {selectedError.userId}</Typography>
                    <Typography><strong>Hata Tipi:</strong> {selectedError.errorType}</Typography>
                    <Typography><strong>Hata Kodu:</strong> {selectedError.errorCode}</Typography>
                    <Typography><strong>Tarih:</strong> {new Date(selectedError.createdAt).toLocaleString('tr-TR')}</Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">İstek Bilgileri</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Typography><strong>İstek Yolu:</strong> {selectedError.requestPath}</Typography>
                    <Typography><strong>Metod:</strong> {selectedError.requestMethod}</Typography>
                    {selectedError.requestPayload && (
                      <Box>
                        <Typography><strong>İstek Verisi:</strong></Typography>
                        <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5', mt: 1 }}>
                          <Typography component="pre" variant="body2">
                            {JSON.stringify(selectedError.requestPayload, null, 2)}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Hata Mesajı</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: '#ffebee' }}>
                    <Typography>{selectedError.errorMessage}</Typography>
                  </Paper>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Stack Trace</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography component="pre" variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedError.stackTrace}
                    </Typography>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
