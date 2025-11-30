import { InputHTMLAttributes, forwardRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import { cn } from '@/utils/cn';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          ref={ref}
          className={cn(
            'block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg',
            'bg-white text-sm placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500',
            className
          )}
          {...props}
        />
        {props.value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ×
            </span>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;

