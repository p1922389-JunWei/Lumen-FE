import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ 
  className, 
  type = 'text',
  label,
  error,
  size = 'default',
  ...props 
}, ref) => {
  const sizes = {
    sm: 'input-sm',
    default: 'input-default',
    lg: 'input-lg',
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'input',
          sizes[size],
          error && 'input-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
