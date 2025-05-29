import { apiClient } from './api';
import { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  RefreshTokenResponse,
  ApiResponse
} from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/admin/login', credentials);
  }

  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/logout', { refreshToken });
  }  
  
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh-token', { refreshToken });
  }
  
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
  }  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  async updateUserProfile(profileData: { username?: string; email?: string }): Promise<ApiResponse<any>> {
    return apiClient.put<ApiResponse<any>>('/auth/update-profile', profileData);
  }
}

export const authService = new AuthService();
