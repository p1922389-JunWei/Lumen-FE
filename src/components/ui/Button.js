import React from 'react';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default',
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };

  const sizes = {
    sm: 'btn-sm',
    default: 'btn-default',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };

  return (
    <button
      ref={ref}
      className={cn('btn', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
