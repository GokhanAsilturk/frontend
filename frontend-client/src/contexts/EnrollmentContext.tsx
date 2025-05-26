import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { EnrollmentContextType, Enrollment } from '../types';
import enrollmentService from '../services/enrollmentService';
import { useAuth } from './AuthContext';
import { useNotification } from './UIContext';

interface EnrollmentState {
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
}

type EnrollmentAction = 
  | { type: 'FETCH_REQUEST' }
  | { type: 'FETCH_SUCCESS'; payload: Enrollment[] }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'ENROLL_REQUEST' }
  | { type: 'ENROLL_SUCCESS'; payload: Enrollment }
  | { type: 'ENROLL_FAILURE'; payload: string }
  | { type: 'WITHDRAW_REQUEST' }
  | { type: 'WITHDRAW_SUCCESS'; payload: string }
  | { type: 'WITHDRAW_FAILURE'; payload: string };

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

const initialState: EnrollmentState = {
  enrollments: [],
  loading: false,
  error: null
};

const enrollmentReducer = (state: EnrollmentState, action: EnrollmentAction): EnrollmentState => {
  switch (action.type) {
    case 'FETCH_REQUEST':
    case 'ENROLL_REQUEST':
    case 'WITHDRAW_REQUEST':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, enrollments: action.payload };
    
    case 'ENROLL_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        enrollments: [...state.enrollments, action.payload] 
      };
    
    case 'WITHDRAW_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        enrollments: state.enrollments.filter(e => e.courseId !== action.payload) 
      };
    
    case 'FETCH_FAILURE':
    case 'ENROLL_FAILURE':
    case 'WITHDRAW_FAILURE':
      return { ...state, loading: false, error: action.payload };
    
    default:
      return state;
  }
};

interface EnrollmentProviderProps {
  children: ReactNode;
}

export const EnrollmentProvider: React.FC<EnrollmentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(enrollmentReducer, initialState);
  const { student } = useAuth();
  const { showNotification } = useNotification();

  const fetchEnrolledCourses = async () => {
    if (!student?.id) return;
    
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      const response = await enrollmentService.getStudentEnrollments(student.id);
      dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kayıtlar yüklenirken hata oluştu';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
    }
  };

  const enrollCourse = async (courseId: string) => {
    dispatch({ type: 'ENROLL_REQUEST' });
    try {
      const response = await enrollmentService.enrollCourse(courseId);
      dispatch({ type: 'ENROLL_SUCCESS', payload: response.data });
      
      if (showNotification) {
        showNotification('Derse başarıyla kayıt oldunuz', 'success');
      }
      
      await fetchEnrolledCourses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kayıt olurken hata oluştu';
      dispatch({ type: 'ENROLL_FAILURE', payload: errorMessage });
      
      if (showNotification) {
        showNotification(errorMessage, 'error');
      }
      
      throw error;
    }
  };

  const withdrawCourse = async (courseId: string) => {
    dispatch({ type: 'WITHDRAW_REQUEST' });
    try {
      await enrollmentService.withdrawCourse(courseId);
      dispatch({ type: 'WITHDRAW_SUCCESS', payload: courseId });
      
      if (showNotification) {
        showNotification('Ders kaydınız başarıyla silindi', 'success');
      }
      
      await fetchEnrolledCourses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kayıt silinirken hata oluştu';
      dispatch({ type: 'WITHDRAW_FAILURE', payload: errorMessage });
      
      if (showNotification) {
        showNotification(errorMessage, 'error');
      }
      
      throw error;
    }
  };

  useEffect(() => {
    if (student?.id) {
      fetchEnrolledCourses();
    }
  }, [student?.id]);  const isEnrolled = useCallback((courseId: string) => {
    return state.enrollments.some(enrollment => enrollment.courseId === courseId);
  }, [state.enrollments]);

  const value = useMemo(() => ({
    enrollments: state.enrollments,
    loading: state.loading,
    error: state.error,
    fetchEnrolledCourses,
    enrollCourse,
    withdrawCourse,
    isEnrolled
  }), [state.enrollments, state.loading, state.error, fetchEnrolledCourses, enrollCourse, withdrawCourse, isEnrolled]);

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollments = (): EnrollmentContextType => {
  const context = useContext(EnrollmentContext);
  if (context === undefined) {
    throw new Error('useEnrollments must be used within an EnrollmentProvider');
  }
  return context;
};
