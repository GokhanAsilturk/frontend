import { Student } from './student';
import { Course } from './course';

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  grade?: number;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  course?: Course;
}

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  PENDING = 'pending'
}

export interface CreateEnrollmentRequest {
  studentId: string;
  courseId: string;
}

export interface UpdateEnrollmentRequest {
  grade?: number;
  status?: EnrollmentStatus;
}

export interface EnrollmentFilters {
  studentId?: string;
  courseId?: string;
  status?: EnrollmentStatus;
  enrollmentDateFrom?: string;
  enrollmentDateTo?: string;
}

// Detaylı kayıt tipi ekliyoruz
export interface EnrollmentWithDetails extends Enrollment {
  studentName?: string;
  studentEmail?: string;
  courseName?: string;
  courseCode?: string;
}

