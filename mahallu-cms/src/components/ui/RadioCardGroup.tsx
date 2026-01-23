import React from 'react';

interface RadioCardOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface RadioCardGroupProps {
  label: string;
  options: RadioCardOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  columns?: 2 | 3 | 4;
}

export default function RadioCardGroup({
  label,
  options,
  value,
  onChange,
  error,
  required,
  columns = 2,
}: RadioCardGroupProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`grid ${gridCols[columns]} gap-2`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative flex items-center justify-center px-3 py-2 rounded-md border-2 transition-all text-sm
              ${
                value === option.value
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                  : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              cursor-pointer
            `}
          >
            <span
              className={`font-medium ${
                value === option.value
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {option.label}
            </span>
            {value === option.value && (
              <div className="absolute top-1 right-1">
                <svg
                  className="w-4 h-4 text-primary-600 dark:text-primary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
