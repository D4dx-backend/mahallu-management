import api from './api';

export interface InstituteAccount {
  id: string;
  tenantId?: string;
  instituteId: string;
  accountName: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  balance?: number;
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface Category {
  id: string;
  tenantId?: string;
  name: string;
  type?: string;
  description?: string;
  createdAt: string;
}

export interface MasterWallet {
  id: string;
  tenantId?: string;
  name: string;
  type?: string;
  balance?: number;
  createdAt: string;
}

export interface Ledger {
  id: string;
  tenantId?: string;
  name: string;
  type?: string;
  description?: string;
  createdAt: string;
}

export interface LedgerItem {
  id: string;
  tenantId?: string;
  ledgerId: string;
  categoryId?: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  createdAt: string;
}

export const masterAccountService = {
  // Institute Accounts
  getAllInstituteAccounts: async (params?: { instituteId?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: InstituteAccount[]; pagination?: any }>('/master-accounts/institute', {
      params,
    });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createInstituteAccount: async (data: Partial<InstituteAccount>) => {
    const response = await api.post<{ success: boolean; data: InstituteAccount }>('/master-accounts/institute', data);
    return response.data.data;
  },

  // Categories
  getAllCategories: async (params?: { type?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Category[]; pagination?: any }>('/master-accounts/categories', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createCategory: async (data: Partial<Category>) => {
    const response = await api.post<{ success: boolean; data: Category }>('/master-accounts/categories', data);
    return response.data.data;
  },

  // Wallets
  getAllWallets: async (params?: { type?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: MasterWallet[]; pagination?: any }>('/master-accounts/wallets', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createWallet: async (data: Partial<MasterWallet>) => {
    const response = await api.post<{ success: boolean; data: MasterWallet }>('/master-accounts/wallets', data);
    return response.data.data;
  },

  // Ledgers
  getAllLedgers: async (params?: { type?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: Ledger[]; pagination?: any }>('/master-accounts/ledgers', { params });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createLedger: async (data: Partial<Ledger>) => {
    const response = await api.post<{ success: boolean; data: Ledger }>('/master-accounts/ledgers', data);
    return response.data.data;
  },

  // Ledger Items
  getLedgerItems: async (params?: { ledgerId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ success: boolean; data: LedgerItem[]; pagination?: any }>('/master-accounts/ledger-items', {
      params,
    });
    // Handle both paginated and non-paginated responses
    if (response.data.pagination) {
      return { data: response.data.data, pagination: response.data.pagination };
    }
    return { data: response.data.data, pagination: null };
  },

  createLedgerItem: async (data: Partial<LedgerItem>) => {
    const response = await api.post<{ success: boolean; data: LedgerItem }>('/master-accounts/ledger-items', data);
    return response.data.data;
  },
};

