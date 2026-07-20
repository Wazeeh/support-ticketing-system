import type { TicketPriority } from '../../types/ticket';

const priorityConfig: Record<TicketPriority, { label: string; color: string; bg: string }> = {
  LOW:    { label: 'Low',    color: '#059669', bg: '#d1fae5' },
  MEDIUM: { label: 'Medium', color: '#d97706', bg: '#fef3c7' },
  HIGH:   { label: 'High',   color: '#ea580c', bg: '#ffedd5' },
  URGENT: { label: 'Urgent', color: '#dc2626', bg: '#fee2e2' },
};

export function PriorityBadge({ priority }: { priority: TicketPriority | null }) {
  if (!priority) {
    return (
      <span
        style={{
          color: '#9ca3af',
          backgroundColor: '#f9fafb',
          padding: '2px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        Unset
      </span>
    );
  }

  const config = priorityConfig[priority];
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