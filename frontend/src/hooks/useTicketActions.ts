import type { Ticket } from '../types/ticket';
import type { User } from '../types/user';

export function useTicketActions(ticket: Ticket, currentUser: User | null) {
  if (!currentUser) {
    return {
      canSetPriority: false, canAssign: false, canReply: false,
      canMarkComplete: false, canClose: false, canReopen: false,
      canReassign: false, canRouteToAdmin: false,
    };
  }

  const isAdmin = currentUser.role === 'ADMIN';
  const isOwningDeveloper =
    currentUser.role === 'DEVELOPER' && ticket.assigned_to_user_id === currentUser.id;

  return {
    canSetPriority: isAdmin && ticket.status !== 'CLOSED',
    canAssign: isAdmin && ['ACCEPTED', 'ASSIGNED', 'IN_PROGRESS'].includes(ticket.status),
    canReply: (isAdmin || isOwningDeveloper) && ticket.status !== 'CLOSED',
    canMarkComplete:
      (isAdmin || isOwningDeveloper) && ['ASSIGNED', 'IN_PROGRESS'].includes(ticket.status),
    canClose: isAdmin && ticket.status !== 'CLOSED',
    canReopen: isAdmin && ticket.status === 'CLOSED',
    canReassign: isOwningDeveloper && ['ASSIGNED', 'IN_PROGRESS'].includes(ticket.status),
    canRouteToAdmin: isOwningDeveloper && ['ASSIGNED', 'IN_PROGRESS'].includes(ticket.status),
  };
}