import { apiClient } from './apiClient';
import type { TicketFilters } from '../components/reporting/TicketFilterBar';

export const reportService = {
  getAnalytics: (params: TicketFilters) =>
    apiClient.get('/admin/reports/analytics', { params: params as Record<string, unknown> }),
  exportCsv: (params: TicketFilters) =>
    apiClient.get('/admin/reports/analytics/export', {
      params: { ...params, format: 'csv' } as Record<string, unknown>,
      responseType: 'blob',
    }),
};