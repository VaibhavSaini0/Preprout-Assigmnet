import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-lg animate-fade-in" role="alertdialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-full max-w-[420px] bg-bg-card rounded-lg shadow-lg border border-border p-2xl animate-slide-up">
        <h3 className="text-lg font-semibold text-text-heading mb-sm">{title}</h3>
        <p className="text-sm text-text-main mb-2xl leading-relaxed">{message}</p>
        <div className="flex justify-end gap-md">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
