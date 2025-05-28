import api, { handleApiResponse, handleApiError } from './api';
import { LoginCredentials, LoginResponse } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/student/login', credentials);
      return handleApiResponse<LoginResponse>(response);
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
    }
  }

  saveToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  hasValidToken(): boolean {
    const accessToken = this.getToken();
    return !!accessToken;
  }

  clearToken(): void {
    localStorage.removeItem('accessToken');
  }
}

const authService = new AuthService();
export default authService;