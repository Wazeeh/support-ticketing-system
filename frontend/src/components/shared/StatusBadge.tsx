import type { TicketStatus } from '../../types/ticket';

const statusConfig: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  SUBMITTED:   { label: 'Submitted',   color: '#6b7280', bg: '#f3f4f6' },
  ACCEPTED:    { label: 'Accepted',    color: '#2563eb', bg: '#dbeafe' },
  ASSIGNED:    { label: 'Assigned',    color: '#7c3aed', bg: '#ede9fe' },
  IN_PROGRESS: { label: 'In Progress', color: '#d97706', bg: '#fef3c7' },
  COMPLETED:   { label: 'Completed',   color: '#059669', bg: '#d1fae5' },
  CLOSED:      { label: 'Closed',      color: '#374151', bg: '#e5e7eb' },
  REOPENED:    { label: 'Reopened',    color: '#dc2626', bg: '#fee2e2' },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <span
      style={{
        color: config.color,
        backgroundColor: config.bg,
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-block',
      }}
    >
      {config.label}
    </span>
  );
}