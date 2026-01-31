import api from './api';

export interface Varisangya {
  id: string;
  tenantId?: string;
  familyId?: string;
  memberId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  receiptNo?: string;
  remarks?: string;
  createdAt: string;
}

export interface Zakat {
  id: string;
  tenantId?: string;
  payerName: string;
  payerId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  receiptNo?: string;
  category?: string;
  remarks?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  tenantId?: string;
  familyId?: string;
  memberId?: string;
  balance: number;
  lastTransactionDate?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  tenantId?: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: 'varisangya' | 'zakat';
  createdAt: string;
}

export const collectibleService = {
  // Varisangya
  getAllVarisangyas: async (params?: { familyId?: string; memberId?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Varisangya[]; pagination?: any }>('/collectibles/varisangya', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createVarisangya: async (data: Partial<Varisangya>) => {
    const response = await api.post<{ success: boolean; data: Varisangya }>('/collectibles/varisangya', data);
    return response.data.data;
  },

  getNextReceiptNo: async (type: 'varisangya' | 'zakat') => {
    const response = await api.get<{ success: boolean; data: { receiptNo: string } }>(
      '/collectibles/receipt-next',
      { params: { type } }
    );
    return response.data.data.receiptNo;
  },

  // Zakat
  getAllZakats: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Zakat[]; pagination?: any }>('/collectibles/zakat', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createZakat: async (data: Partial<Zakat>) => {
    const response = await api.post<{ success: boolean; data: Zakat }>('/collectibles/zakat', data);
    return response.data.data;
  },

  // Wallet
  getWallet: async (params?: { familyId?: string; memberId?: string }) => {
    const response = await api.get<{ success: boolean; data: Wallet }>('/collectibles/wallet', { params });
    return response.data.data;
  },

  getWalletTransactions: async (walletId: string) => {
    const response = await api.get<{ success: boolean; data: Transaction[] }>(
      `/collectibles/wallet/${walletId}/transactions`
    );
    return response.data.data;
  },
};

