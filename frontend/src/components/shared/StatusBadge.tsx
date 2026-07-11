// frontend/src/components/shared/StatusBadge.tsx
import React from 'react';
import { clsx } from 'clsx'; // Ei library-ti install kora na thakle npm install clsx dao

type Status = 'SUBMITTED' | 'ASSIGNED' | 'COMPLETED' | 'CLOSED';

const statusConfig: Record<Status, { label: string; className: string }> = {
  SUBMITTED: { label: 'Submitted', className: 'bg-gray-200 text-gray-800' },
  ASSIGNED: { label: 'Assigned', className: 'bg-blue-200 text-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-green-200 text-green-800' },
  CLOSED: { label: 'Closed', className: 'bg-red-200 text-red-800' },
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const { label, className } = statusConfig[status];
  
  return (
    <span className={clsx('px-2 py-1 rounded-full text-sm font-semibold', className)}>
      {label}
    </span>
  );
};