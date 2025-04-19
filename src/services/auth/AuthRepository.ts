export interface ApiResponse<T> {
    message: string;
    status: 'success' | 'error';
    data?: T | null;
    error?: {
      code: string;
      details?: string;
    };
  }
  
  // Respuesta específica para el login
  export interface LoginResponse {
    token: string;
    user: {
      id_usuario: number;
      nombre: string;
      correo: string;
      rol: string;
    };
    expiresIn: number;
  }
  
  // Define los nombres de los endpoints
  export enum AuthEndpoints {
    LOGIN = '/login',
    REGISTER = '/register',
    VERIFY = '/verify',
    REFRESH_TOKEN = '/refresh-token',
    LOGOUT = '/logout'
  }
  
  // Interfaces de parámetros para cada endpoint (request)
  export interface LoginRequest {
    correo: string;
    contraseña: string;
    rememberMe?: boolean;
  }
  
  export interface RegisterRequest {
    nombre: string;
    correo: string;
    contraseña: string;
    confirmarContraseña: string;
  }
  
  // Datos del usuario decodificados del token
  export interface UserData {
    id_usuario: number;
    nombre: string;
    correo: string;
    rol: string;
    permisos: string[];
  }
  
  // Interfaz del repositorio de autenticación - define lo que la implementación de API debe implementar
  export interface IAuthRepository {
    login(data: LoginRequest): Promise<ApiResponse<LoginResponse>>;
    register(data: RegisterRequest): Promise<ApiResponse<UserData>>;
    verifyToken(token: string): Promise<ApiResponse<UserData>>;
    refreshToken(): Promise<ApiResponse<{ token: string }>>;
    logout(): Promise<ApiResponse<void>>;
  }