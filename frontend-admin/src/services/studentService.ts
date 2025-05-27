import { apiClient } from './api';
import { 
  Student, 
  CreateStudentRequest, 
  UpdateStudentRequest,
  StudentFilters,
  PaginatedStudentsResponse,
  PaginationParams
} from '../types';

class StudentService {  async getStudents(
    params?: StudentFilters & PaginationParams
  ): Promise<PaginatedStudentsResponse> {
    return apiClient.get<PaginatedStudentsResponse>('/students', { params });
  }

  async getStudent(id: string): Promise<Student> {
    return apiClient.get<Student>(`/students/${id}`);
  }

  async createStudent(data: CreateStudentRequest): Promise<Student> {
    return apiClient.post<Student>('/students', data);
  }

  async updateStudent(id: string, data: UpdateStudentRequest): Promise<Student> {
    return apiClient.put<Student>(`/students/${id}`, data);
  }

  async deleteStudent(id: string): Promise<void> {
    return apiClient.delete(`/students/${id}`);
  }

  async toggleStudentStatus(id: string): Promise<Student> {
    return apiClient.patch<Student>(`/students/${id}/toggle-status`);
  }

  async bulkDeleteStudents(ids: string[]): Promise<void> {
    return apiClient.post('/students/bulk-delete', { ids });
  }

  async exportStudents(filters?: StudentFilters): Promise<Blob> {
    const params = { ...filters, format: 'csv' };
    const response = await apiClient.get('/students/export', { 
      params,
      responseType: 'blob'
    });
    return response as unknown as Blob;
  }

  async importStudents(file: File): Promise<{ success: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const studentService = new StudentService();
