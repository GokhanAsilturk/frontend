import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import authService from '../services/authService';
import { clearTokens, saveTokens, getAccessToken } from '../utils/authUtils';
import { User, Student, AuthContextType } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  student: Student | null;
  loading: boolean;
  error: string | null;
}

// Auth action types
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  student: null,
  loading: false,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication context provider bileşeni
 * Kullanıcı kimlik doğrulama durumunu yönetir
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Kullanıcı giriş işlemi
   */
  const login = useCallback(async (credentials: { username: string; password: string }): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      
      const response = await authService.login(credentials);
      const { user: userData, accessToken, refreshToken } = response;
      
      // Token'ları kaydet
      saveTokens(accessToken, refreshToken);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    } catch (error: any) {
      const errorMessage = error.message ?? 'Giriş işlemi başarısız';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Kullanıcı çıkış işlemi
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  /**
   * Kullanıcı profil güncelleme
   */
  const updateProfile = useCallback((data: Partial<User>): void => {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
  }, []);

  /**
   * Kimlik doğrulama durumunu kontrol et
   */
  const checkAuthStatus = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const token = getAccessToken();
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Token varsa authenticated olarak işaretle
      // Gerçek kullanıcı bilgileri ilk API çağrısında gelecek
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Auth validation error:', error);
      clearTokens();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Uygulama başladığında auth durumunu kontrol et
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Context value'yu useMemo ile optimize et
  const value = useMemo(() => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    student: state.student,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    updateProfile
  }), [state, login, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Auth context hook'u
 * AuthContext'i kullanmak için custom hook
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;