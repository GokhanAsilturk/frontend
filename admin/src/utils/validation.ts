import * as yup from 'yup';
import { VALIDATION_RULES } from './constants';

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE.test(phone);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(`Şifre en az ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} karakter olmalıdır`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }

  if (!/\d/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): boolean => {
  return name.length >= VALIDATION_RULES.NAME_MIN_LENGTH && 
         name.length <= VALIDATION_RULES.NAME_MAX_LENGTH;
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateCourseCode = (code: string): boolean => {
  // Course code should be 6-10 characters, alphanumeric with possible dashes
  const codeRegex = /^[A-Z0-9-]{6,10}$/;
  return codeRegex.test(code);
};

export const validateCredits = (credits: number): boolean => {
  return credits > 0 && credits <= 10 && Number.isInteger(credits);
};

export const validateCapacity = (capacity: number): boolean => {
  return capacity > 0 && capacity <= 500 && Number.isInteger(capacity);
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

// Yup validation schemas
export const studentValidationSchema = yup.object({
  username: yup
    .string()
    .required('Kullanıcı adı zorunludur')
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(50, 'Kullanıcı adı en fazla 50 karakter olabilir'),
  password: yup
    .string()
    .required('Şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .max(100, 'Şifre en fazla 100 karakter olabilir'),
  firstName: yup
    .string()
    .required('Ad alanı zorunludur')
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: yup
    .string()
    .required('Soyad alanı zorunludur')
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  email: yup
    .string()
    .required('E-posta alanı zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
  dateOfBirth: yup
    .string()
    .required('Doğum tarihi zorunludur')
    .test('valid-date', 'Geçerli bir tarih giriniz', function(value) {
      if (!value) return false;
      return !isNaN(Date.parse(value));
    })
    .test('future-date', 'Doğum tarihi gelecek bir tarih olamaz', function(value) {
      if (!value) return false;
      return new Date(value) < new Date();
    })
    .test('age', 'Yaş en az 16 olmalıdır', function(value) {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 16;
      }
      return age >= 16;
    }),
  phone: yup
    .string()
    .optional()
    .matches(/^[+]?[()]?[\d\s\-()]{10,}$/, 'Geçerli bir telefon numarası giriniz'),
});

export const courseValidationSchema = yup.object({
  name: yup
    .string()
    .required('Kurs adı zorunludur')
    .min(3, 'Kurs adı en az 3 karakter olmalıdır')
    .max(100, 'Kurs adı en fazla 100 karakter olabilir'),
  description: yup
    .string()
    .optional()
    .min(10, 'Açıklama en az 10 karakter olmalıdır')
    .max(500, 'Açıklama en fazla 500 karakter olabilir'),
  credits: yup
    .number()
    .required('Kredi zorunludur')
    .min(1, 'Kredi en az 1 olmalıdır')
    .max(10, 'Kredi en fazla 10 olabilir')
    .integer('Kredi tam sayı olmalıdır'),
});

export const loginValidationSchema = yup.object({
  email: yup
    .string()
    .required('E-posta alanı zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: yup
    .string()
    .required('Şifre alanı zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});
