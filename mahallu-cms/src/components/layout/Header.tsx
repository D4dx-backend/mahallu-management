import { FiMenu, FiBell, FiSun, FiMoon, FiUser, FiLogOut, FiSearch, FiMail, FiShield, FiCalendar, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { applyTheme } from '@/utils/theme';
import { useState, useEffect, useRef } from 'react';
import TenantSwitcher from './TenantSwitcher';
import CommandPalette from '@/components/ui/CommandPalette';

export default function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout, isSuperAdmin, currentTenantId } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isViewingAsTenant = isSuperAdmin && currentTenantId;

  useEffect(() => {
    setMounted(true);
    applyTheme();
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme();
    }
  }, [theme, mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const formatMemberSince = (date: string) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  const getAccountTypeLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (user?.role === 'mahall') return 'Mahall Admin';
    if (user?.role === 'survey') return 'Survey Admin';
    if (user?.role === 'institute') return 'Institute Admin';
    return 'User';
  };

  return (
    <>
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
      
      {/* Viewing as Tenant Banner */}
      {isViewingAsTenant && (
        <div className="sticky top-0 z-40 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white text-sm">
          <FiShield className="h-4 w-4" />
          <span className="font-medium">Viewing as Tenant</span>
          <span className="opacity-75">•</span>
          <span className="opacity-90">All data is filtered for the selected tenant</span>
        </div>
      )}
      
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/50 bg-white/80 backdrop-blur-md px-6 dark:border-gray-800/50 dark:bg-gray-900/80">
        <div className="flex items-center gap-4">
          {/* Search / Command Palette Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-100/80 rounded-lg hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 dark:text-gray-400 transition-colors"
          >
            <FiSearch className="h-4 w-4" />
            <span className="hidden md:inline">Search menu...</span>
            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
        {/* Tenant Switcher (Super Admin Only) */}
        {isSuperAdmin && <TenantSwitcher />}

        {/* User Menu */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200/50 dark:border-gray-700/50 relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 relative">
              <FiUser className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {getAccountTypeLabel()}
              </p>
            </div>
            <FiChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              {/* Blue Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center relative">
                    <FiUser className="h-6 w-6 text-white" />
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-blue-600"></span>
                  </div>
                  <div>
                    <p className="text-white/90 text-sm">Welcome back,</p>
                    <p className="text-white font-semibold text-lg">{user?.name || 'User'}</p>
                  </div>
                </div>
              </div>

              {/* User Info Cards */}
              <div className="p-4 space-y-3">
                {/* Email Address */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                      <FiMail className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email Address</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user?.email || user?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Type */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                      <FiShield className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Account Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getAccountTypeLabel()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                      <FiCalendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Member Since</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user?.joiningDate ? formatMemberSince(user.joiningDate) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-1">
                {/* Notifications */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Handle notifications click
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <FiBell className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                      Notifications
                    </span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    handleThemeToggle();
                    // Keep menu open after toggle
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {mounted && theme === 'dark' ? (
                      <FiSun className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                    ) : (
                      <FiMoon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                      {mounted && theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </button>

                {/* Sign Out */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FiLogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Sign out
                    </span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-red-400 dark:text-red-500" />
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </header>
    </>
  );
}

