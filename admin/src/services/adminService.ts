import { apiClient } from './api';
import { 
  Admin, 
  AdminCreateData, 
  AdminUpdateData,
  ApiResponse,
  ApiPaginatedResponse
} from '../types';

class AdminService {
  async getAdmins(): Promise<ApiPaginatedResponse<Admin>> {
    return apiClient.get<ApiPaginatedResponse<Admin>>('/admins');
  }

  async getAdmin(id: string): Promise<ApiResponse<Admin>> {
    return apiClient.get<ApiResponse<Admin>>(`/admins/${id}`);
  }

  async createAdmin(data: AdminCreateData): Promise<ApiResponse<Admin>> {
    return apiClient.post<ApiResponse<Admin>>('/admins', data);
  }

  async updateAdmin(id: string, data: AdminUpdateData): Promise<ApiResponse<Admin>> {
    return apiClient.put<ApiResponse<Admin>>(`/admins/${id}`, data);
  }

  async deleteAdmin(id: string): Promise<void> {
    await apiClient.delete(`/admins/${id}`);
  }
}

export const adminService = new AdminService();
