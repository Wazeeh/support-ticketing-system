import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../../../services/ticketService';
import { useAuth } from '../../../hooks/useAuth';
import { AdminDashboardLayout } from '../AdminDashboardLayout';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { PriorityBadge } from '../../../components/shared/PriorityBadge';
import { PrioritySelector } from '../../../components/ticket/PrioritySelector';
import { AssignDeveloperControl } from '../../../components/ticket/AssignDeveloperControl';
import { AttachmentList } from '../../../components/ticket/AttachmentList';
import { ReplyThread } from '../../../components/ticket/ReplyThread';
import { StatusActionBar } from '../../../components/ticket/StatusActionBar';
import { TicketTimelineView } from '../../../components/reporting/TicketTimelineView';
import { RichTextViewer } from '../../../components/shared/RichTextViewer';
import { useTicketActions } from '../../../hooks/useTicketActions';

export function TicketDetailPage() {
  const { id } = useParams();
  const ticketId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['admin-ticket', ticketId],
    queryFn: () => ticketService.getAdminTicket(ticketId).then((res) => res.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });

  if (isLoading || !ticket) {
    return <AdminDashboardLayout><p>Loading...</p></AdminDashboardLayout>;
  }

  const actions = useTicketActions(ticket, user);

  return (
    <AdminDashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{ticket.tracking_number}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 20 }}>
        <div>
          <p><strong>Submitter:</strong> {ticket.submitter_name} ({ticket.submitter_email})</p>
          <p><strong>Software:</strong> {ticket.software} — <strong>Category:</strong> {ticket.issue_category}</p>
          <RichTextViewer html={ticket.description} />

          <ReplyThread
            replies={(ticket as any).replies ?? []}
            canReply={actions.canReply}
            canClose={actions.canClose}
            onSubmit={async (message, closeTicket) => {
              await ticketService.adminReply(ticketId, message, closeTicket);
              invalidate();
            }}
          />

          <TicketTimelineView ticketId={ticketId} />
        </div>

        <div>
          {actions.canSetPriority && (
            <PrioritySelector
              value={ticket.priority}
              onChange={async (priority) => { await ticketService.setPriority(ticketId, priority); invalidate(); }}
            />
          )}

          {actions.canAssign && (
            <div style={{ marginTop: 10 }}>
              <AssignDeveloperControl
                onAssign={async (devId) => { await ticketService.assignDeveloper(ticketId, devId); invalidate(); }}
              />
            </div>
          )}

          <StatusActionBar
            ticket={ticket}
            currentUser={user}
            onMarkComplete={async () => { await ticketService.adminComplete(ticketId); invalidate(); }}
            onClose={async () => { await ticketService.adminReply(ticketId, 'Closed by admin.', true); invalidate(); }}
            onReopen={async () => { await ticketService.reopenTicket(ticketId, 'Reopened by admin.'); invalidate(); }}
            onRouteToAdmin={() => {}}
          />

          <AttachmentList ticketId={ticketId} attachments={(ticket as any).attachments ?? []} />
        </div>
      </div>
    </AdminDashboardLayout>
  );
}