import { apiClient } from './api';
import { 
  Student, 
  CreateStudentRequest, 
  UpdateStudentRequest,
  StudentFilters,
  PaginationParams,
  ApiResponse,
  ApiPaginatedResponse
} from '../types';

class StudentService {  
  async getStudents(
    params?: StudentFilters & PaginationParams
  ): Promise<ApiPaginatedResponse<Student>> {
    return apiClient.get<ApiPaginatedResponse<Student>>('/students', { params });
  }

  async getStudent(id: string): Promise<ApiResponse<Student>> {
    return apiClient.get<ApiResponse<Student>>(`/students/${id}`);
  }

  async createStudent(data: CreateStudentRequest): Promise<ApiResponse<Student>> {
    return apiClient.post<ApiResponse<Student>>('/students', data);
  }

  async updateStudent(id: string, data: UpdateStudentRequest): Promise<ApiResponse<Student>> {
    return apiClient.put<ApiResponse<Student>>(`/students/${id}`, data);
  }

  async deleteStudent(id: string): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  }

  async toggleStudentStatus(id: string): Promise<ApiResponse<Student>> {
    return apiClient.patch<ApiResponse<Student>>(`/students/${id}/toggle-status`);
  }

  async bulkDeleteStudents(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/students/bulk-delete', { ids });
  }

  async exportStudents(filters?: StudentFilters): Promise<Blob> {
    const params = { ...filters, format: 'csv' };
    const response = await apiClient.get('/students/export', { 
      params,
      responseType: 'blob'
    });
    return new Blob([response as any], { type: 'text/csv' });
  }

  async importStudents(file: File): Promise<ApiResponse<{ success: number; errors: any[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<{ success: number; errors: any[] }>>('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const studentService = new StudentService();
