import { apiClient } from './api';
import { ErrorLogResponse } from '../types';

export const errorLogService = {
  /**
   * Hata loglarını getir
   */
  async getErrorLogs(page: number = 1, limit: number = 10): Promise<ErrorLogResponse> {
    const response = await apiClient.get('/api/errors', {
      params: { page, limit }
    });
    return response as ErrorLogResponse;
  },
};
