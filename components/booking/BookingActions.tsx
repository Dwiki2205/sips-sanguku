import Button from '@/components/ui/Button';

interface BookingActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  status: string;
}

export default function BookingActions({ 
  onEdit, 
  onDelete, 
  onConfirm, 
  onCancel, 
  status 
}: BookingActionsProps) {
  return (
    <div className="flex space-x-2">
      {status === 'pending' && onConfirm && (
        <Button
          size="sm"
          variant="primary"
          onClick={onConfirm}
        >
          Konfirmasi
        </Button>
      )}
      
      {status === 'confirmed' && onCancel && (
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
        >
          Batalkan
        </Button>
      )}
      
      <Button
        size="sm"
        variant="outline"
        onClick={onEdit}
      >
        Edit
      </Button>
      
      <Button
        size="sm"
        variant="danger"
        onClick={onDelete}
      >
        Hapus
      </Button>
    </div>
  );
}