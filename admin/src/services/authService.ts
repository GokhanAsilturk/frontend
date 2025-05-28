import { apiClient } from './api';
import { 
  LoginCredentials, 
  LoginResponse, 
  User, 
  RefreshTokenResponse 
} from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/admin/login', credentials);
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
  }  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh-token', { refreshToken });
  }async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean, message: string, data: User }>('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    return apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }
}

export const authService = new AuthService();
