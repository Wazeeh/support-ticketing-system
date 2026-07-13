import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../../services/ticketService';

const actionColors: Record<string, string> = {
  CREATED: '#6b7280', PRIORITY_SET: '#2563eb', ASSIGNED: '#2563eb',
  REASSIGNED: '#ea580c', ROUTED_TO_ADMIN: '#ea580c', STATUS_CHANGED: '#059669',
  REPLY_ADDED: '#059669', CLOSED: '#374151', REOPENED: '#dc2626', ATTACHMENT_ADDED: '#6b7280',
};

export function TicketTimelineView({ ticketId }: { ticketId: number }) {
  const { data } = useQuery({
    queryKey: ['timeline', ticketId],
    queryFn: () => ticketService.getTimeline(ticketId).then((res) => res.data),
  });

  if (!data) return <p>Loading timeline...</p>;

  return (
    <div style={{ marginTop: '16px' }}>
      <strong>Timeline</strong>
      <div style={{ marginTop: 10, borderLeft: '2px solid #e5e7eb', paddingLeft: 16 }}>
        {data.events.map((e) => (
          <div key={e.id} style={{ marginBottom: 14, position: 'relative' }}>
            <div style={{
              position: 'absolute', left: -21, top: 3, width: 10, height: 10,
              borderRadius: '50%', backgroundColor: actionColors[e.action] ?? '#9ca3af',
            }} />
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {e.action.replace(/_/g, ' ')}
              {e.from_value && e.to_value && ` — ${e.from_value} → ${e.to_value}`}
              {!e.from_value && e.to_value && ` — ${e.to_value}`}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {e.actor_name ?? 'System'} ({e.actor_role}) — {new Date(e.timestamp).toLocaleString()}
            </p>
            {e.note && <p style={{ fontSize: '0.8rem', color: '#374151' }}>{e.note}</p>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <strong style={{ fontSize: '0.85rem' }}>Time in status</strong>
        <div style={{ marginTop: 6 }}>
          {Object.entries(data.duration_summary.time_in_status).map(([status, hours]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 100, fontSize: '0.75rem' }}>{status}</span>
              <div style={{
                height: 8, backgroundColor: '#2563eb', borderRadius: 4,
                width: `${Math.min(100, (hours as number) * 2)}px`,
              }} />
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{(hours as number).toFixed(1)}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}