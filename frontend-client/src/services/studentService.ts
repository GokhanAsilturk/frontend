import api from './api';
import { ApiResponse, Student } from '../types';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}

const studentService = {
  /**
   * ID'ye göre öğrenci getir
   */
  getStudentById: (id: string): Promise<ApiResponse<Student>> => {
    return api.get(`/students/${id}`);
  },

  /**
   * Profil bilgilerini güncelle
   */
  updateProfile: (data: UpdateProfileData): Promise<ApiResponse<Student>> => {
    return api.put('/students/profile', data);
  },

  /**
   * Profil bilgilerini getir - user context'ten kullanılacak
   */
  getProfile: (): Promise<ApiResponse<Student>> => {
    return api.get('/students/profile');
  },
};

export default studentService;