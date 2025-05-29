export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse{
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
}


export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}
