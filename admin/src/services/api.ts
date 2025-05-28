import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// ApiError türünü doğrudan burada tanımlıyoruz
interface ApiError {
  message: string;
  errors?: any;
  statusCode?: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');            if (refreshToken) {              const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                refreshToken,
              });

              // Backend dönüş değişkenlerini kontrol et (token/accessToken)
              const token = response.data.accessToken ?? response.data.token;
              const newRefreshToken = response.data.refreshToken ?? refreshToken;
              
              if (!token) {
                throw new Error('Token yenileme başarısız: Token alınamadı');
              }
              
              localStorage.setItem('accessToken', token);
              localStorage.setItem('refreshToken', newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }        // Handle API errors
        const apiError: ApiError = {
          message: this.getErrorMessage(error),
          errors: error.response?.data?.errors,
          statusCode: error.response?.status,
        };        return Promise.reject(apiError);
      }
    );
  }

  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Geçersiz istek. Lütfen bilgilerinizi kontrol ediniz.';
        case 401:
          return 'Yetkiniz bulunmamaktadır. Lütfen tekrar giriş yapınız.';
        case 403:
          return 'Bu işlemi gerçekleştirme yetkiniz bulunmamaktadır.';
        case 404:
          return 'Aradığınız kaynak bulunamadı.';
        case 422:
          return 'Gönderilen veriler geçersiz.';
        case 429:
          return 'Çok fazla istek gönderdiniz. Lütfen bekleyiniz.';
        case 500:
          return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.';
        default:
          return 'Bilinmeyen bir hata oluştu.';
      }
    }

    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol ediniz.';
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyiniz.';
    }

    return error.message ?? 'Bilinmeyen bir hata oluştu.';
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default ApiClient;
