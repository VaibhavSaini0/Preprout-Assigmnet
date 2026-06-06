import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:enabled:bg-primary-dark',
  secondary: 'bg-primary-light text-primary hover:enabled:bg-primary/20',
  ghost: 'bg-transparent text-text-main border border-border hover:enabled:bg-bg-tab-active',
  danger: 'bg-danger-bg text-danger hover:enabled:bg-danger-light',
  'danger-outline': 'bg-transparent text-danger border border-danger-light hover:enabled:bg-danger-bg',
};

export default function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-sm h-button px-2xl rounded-md text-base font-medium transition duration-150 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${
        variantStyles[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
