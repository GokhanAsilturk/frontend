export interface User {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student';
}

export interface Student {
  id: string;
  studentId: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User & { userId?: string };
  accessToken: string;
  refreshToken: string;
}

export interface UpdateStudentProfileRequest {
  firstName: string;
  lastName: string;
  birthDate: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

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

export interface EnrollmentContextType {
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
  fetchStudentEnrollments: (studentId: string) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  withdrawCourse: (courseId: string) => Promise<void>; 
  isEnrolled: (courseId: string) => boolean;
}