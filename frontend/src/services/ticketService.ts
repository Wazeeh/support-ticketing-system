import { apiClient } from './apiClient';
import type { Ticket, TicketListResponse } from '../types/ticket';
import type { TimelineResponse } from '../types/audit';

export const ticketService = {
  submitTicket: (formData: FormData) =>
    apiClient.post<{ ticket_id: number; tracking_number: string; status: string; created_at: string }>(
      '/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } }
    ),
  trackTicket: (trackingNumber: string) =>
    apiClient.get(`/tickets/track/${trackingNumber}`),

  listAdminTickets: (params: Record<string, unknown>) =>
    apiClient.get<TicketListResponse>('/admin/tickets', { params }),
  getAdminTicket: (id: number) => apiClient.get<Ticket>(`/admin/tickets/${id}`),
  setPriority: (id: number, priority: string) =>
    apiClient.patch(`/admin/tickets/${id}/priority`, { priority }),
  assignDeveloper: (id: number, developer_user_id: number, note?: string) =>
    apiClient.patch(`/admin/tickets/${id}/assign`, { developer_user_id, note }),
  adminReply: (id: number, message: string, close_ticket: boolean) =>
    apiClient.post(`/admin/tickets/${id}/reply`, { message, close_ticket }),
  adminComplete: (id: number) => apiClient.patch(`/admin/tickets/${id}/complete`),
  reopenTicket: (id: number, reason: string) =>
    apiClient.patch(`/admin/tickets/${id}/reopen`, { reason }),

  listDeveloperTickets: (params: Record<string, unknown>) =>
    apiClient.get('/developer/tickets', { params }),
  getDeveloperTicket: (id: number) => apiClient.get<Ticket>(`/developer/tickets/${id}`),
  developerReply: (id: number, message: string) =>
    apiClient.post(`/developer/tickets/${id}/reply`, { message }),
  reassign: (id: number, target_developer_user_id: number, note?: string) =>
    apiClient.patch(`/developer/tickets/${id}/reassign`, { target_developer_user_id, note }),
  routeToAdmin: (id: number, note?: string) =>
    apiClient.patch(`/developer/tickets/${id}/route-to-admin`, { note }),
  developerComplete: (id: number) => apiClient.patch(`/developer/tickets/${id}/complete`),

  getTimeline: (id: number) => apiClient.get<TimelineResponse>(`/tickets/${id}/timeline`),
  getDownloadUrl: (ticketId: number, attachmentId: number) =>
    apiClient.get(`/tickets/${ticketId}/attachments/${attachmentId}/download`),
};