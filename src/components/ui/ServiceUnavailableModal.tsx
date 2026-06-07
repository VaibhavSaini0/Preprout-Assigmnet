import Button from './Button';
import { IconClose } from '../icons/Icons';

interface ServiceUnavailableModalProps {
  open: boolean;
  serviceName: string;
  onClose: () => void;
}

export default function ServiceUnavailableModal({
  open,
  serviceName,
  onClose,
}: ServiceUnavailableModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-lg animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-unavailable-title"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-[420px] bg-bg-card rounded-lg shadow-lg border border-border p-2xl animate-slide-up">
        <button
          type="button"
          className="absolute top-lg right-lg flex items-center justify-center w-8 h-8 rounded-full text-text-subtle hover:bg-bg-tab-active hover:text-text-heading transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <IconClose width={18} height={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-lg">
          <span className="text-xl" aria-hidden="true">🚧</span>
        </div>

        <h2 id="service-unavailable-title" className="text-lg font-semibold text-text-heading mb-sm">
          Service Not Available
        </h2>
        <p className="text-sm text-text-main leading-relaxed mb-xs">
          <strong>{serviceName}</strong> is not available right now.
        </p>
        <p className="text-sm text-text-subtle leading-relaxed mb-2xl">
          This feature is coming soon. Please check back later or contact your administrator.
        </p>

        <Button onClick={onClose} fullWidth>
          Got it
        </Button>
      </div>
    </div>
  );
}
