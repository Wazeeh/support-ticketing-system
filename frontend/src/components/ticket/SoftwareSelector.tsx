import type { SoftwareType } from '../../types/ticket';

interface SoftwareSelectorProps {
  value: SoftwareType | null;
  onChange: (value: SoftwareType) => void;
}

export function SoftwareSelector({ value, onChange }: SoftwareSelectorProps) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
        Software
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as SoftwareType)}
        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
      >
        <option value="">Select software</option>
        <option value="TMS">TMS</option>
        <option value="FINMAN">Finman</option>
      </select>
    </div>
  );
}