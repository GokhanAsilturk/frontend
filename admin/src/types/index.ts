export * from './auth';
export * from './student';
export * from './course';
export * from './enrollment';
export type { ApiResponse , ApiPaginatedResponse } from './api';
export * from './errorLog';
export * from './admin';

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
