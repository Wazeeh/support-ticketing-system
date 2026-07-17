import React from 'react';
import { clsx } from 'clsx';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: 'Low', className: 'bg-green-100 text-green-700' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', className: 'bg-red-600 text-white' },
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const { label, className } = priorityConfig[priority];
  
  return (
    <span className={clsx('px-2 py-1 rounded text-xs font-bold uppercase', className)}>
      {label}
    </span>
  );
};