import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';
import courseService from '../services/courseService';
import { Course, ApiResponse } from '../types';

// Course state interface
interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Course action types
type CourseAction =
  | { type: 'FETCH_COURSES_REQUEST' }
  | { type: 'FETCH_COURSES_SUCCESS'; payload: { courses: Course[]; total: number } }
  | { type: 'FETCH_COURSES_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_COURSE'; payload: Course }
  | { type: 'CLEAR_CURRENT_COURSE' }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
  searchTerm: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Course reducer
const courseReducer = (state: CourseState, action: CourseAction): CourseState => {
  switch (action.type) {
    case 'FETCH_COURSES_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_COURSES_SUCCESS':
      return {
        ...state,
        loading: false,
        courses: action.payload.courses,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
        },
      };
    case 'FETCH_COURSES_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_CURRENT_COURSE':
      return {
        ...state,
        currentCourse: action.payload,
      };
    case 'CLEAR_CURRENT_COURSE':
      return {
        ...state,
        currentCourse: null,
      };
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        pagination: {
          ...state.pagination,
          page: 1, // Reset to first page when searching
        },
      };
    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: action.payload,
        },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Course context interface
interface CourseContextType {
  state: CourseState;
  fetchCourses: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  getCourseById: (id: string) => Promise<void>;
  searchCourses: (term: string) => void;
  setPage: (page: number) => void;
  clearCurrentCourse: () => void;
  clearError: () => void;
}

// Create context
const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Helper function to extract courses from API response
const extractCoursesData = (responseData: unknown): { courses: Course[]; total: number } => {
  let courses: Course[] = [];
  let total = 0;

  // Check if response has success and data properties
  if (typeof responseData === 'object' && responseData !== null) {
    const response = responseData as Record<string, unknown>;
      if (response.hasOwnProperty('success') && response.hasOwnProperty('data')) {
      const apiResponse = response as unknown as ApiResponse<Course[]>;
      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        courses = apiResponse.data;
        total = courses.length;
      }
    } else if (Array.isArray(responseData)) {
      courses = responseData;
      total = courses.length;
    } else if (response.hasOwnProperty('content') && Array.isArray(response.content)) {
      courses = response.content as Course[];
      total = typeof response.totalElements === 'number' ? response.totalElements : courses.length;
    }
  }

  return { courses, total };
};

// Helper function to extract single course from API response
const extractCourseData = (responseData: unknown): Course | null => {
  if (typeof responseData === 'object' && responseData !== null) {
    const response = responseData as Record<string, unknown>;
      if (response.hasOwnProperty('success') && response.hasOwnProperty('data')) {
      const apiResponse = response as unknown as ApiResponse<Course>;
      return apiResponse.success ? apiResponse.data : null;
    } else if (response.hasOwnProperty('id')) {
      return responseData as Course;
    }
  }
  
  return null;
};

// Course provider component
export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  // Fetch courses with simplified logic
  const fetchCourses = useCallback(async (params: { page?: number; limit?: number; search?: string } = {}) => {
    try {
      dispatch({ type: 'FETCH_COURSES_REQUEST' });
      
      const response = await courseService.getAllCourses({
        page: params.page ?? state.pagination.page,
        limit: params.limit ?? state.pagination.limit,
        search: params.search ?? state.searchTerm,
      });

      const { courses, total } = extractCoursesData(response.data);
      
      dispatch({
        type: 'FETCH_COURSES_SUCCESS',
        payload: { courses, total },
      });
    } catch (error) {
      console.error('Course data fetch error:', error);
      dispatch({
        type: 'FETCH_COURSES_FAILURE',
        payload: error instanceof Error ? error.message : 'Dersler yüklenirken hata oluştu',
      });
    }
  }, [state.pagination.page, state.pagination.limit, state.searchTerm]);  // Get course by ID
  const getCourseById = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'FETCH_COURSES_REQUEST' });
      
      const response = await courseService.getCourseById(id);
      let courseData: Course | null = null;
      
      if (response?.data) {
        if (typeof response.data === 'object' && response.data !== null) {
          const responseData = response.data as any;
          
          if (responseData.success === true && responseData.data) {
            courseData = responseData.data as Course;
          }
          else if (responseData.id) {
            courseData = responseData as Course;
          }
          else {
            courseData = extractCourseData(response.data);
          }
        }
      }
      
      if (courseData?.id) {
        dispatch({ type: 'SET_CURRENT_COURSE', payload: courseData });
        dispatch({ type: 'FETCH_COURSES_SUCCESS', payload: { courses: [], total: 0 } });
      } else {
        dispatch({ type: 'FETCH_COURSES_FAILURE', payload: 'Kurs bilgisi bulunamadı' });
      }
    } catch (error) {
      dispatch({
        type: 'FETCH_COURSES_FAILURE',
        payload: error instanceof Error ? error.message : 'Kurs bilgileri yüklenirken hata oluştu',
      });
    }
  }, []);

  // Search courses
  const searchCourses = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  // Clear current course
  const clearCurrentCourse = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_COURSE' });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);
  // Memoized context value
  const value = useMemo<CourseContextType>(() => ({
    state: {
      courses: state.courses,
      currentCourse: state.currentCourse,
      loading: state.loading,
      error: state.error,
      searchTerm: state.searchTerm,
      pagination: state.pagination,
    },
    fetchCourses,
    getCourseById,
    searchCourses,
    setPage,
    clearCurrentCourse,
    clearError,
  }), [state, fetchCourses, getCourseById, searchCourses, setPage, clearCurrentCourse, clearError]);

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

// Custom hook to use course context
export const useCourse = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

export default CourseContext;
