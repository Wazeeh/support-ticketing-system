import { useState } from 'react';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { notificationService } from '../../services/notificationService';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'unread'],

    queryFn: () =>
      notificationService
        .listUnread()
        .then((response) => response.data),

    refetchInterval: 25000,
  });

  const unreadCount = data?.length ?? 0;

  const handleMarkAllRead = async () => {
    if (!data || data.length === 0) {
      return;
    }

    await Promise.all(
      data.map((notification) =>
        notificationService.markRead(notification.id),
      ),
    );

    await queryClient.invalidateQueries({
      queryKey: ['notifications', 'unread'],
    });
  };

  const handleMarkOneRead = async (
    notificationId: number,
  ) => {
    await notificationService.markRead(notificationId);

    await queryClient.invalidateQueries({
      queryKey: ['notifications', 'unread'],
    });
  };

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <button
        type="button"
        aria-label="Open notifications"
        onClick={() =>
          setIsOpen((currentValue) => !currentValue)
        }
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          fontSize: '20px',
        }}
      >
        🔔

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#dc2626',
              color: '#ffffff',
              borderRadius: '9999px',
              fontSize: '0.65rem',
              padding: '1px 5px',
              fontWeight: 700,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '8px',
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            width: '300px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
            zIndex: 20,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <strong>Notifications</strong>

            <button
              type="button"
              disabled={unreadCount === 0}
              onClick={handleMarkAllRead}
              style={{
                fontSize: '0.75rem',
                background: 'none',
                border: 'none',
                color:
                  unreadCount === 0
                    ? '#9ca3af'
                    : '#2563eb',
                cursor:
                  unreadCount === 0
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              Mark all read
            </button>
          </div>

          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
            }}
          >
            {isLoading && (
              <p
                style={{
                  padding: '12px',
                  color: '#6b7280',
                }}
              >
                Loading notifications...
              </p>
            )}

            {!isLoading && data?.length === 0 && (
              <p
                style={{
                  padding: '12px',
                  color: '#6b7280',
                }}
              >
                No new notifications
              </p>
            )}

            {data?.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  handleMarkOneRead(notification.id)
                }
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  {notification.type.replace(/_/g, ' ')}
                </div>

                <div
                  style={{
                    color: '#6b7280',
                  }}
                >
                  Ticket #{notification.ticket_id}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}