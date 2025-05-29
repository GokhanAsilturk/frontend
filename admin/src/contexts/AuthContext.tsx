import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { User, AuthContextType, LoginCredentials } from '../types';
import { authService } from '../services';
import { isTokenExpired, clearTokens, saveTokens } from '../utils/authUtils';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);  
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(credentials);
      
      // Backend'den dönen veri yapısını doğru şekilde işle
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        
        // Gerekli alanları kontrol et
        if (!accessToken || !refreshToken || !user) {
          console.error('Token bilgileri eksik:', response);
          throw new Error('Giriş başarısız: Token bilgileri eksik');
        }
        
        // Store tokens using utility function
        saveTokens(accessToken, refreshToken);
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        throw new Error(response.message ?? 'Giriş başarısız');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, 
  
  [dispatch]);const logout = useCallback((): void => {
    // Refresh token'ı al ve API'ye gönder
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Clear tokens using utility function
    clearTokens();
    
    // Call logout API to invalidate tokens on server
    if (refreshToken) {
      authService.logout(refreshToken).catch(console.error);
    }
    
    dispatch({ type: 'LOGOUT' });
  }, []);const checkAuthStatus = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }      // Check if token is expired
      if (isTokenExpired(token)) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await authService.refreshToken(refreshToken);
            // API yanıt formatı düzgün şekilde ele alınıyor
            saveTokens(response.data.accessToken, response.data.refreshToken ?? refreshToken);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            clearTokens();
            dispatch({ type: 'LOGOUT' });
            return;
          }
        } else {
          clearTokens();
          dispatch({ type: 'LOGOUT' });
          return;
        }
      }      // Get current user and extract data from response
      const userData = await authService.getCurrentUser();
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    } catch (error) {
      console.error('Auth check failed:', error);
      clearTokens();
      dispatch({ type: 'LOGOUT' });
    }
  }, [dispatch]);
  const updateProfile = useCallback((updates: Partial<User>): void => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = useMemo(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    checkAuthStatus,
    updateProfile,
  }), [state.user, state.isAuthenticated, state.isLoading, login, logout, checkAuthStatus, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
