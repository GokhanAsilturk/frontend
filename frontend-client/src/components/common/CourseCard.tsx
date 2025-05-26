import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { School, Person, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEnrollments } from '../../contexts/EnrollmentContext';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  showEnrollmentActions?: boolean;
  onEnroll?: (courseId: string) => Promise<void>;
  onWithdraw?: (courseId: string) => Promise<void>;
  onViewDetails?: (courseId: string) => void;
  isEnrolled?: boolean;
  loading?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  showEnrollmentActions = true,
  onEnroll,
  onWithdraw,
  onViewDetails,
  isEnrolled: propIsEnrolled,
  loading: propLoading = false
}) => {
  const navigate = useNavigate();
  const { enrollments, enrollCourse, withdrawCourse } = useEnrollments();
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: 'enroll' | 'withdraw' | null }>({
    open: false,
    action: null
  });
  const [error, setError] = useState('');

  // Use prop isEnrolled if provided, otherwise calculate from enrollments
  const isEnrolled = propIsEnrolled ?? enrollments.some(
    (enrollment) => enrollment.course?.id === course.id || enrollment.courseId === course.id
  );


  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course.id);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  const handleEnrollmentAction = async (action: 'enroll' | 'withdraw') => {
    setLoading(true);
    setError('');

    try {
      if (action === 'enroll') {
        if (onEnroll) {
          await onEnroll(course.id);
        } else {
          await enrollCourse(course.id);
        }      } else {
        // For withdraw action
        const withdrawFunction = onWithdraw || withdrawCourse;
        await withdrawFunction(course.id);
      }
      setConfirmDialog({ open: false, action: null });
    } catch (error: any) {
      setError(error.message ?? `${action === 'enroll' ? 'Kayıt' : 'Çıkış'} işlemi başarısız`);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmDialog = (action: 'enroll' | 'withdraw') => {
    setConfirmDialog({ open: true, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, action: null });
    setError('');
  };

  const getEnrollmentButtonText = () => {
    if (loading) return <CircularProgress size={20} />;
    return isEnrolled ? 'Kaydı Sil' : 'Kayıt Ol';
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {course.name}
            </Typography>
            {showEnrollmentActions && (
              <Chip
                label={isEnrolled ? 'Kayıtlı' : 'Kayıt Yok'}
                color={isEnrolled ? 'success' : 'default'}
                size="small"
              />
            )}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {course.description ?? 'Açıklama bulunmamaktadır.'}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {course.credits && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <School fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {course.credits} Kredi
                </Typography>
              </Box>
            )}

            {course.instructor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {course.instructor}
                </Typography>
              </Box>
            )}

            {course.duration && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {course.duration}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={handleViewDetails} fullWidth>
            Detayları Gör
          </Button>

          {showEnrollmentActions && (
            <Button
              variant={isEnrolled ? 'outlined' : 'contained'}
              color={isEnrolled ? 'error' : 'primary'}
              size="small"
              onClick={() => openConfirmDialog(isEnrolled ? 'withdraw' : 'enroll')}
              disabled={loading}
              fullWidth
            >
              {getEnrollmentButtonText()}
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>
          {confirmDialog.action === 'enroll' ? 'Derse Kayıt Ol' : 'Kayıt Silme Onayı'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            {confirmDialog.action === 'enroll'
              ? `"${course.name}" dersine kayıt olmak istediğinizden emin misiniz?`
              : `"${course.name}" dersinden kaydınızı silmek istediğinizden emin misiniz?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} disabled={loading}>
            İptal
          </Button>
          <Button
            onClick={() => confirmDialog.action && handleEnrollmentAction(confirmDialog.action)}
            color={confirmDialog.action === 'enroll' ? 'primary' : 'error'}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Onayla'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CourseCard;