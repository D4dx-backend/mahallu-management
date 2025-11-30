import { useState, useRef, useEffect, ReactNode } from 'react';
import { FiFilter, FiSearch, FiRefreshCw, FiDownload, FiX, FiFileText, FiFile } from 'react-icons/fi';
import Button from './Button';
import Dropdown, { DropdownItem } from './Dropdown';
import { cn } from '@/utils/cn';

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  isFilterVisible?: boolean;
  hasFilters?: boolean; // Show filter button only if filters exist
  onRefresh?: () => void;
  onExport?: (type: 'csv' | 'json' | 'pdf') => void;
  actionButtons?: ReactNode;
  className?: string;
  isExporting?: boolean;
}

export default function TableToolbar({
  searchQuery,
  onSearchChange,
  onFilterClick,
  isFilterVisible = false,
  hasFilters = false,
  onRefresh,
  onExport,
  actionButtons,
  className,
  isExporting,
}: TableToolbarProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchExpanded(false);
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const exportItems: DropdownItem[] = [
    {
      label: 'Export CSV',
      icon: <FiFileText />,
      onClick: () => onExport?.('csv'),
      disabled: isExporting,
    },
    {
      label: 'Export JSON',
      icon: <FiFile />,
      onClick: () => onExport?.('json'),
      disabled: isExporting,
    },
    {
      label: 'Export PDF',
      icon: <FiDownload />,
      onClick: () => onExport?.('pdf'),
      disabled: isExporting,
    },
  ];

  return (
    <div className={cn('flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6', className)}>
      <div className="flex items-center gap-2 flex-1">
        {/* Filter Toggle - Only show if filters exist */}
        {hasFilters && onFilterClick && (
          <Button
            variant={isFilterVisible ? 'primary' : 'outline'}
            size="md"
            onClick={onFilterClick}
            className="flex items-center gap-2"
          >
            <FiFilter className="h-4 w-4" />
            Filter
          </Button>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <Button variant="outline" size="md" onClick={onRefresh} className="px-3">
            <FiRefreshCw className="h-4 w-4" />
          </Button>
        )}

        {/* Search */}
        <div className={cn(
          "relative flex items-center transition-all duration-300 ease-in-out overflow-hidden h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
          isSearchExpanded ? "w-64" : "w-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        )} onClick={!isSearchExpanded ? handleSearchClick : undefined}>
          <div className="flex-shrink-0 w-10 h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <FiSearch className="h-4 w-4" />
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onBlur={handleSearchBlur}
            placeholder="Search"
            className={cn(
              "w-full h-full bg-transparent border-none focus:ring-0 text-sm focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 pr-8",
              !isSearchExpanded && "pointer-events-none opacity-0"
            )}
            tabIndex={isSearchExpanded ? 0 : -1}
          />
          
          {searchQuery && isSearchExpanded && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleClearSearch();
              }}
              className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
         {/* Export Dropdown */}
        {onExport && (
          <Dropdown
            trigger={
              <Button variant="outline" size="md" isLoading={isExporting}>
                {!isExporting && <FiDownload className="h-4 w-4 sm:mr-2" />}
                <span className="hidden sm:inline">Export</span>
              </Button>
            }
            items={exportItems}
          />
        )}
        
        {/* Action Buttons */}
        {actionButtons}
      </div>
    </div>
  );
}

