import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  ticket_id: number;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  listUnread: () =>
    apiClient.get<Notification[]>('/admin/notifications', { params: { unread_only: true } }),
  markRead: (id: number) => apiClient.patch(`/admin/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/admin/notifications/read-all'),
};