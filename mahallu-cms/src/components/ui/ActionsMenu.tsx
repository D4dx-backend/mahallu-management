import { useState, useRef, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { cn } from '@/utils/cn';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'danger' | 'warning';
}

interface ActionsMenuProps {
  items: ActionMenuItem[];
  className?: string;
}

export default function ActionsMenu({ items, className }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter out disabled items and check if we have any items
  const visibleItems = items.filter(item => !item.disabled);

  // Don't render if no items
  if (visibleItems.length === 0) {
    return null;
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: ActionMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const getVariantStyles = (variant: ActionMenuItem['variant'] = 'default') => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700';
    }
  };

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <FiMoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 py-1">
          {visibleItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(item);
              }}
              disabled={item.disabled}
              className={cn(
                'w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors',
                getVariantStyles(item.variant),
                item.disabled && 'opacity-50 cursor-not-allowed',
                item.className
              )}
            >
              {item.icon && <span className="flex items-center justify-center h-4 w-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

