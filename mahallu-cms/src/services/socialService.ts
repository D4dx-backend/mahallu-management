import api from './api';

export interface Banner {
  id: string;
  tenantId?: string;
  title: string;
  image: string;
  link?: string;
  status?: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Feed {
  id: string;
  tenantId?: string;
  title: string;
  content: string;
  image?: string;
  authorId?: string;
  authorName?: string;
  isSuperFeed?: boolean;
  status?: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  tenantId?: string;
  userId?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  httpMethod?: string;
  endpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode?: number;
  requestBody?: Record<string, any>;
  responseData?: Record<string, any>;
  errorMessage?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Support {
  id: string;
  tenantId?: string;
  userId?: string;
  userName?: string;
  subject: string;
  message: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  response?: string;
  createdAt: string;
}

export const socialService = {
  // Banners
  getAllBanners: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Banner[]; pagination?: any }>('/social/banners', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createBanner: async (data: Partial<Banner>) => {
    const response = await api.post<{ success: boolean; data: Banner }>('/social/banners', data);
    return response.data.data;
  },

  // Feeds
  getAllFeeds: async (params?: { status?: string; isSuperFeed?: boolean; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Feed[]; pagination?: any }>('/social/feeds', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createFeed: async (data: Partial<Feed>) => {
    const response = await api.post<{ success: boolean; data: Feed }>('/social/feeds', data);
    return response.data.data;
  },

  // Activity Logs
  getActivityLogs: async (params?: { entityType?: string; entityId?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: ActivityLog[]; pagination?: any }>('/social/activity-logs', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  // Support
  getAllSupport: async (params?: { status?: string; priority?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Support[]; pagination?: any }>('/social/support', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createSupport: async (data: Partial<Support>) => {
    const response = await api.post<{ success: boolean; data: Support }>('/social/support', data);
    return response.data.data;
  },

  updateSupport: async (id: string, data: Partial<Support>) => {
    const response = await api.put<{ success: boolean; data: Support }>(`/social/support/${id}`, data);
    return response.data.data;
  },
};

