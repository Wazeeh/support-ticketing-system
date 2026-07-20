import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationService.listUnread().then((res) => res.data),
    refetchInterval: 25000, // poll every 25s per spec §6.6
  });

  const unreadCount = data?.length ?? 0;

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute', top: -4, right: -4, backgroundColor: '#dc2626',
              color: '#fff', borderRadius: '9999px', fontSize: '0.65rem',
              padding: '1px 5px', fontWeight: 700,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute', right: 0, top: '100%', marginTop: '8px',
            backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
            width: '280px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 20,
          }}
        >
          <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Notifications</strong>
            <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>
              Mark all read
            </button>
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {data?.length === 0 && <p style={{ padding: '12px', color: '#6b7280' }}>No new notifications</p>}
            {data?.map((n) => (
              <div key={n.id} style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
                {n.type.replace(/_/g, ' ')} — Ticket #{n.ticket_id}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}