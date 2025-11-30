import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm transition-all duration-200',
              'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-gray-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
              'hover:border-gray-300 dark:hover:border-gray-600',
              'dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100 dark:ring-offset-gray-950',
              'dark:placeholder:text-gray-500 dark:focus-visible:ring-primary-500/20 dark:focus-visible:border-primary-500',
              error && 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500',
              icon && 'pl-11',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 ml-1 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1 fade-in duration-200">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 ml-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
