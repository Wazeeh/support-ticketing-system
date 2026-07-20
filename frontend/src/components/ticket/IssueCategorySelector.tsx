import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import type { SoftwareType } from '../../types/ticket';

interface CategoryOption { value: string; label: string; requires_description: boolean }

interface IssueCategorySelectorProps {
  software: SoftwareType | null;
  value: string | null;
  otherDescription: string;
  onChange: (value: string) => void;
  onOtherDescriptionChange: (value: string) => void;
}

export function IssueCategorySelector({
  software, value, otherDescription, onChange, onOtherDescriptionChange,
}: IssueCategorySelectorProps) {
  const [options, setOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    if (!software) {
      setOptions([]);
      return;
    }
    categoryService.listCategories(software).then((res) => setOptions(res.data));
  }, [software]);

  const selected = options.find((o) => o.value === value);

  return (
    <div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
          Issue Category
        </label>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={!software}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
          <option value="">{software ? 'Select category' : 'Select software first'}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {selected?.requires_description && (
        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
            Please describe the issue
          </label>
          <textarea
            value={otherDescription}
            onChange={(e) => onOtherDescriptionChange(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
          {otherDescription.trim().length > 0 && otherDescription.trim().length < 10 && (
            <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 4 }}>
              Minimum 10 characters
            </p>
          )}
        </div>
      )}
    </div>
  );
}