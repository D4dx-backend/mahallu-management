import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  currentTenantId: string | null;
  isSuperAdmin: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setCurrentTenant: (tenantId: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentTenantId: null,
      isSuperAdmin: false,
      setUser: (user) =>
        set({
          user,
          isSuperAdmin: user?.isSuperAdmin || false,
          currentTenantId: user?.tenantId || null,
        }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },
      setCurrentTenant: (tenantId) => set({ currentTenantId: tenantId }),
      logout: () =>
        set({
          user: null,
          token: null,
          currentTenantId: null,
          isSuperAdmin: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

