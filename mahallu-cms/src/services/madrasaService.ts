import api from './api';
import { Institute } from '@/types';

export const madrasaService = {
  getAll: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Institute[]; pagination?: any }>('/madrasa', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Institute }>(`/madrasa/${id}`);
    return response.data.data;
  },

  create: async (madrasaData: Partial<Institute>) => {
    const response = await api.post<{ success: boolean; data: Institute }>('/madrasa', madrasaData);
    return response.data.data;
  },

  update: async (id: string, madrasaData: Partial<Institute>) => {
    const response = await api.put<{ success: boolean; data: Institute }>(`/madrasa/${id}`, madrasaData);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/madrasa/${id}`);
    return response.data;
  },
};

