import api from './api';
import { ApiResponse, Enrollment } from '../types';
import { AxiosResponse } from 'axios';

const enrollmentService = {
  /**
   * Öğrencinin kayıtlı derslerini getir
   * API endpoint: GET /api/enrollments/students/{id}
   */
  getStudentEnrollments: async (studentId: string): Promise<ApiResponse<Enrollment[]>> => {
    if (!studentId) {
      return { success: false, data: [], message: 'Invalid student ID' };
    }
    
    try {
      const response: AxiosResponse<ApiResponse<Enrollment[]>> = await api.get(`/enrollments/students/${studentId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data as ApiResponse<Enrollment[]>; 
      }
      return { success: false, data: [], message: error.message ?? 'Failed to fetch enrollments' };
    }
  },

  /**
   * Derse kayıt ol
   * API endpoint: POST /api/enrollments/student/courses/{courseId}/enroll
   */
  enrollCourse: async (courseId: string): Promise<ApiResponse<Enrollment>> => {
    const response: AxiosResponse<ApiResponse<Enrollment>> = await api.post(`/enrollments/student/courses/${courseId}/enroll`);
    return response.data;
  },

  /**
   * Dersten çıkış yap
   * API endpoint: DELETE /api/enrollments/student/courses/{courseId}/withdraw
   */
  withdrawCourse: async (courseId: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/enrollments/student/courses/${courseId}/withdraw`);
    return response.data;
  },
};

export default enrollmentService;