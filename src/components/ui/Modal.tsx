import { useEffect, type ReactNode } from 'react';
import { IconClose } from '../icons/Icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  md: 'max-w-[640px]',
  lg: 'max-w-[900px]',
  xl: 'max-w-[1100px]',
};

export default function Modal({ open, onClose, title, children, size = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-lg pt-[5vh] overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizeClasses[size]} bg-bg-card rounded-lg shadow-lg border border-border animate-slide-up`}
      >
        <div className="flex items-center justify-between px-2xl py-xl border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold text-text-heading">
            {title}
          </h2>
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-full text-text-subtle transition-colors duration-150 hover:bg-bg-tab-active hover:text-text-heading"
            onClick={onClose}
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>
        <div className="p-2xl">{children}</div>
      </div>
    </div>
  );
}
