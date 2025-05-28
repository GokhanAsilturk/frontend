import React, { createContext, useReducer, useCallback, ReactNode, useContext, useMemo } from 'react';
import enrollmentService from '../services/enrollmentService';
import { Enrollment, ApiResponse, EnrollmentContextType, AuthContextType } from '../types';
import AuthContext from './AuthContext';

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
  | { type: 'WITHDRAW_SUCCESS'; payload: string } // payload is courseId (string)
  | { type: 'WITHDRAW_FAILURE'; payload: string };

const initialState: EnrollmentState = {
  enrollments: [],
  loading: false,
  error: null
};

const enrollmentReducer = (state: EnrollmentState, action: EnrollmentAction): EnrollmentState => {
  console.log('Enrollment Reducer - Action:', action);
  
  switch (action.type) {
    case 'FETCH_REQUEST':
    case 'ENROLL_REQUEST':
    case 'WITHDRAW_REQUEST':
      return { ...state, loading: true, error: null };
      
    case 'FETCH_SUCCESS':
      console.log('Enrollment Reducer - FETCH_SUCCESS Payload:', action.payload);
      return {
        ...state,
        loading: false,
        enrollments: action.payload
      };
      
    case 'ENROLL_SUCCESS': {
      console.log('Enrollment Reducer - ENROLL_SUCCESS Payload:', action.payload);
      return { 
        ...state, 
        loading: false, 
        enrollments: [...state.enrollments, action.payload] 
      };
    }
    
    case 'WITHDRAW_SUCCESS': {
      console.log('Enrollment Reducer - WITHDRAW_SUCCESS Payload (courseId):', action.payload);
      return {
        ...state,
        loading: false,
        enrollments: state.enrollments.filter(e => e.courseId !== action.payload)
      };
    }
    
    case 'FETCH_FAILURE':
    case 'ENROLL_FAILURE':
    case 'WITHDRAW_FAILURE':
      console.error('Enrollment Reducer - Failure Action:', action.type, 'Payload:', action.payload);
      return { ...state, loading: false, error: action.payload };
      
    default:
      return state;
  }
};

interface EnrollmentProviderProps {
  children: ReactNode;
}

// Helper function to parse enrollment array response
const parseEnrollmentArrayResponse = (apiResponse: ApiResponse<Enrollment[]> | Enrollment[]): Enrollment[] => {
  console.log("parseEnrollmentArrayResponse - Received:", apiResponse);
  
  // Check if it's already an array
  if (Array.isArray(apiResponse)) {
    console.log("parseEnrollmentArrayResponse - Is Array, returning directly:", apiResponse);
    return apiResponse;
  }
  
  // Handle ApiResponse structure
  if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
    console.log("parseEnrollmentArrayResponse - Is ApiResponse object, success:", apiResponse.success);
    
    if (apiResponse.success && apiResponse.data) {
      if (Array.isArray(apiResponse.data)) {
        console.log("parseEnrollmentArrayResponse - Valid data array:", apiResponse.data);
        return apiResponse.data;
      } else {
        console.error("parseEnrollmentArrayResponse - Data is not an array:", apiResponse.data);
        return [];
      }
    } else {
      console.error("parseEnrollmentArrayResponse - API response unsuccessful:", apiResponse.message || "Unknown error");
      return [];
    }
  }
  
  console.error("parseEnrollmentArrayResponse - Invalid API response structure:", apiResponse);
  return [];
};

// Helper function to parse single enrollment response
const parseEnrollmentResponse = (apiResponse: ApiResponse<Enrollment> | Enrollment): Enrollment | null => {
  console.log("parseEnrollmentResponse - Received:", apiResponse);
  
  // Check if it's already an Enrollment object
  if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse && 'courseId' in apiResponse) {
    console.log("parseEnrollmentResponse - Is Enrollment object, returning directly:", apiResponse);
    return apiResponse as Enrollment;
  }
  
  // Handle ApiResponse structure
  if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
    console.log("parseEnrollmentResponse - Is ApiResponse object, success:", apiResponse.success);
    
    if (apiResponse.success && apiResponse.data) {
      console.log("parseEnrollmentResponse - Valid data:", apiResponse.data);
      return apiResponse.data;
    } else {
      console.error("parseEnrollmentResponse - API response unsuccessful:", apiResponse.message || "Unknown error");
      return null;
    }
  }
  
  console.error("parseEnrollmentResponse - Invalid API response structure:", apiResponse);
  return null;
};

export const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export const EnrollmentProvider: React.FC<EnrollmentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(enrollmentReducer, initialState);
  const authContext = useContext(AuthContext) as AuthContextType;

  const fetchStudentEnrollments = useCallback(async (studentId: string) => {
    if (!studentId) {
      console.error('fetchStudentEnrollments: studentId parametresi boş!');
      dispatch({ type: 'FETCH_FAILURE', payload: 'Student ID is missing or invalid' });
      return;
    }
    
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      console.log(`EnrollmentContext: Öğrenci kayıtlarını getirmeye çalışıyor: ${studentId}`);
      const response = await enrollmentService.getStudentEnrollments(studentId);
      console.log('EnrollmentContext: API yanıtı:', response);
      
      if (!response || !response.success) {
        console.error('EnrollmentContext: API yanıtı başarısız:', response);
        throw new Error(response?.message || 'API request failed');
      }
      
      const enrollments = parseEnrollmentArrayResponse(response);
      console.log('EnrollmentContext: İşlenen enrollment verileri:', enrollments);
      
      dispatch({ type: 'FETCH_SUCCESS', payload: enrollments });
      console.log('EnrollmentContext: Kayıt bilgileri başarıyla alındı:', enrollments);
    } catch (err: any) {
      console.error('EnrollmentContext: Kayıt bilgilerini getirirken hata:', err);
      dispatch({ type: 'FETCH_FAILURE', payload: err.message ?? 'Failed to fetch enrollments' });
    }
  }, []);

  const enrollCourse = useCallback(async (courseId: string) => {
    dispatch({ type: 'ENROLL_REQUEST' });
    try {
      console.log(`EnrollmentContext: Derse kaydolmaya çalışıyor: ${courseId}`);
      const response = await enrollmentService.enrollCourse(courseId);
      console.log('EnrollmentContext: API yanıtı (derse kayıt):', response);
      
      const enrollment = parseEnrollmentResponse(response);
      if (enrollment) {
        console.log('EnrollmentContext: Derse kayıt başarılı:', enrollment);
        dispatch({ type: 'ENROLL_SUCCESS', payload: enrollment });
        
        if (authContext?.student?.id) { 
          console.log(`EnrollmentContext: Öğrenci kayıtlarını yeniden getiriyor (enroll sonrası): ${authContext.student.id}`);
          fetchStudentEnrollments(authContext.student.id);
        }
      } else {
        console.error('EnrollmentContext: Kayıt verisi işlenemedi');
        dispatch({ type: 'ENROLL_FAILURE', payload: 'Failed to process enrollment data' });
      }
    } catch (err: any) {
      console.error('EnrollmentContext: Derse kaydolurken hata:', err);
      dispatch({ type: 'ENROLL_FAILURE', payload: err.message ?? 'Failed to enroll in course' });
    }
  }, [authContext, fetchStudentEnrollments]);

  const withdrawCourse = useCallback(async (courseId: string) => {
    dispatch({ type: 'WITHDRAW_REQUEST' });
    try {
      console.log(`EnrollmentContext: Dersten çıkış yapılıyor: ${courseId}`);
      await enrollmentService.withdrawCourse(courseId);
      
      dispatch({ type: 'WITHDRAW_SUCCESS', payload: courseId });
      
      if (authContext?.student?.id) {
        console.log(`EnrollmentContext: Öğrenci kayıtlarını yeniden getiriyor (withdraw sonrası): ${authContext.student.id}`);
        fetchStudentEnrollments(authContext.student.id);
      }
    } catch (err: any) {
      console.error('EnrollmentContext: Dersten çıkış yaparken hata:', err);
      dispatch({ type: 'WITHDRAW_FAILURE', payload: err.message ?? 'Failed to withdraw from course' });
    }
  }, [authContext, fetchStudentEnrollments]);

  const isEnrolled = useCallback((courseId: string): boolean => {
    return state.enrollments.some(enrollment => 
      enrollment.courseId === courseId || 
      enrollment.course?.id === courseId
    );
  }, [state.enrollments]);

  const contextValue = useMemo(() => ({
    ...state,
    fetchStudentEnrollments,
    enrollCourse,
    withdrawCourse,
    isEnrolled
  }), [state, fetchStudentEnrollments, enrollCourse, withdrawCourse, isEnrolled]);

  return (
    <EnrollmentContext.Provider value={contextValue}>
      {children}
    </EnrollmentContext.Provider>
  );
};

// Custom hook to use the EnrollmentContext
export const useEnrollment = (): EnrollmentContextType => {
  const context = useContext(EnrollmentContext);
  if (context === undefined) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
};

export default EnrollmentContext;
