import React from 'react';
import { clsx } from 'clsx';

// Dummy unread count
const unreadCount = 3;

export const NotificationBell: React.FC = () => {
  return (
    <div className="relative inline-block cursor-pointer p-2">
      {/* Bell Icon (Simplified) */}
      <span className="text-xl">🔔</span>
      
      {/* Unread Badge */}
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {unreadCount}
        </span>
      )}
    </div>
  );
};