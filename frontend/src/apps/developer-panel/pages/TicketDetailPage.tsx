import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../../../services/ticketService';
import { useAuth } from '../../../hooks/useAuth';
import { useTicketActions } from '../../../hooks/useTicketActions';
import { DeveloperDashboardLayout } from '../DeveloperDashboardLayout';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { PriorityBadge } from '../../../components/shared/PriorityBadge';
import { RichTextViewer } from '../../../components/shared/RichTextViewer';
import { AttachmentList } from '../../../components/ticket/AttachmentList';
import { ReplyThread } from '../../../components/ticket/ReplyThread';
import { ReassignControl } from '../../../components/ticket/ReassignControl';
import { RouteToAdminButton } from '../../../components/ticket/RouteToAdminButton';
import { MarkCompleteButton } from '../../../components/ticket/MarkCompleteButton';
import { TicketTimelineView } from '../../../components/reporting/TicketTimelineView';

export function TicketDetailPage() {
  const { id } = useParams();
  const ticketId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['developer-ticket', ticketId],
    queryFn: () => ticketService.getDeveloperTicket(ticketId).then((res) => res.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['developer-ticket', ticketId] });

  if (isLoading || !ticket) {
    return <DeveloperDashboardLayout><p>Loading...</p></DeveloperDashboardLayout>;
  }

  const actions = useTicketActions(ticket, user);

  return (
    <DeveloperDashboardLayout>
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
            onSubmit={async (message) => {
              await ticketService.developerReply(ticketId, message);
              invalidate();
            }}
          />

          <TicketTimelineView ticketId={ticketId} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MarkCompleteButton
            visible={actions.canMarkComplete}
            onClick={async () => { await ticketService.developerComplete(ticketId); invalidate(); }}
          />

          {actions.canReassign && (
            <ReassignControl
              onReassign={async (devId, note) => { await ticketService.reassign(ticketId, devId, note); invalidate(); }}
            />
          )}

          {actions.canRouteToAdmin && (
            <RouteToAdminButton
              onConfirm={async (note) => { await ticketService.routeToAdmin(ticketId, note); invalidate(); }}
            />
          )}

          <AttachmentList ticketId={ticketId} attachments={(ticket as any).attachments ?? []} />
        </div>
      </div>
    </DeveloperDashboardLayout>
  );
}