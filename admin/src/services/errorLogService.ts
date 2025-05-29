import { apiClient } from './api';
import { ErrorLog, ApiPaginatedResponse } from '../types';

export const errorLogService = {
  /**
   * Hata loglarını getir
   */
  async getErrorLogs(page: number = 1, limit: number = 10): Promise<ApiPaginatedResponse<ErrorLog>> {
    return apiClient.get<ApiPaginatedResponse<ErrorLog>>('/api/errors', {
      params: { page, limit }
    });
  },
};
