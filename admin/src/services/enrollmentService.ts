import { apiClient } from './api';
import { 
  Enrollment,
  EnrollmentWithDetails,
  CreateEnrollmentRequest, 
  UpdateEnrollmentRequest,
  EnrollmentFilters,
  PaginationParams,
  ApiResponse,
  ApiPaginatedResponse
} from '@/types';

class EnrollmentService {
  async getEnrollments(
    filters?: EnrollmentFilters, 
    pagination?: PaginationParams
  ): Promise<ApiPaginatedResponse<Enrollment>> {
    const params = { ...filters, ...pagination };
    return apiClient.get<ApiPaginatedResponse<Enrollment>>('/enrollments', { params });
  }

  async getEnrollmentsWithDetails(
    filters?: EnrollmentFilters, 
    pagination?: PaginationParams
  ): Promise<ApiPaginatedResponse<EnrollmentWithDetails>> {
    const params = { ...filters, ...pagination, includeDetails: true };
    return apiClient.get<ApiPaginatedResponse<EnrollmentWithDetails>>('/enrollments', { params });
  }

  async getEnrollment(id: string): Promise<ApiResponse<Enrollment>> {
    return apiClient.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
  }

  async createEnrollment(data: CreateEnrollmentRequest): Promise<ApiResponse<Enrollment>> {
    return apiClient.post<ApiResponse<Enrollment>>('/enrollments', data);
  }

  async updateEnrollment(id: string, data: UpdateEnrollmentRequest): Promise<ApiResponse<Enrollment>> {
    return apiClient.put<ApiResponse<Enrollment>>(`/enrollments/${id}`, data);
  }

  async deleteEnrollment(id: string): Promise<void> {
    await apiClient.delete(`/enrollments/${id}`);
  }

  async bulkCreateEnrollments(enrollments: CreateEnrollmentRequest[]): Promise<ApiResponse<{ success: number; errors: any[] }>> {
    return apiClient.post<ApiResponse<{ success: number; errors: any[] }>>('/enrollments/bulk-create', { enrollments });
  }

  async bulkDeleteEnrollments(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/enrollments/bulk-delete', { ids });
  }

  async getStudentEnrollments(studentId: string): Promise<ApiResponse<Enrollment[]>> {
    return apiClient.get<ApiResponse<Enrollment[]>>(`/enrollments/students/${studentId}`);
  }

  async getCourseEnrollments(courseId: string): Promise<ApiResponse<Enrollment[]>> {
    return apiClient.get<ApiResponse<Enrollment[]>>(`/enrollments/courses/${courseId}`);
  }

  async checkEnrollmentConflict(studentId: string, courseId: string): Promise<ApiResponse<{ hasConflict: boolean; message?: string }>> {
    return apiClient.get<ApiResponse<{ hasConflict: boolean; message?: string }>>(`/enrollments/check-conflict`, {
      params: { studentId, courseId }
    });
  }

  async exportEnrollments(filters?: EnrollmentFilters): Promise<Blob> {
    const params = { ...filters, format: 'csv' };
    const response = await apiClient.get('/enrollments/export', { 
      params,
      responseType: 'blob'
    });
    return response as Blob;
  }
}

export const enrollmentService = new EnrollmentService();
