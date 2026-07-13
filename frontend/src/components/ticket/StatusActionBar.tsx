import type { Ticket } from '../../types/ticket';
import type { User } from '../../types/user';
import { useTicketActions } from '../../hooks/useTicketActions';
import { Button } from '../shared/Button';

interface StatusActionBarProps {
  ticket: Ticket;
  currentUser: User | null;
  onMarkComplete: () => void;
  onClose: () => void;
  onReopen: () => void;
  onRouteToAdmin: () => void;
}

export function StatusActionBar({
  ticket, currentUser, onMarkComplete, onClose, onReopen, onRouteToAdmin,
}: StatusActionBarProps) {
  const actions = useTicketActions(ticket, currentUser);

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
      {actions.canMarkComplete && (
        <Button variant="secondary" onClick={onMarkComplete}>Mark Complete</Button>
      )}
      {actions.canClose && (
        <Button variant="danger" onClick={onClose}>Close Ticket</Button>
      )}
      {actions.canReopen && (
        <Button variant="secondary" onClick={onReopen}>Reopen</Button>
      )}
      {actions.canRouteToAdmin && (
        <Button variant="secondary" onClick={onRouteToAdmin}>Route to Admin</Button>
      )}
    </div>
  );
}