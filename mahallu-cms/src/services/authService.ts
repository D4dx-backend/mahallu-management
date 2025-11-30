import api from './api';
import { User } from '@/types';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface OTPCredentials {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  sendOTP: async (phone: string) => {
    const response = await api.post<{ success: boolean; message: string; otp?: string }>('/auth/send-otp', { phone });
    return response.data;
  },

  verifyOTP: async (credentials: OTPCredentials) => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/verify-otp', credentials);
    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

