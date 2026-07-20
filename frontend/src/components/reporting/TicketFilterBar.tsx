import { useState, useEffect } from 'react';
import { piuTiService } from '../../services/piuTiService';
import type { TicketStatus, TicketPriority, SoftwareType } from '../../types/ticket';

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  software?: SoftwareType;
  piu_id?: number;
  ti_id?: number;
  submitted_from?: string;
  submitted_to?: string;
  completed_from?: string;
  completed_to?: string;
  search?: string;
}

interface TicketFilterBarProps {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
}

export function TicketFilterBar({ filters, onChange }: TicketFilterBarProps) {
  const [piuOptions, setPiuOptions] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    piuTiService.listPiu().then((res) => setPiuOptions(res.data));
  }, []);

  const update = (patch: Partial<TicketFilters>) => onChange({ ...filters, ...patch });

  const inputStyle = { padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
      <input
        placeholder="Search tracking # or name"
        value={filters.search ?? ''}
        onChange={(e) => update({ search: e.target.value || undefined })}
        style={{ ...inputStyle, minWidth: 200 }}
      />

      <select
        value={filters.status ?? ''}
        onChange={(e) => update({ status: (e.target.value || undefined) as TicketStatus | undefined })}
        style={inputStyle}
      >
        <option value="">All statuses</option>
        {['SUBMITTED', 'ACCEPTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'REOPENED'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.priority ?? ''}
        onChange={(e) => update({ priority: (e.target.value || undefined) as TicketPriority | undefined })}
        style={inputStyle}
      >
        <option value="">All priorities</option>
        {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={filters.software ?? ''}
        onChange={(e) => update({ software: (e.target.value || undefined) as SoftwareType | undefined })}
        style={inputStyle}
      >
        <option value="">All software</option>
        <option value="TMS">TMS</option>
        <option value="FINMAN">Finman</option>
      </select>

      <select
        value={filters.piu_id ?? ''}
        onChange={(e) => update({ piu_id: e.target.value ? Number(e.target.value) : undefined })}
        style={inputStyle}
      >
        <option value="">All PIUs</option>
        {piuOptions.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
        Submitted
        <input
          type="date"
          value={filters.submitted_from ?? ''}
          onChange={(e) => update({ submitted_from: e.target.value || undefined })}
          style={inputStyle}
        />
        to
        <input
          type="date"
          value={filters.submitted_to ?? ''}
          onChange={(e) => update({ submitted_to: e.target.value || undefined })}
          style={inputStyle}
        />
      </label>
    </div>
  );
}