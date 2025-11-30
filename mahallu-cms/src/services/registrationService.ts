import api from './api';

export interface NikahRegistration {
  id: string;
  tenantId?: string;
  groomName: string;
  groomAge?: number;
  groomId?: string;
  brideName: string;
  brideAge?: number;
  brideId?: string;
  nikahDate: string;
  mahallId?: string;
  waliName?: string;
  witness1?: string;
  witness2?: string;
  mahrAmount?: number;
  mahrDescription?: string;
  status?: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: string;
}

export interface DeathRegistration {
  id: string;
  tenantId?: string;
  deceasedName: string;
  deceasedId?: string;
  deathDate: string;
  placeOfDeath?: string;
  causeOfDeath?: string;
  mahallId?: string;
  familyId?: string;
  informantName?: string;
  informantRelation?: string;
  informantPhone?: string;
  status?: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: string;
}

export interface NOC {
  id: string;
  tenantId?: string;
  applicantName: string;
  applicantId?: string;
  applicantPhone?: string;
  purpose: string;
  type: 'common' | 'nikah';
  nikahRegistrationId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  issuedDate?: string;
  expiryDate?: string;
  remarks?: string;
  createdAt: string;
}

export const registrationService = {
  // Nikah Registrations
  getAllNikah: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: NikahRegistration[]; pagination?: any }>('/registrations/nikah', {
      params,
    });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  getNikahById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: NikahRegistration }>(`/registrations/nikah/${id}`);
    return response.data.data;
  },

  createNikah: async (data: Partial<NikahRegistration>) => {
    const response = await api.post<{ success: boolean; data: NikahRegistration }>('/registrations/nikah', data);
    return response.data.data;
  },

  // Death Registrations
  getAllDeath: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: DeathRegistration[]; pagination?: any }>('/registrations/death', {
      params,
    });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  getDeathById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: DeathRegistration }>(`/registrations/death/${id}`);
    return response.data.data;
  },

  createDeath: async (data: Partial<DeathRegistration>) => {
    const response = await api.post<{ success: boolean; data: DeathRegistration }>('/registrations/death', data);
    return response.data.data;
  },

  // NOC
  getAllNOC: async (params?: { type?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: NOC[]; pagination?: any }>('/registrations/noc', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  getNOCById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: NOC }>(`/registrations/noc/${id}`);
    return response.data.data;
  },

  createNOC: async (data: Partial<NOC>) => {
    const response = await api.post<{ success: boolean; data: NOC }>('/registrations/noc', data);
    return response.data.data;
  },

  updateNOC: async (id: string, data: Partial<NOC>) => {
    const response = await api.put<{ success: boolean; data: NOC }>(`/registrations/noc/${id}`, data);
    return response.data.data;
  },
};

