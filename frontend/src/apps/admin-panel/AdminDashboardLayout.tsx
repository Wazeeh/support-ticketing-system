import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationBell } from '../../components/shared/NotificationBell';
import { useAuth } from '../../hooks/useAuth';

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'Tickets', path: '/admin/tickets' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Developers', path: '/admin/developers' },
];

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, borderRight: '1px solid #e5e7eb', padding: '20px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: 24, fontWeight: 700 }}>
          Admin Panel
        </div>
        <nav>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'block', padding: '10px 20px', textDecoration: 'none',
                  color: isActive ? '#2563eb' : '#374151',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          gap: 16, padding: '14px 24px', borderBottom: '1px solid #e5e7eb',
        }}>
          <NotificationBell />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user?.full_name}</span>
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Logout
          </button>
        </header>
        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}