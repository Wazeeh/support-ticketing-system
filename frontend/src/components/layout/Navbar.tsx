import React from 'react';
import { NotificationBell } from '../shared/NotificationBell';
import { Button } from '../shared/Button';

export const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="text-xl font-bold">Ticketing System</div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        <Button variant="primary">New Ticket</Button>
      </div>
    </nav>
  );
};