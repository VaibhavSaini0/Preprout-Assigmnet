interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-[3px]',
};

export default function Spinner({ size = 'md', label, className = '' }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-md ${className}`} role="status">
      <div
        className={`${sizeMap[size]} border-border border-t-primary rounded-full animate-spin`}
        aria-hidden="true"
      />
      {label && <p className="text-sm text-text-subtle">{label}</p>}
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  );
}
