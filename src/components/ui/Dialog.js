import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// Simple Dialog components without Radix UI
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <>
      <div 
        className="dialog-overlay animate-fadeIn"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </>
  );
};

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('dialog-content animate-slideUp', className)}
    {...props}
  >
    {children}
  </div>
));
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('mb-4', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h2
    ref={ref}
    className={cn('text-xl font-semibold text-gray-900', className)}
    {...props}
  >
    {children}
  </h2>
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-gray-600 mt-2', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

const DialogClose = ({ onClose, className }) => (
  <button
    className={cn('dialog-close', className)}
    onClick={onClose}
  >
    <X style={{ width: '1.25rem', height: '1.25rem', color: '#6B7280' }} />
    <span className="sr-only">Close</span>
  </button>
);

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
