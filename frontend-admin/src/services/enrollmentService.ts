import { apiClient } from './api';
import { 
  Enrollment,
  EnrollmentWithDetails,
  CreateEnrollmentRequest, 
  UpdateEnrollmentRequest,
  EnrollmentFilters,
  PaginatedEnrollmentsResponse,
  PaginationParams
} from '../types';

class EnrollmentService {
  async getEnrollments(
    filters?: EnrollmentFilters, 
    pagination?: PaginationParams
  ): Promise<PaginatedEnrollmentsResponse> {
    const params = { ...filters, ...pagination };
    return apiClient.get<PaginatedEnrollmentsResponse>('/enrollments', { params });
  }

  async getEnrollmentsWithDetails(
    filters?: EnrollmentFilters, 
    pagination?: PaginationParams
  ): Promise<{ enrollments: EnrollmentWithDetails[]; total: number; page: number; limit: number; totalPages: number }> {
    const params = { ...filters, ...pagination, includeDetails: true };
    return apiClient.get('/enrollments', { params });
  }

  async getEnrollment(id: string): Promise<Enrollment> {
    return apiClient.get<Enrollment>(`/enrollments/${id}`);
  }

  async createEnrollment(data: CreateEnrollmentRequest): Promise<Enrollment> {
    return apiClient.post<Enrollment>('/enrollments', data);
  }

  async updateEnrollment(id: string, data: UpdateEnrollmentRequest): Promise<Enrollment> {
    return apiClient.put<Enrollment>(`/enrollments/${id}`, data);
  }

  async deleteEnrollment(id: string): Promise<void> {
    return apiClient.delete(`/enrollments/${id}`);
  }

  async bulkCreateEnrollments(enrollments: CreateEnrollmentRequest[]): Promise<{ success: number; errors: any[] }> {
    return apiClient.post('/enrollments/bulk-create', { enrollments });
  }

  async bulkDeleteEnrollments(ids: string[]): Promise<void> {
    return apiClient.post('/enrollments/bulk-delete', { ids });
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    return apiClient.get<Enrollment[]>(`/enrollments/student/${studentId}`);
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    return apiClient.get<Enrollment[]>(`/enrollments/course/${courseId}`);
  }

  async checkEnrollmentConflict(studentId: string, courseId: string): Promise<{ hasConflict: boolean; message?: string }> {
    return apiClient.get(`/enrollments/check-conflict`, {
      params: { studentId, courseId }
    });
  }

  async exportEnrollments(filters?: EnrollmentFilters): Promise<Blob> {
    const params = { ...filters, format: 'csv' };
    const response = await apiClient.get('/enrollments/export', { 
      params,
      responseType: 'blob'
    });
    return response as unknown as Blob;
  }
}

export const enrollmentService = new EnrollmentService();
