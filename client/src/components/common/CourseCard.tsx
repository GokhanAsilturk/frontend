import React, { useState, useEffect } from 'react';
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
import { } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEnrollment } from '../../contexts/EnrollmentContext'; // useEnrollments -> useEnrollment
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
  // contextLoading ve contextError olarak yeniden adlandırıldı
  const { enrollments, loading: contextLoading, error: contextError, enrollCourse, withdrawCourse, isEnrolled: isEnrolledFromContext } = useEnrollment();

  const [cardLoading, setCardLoading] = useState(propLoading);
  const [cardError, setCardError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null as 'enroll' | 'withdraw' | null });

  // Prop olarak gelen isEnrolled durumunu kullan, yoksa context'ten hesapla
  const [isCurrentlyEnrolled, setIsCurrentlyEnrolled] = useState(() => 
    typeof propIsEnrolled === 'boolean' ? propIsEnrolled : isEnrolledFromContext(course.id)
  );
  
  useEffect(() => {
    // Context'ten gelen enrollments veya propIsEnrolled değiştiğinde isCurrentlyEnrolled durumunu güncelle
    if (typeof propIsEnrolled === 'boolean') {
      setIsCurrentlyEnrolled(propIsEnrolled);
    } else {
      setIsCurrentlyEnrolled(isEnrolledFromContext(course.id));
    }
  }, [propIsEnrolled, course.id, isEnrolledFromContext, enrollments]); // enrollments'ı bağımlılıklara ekledim, çünkü isEnrolledFromContext'in hesaplaması enrollments'a bağlı olabilir.

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course.id);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  const handleEnrollmentAction = async (action: 'enroll' | 'withdraw') => {
    setCardLoading(true);
    setCardError('');

    try {
      if (action === 'enroll') {
        if (onEnroll) {
          await onEnroll(course.id);
        } else {
          await enrollCourse(course.id);
        }
        setIsCurrentlyEnrolled(true); // Durumu güncelle
      } else {
        const withdrawFunction = onWithdraw || withdrawCourse;
        await withdrawFunction(course.id);
        setIsCurrentlyEnrolled(false); // Durumu güncelle
      }
      setConfirmDialog({ open: false, action: null });
    } catch (error: any) {
      setCardError(error.message ?? `${action === 'enroll' ? 'Kayıt' : 'Çıkış'} işlemi başarısız`);
    } finally {
      setCardLoading(false);
    }
  };

  const openConfirmDialog = (action: 'enroll' | 'withdraw') => {
    setConfirmDialog({ open: true, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, action: null });
    setCardError('');
  };

  const getEnrollmentButtonText = () => {
    if (cardLoading || contextLoading) return <CircularProgress size={20} />; // cardLoading ve contextLoading kontrolü
    return isCurrentlyEnrolled ? 'Kaydı Sil' : 'Kayıt Ol';
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
                label={isCurrentlyEnrolled ? 'Kayıtlı' : 'Kayıt Yok'}
                color={isCurrentlyEnrolled ? 'success' : 'default'}
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

         
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={handleViewDetails} fullWidth>
            Detayları Gör
          </Button>

          {showEnrollmentActions && (
            <Button
              variant={isCurrentlyEnrolled ? 'outlined' : 'contained'}
              color={isCurrentlyEnrolled ? 'error' : 'primary'}
              size="small"
              onClick={() => openConfirmDialog(isCurrentlyEnrolled ? 'withdraw' : 'enroll')}
              disabled={cardLoading || contextLoading} // cardLoading ve contextLoading kontrolü
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
          {(cardError || contextError) && ( // cardError ve contextError kontrolü
            <Alert severity="error" sx={{ mb: 2 }}>
              {cardError || contextError}
            </Alert>
          )}
          <Typography>
            {confirmDialog.action === 'enroll'
              ? `"${course.name}" dersine kayıt olmak istediğinizden emin misiniz?`
              : `"${course.name}" dersinden kaydınızı silmek istediğinizden emin misiniz?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} disabled={cardLoading || contextLoading}>
            İptal
          </Button>
          <Button
            onClick={() => confirmDialog.action && handleEnrollmentAction(confirmDialog.action)}
            color={confirmDialog.action === 'enroll' ? 'primary' : 'error'}
            variant="contained"
            disabled={cardLoading || contextLoading} // cardLoading ve contextLoading kontrolü
          >
            {(cardLoading || contextLoading) ? <CircularProgress size={20} /> : 'Onayla'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CourseCard;