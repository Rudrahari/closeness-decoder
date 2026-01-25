import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses - auto logout on token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - clear auth state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Redirect to login if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDto;
}

// Sign up with Google credential
export const signUpWithGoogle = async (credential: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/signup', { credential });
  return response.data;
};

// Sign in with Google credential
export const signInWithGoogle = async (credential: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/signin', { credential });
  return response.data;
};

// Get current user - validates token
export const getCurrentUser = async (): Promise<UserDto> => {
  const response = await api.get<UserDto>('/api/auth/me');
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};

export default api;
