

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning', 
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
    default: 'bg-neutral-border text-text-secondary',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}

// Chip is similar to Badge but with different styling
export function Chip({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-md text-sm font-medium';
  
  const variantClasses = {
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    danger: 'bg-danger text-white', 
    info: 'bg-info text-white',
    default: 'bg-neutral-border text-ink',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}