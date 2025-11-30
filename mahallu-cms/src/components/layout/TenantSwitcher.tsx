import { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiLayers, FiCheck, FiSearch } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import { tenantService } from '@/services/tenantService';
import { Tenant } from '@/types/tenant';
import { cn } from '@/utils/cn';

export default function TenantSwitcher() {
  const { isSuperAdmin, currentTenantId, setCurrentTenant } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenantData] = useState<Tenant | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSuperAdmin) {
      loadTenants();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (currentTenantId && tenants.length > 0) {
      const tenant = tenants.find((t) => t.id === currentTenantId);
      setCurrentTenantData(tenant || null);
    }
  }, [currentTenantId, tenants]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset search when closing dropdown
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const response = await tenantService.getAll({ status: 'active' });
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantSelect = (tenant: Tenant) => {
    setCurrentTenant(tenant.id);
    setCurrentTenantData(tenant);
    setIsOpen(false);
    // Reload page data with new tenant context
    window.location.reload();
  };

  const filteredTenants = tenants.filter((tenant) => {
    const query = searchQuery.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(query) ||
      tenant.code.toLowerCase().includes(query) ||
      tenant.location.toLowerCase().includes(query)
    );
  });

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-transparent",
          isOpen 
            ? "bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" 
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        <FiLayers className="h-4 w-4" />
        <span className="hidden md:inline max-w-[150px] truncate">
          {currentTenant ? currentTenant.name : 'Select Tenant'}
        </span>
        <FiChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-[500px] flex flex-col">
          <div className="px-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400 dark:text-white"
                autoFocus
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[400px]">
            {isLoading ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">Loading...</div>
            ) : filteredTenants.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                {searchQuery ? 'No tenants found matching your search' : 'No tenants available'}
              </div>
            ) : (
              <div className="space-y-1 py-1">
                {filteredTenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSelect(tenant)}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4",
                      currentTenantId === tenant.id
                        ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400"
                        : "border-transparent text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-base mb-0.5">{tenant.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          <span className="opacity-75">{tenant.code}</span>
                          <span>•</span>
                          <span>{tenant.location}</span>
                        </p>
                      </div>
                      {currentTenantId === tenant.id && (
                        <FiCheck className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
