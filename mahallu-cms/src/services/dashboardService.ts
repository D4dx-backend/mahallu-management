import api from './api';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  families: {
    total: number;
    approved: number;
    pending: number;
    unapproved: number;
  };
  members: {
    total: number;
    male: number;
    female: number;
  };
}

export const dashboardService = {
  getStats: async () => {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return response.data.data;
  },
};

