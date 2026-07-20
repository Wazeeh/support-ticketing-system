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
    apiClient.get<Notification[]>('/notifications', { params: { unread_only: true } }),
  markRead: (id: number) => apiClient.patch(`/notifications/${id}/read`),
};