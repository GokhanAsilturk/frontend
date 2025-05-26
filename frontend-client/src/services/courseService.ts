import api from './api';
import { ApiResponse, Course } from '../types';

interface CourseParams {
  page?: number;
  limit?: number;
  search?: string;
}

const courseService = {
  /**
   * Tüm dersleri getir
   */
  getAllCourses: (params: CourseParams = {}): Promise<ApiResponse<Course[]>> => {
    return api.get('/courses', { params });
  },

  /**
   * ID'ye göre ders getir
   */
  getCourseById: (id: string): Promise<ApiResponse<Course>> => {
    return api.get(`/courses/${id}`);
  },

  /**
   * Ders arama
   */
  searchCourses: (searchTerm: string, params: CourseParams = {}): Promise<ApiResponse<Course[]>> => {
    return api.get('/courses', { 
      params: { ...params, search: searchTerm } 
    });
  },
};

export default courseService;