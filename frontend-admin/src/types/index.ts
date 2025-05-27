// Auth Types
export interface User {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'admin';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  student: Student | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Student Types
export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
  User?: User;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  birthDate: string;
}

// Course Types
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

export interface CourseFormData {
  name: string;
  description: string;
  credits: number;
  instructor?: string;
  duration?: string;
}

// Enrollment Types
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  course?: Course;
}

// Admin Types
export interface Admin {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code?: string;
    details?: any;
  };
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

// UI Types
export interface UIContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  notification: NotificationState | null;
  clearNotification: () => void;
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  open: boolean;
}

// Table and Pagination Types
export interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface FilterParams {
  [key: string]: any;
}

// Form Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [field: string]: string;
}

// Permission Types
export type Permission = 
  | 'students:read' 
  | 'students:create' 
  | 'students:update' 
  | 'students:delete'
  | 'courses:read' 
  | 'courses:create' 
  | 'courses:update' 
  | 'courses:delete'
  | 'enrollments:read' 
  | 'enrollments:create' 
  | 'enrollments:delete'
  | 'admins:read' 
  | 'admins:create' 
  | 'admins:update' 
  | 'admins:delete';

export interface RolePermissions {
  admin: Permission[];
  student: Permission[];
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  activeCourses: number;
}

export interface RecentActivity {
  id: string;
  type: 'student_created' | 'course_created' | 'enrollment_created' | 'enrollment_deleted';
  description: string;
  createdAt: string;
  user?: string;
}
