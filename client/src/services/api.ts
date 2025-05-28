import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '../types';

const baseURL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

// Axios instance oluştur
const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - her istekte token ekler
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hataları ve token yenileme
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${baseURL}/auth/refresh-token`, { 
          refreshToken 
        });
        
        // API yanıt formatı: { success, message, data: { accessToken } }
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Orijinal isteği yeniden gönder
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Yenileme başarısız olursa logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        
        // Error'u loglayıp yeniden fırlatıyoruz
        console.error('Token yenileme hatası:', refreshError);
        throw new Error('Token yenileme başarısız oldu');
      }
    }
    
    return Promise.reject(error);
  }
);

// API response wrapper
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message ?? 'API request failed');
  }
};

// Error handler
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const errorData = error.response.data as any;
    return errorData.message ?? errorData.error ?? 'Bir hata oluştu';
  } else if (error.request) {
    return 'Sunucuya bağlanılamadı';
  } else {
    return error.message ?? 'Bilinmeyen bir hata oluştu';
  }
};

export default api;