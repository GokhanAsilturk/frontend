import { apiClient } from './api';
import { 
  Course, 
  CreateCourseRequest, 
  UpdateCourseRequest,
  CourseFilters,
  PaginationParams,
  ApiResponse,
  ApiPaginatedResponse
} from '../types';

class CourseService {
  async getCourses(
    filters?: CourseFilters, 
    pagination?: PaginationParams
  ): Promise<ApiPaginatedResponse<Course>> {
    const params = { ...filters, ...pagination };
    return apiClient.get<ApiPaginatedResponse<Course>>('/courses', { params });
  }

  async getCourse(id: string): Promise<ApiResponse<Course>> {
    return apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
  }

  async createCourse(data: CreateCourseRequest): Promise<ApiResponse<Course>> {
    return apiClient.post<ApiResponse<Course>>('/courses', data);
  }

  async updateCourse(id: string, data: UpdateCourseRequest): Promise<ApiResponse<Course>> {
    return apiClient.put<ApiResponse<Course>>(`/courses/${id}`, data);
  }

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  }

  async toggleCourseStatus(id: string): Promise<ApiResponse<Course>> {
    return apiClient.patch<ApiResponse<Course>>(`/courses/${id}/toggle-status`);
  }

  async checkCourseCodeUniqueness(code: string, excludeId?: string): Promise<ApiResponse<{ isUnique: boolean }>> {
    const params = excludeId ? { excludeId } : {};
    return apiClient.get<ApiResponse<{ isUnique: boolean }>>(`/courses/check-code/${code}`, { params });
  }

  async bulkDeleteCourses(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/courses/bulk-delete', { ids });
  }

  async exportCourses(filters?: CourseFilters): Promise<Blob> {
    const params = { ...filters, format: 'csv' };
    const response = await apiClient.get('/courses/export', { 
      params,
      responseType: 'blob'
    });
    return response as unknown as Blob;
  }
}

export const courseService = new CourseService();
