import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-danger-bg border-danger-light text-danger',
  success: 'bg-success-bg border-success text-[#065f46]',
  info: 'bg-primary-light border-primary/25 text-primary-dark',
};

export default function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  return (
    <div
      className={`p-md px-lg rounded-md text-sm font-medium border ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
}
