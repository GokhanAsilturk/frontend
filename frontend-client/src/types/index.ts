/**
 * Backend API'sinden gelen User tipi
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
}

/**
 * Backend API'sinden gelen Student tipi
 */
export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend API'sinden gelen Course tipi
 */
export interface Course {
  id: string;
  name: string;
  description: string;
  credits?: number;
  instructor?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend API'sinden gelen Enrollment tipi
 */
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course?: Course;
  student?: Student;
  createdAt: string;
  updatedAt: string;
}

/**
 * API yanıt tipi - Backend'den gelen format
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Sayfalama yanıtı tipi - Backend'den gelen format
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Giriş isteği tipi
 */
export interface LoginRequest {
  username: string; // Backend email değil username kullanıyor
  password: string;
}

/**
 * Giriş yanıtı tipi - Backend'den gelen format
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Student profil güncelleme isteği tipi
 */
export interface UpdateStudentProfileRequest {
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD format
}

/**
 * Sayfalama parametreleri
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Hata tipi
 */
export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Loading state tipi
 */
export interface LoadingState {
  [key: string]: boolean;
}

/**
 * Form validation tipi
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Giriş bilgileri tipi
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Auth Context State tipi
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Auth Context tipi
 */
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  student: Student | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
}

/**
 * Course Context tipi
 */
export interface CourseContextType {
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
  fetchCourses: () => Promise<void>;
  getCourseById: (id: string) => Promise<void>;
  searchCourses: (term: string) => void;
  setPage: (page: number) => void;
  clearCurrentCourse: () => void;
  clearError: () => void;
}

/**
 * Enrollment Context tipi
 */
export interface EnrollmentContextType {
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
  fetchEnrolledCourses: () => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  withdrawCourse: (courseId: string) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
}