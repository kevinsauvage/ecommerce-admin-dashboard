import { Button } from './ui/button';
import Modal from './ui/Modal';

interface AlertModalProps {
  loading: boolean;
  isOpen: boolean;
  close: () => void;
  onConfirm: () => void;
}

export default function AlertModal({
  loading,
  isOpen,
  close,
  onConfirm,
}: AlertModalProps) {
  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={() => close()}
    >
      <div className="flex gap-3">
        <Button onClick={close} variant="outline" disabled={loading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
