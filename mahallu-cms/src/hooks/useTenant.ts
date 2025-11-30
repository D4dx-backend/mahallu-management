import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { tenantService } from '@/services/tenantService';
import { Tenant } from '@/types/tenant';

export function useTenant() {
  const { currentTenantId, isSuperAdmin } = useAuthStore();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentTenantId && isSuperAdmin) {
      loadTenant();
    }
  }, [currentTenantId, isSuperAdmin]);

  const loadTenant = async () => {
    if (!currentTenantId) return;
    try {
      setIsLoading(true);
      const data = await tenantService.getById(currentTenantId);
      setTenant(data);
    } catch (error) {
      console.error('Error loading tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { tenant, isLoading, reload: loadTenant };
}

