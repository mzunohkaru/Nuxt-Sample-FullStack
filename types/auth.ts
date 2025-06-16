export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: User;
    expiresIn: number;
  };
  timestamp: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponse {
  success: true;
  data: {
    token: string;
    user: User;
    expiresIn: number;
  };
  timestamp: string;
}

export interface LogoutResponse {
  success: true;
  data: {
    message: string;
  };
  timestamp: string;
}

export interface AuthenticatedRequest {
  user?: User;
  token?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  user?: User;
  error?: string;
}