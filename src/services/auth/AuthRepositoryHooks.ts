import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authRepository } from './AuthRepositoryApi';
import { 
  ApiResponse,
  LoginRequest, 
  LoginResponse,
  RegisterRequest,
  UserData
} from './AuthRepository';

// Constantes para las claves de query
const QUERY_KEYS = {
  USER_DATA: 'userData',
  AUTH_STATUS: 'authStatus'
} as const;

// Hook para login
export const useLoginHook = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ApiResponse<LoginResponse>, Error, LoginRequest>({
    mutationFn: (data: LoginRequest) => authRepository.login(data),
    onSuccess: (response) => {
      if (response.status === 'success') {
        queryClient.setQueryData([QUERY_KEYS.USER_DATA], response.data?.user);
        queryClient.setQueryData([QUERY_KEYS.AUTH_STATUS], true);
      }
    },
    onError: (error) => {
      queryClient.setQueryData([QUERY_KEYS.AUTH_STATUS], false);
    }
  });

  const login = useCallback((data: LoginRequest) => mutation.mutateAsync(data), [mutation]);

  return {
    login,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data
  };
};

// Hook para registro
export const useRegisterHook = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ApiResponse<UserData>, Error, RegisterRequest>({
    mutationFn: (data: RegisterRequest) => authRepository.register(data),
    onSuccess: (response) => {
      if (response.status === 'success') {
        queryClient.setQueryData([QUERY_KEYS.USER_DATA], response.data);
      }
    }
  });

  const register = useCallback((data: RegisterRequest) => mutation.mutateAsync(data), [mutation]);

  return {
    register,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data
  };
};

// Hook para verificar token y estado de autenticación
export const useAuthStatus = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('authToken');
  
  const query = useQuery<ApiResponse<UserData>, Error>({
    queryKey: [QUERY_KEYS.USER_DATA],
    queryFn: () => authRepository.verifyToken(token || ''),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1
  });

  const logout = useCallback(async () => {
    try {
      await authRepository.logout();
      queryClient.setQueryData([QUERY_KEYS.USER_DATA], null);
      queryClient.setQueryData([QUERY_KEYS.AUTH_STATUS], false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }, [queryClient]);

  // Efecto para manejar el estado de autenticación
  useEffect(() => {
    const isAuthenticated = !!token && query.data?.status === 'success' && !!query.data?.data;
    queryClient.setQueryData([QUERY_KEYS.AUTH_STATUS], isAuthenticated);
  }, [token, query.data, queryClient]);

  return {
    isAuthenticated: query.data?.status === 'success' && !!query.data?.data,
    userData: query.data?.data || null,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    logout
  };
};

// Hook para refrescar el token
export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: () => authRepository.refreshToken(),
    onSuccess: (response) => {
      if (response.status === 'success' && response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_DATA] });
      }
    },
    onError: () => {
      queryClient.setQueryData([QUERY_KEYS.AUTH_STATUS], false);
    }
  });

  const refreshToken = useCallback(() => mutation.mutateAsync(), [mutation]);

  return {
    refreshToken,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error
  };
};

// Hook para obtener listado (ejemplo con useQuery)
export const useUsersListHook = () => {
  const token = localStorage.getItem('authToken');
  
  // Ejemplo de hook para un listado usando useQuery
  return useQuery<ApiResponse<any[]>, Error>({
    queryKey: ['usersList'],
    queryFn: async () => {
      // Aquí puedes implementar la llamada a un repositorio para listar usuarios
      // Por ahora solo es un ejemplo
      const response = await fetch('/api/users', {
        headers: {
          'x-auth-token': token || ''
        }
      });
      return response.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutos antes de considerar datos como obsoletos
    refetchOnWindowFocus: false
  });
};