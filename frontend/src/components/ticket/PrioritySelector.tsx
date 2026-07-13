import type { TicketPriority } from '../../types/ticket';

interface PrioritySelectorProps {
  value: TicketPriority | null;
  disabled?: boolean;
  onChange: (priority: TicketPriority) => void;
}

export function PrioritySelector({ value, disabled, onChange }: PrioritySelectorProps) {
  return (
    <select
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as TicketPriority)}
      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
    >
      <option value="" disabled>Set priority</option>
      {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}