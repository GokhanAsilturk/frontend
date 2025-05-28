/**
 * Uygulama sabitleri
 */

// API Base URL
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL ?? 'https://your-production-api.com/api'
  : process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },
  STUDENTS: {
    BASE: '/students',
    PROFILE: '/students/profile'
  },
  COURSES: {
    BASE: '/courses',
    ENROLL: '/courses/:id/enroll',
    UNENROLL: '/courses/:id/unenroll'
  },
  ENROLLMENTS: {
    BASE: '/enrollments',
    MY_ENROLLMENTS: '/enrollments/my'
  }
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language'
} as const;

// Ders seviyeleri
export const COURSE_LEVELS = [
  'Başlangıç',
  'Orta',
  'İleri'
] as const;

// Kayıt durumları
export const ENROLLMENT_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  PENDING: 'pending'
} as const;

// Kayıt durumu etiketleri
export const ENROLLMENT_STATUS_LABELS = {
  [ENROLLMENT_STATUSES.ACTIVE]: 'Aktif',
  [ENROLLMENT_STATUSES.COMPLETED]: 'Tamamlandı',
  [ENROLLMENT_STATUSES.DROPPED]: 'Bırakıldı',
  [ENROLLMENT_STATUSES.PENDING]: 'Beklemede'
} as const;

// Sayfalama varsayılanları
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
} as const;

// Validasyon kuralları
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Geçerli bir e-posta adresi giriniz'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Şifre en az 6 karakter olmalıdır'
  },  PHONE: {
    PATTERN: /^[+]?[1-9]\d{0,15}$/,
    MESSAGE: 'Geçerli bir telefon numarası giriniz'
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'İsim 2-50 karakter arasında olmalıdır'
  }
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
  UNAUTHORIZED: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
  FORBIDDEN: 'Bu işlem için yetkiniz bulunmuyor.',
  NOT_FOUND: 'İstenen kaynak bulunamadı.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  VALIDATION_ERROR: 'Girilen bilgilerde hata var. Lütfen kontrol edin.',
  UNKNOWN_ERROR: 'Bilinmeyen bir hata oluştu.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Başarıyla giriş yaptınız.',
  LOGOUT_SUCCESS: 'Başarıyla çıkış yaptınız.',
  PROFILE_UPDATED: 'Profil bilgileriniz güncellendi.',
  PASSWORD_CHANGED: 'Şifreniz başarıyla değiştirildi.',
  ENROLLMENT_SUCCESS: 'Derse başarıyla kayıt oldunuz.',
  UNENROLLMENT_SUCCESS: 'Ders kaydınız iptal edildi.'
} as const;

// Navigation Menu Items
export const MENU_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    icon: 'dashboard'
  },
  {
    label: 'Dersler',
    path: '/courses',
    icon: 'school'
  },
  {
    label: 'Kayıtlarım',
    path: '/enrollments',
    icon: 'assignment'
  },
  {
    label: 'Ödevlerim',
    path: '/assignments',
    icon: 'assignment_turned_in'
  },
  {
    label: 'Notlarım',
    path: '/grades',
    icon: 'grade'
  },
  {
    label: 'Profil',
    path: '/profile',
    icon: 'person'
  }
] as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#2e7d32',
  ERROR: '#d32f2f',
  WARNING: '#ed6c02',
  INFO: '#0288d1'
} as const;

// Breakpoints
export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 900,
  LG: 1200,
  XL: 1536
} as const;