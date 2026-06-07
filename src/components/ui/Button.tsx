import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:enabled:bg-primary-dark shadow-sm hover:enabled:shadow-md active:enabled:scale-[0.98]',
  secondary: 'bg-primary-light text-primary-dark hover:enabled:bg-primary/20 active:enabled:scale-[0.98]',
  ghost: 'bg-transparent text-text-main border border-border hover:enabled:bg-bg-tab-active',
  danger: 'bg-danger-bg text-danger hover:enabled:bg-danger-light active:enabled:scale-[0.98]',
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
