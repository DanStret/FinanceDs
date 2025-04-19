import type { AxiosError, AxiosRequestConfig } from 'axios';

import api from '../api';
import { 
  AuthEndpoints
} from './AuthRepository';

import type { 
  UserData,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  IAuthRepository,
  RegisterRequest
} from './AuthRepository';

// Constantes para el almacenamiento
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export class AuthRepositoryApi implements IAuthRepository {
  constructor() {
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Interceptor de response para manejar errores y refresh token
    api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Si el error es 401 y no es un intento de refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshToken) {
              const response = await this.refreshToken();
              if (response.status === 'success' && response.data?.token) {
                localStorage.setItem(TOKEN_KEY, response.data.token);
                return api(originalRequest);
              }
            }
          } catch (_refreshError) {
            this.clearAuthData();
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  private clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // También limpiar el token que usa api.ts
    localStorage.removeItem("token");
  }
  
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>(
        `/auth${AuthEndpoints.LOGIN}`, 
        data
      );
      
      if (response.data.status === 'success' && response.data.data) {
        const { token } = response.data.data;
        localStorage.setItem(TOKEN_KEY, token);
        // También guardar el token para api.ts
        localStorage.setItem("token", token);
        if (data.rememberMe) {
          localStorage.setItem(REFRESH_TOKEN_KEY, token);
        }
      }
      
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<UserData>> {
    try {
      const response = await api.post<ApiResponse<UserData>>(
        `/auth${AuthEndpoints.REGISTER}`, 
        data
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyToken(token: string): Promise<ApiResponse<UserData>> {
    try {
      const response = await api.get<ApiResponse<UserData>>(
        `/auth${AuthEndpoints.VERIFY}`,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const response = await api.post<ApiResponse<{ token: string }>>(
        `/auth${AuthEndpoints.REFRESH_TOKEN}`,
        { refreshToken }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>(
        `/auth${AuthEndpoints.LOGOUT}`
      );
      this.clearAuthData();
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiResponse<any> {
    if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError) {
      const axiosError = error as AxiosError;
      const response = axiosError.response?.data as ApiResponse<any>;
      return {
        message: response?.message || axiosError.message,
        status: 'error',
        error: {
          code: axiosError.response?.status?.toString() || 'UNKNOWN',
          details: response?.error?.details
        }
      };
    }
    
    return {
      message: 'Error desconocido',
      status: 'error',
      error: {
        code: 'UNKNOWN',
        details: error instanceof Error ? error.message : undefined
      }
    };
  }
}

// Crear una instancia singleton para usar en toda la aplicación
export const authRepository: IAuthRepository = new AuthRepositoryApi();