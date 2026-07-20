import type { ReactNode } from 'react';
import { NotificationBell } from '../../components/shared/NotificationBell';
import { useAuth } from '../../hooks/useAuth';

interface DeveloperDashboardLayoutProps {
  children: ReactNode;
}

export function DeveloperDashboardLayout({ children }: DeveloperDashboardLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 24px', borderBottom: '1px solid #e5e7eb',
      }}>
        <strong>My Tickets</strong>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <NotificationBell />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user?.full_name}</span>
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: '24px' }}>{children}</main>
    </div>
  );
}