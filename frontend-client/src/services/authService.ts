import api, { handleApiResponse, handleApiError } from './api';
import { LoginCredentials, LoginResponse } from '../types';

class AuthService {
  // Öğrenci girişi
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/student/login', credentials);
      return handleApiResponse<LoginResponse>(response);
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Çıkış
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
    }
  }

  // Token'ı local storage'a kaydet
  saveToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
  }

  // Token'ı local storage'dan al
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Token varlığını kontrol et
  hasValidToken(): boolean {
    const accessToken = this.getToken();
    return !!accessToken;
  }

  // Token'ı temizle
  clearToken(): void {
    localStorage.removeItem('accessToken');
  }
}

const authService = new AuthService();
export default authService;