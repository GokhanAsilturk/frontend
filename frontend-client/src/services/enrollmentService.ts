import api from './api';
import { ApiResponse, Enrollment } from '../types';
import { AxiosResponse } from 'axios';

// API oturumunu başlat
const enrollmentService = {
  /**
   * Öğrencinin kayıtlı derslerini getir
   * API endpoint: GET /api/enrollments/students/{id}
   */
  getStudentEnrollments: async (studentId: string): Promise<ApiResponse<Enrollment[]>> => {
    console.log(`getStudentEnrollments çağrılıyor, studentId: ${studentId}`);
    
    if (!studentId) {
      console.error('getStudentEnrollments - studentId boş veya tanımsız!');
      return { success: false, data: [], message: 'Invalid student ID' };
    }
    
    try {
      // API dokümantasyonuna göre doğru endpoint: /api/enrollments/students/{id}
      // baseURL ayarlandığından /api/ öneki kaldırılmalı
      console.log(`Endpoint çağrılıyor: /enrollments/students/${studentId}`);
      
      // Konsola tüm URL'yi de yazdıralım
      const fullUrl = `${api.defaults.baseURL}/enrollments/students/${studentId}`;
      console.log(`Tam URL: ${fullUrl}`);
      
      const response: AxiosResponse<ApiResponse<Enrollment[]>> = await api.get(`/enrollments/students/${studentId}`);
      console.log('enrollmentService - getStudentEnrollments - API Raw Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('getStudentEnrollments - API Hatası:', error);
      console.error('Hata detayları:', error.response?.data);
      console.error('Hata durumu:', error.response?.status);
      
      // Hata durumunda API'nin döndüğü yanıtı kontrol et
      if (error.response?.data) { // Optional chaining kullanıldı
        return error.response.data as ApiResponse<Enrollment[]>; 
      }
      
      // Genel bir hata mesajı döndür
      return { success: false, data: [], message: error.message ?? 'Failed to fetch enrollments' }; // Nullish coalescing kullanıldı
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