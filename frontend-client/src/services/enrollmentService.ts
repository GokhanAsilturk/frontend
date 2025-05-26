import api from './api';
import { ApiResponse, Enrollment } from '../types';

const enrollmentService = {
  /**
   * Öğrencinin kayıtlı derslerini getir
   */
  getStudentEnrollments: (studentId: string): Promise<ApiResponse<Enrollment[]>> => {
    return api.get(`/enrollments/students/${studentId}`);
  },

  /**
   * Derse kayıt ol
   */
  enrollCourse: (courseId: string): Promise<ApiResponse<Enrollment>> => {
    return api.post(`/enrollments/student/courses/${courseId}/enroll`);
  },

  /**
   * Dersten çıkış yap
   */
  withdrawCourse: (courseId: string): Promise<ApiResponse<void>> => {
    return api.delete(`/enrollments/student/courses/${courseId}/withdraw`);
  },
};

export default enrollmentService;