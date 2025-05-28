import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Chip,
  Paper,
  InputAdornment,
  Button,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useCourse } from '../contexts/CourseContext';
import { useEnrollment } from '../contexts/EnrollmentContext';
import { LoadingSpinner, ErrorMessage, CourseCard } from '../components/common';
import { Course } from '../types';

interface CoursesProps {
  readonly isEnrolledView?: boolean;
}

function Courses({ isEnrolledView = false }: CoursesProps) {
  const { state: { courses, loading, error }, fetchCourses } = useCourse();
  const { enrollments, enrollCourse, withdrawCourse } = useEnrollment();
  const navigate = useNavigate();
  
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [withdrawingCourseId, setWithdrawingCourseId] = useState<string | null>(null);
  
  const coursesPerPage = 9;

  useEffect(() => {
    let isComponentMounted = true;
    
    const loadData = async () => {
      try {
        if (isComponentMounted && courses.length === 0) {
          await fetchCourses();
        }
      } catch (error) {
        if (isComponentMounted) {
          console.error('Ders yükleme hatası:', error);
        }
      }
    };

    loadData();

    return () => {
      isComponentMounted = false;
    };
  }, [fetchCourses]);

  useEffect(() => {
    let filtered: Course[] = courses;

    if (searchTerm) {
      filtered = filtered.filter((course: Course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (isEnrolledView && Array.isArray(enrollments)) {
      filtered = filtered.filter(course => 
        enrollments.some(enrollment => {
          return enrollment.courseId === course.id || 
                (enrollment.course && enrollment.course.id === course.id);
        })
      );
      console.log('Filtrelenmiş kayıtlı dersler:', filtered);
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [courses, searchTerm, isEnrolledView, enrollments]);

  const enrolledCourseIds = Array.isArray(enrollments) ? 
    enrollments.map(e => e.courseId || e.course?.id).filter(Boolean) : [];
    
  console.log('Derslerim sayfası - Kayıt bilgileri:', {
    enrollments,
    enrolledCourseIds
  });

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      await enrollCourse(courseId);
      
      console.log(`${courseId} dersine başarıyla kaydolundu`);
    } catch (error) {
      console.error('Kayıt hatası:', error);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleWithdraw = async (courseId: string) => {
    try {
      setWithdrawingCourseId(courseId);
      await withdrawCourse(courseId);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      setWithdrawingCourseId(null);
    }
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
  };

  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  if (loading) {
    return <LoadingSpinner fullScreen message="Dersler yükleniyor..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Dersler Yüklenemedi"
        message={error}
        onRetry={fetchCourses}
        fullWidth
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEnrolledView ? 'Derslerim' : 'Tüm Dersler'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {filteredCourses.length} ders bulundu
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filtreler</Typography>
          <Button
            variant="text"
            size="small"
            onClick={clearFilters}
            sx={{ ml: 'auto' }}
          >
            Temizle
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ders Ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {searchTerm && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchTerm && (
              <Chip
                label={`Arama: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                size="small"
              />
            )}
          </Box>
        )}
      </Paper>

      {paginatedCourses.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {paginatedCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard
                  course={course}
                  onEnroll={handleEnroll}
                  onWithdraw={handleWithdraw}
                  onViewDetails={handleViewDetails}
                  isEnrolled={enrolledCourseIds.includes(course.id)}
                  loading={enrollingCourseId === course.id || withdrawingCourseId === course.id}
                  showEnrollmentActions={true}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {isEnrolledView 
              ? 'Kayıtlı Ders Bulunamadı' 
              : 'Ders Bulunamadı'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEnrolledView
              ? 'Henüz hiçbir derse kayıt olmadınız. Dersler sayfasından ders kaydı yapabilirsiniz.'
              : 'Arama kriterlerinize uygun ders bulunamadı. Filtreleri değiştirmeyi deneyin.'
            }
          </Typography>
          {isEnrolledView && (
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/courses')}
            >
              Tüm Dersleri Görüntüle
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default Courses;