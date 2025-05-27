/**
 * Access token'ı localStorage'dan al
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Refresh token'ı localStorage'dan al
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Token'ları localStorage'a kaydet
 */
export const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Tüm token'ları localStorage'dan temizle
 */
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Token'ın süresi dolmuş mu kontrol et
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Date.now() / 1000;
  } catch (error) {
    console.error("Token çözümlenirken hata oluştu:", error);
    return true;
  }
};

/**
 * Token'dan kullanıcı bilgilerini çıkar
 */
export const getUserFromToken = (token: string): any => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error("Token'dan kullanıcı bilgileri çıkarılırken hata oluştu:", error);
    return null;
  }
  };