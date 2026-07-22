import { useState } from 'react';
import { Button } from '../shared/Button';
import { ConfirmActionModal } from '../shared/ConfirmActionModal';

interface RouteToAdminButtonProps {
  disabled?: boolean;
  onConfirm: (note?: string) => void;
}

export function RouteToAdminButton({ disabled, onConfirm }: RouteToAdminButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');

  return (
    <>
      <Button variant="secondary" disabled={disabled} onClick={() => setIsOpen(true)}>
        Route to Admin
      </Button>
      <ConfirmActionModal
        isOpen={isOpen}
        title="Route ticket to Admin"
        message="This will unassign the ticket from you and return it to Admin for reassignment."
        confirmLabel="Route to Admin"
        onCancel={() => setIsOpen(false)}
        onConfirm={() => { onConfirm(note || undefined); setIsOpen(false); setNote(''); }}
      />
    </>
  );
}