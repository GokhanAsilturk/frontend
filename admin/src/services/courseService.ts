import { apiClient } from './api';
import { 
  Course, 
  CreateCourseRequest, 
  UpdateCourseRequest,
  CourseFilters,
  PaginatedCoursesResponse,
  PaginationParams
} from '../types';

class CourseService {
  async getCourses(
    filters?: CourseFilters, 
    pagination?: PaginationParams
  ): Promise<PaginatedCoursesResponse> {
    const params = { ...filters, ...pagination };
    return apiClient.get<PaginatedCoursesResponse>('/courses', { params });
  }

  async getCourse(id: string): Promise<Course> {
    return apiClient.get<Course>(`/courses/${id}`);
  }

  async createCourse(data: CreateCourseRequest): Promise<Course> {
    return apiClient.post<Course>('/courses', data);
  }

  async updateCourse(id: string, data: UpdateCourseRequest): Promise<Course> {
    return apiClient.put<Course>(`/courses/${id}`, data);
  }

  async deleteCourse(id: string): Promise<void> {
    return apiClient.delete(`/courses/${id}`);
  }

  async toggleCourseStatus(id: string): Promise<Course> {
    return apiClient.patch<Course>(`/courses/${id}/toggle-status`);
  }

  async checkCourseCodeUniqueness(code: string, excludeId?: string): Promise<{ isUnique: boolean }> {
    const params = excludeId ? { excludeId } : {};
    return apiClient.get<{ isUnique: boolean }>(`/courses/check-code/${code}`, { params });
  }

  async bulkDeleteCourses(ids: string[]): Promise<void> {
    return apiClient.post('/courses/bulk-delete', { ids });
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
