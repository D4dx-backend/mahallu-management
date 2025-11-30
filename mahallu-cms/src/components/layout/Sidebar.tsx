import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menuItems, MenuItem } from '@/constants/menuItems';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';

interface MenuItemComponentProps {
  item: MenuItem;
  level?: number;
}

function MenuItemComponent({ item, level = 0 }: MenuItemComponentProps) {
  const location = useLocation();
  const { isSuperAdmin, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon as React.ComponentType<{ className?: string }>;
  const isActive = item.path === location.pathname;

  // Get user role
  const userRole = user?.role || (isSuperAdmin ? 'super_admin' : null);

  // Check if menu item is accessible based on role
  const isAccessible = () => {
    // Super admin only check
    if (item.superAdminOnly && !isSuperAdmin) {
      return false;
    }
    // Role-based access check
    if (item.allowedRoles && userRole) {
      return item.allowedRoles.includes(userRole);
    }
    // If no restrictions, allow access
    return true;
  };

  // Hide menu items that user doesn't have access to
  if (!isAccessible()) {
    return null;
  }

  // Filter children based on access
  const visibleChildren = item.children?.filter((child) => {
    if (child.superAdminOnly && !isSuperAdmin) return false;
    if (child.allowedRoles && userRole) {
      return child.allowedRoles.includes(userRole);
    }
    return true;
  });

  // Check if any child is active to auto-expand
  useEffect(() => {
    if (hasChildren) {
      const isChildActive = (items: MenuItem[]): boolean => {
        return items.some((child) => {
          if (child.path === location.pathname) return true;
          if (child.children) return isChildActive(child.children);
          return false;
        });
      };
      
      if (isChildActive(item.children || [])) {
        setIsOpen(true);
      }
    }
  }, [location.pathname, item.children, hasChildren]);

  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <li>
      {hasChildren ? (
        <>
          <button
            onClick={handleToggle}
            className={cn(
              'group w-full flex items-center justify-between py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              'hover:bg-gray-50 dark:hover:bg-gray-800/50',
              'text-gray-600 dark:text-gray-400',
              // Base padding right is fixed, left is dynamic
              'pr-4'
            )}
            style={{ paddingLeft: `${level * 1.25 + 1}rem` }}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 flex-shrink-0 transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              <span className="truncate">{item.label}</span>
            </div>
            {isOpen ? (
              <FiChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <FiChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </button>
          {isOpen && visibleChildren && visibleChildren.length > 0 && (
            <ul className="mt-1 space-y-1">
              {visibleChildren.map((child) => (
                <MenuItemComponent key={child.id} item={child} level={level + 1} />
              ))}
            </ul>
          )}
        </>
      ) : (
        <Link
          to={item.path || '#'}
          className={cn(
            'group flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border-l-4',
            // Base padding right is fixed, left is dynamic
            'pr-4',
            isActive
              ? 'border-primary-600 bg-primary-50/50 text-primary-700 dark:bg-primary-900/10 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
          )}
          style={{ paddingLeft: `${level * 1.25 + 1}rem` }}
        >
          <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary-600 dark:text-primary-400" : "group-hover:text-primary-600 dark:group-hover:text-primary-400")} />
          <span className="truncate">{item.label}</span>
        </Link>
      )}
    </li>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              K
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Jamaah Hub
            </h1>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <MenuItemComponent key={item.id} item={item} />
            ))}
          </ul>
        </nav>

        {/* Version */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-medium">
            <span>Version 3.1.0</span>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
          </div>
        </div>
      </div>
    </aside>
  );
}

