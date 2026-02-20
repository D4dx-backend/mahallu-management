import api from './api';

export interface MemberOverviewResponse {
  member: {
    id: string;
    name: string;
    phone?: string;
    familyName?: string;
    mahallId?: string;
  };
  family: {
    details: {
      id: string;
      houseName?: string;
      mahallId?: string;
      varisangyaGrade?: string;
      contactNo?: string;
      area?: string;
      place?: string;
      status?: string;
    } | null;
    members: Array<{
      id: string;
      name: string;
      phone?: string;
      gender?: 'male' | 'female';
      mahallId?: string;
      status?: string;
    }>;
    financialSummary: {
      varisangyaTotal: number;
      varisangyaCount: number;
      zakatTotal: number;
      zakatCount: number;
    };
  };
  mahalluStatistics: {
    users: number;
    families: number;
    members: number;
  };
  varusankhyaDetails: {
    familyMahallId: string | null;
    memberMahallId: string | null;
    varisangyaGrade: string | null;
    latestVarisangyaReceiptNo: string | null;
    latestZakatReceiptNo: string | null;
    latestVarisangyaPaymentDate: string | null;
    latestZakatPaymentDate: string | null;
  };
  assignedOptions: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export const memberPortalService = {
  getOverview: async () => {
    const response = await api.get<{ success: boolean; data: MemberOverviewResponse }>('/member-user/overview');
    return response.data.data;
  },
};
